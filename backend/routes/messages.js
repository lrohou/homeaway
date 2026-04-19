import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all messages for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const messages = await query(
      'SELECT id, trip_id, user_id, text as content, created_date as created_at FROM messages WHERE trip_id = ? ORDER BY created_date ASC',
      [tripId]
    );
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await run(
      `INSERT INTO messages (trip_id, user_id, text, created_date)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [tripId, req.userId, text]
    );

    res.status(201).json({ id: result.lastID, message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a message (only own messages)
router.delete('/:msgId', authenticateToken, async (req, res) => {
  try {
    const { msgId } = req.params;
    const msg = await query('SELECT user_id FROM messages WHERE id = ?', [msgId]);
    if (!msg.length) return res.status(404).json({ error: 'Message not found' });
    if (msg[0].user_id !== req.userId) return res.status(403).json({ error: 'Not your message' });
    await run('DELETE FROM messages WHERE id = ?', [msgId]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
