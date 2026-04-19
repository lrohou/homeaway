import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List all shared trips
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sharedTrips = await query(`
      SELECT st.*, t.name as trip_name, t.start_date, t.end_date, u.name as user_name
      FROM shared_trips st
      JOIN trips t ON st.trip_id = t.id
      JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `);
    res.json(sharedTrips);
  } catch (error) {
    console.error('List community trips error:', error);
    res.status(500).json({ error: 'Failed to fetch community trips' });
  }
});

// Get detailed info for a shared trip
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sharedTrip = await query(`
      SELECT st.*, t.name as trip_name, t.start_date, t.end_date, u.name as user_name
      FROM shared_trips st
      JOIN trips t ON st.trip_id = t.id
      JOIN users u ON st.user_id = u.id
      WHERE st.id = ?
    `, [id]);

    if (sharedTrip.length === 0) {
      return res.status(404).json({ error: 'Shared trip not found' });
    }

    res.json(sharedTrip[0]);
  } catch (error) {
    console.error('Get community trip error:', error);
    res.status(500).json({ error: 'Failed to fetch community trip details' });
  }
});

// Share or update sharing settings for a trip
router.post('/share', authenticateToken, async (req, res) => {
  try {
    const { trip_id, share_accommodations, share_transports, share_activities, cover_image, comments } = req.body;

    // Check if user is owner of the trip
    const ownerCheck = await query(
      'SELECT id FROM trips WHERE id = ? AND owner_id = ?',
      [trip_id, req.userId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: 'Only the trip owner can share it' });
    }

    // UPSERT-like behavior (Delete then insert or update)
    await run(`
      INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (trip_id) DO UPDATE SET
        share_accommodations = EXCLUDED.share_accommodations,
        share_transports = EXCLUDED.share_transports,
        share_activities = EXCLUDED.share_activities,
        cover_image = EXCLUDED.cover_image,
        comments = EXCLUDED.comments
    `, [
      trip_id, 
      req.userId, 
      share_accommodations ?? true, 
      share_transports ?? true, 
      share_activities ?? true, 
      cover_image || null, 
      comments || null
    ]);

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

    // Check if user is owner of the trip
    const ownerCheck = await query(
      'SELECT id FROM trips WHERE id = ? AND owner_id = ?',
      [tripId, req.userId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: 'Only the trip owner can unshare it' });
    }

    await run('DELETE FROM shared_trips WHERE trip_id = ?', [tripId]);
    res.json({ message: 'Trip unshared successfully' });
  } catch (error) {
    console.error('Unshare trip error:', error);
    res.status(500).json({ error: 'Failed to unshare trip' });
  }
});

// Get sharing settings for a specific trip
router.get('/settings/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const settings = await query('SELECT * FROM shared_trips WHERE trip_id = ?', [tripId]);
    res.json(settings[0] || null);
  } catch (error) {
    console.error('Get share settings error:', error);
    res.status(500).json({ error: 'Failed to fetch share settings' });
  }
});

// GET shared content of a trip
router.get('/:id/content', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sharedTripResult = await query('SELECT * FROM shared_trips WHERE id = ?', [id]);
    if (sharedTripResult.length === 0) {
      return res.status(404).json({ error: 'Shared trip not found' });
    }
    const sharedTrip = sharedTripResult[0];
    const tripId = sharedTrip.trip_id;

    // Fetch Planning (always shared)
    const steps = await query('SELECT * FROM trip_steps WHERE trip_id = ? ORDER BY date, start_time', [tripId]);
    
    // Fetch Bookings based on share settings
    let accommodations = [];
    if (sharedTrip.share_accommodations) {
      accommodations = await query('SELECT * FROM accommodations WHERE trip_id = ?', [tripId]);
    }

    let transports = [];
    if (sharedTrip.share_transports) {
      transports = await query('SELECT * FROM transports WHERE trip_id = ?', [tripId]);
    }

    let activities = [];
    if (sharedTrip.share_activities) {
      activities = await query('SELECT * FROM activities WHERE trip_id = ?', [tripId]);
    }

    res.json({
      trip: sharedTrip,
      steps,
      accommodations,
      transports,
      activities
    });
  } catch (error) {
    console.error('Get community content error:', error);
    res.status(500).json({ error: 'Failed to fetch community content' });
  }
});

export default router;
