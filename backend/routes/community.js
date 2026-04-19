import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List all shared trips (with destination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sharedTrips = await query(`
      SELECT st.*, t.name as trip_name, t.start_date, t.end_date, t.location_name, u.name as user_name,
      (SELECT COUNT(*) FROM trip_likes WHERE shared_trip_id = st.id) as like_count,
      EXISTS(SELECT 1 FROM trip_likes WHERE shared_trip_id = st.id AND user_id = $1) as is_liked_by_user
      FROM shared_trips st
      JOIN trips t ON st.trip_id = t.id
      JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `, [req.userId]);
    res.json(sharedTrips);
  } catch (error) {
    console.error('List community trips error:', error);
    res.status(500).json({ error: 'Failed to fetch community trips' });
  }
});

// Get shared trip meta info
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sharedTrip = await query(`
      SELECT st.*, t.name as trip_name, t.start_date, t.end_date, t.location_name, u.name as user_name,
      (SELECT COUNT(*) FROM trip_likes WHERE shared_trip_id = st.id) as like_count,
      EXISTS(SELECT 1 FROM trip_likes WHERE shared_trip_id = st.id AND user_id = $1) as is_liked_by_user
      FROM shared_trips st
      JOIN trips t ON st.trip_id = t.id
      JOIN users u ON st.user_id = u.id
      WHERE st.id = $2
    `, [req.userId, id]);
    if (sharedTrip.length === 0) return res.status(404).json({ error: 'Shared trip not found' });
    res.json(sharedTrip[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community trip details' });
  }
});

// Like a shared trip
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run(`
      INSERT INTO trip_likes (shared_trip_id, user_id) 
      VALUES ($1, $2) ON CONFLICT DO NOTHING
    `, [id, req.userId]);
    res.json({ message: 'Liked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like trip' });
  }
});

// Unlike a shared trip
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run(`
      DELETE FROM trip_likes 
      WHERE shared_trip_id = $1 AND user_id = $2
    `, [id, req.userId]);
    res.json({ message: 'Unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike trip' });
  }
});

// Share or update sharing settings for a trip (with per-booking selections)
router.post('/share', authenticateToken, async (req, res) => {
  try {
    const { trip_id, cover_image, comments, bookings } = req.body;

    // Check owner
    const ownerCheck = await query('SELECT id FROM trips WHERE id = ? AND owner_id = ?', [trip_id, req.userId]);
    if (ownerCheck.length === 0) return res.status(403).json({ error: 'Only the trip owner can share it' });

    // Upsert shared_trips
    const result = await run(`
      INSERT INTO shared_trips (trip_id, user_id, cover_image, comments)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (trip_id) DO UPDATE SET
        cover_image = EXCLUDED.cover_image,
        comments = EXCLUDED.comments
    `, [trip_id, req.userId, cover_image || null, comments || null]);

    // Get the shared_trip id
    const shared = await query('SELECT id FROM shared_trips WHERE trip_id = ?', [trip_id]);
    const sharedTripId = shared[0].id;

    // If bookings list provided, save per-booking settings
    if (Array.isArray(bookings)) {
      // Delete old
      await run('DELETE FROM shared_trip_bookings WHERE shared_trip_id = ?', [sharedTripId]);
      // Insert new
      for (const b of bookings) {
        await run(
          `INSERT INTO shared_trip_bookings (shared_trip_id, booking_type, booking_id, is_shared, review)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT (shared_trip_id, booking_type, booking_id) DO UPDATE SET
             is_shared = EXCLUDED.is_shared, review = EXCLUDED.review`,
          [sharedTripId, b.booking_type, b.booking_id, b.is_shared !== false, b.review || null]
        );
      }
    }

    res.json({ message: 'Trip shared successfully' });
  } catch (error) {
    console.error('Share trip error:', error);
    res.status(500).json({ error: 'Failed to share trip' });
  }
});

// Unshare a trip
router.delete('/unshare/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const ownerCheck = await query('SELECT id FROM trips WHERE id = ? AND owner_id = ?', [tripId, req.userId]);
    if (ownerCheck.length === 0) return res.status(403).json({ error: 'Only the trip owner can unshare it' });
    await run('DELETE FROM shared_trips WHERE trip_id = ?', [tripId]);
    res.json({ message: 'Trip unshared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unshare trip' });
  }
});

// Get sharing settings for a specific trip (with per-booking selections)
router.get('/settings/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const settings = await query('SELECT * FROM shared_trips WHERE trip_id = ?', [tripId]);
    if (!settings.length) return res.json(null);

    const sharedTripId = settings[0].id;
    const bookings = await query('SELECT * FROM shared_trip_bookings WHERE shared_trip_id = ?', [sharedTripId]);
    res.json({ ...settings[0], bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch share settings' });
  }
});

// GET shared content of a trip (filtered by per-booking selections)
router.get('/:id/content', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sharedTripResult = await query('SELECT * FROM shared_trips WHERE id = ?', [id]);
    if (sharedTripResult.length === 0) return res.status(404).json({ error: 'Shared trip not found' });
    const sharedTrip = sharedTripResult[0];
    const tripId = sharedTrip.trip_id;

    // Get per-booking selections
    const bookingSelections = await query('SELECT * FROM shared_trip_bookings WHERE shared_trip_id = ?', [id]);
    const selectionMap = {};
    bookingSelections.forEach(b => {
      selectionMap[`${b.booking_type}_${b.booking_id}`] = b;
    });
    const hasPerBooking = bookingSelections.length > 0;

    // Steps always shared
    const steps = await query('SELECT * FROM trip_steps WHERE trip_id = ? ORDER BY date, start_time', [tripId]);

    // Accommodations
    const allAccommodations = await query('SELECT * FROM accommodations WHERE trip_id = ?', [tripId]);
    const accommodations = hasPerBooking
      ? allAccommodations.filter(a => {
          const sel = selectionMap[`accommodation_${a.id}`];
          return sel ? sel.is_shared : false;
        }).map(a => ({ ...a, review: selectionMap[`accommodation_${a.id}`]?.review }))
      : allAccommodations;

    // Transports
    const allTransports = await query('SELECT * FROM transports WHERE trip_id = ?', [tripId]);
    const transports = hasPerBooking
      ? allTransports.filter(t => {
          const sel = selectionMap[`transport_${t.id}`];
          return sel ? sel.is_shared : false;
        }).map(t => ({ ...t, review: selectionMap[`transport_${t.id}`]?.review }))
      : allTransports;

    // Activities
    const allActivities = await query('SELECT * FROM activities WHERE trip_id = ?', [tripId]);
    const activities = hasPerBooking
      ? allActivities.filter(a => {
          const sel = selectionMap[`activity_${a.id}`];
          return sel ? sel.is_shared : false;
        }).map(a => ({ ...a, review: selectionMap[`activity_${a.id}`]?.review }))
      : allActivities;

    res.json({ trip: sharedTrip, steps, accommodations, transports, activities });
  } catch (error) {
    console.error('Get community content error:', error);
    res.status(500).json({ error: 'Failed to fetch community content' });
  }
});

export default router;
