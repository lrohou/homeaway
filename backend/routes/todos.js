import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all todos for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { type } = req.query; // 'todo' or 'shopping'
    let sql = 'SELECT * FROM todo_items WHERE trip_id = ?';
    const params = [tripId];
    if (type) { sql += ' AND list_type = ?'; params.push(type); }
    sql += ' ORDER BY created_at ASC';
    const items = await query(sql, params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create todo item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { text, list_type = 'todo', assigned_to } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const result = await run(
      'INSERT INTO todo_items (trip_id, text, list_type, assigned_to, created_by) VALUES (?, ?, ?, ?, ?)',
      [tripId, text, list_type, assigned_to || null, req.userId]
    );
    const items = await query('SELECT * FROM todo_items WHERE id = ?', [result.lastID]);
    res.status(201).json(items[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo (toggle done, edit text)
router.patch('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { is_done, text, assigned_to } = req.body;
    const existing = await query('SELECT * FROM todo_items WHERE id = ?', [itemId]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const updated = {
      text: text !== undefined ? text : existing[0].text,
      is_done: is_done !== undefined ? is_done : existing[0].is_done,
      assigned_to: assigned_to !== undefined ? assigned_to : existing[0].assigned_to,
    };
    await run(
      'UPDATE todo_items SET text = ?, is_done = ?, assigned_to = ? WHERE id = ?',
      [updated.text, updated.is_done, updated.assigned_to, itemId]
    );
    const items = await query('SELECT * FROM todo_items WHERE id = ?', [itemId]);
    res.json(items[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo item
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    await run('DELETE FROM todo_items WHERE id = ?', [itemId]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
