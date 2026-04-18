import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all expenses for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const expenses = await query(
      `SELECT e.*, u.name as payer_name, u.email as payer_email 
       FROM expenses e 
       LEFT JOIN users u ON e.paid_by = u.id 
       WHERE e.trip_id = ? 
       ORDER BY e.date DESC`,
      [tripId]
    );
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get single expense
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { tripId, id } = req.params;
    const expenses = await query(
      `SELECT e.*, u.name as payer_name, u.email as payer_email 
       FROM expenses e 
       LEFT JOIN users u ON e.paid_by = u.id 
       WHERE e.id = ? AND e.trip_id = ?`,
      [id, tripId]
    );
    if (expenses.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expenses[0]);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, amount, category, date, paid_by, split_between } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }

    const result = await run(
      `INSERT INTO expenses (trip_id, title, amount, category, date, paid_by, split_between)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tripId, title, amount, category || 'other', date, paid_by, JSON.stringify(split_between || [])]
    );

    res.status(201).json({ id: result.lastID, message: 'Expense created' });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, paid_by } = req.body;

    await run(
      `UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, paid_by = ?
       WHERE id = ?`,
      [title, amount, category, date, paid_by, id]
    );

    res.json({ message: 'Expense updated' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
