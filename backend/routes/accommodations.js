import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all accommodations for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const accommodations = await query(
      'SELECT id, trip_id, name, location, checkin as "checkIn", checkout as "checkOut", price, currency, bookingreference as "bookingReference", latitude, longitude FROM accommodations WHERE trip_id = ? ORDER BY checkin',
      [tripId]
    );
    res.json(accommodations);
  } catch (error) {
    console.error('Get accommodations error:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

// Get single accommodation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tripId, id } = req.params;
    const accommodations = await query(
      'SELECT id, trip_id, name, location, checkin as "checkIn", checkout as "checkOut", price, currency, bookingreference as "bookingReference", latitude, longitude FROM accommodations WHERE id = ? AND trip_id = ?',
      [id, tripId]
    );
    if (accommodations.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    res.json(accommodations[0]);
  } catch (error) {
    console.error('Get accommodation error:', error);
    res.status(500).json({ error: 'Failed to fetch accommodation' });
  }
});

// Create accommodation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, location, checkIn, checkOut, price, currency, bookingReference } = req.body;

    if (!name || !location || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Name, location, checkIn, and checkOut are required' });
    }

    const result = await run(
      `INSERT INTO accommodations (trip_id, name, location, checkin, checkout, price, currency, bookingreference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, name, location, checkIn, checkOut, price || 0, currency || 'EUR', bookingReference]
    );

    res.status(201).json({ id: result.lastID, message: 'Accommodation created' });
  } catch (error) {
    console.error('Create accommodation error:', error);
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

// Update accommodation
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, checkIn, checkOut, price, currency, bookingReference } = req.body;

    await run(
      `UPDATE accommodations SET name = ?, location = ?, checkin = ?, checkout = ?, price = ?, currency = ?, bookingreference = ?
       WHERE id = ?`,
      [name, location, checkIn, checkOut, price, currency, bookingReference, id]
    );

    res.json({ message: 'Accommodation updated' });
  } catch (error) {
    console.error('Update accommodation error:', error);
    res.status(500).json({ error: 'Failed to update accommodation' });
  }
});

// Delete accommodation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM accommodations WHERE id = ?', [id]);
    res.json({ message: 'Accommodation deleted' });
  } catch (error) {
    console.error('Delete accommodation error:', error);
    res.status(500).json({ error: 'Failed to delete accommodation' });
  }
});

export default router;
