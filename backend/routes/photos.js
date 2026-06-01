import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

import { uploadToSupabase } from '../utils/supabaseStorage.js';

// Get all photos for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const photos = await query(
      `SELECT p.*, u.name as uploader_name 
       FROM trip_photos p 
       LEFT JOIN users u ON u.id = p.uploaded_by 
       WHERE p.trip_id = ? 
       ORDER BY p.created_at DESC`,
      [tripId]
    );
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Upload photo
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const fileUrl = await uploadToSupabase(req.file, 'photos');

    const result = await run(
      `INSERT INTO trip_photos (trip_id, file_url, caption, uploaded_by) VALUES (?, ?, ?, ?)`,
      [tripId, fileUrl, caption || null, req.userId]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Photo uploaded',
      photo: {
        id: result.lastID,
        trip_id: tripId,
        file_url: fileUrl,
        caption: caption || null,
        uploaded_by: req.userId,
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Delete photo
router.delete('/:photoId', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    await run('DELETE FROM trip_photos WHERE id = ?', [photoId]);
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
