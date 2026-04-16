import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all activities for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const activities = await query(
      'SELECT * FROM activities WHERE trip_id = ? ORDER BY date',
      [tripId]
    );
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get single activity
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tripId, id } = req.params;
    const activities = await query(
      'SELECT * FROM activities WHERE id = ? AND trip_id = ?',
      [id, tripId]
    );
    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activities[0]);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, date, time, duration, price, description, latitude, longitude, location } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    const result = await run(
      `INSERT INTO activities (trip_id, name, date, time, duration, price, description, latitude, longitude, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, name, date, time, duration || 60, price || 0, description, latitude || null, longitude || null, location || null]
    );

    res.status(201).json({ id: result.lastID, message: 'Activity created' });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, time, duration, price, description, latitude, longitude, location } = req.body;

    await run(
      `UPDATE activities SET name = ?, date = ?, time = ?, duration = ?, price = ?, description = ?, latitude = ?, longitude = ?, location = ?
       WHERE id = ?`,
      [name, date, time, duration, price, description, latitude || null, longitude || null, location || null, id]
    );

    res.json({ message: 'Activity updated' });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM activities WHERE id = ?', [id]);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;
