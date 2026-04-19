import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get participants for a trip (all bookings)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const participants = await query(
      'SELECT * FROM booking_participants WHERE trip_id = ?',
      [tripId]
    );
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Set participants for a booking (replaces existing)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { booking_type, booking_id, user_ids } = req.body;
    if (!booking_type || !booking_id || !Array.isArray(user_ids)) {
      return res.status(400).json({ error: 'booking_type, booking_id, user_ids required' });
    }
    // Delete existing participants for this booking
    await run(
      'DELETE FROM booking_participants WHERE trip_id = ? AND booking_type = ? AND booking_id = ?',
      [tripId, booking_type, booking_id]
    );
    // Insert new participants
    for (const userId of user_ids) {
      await run(
        'INSERT INTO booking_participants (trip_id, booking_type, booking_id, user_id) VALUES (?, ?, ?, ?)',
        [tripId, booking_type, booking_id, userId]
      );
    }
    const participants = await query(
      'SELECT * FROM booking_participants WHERE trip_id = ? AND booking_type = ? AND booking_id = ?',
      [tripId, booking_type, booking_id]
    );
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set participants' });
  }
});

export default router;
