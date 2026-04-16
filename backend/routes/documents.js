import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// Get all documents for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const documents = await query(
      'SELECT * FROM trip_documents WHERE trip_id = ? ORDER BY created_date DESC',
      [tripId]
    );
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const result = await run(
      `INSERT INTO trip_documents (trip_id, title, type, file_url, created_date)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [tripId, title, type || 'other', fileUrl]
    );

    res.status(201).json({ 
      id: result.lastID, 
      message: 'Document uploaded',
      document: {
        id: result.lastID,
        trip_id: tripId,
        title,
        type: type || 'other',
        file_url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM trip_documents WHERE id = ?', [id]);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
