import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all trips for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await query(`
      SELECT t.*, 
      (SELECT COUNT(*) FROM trip_members WHERE trip_id = t.id) as member_count
      FROM trips t
      INNER JOIN trip_members tm ON t.id = tm.trip_id
      WHERE tm.user_id = ?
      ORDER BY t.start_date DESC
    `, [req.userId]);

    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get single trip
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this trip
    const members = await query(
      'SELECT * FROM trip_members WHERE trip_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ error: 'No access to this trip' });
    }

    const trips = await query('SELECT * FROM trips WHERE id = ?', [id]);
    const trip = trips[0];
    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create trip
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, start_date, end_date, location_lat, location_lng, location_name, budget, cover_image } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Name, start_date, and end_date are required' });
    }

    const result = await run(
      `INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        description, 
        start_date, 
        end_date, 
        req.userId, 
        location_lat === "" ? null : location_lat, 
        location_lng === "" ? null : location_lng, 
        location_name, 
        budget === "" ? null : budget,
        cover_image || null
      ]
    );

    const tripId = result.lastID;

    // Add user as owner to trip_members
    await run(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [tripId, req.userId, 'owner']
    );

    const trips = await query('SELECT * FROM trips WHERE id = ?', [tripId]);
    const newTrip = trips[0];
    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, status, budget, cover_image } = req.body;

    // Check if user is owner
    const members = await query(
      'SELECT * FROM trip_members WHERE trip_id = ? AND user_id = ? AND role = ?',
      [id, req.userId, 'owner']
    );

    if (members.length === 0) {
      return res.status(403).json({ error: 'Only trip owner can update' });
    }

    await run(
      'UPDATE trips SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, budget = ?, cover_image = ? WHERE id = ?',
      [name, description, start_date, end_date, status, budget, cover_image || null, id]
    );

    const trips = await query('SELECT * FROM trips WHERE id = ?', [id]);
    const updatedTrip = trips[0];
    res.json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is owner
    const members = await query(
      'SELECT * FROM trip_members WHERE trip_id = ? AND user_id = ? AND role = ?',
      [id, req.userId, 'owner']
    );

    if (members.length === 0) {
      return res.status(403).json({ error: 'Only trip owner can delete' });
    }

    await run('DELETE FROM trips WHERE id = ?', [id]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

export default router;
