import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all transports for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const transports = await query(
      'SELECT id, trip_id, type, departure, arrival, departuretime as "departureTime", arrivaltime as "arrivalTime", bookingreference as "bookingReference", price, latitude, longitude FROM transports WHERE trip_id = ? ORDER BY departuretime',
      [tripId]
    );
    res.json(transports);
  } catch (error) {
    console.error('Get transports error:', error);
    res.status(500).json({ error: 'Failed to fetch transports' });
  }
});

// Get single transport
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tripId, id } = req.params;
    const transports = await query(
      'SELECT id, trip_id, type, departure, arrival, departuretime as "departureTime", arrivaltime as "arrivalTime", bookingreference as "bookingReference", price, latitude, longitude FROM transports WHERE id = ? AND trip_id = ?',
      [id, tripId]
    );
    if (transports.length === 0) {
      return res.status(404).json({ error: 'Transport not found' });
    }
    res.json(transports[0]);
  } catch (error) {
    console.error('Get transport error:', error);
    res.status(500).json({ error: 'Failed to fetch transport' });
  }
});

// Create transport
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { type, departure, arrival, departureTime, arrivalTime, bookingReference, price } = req.body;

    if (!type || !departure || !arrival) {
      return res.status(400).json({ error: 'Type, departure, and arrival are required' });
    }

    const result = await run(
      `INSERT INTO transports (trip_id, type, departure, arrival, departuretime, arrivaltime, bookingreference, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tripId, type, departure, arrival, departureTime, arrivalTime, bookingReference, price || 0]
    );

    res.status(201).json({ id: result.lastID, message: 'Transport created' });
  } catch (error) {
    console.error('Create transport error:', error);
    res.status(500).json({ error: 'Failed to create transport' });
  }
});

// Update transport
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, departure, arrival, departureTime, arrivalTime, bookingReference, price } = req.body;

    await run(
      `UPDATE transports SET type = ?, departure = ?, arrival = ?, departuretime = ?, arrivaltime = ?, bookingreference = ?, price = ?
       WHERE id = ?`,
      [type, departure, arrival, departureTime, arrivalTime, bookingReference, price, id]
    );

    res.json({ message: 'Transport updated' });
  } catch (error) {
    console.error('Update transport error:', error);
    res.status(500).json({ error: 'Failed to update transport' });
  }
});

// Delete transport
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM transports WHERE id = ?', [id]);
    res.json({ message: 'Transport deleted' });
  } catch (error) {
    console.error('Delete transport error:', error);
    res.status(500).json({ error: 'Failed to delete transport' });
  }
});

export default router;
