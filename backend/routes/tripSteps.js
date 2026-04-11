import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all steps for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const steps = await query(
      'SELECT * FROM trip_steps WHERE trip_id = ? ORDER BY date',
      [tripId]
    );
    res.json(steps);
  } catch (error) {
    console.error('Get steps error:', error);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
});

// Get single step
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tripId, id } = req.params;
    const steps = await query(
      'SELECT * FROM trip_steps WHERE id = ? AND trip_id = ?',
      [id, tripId]
    );
    if (steps.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }
    res.json(steps[0]);
  } catch (error) {
    console.error('Get step error:', error);
    res.status(500).json({ error: 'Failed to fetch step' });
  }
});

// Create step
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, date, start_time, location, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const result = await run(
      `INSERT INTO trip_steps (trip_id, title, date, start_time, location, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tripId, title, date, start_time, location, description]
    );

    res.status(201).json({ id: result.lastID, message: 'Step created' });
  } catch (error) {
    console.error('Create step error:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

// Update step
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, start_time, location, description } = req.body;

    await run(
      `UPDATE trip_steps SET title = ?, date = ?, start_time = ?, location = ?, description = ?
       WHERE id = ?`,
      [title, date, start_time, location, description, id]
    );

    res.json({ message: 'Step updated' });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Delete step
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM trip_steps WHERE id = ?', [id]);
    res.json({ message: 'Step deleted' });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

export default router;
