import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all polls for a trip (with options and votes)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    
    // Instead of N+1, fetch everything in 3 bulk queries and merge in memory
    const polls = await query(
      `SELECT p.*, u.name as creator_name 
       FROM polls p 
       LEFT JOIN users u ON u.id = p.created_by 
       WHERE p.trip_id = ? 
       ORDER BY p.created_at DESC`, 
      [tripId]
    );

    if (polls.length === 0) return res.json([]);

    const pollIds = polls.map(p => p.id);
    const placeholders = pollIds.map(() => '?').join(',');

    const options = await query(`SELECT * FROM poll_options WHERE poll_id IN (${placeholders}) ORDER BY id ASC`, pollIds);
    const votes = await query(
      `SELECT pv.*, u.name as user_name 
       FROM poll_votes pv 
       LEFT JOIN users u ON u.id = pv.user_id 
       WHERE pv.poll_id IN (${placeholders})`,
      pollIds
    );

    const enriched = polls.map(poll => {
      const pollVotes = votes.filter(v => v.poll_id === poll.id);
      const pollOptions = options.filter(o => o.poll_id === poll.id).map(opt => ({
        ...opt,
        votes: pollVotes.filter(v => v.option_id === opt.id),
        vote_count: pollVotes.filter(v => v.option_id === opt.id).length,
      }));

      return {
        ...poll,
        creator_name: poll.creator_name || 'Unknown',
        options: pollOptions,
        total_votes: pollVotes.length,
        user_vote: pollVotes.find(v => v.user_id === req.userId)?.option_id || null,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Create a poll
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { question, description, options, deadline } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options are required' });
    }

    const result = await run(
      'INSERT INTO polls (trip_id, question, description, deadline, created_by) VALUES (?, ?, ?, ?, ?)',
      [tripId, question, description || null, deadline || null, req.userId]
    );

    const pollId = result.lastID;

    // Insert options
    for (const label of options) {
      if (label.trim()) {
        await run('INSERT INTO poll_options (poll_id, label) VALUES (?, ?)', [pollId, label.trim()]);
      }
    }

    res.status(201).json({ id: pollId, message: 'Poll created' });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Vote on a poll
router.post('/:pollId/vote', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { option_id } = req.body;

    if (!option_id) {
      return res.status(400).json({ error: 'option_id is required' });
    }

    // Check if poll exists and is not expired
    const poll = await query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!poll.length) return res.status(404).json({ error: 'Poll not found' });

    if (poll[0].deadline && new Date(poll[0].deadline) < new Date()) {
      return res.status(400).json({ error: 'Poll has ended' });
    }

    // Check option belongs to poll
    const option = await query('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?', [option_id, pollId]);
    if (!option.length) return res.status(400).json({ error: 'Invalid option' });

    // Upsert vote (delete existing then insert)
    await run('DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?', [pollId, req.userId]);
    await run(
      'INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
      [pollId, option_id, req.userId]
    );

    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Remove vote
router.delete('/:pollId/vote', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    await run('DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?', [pollId, req.userId]);
    res.json({ message: 'Vote removed' });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
});

// Delete a poll (only creator)
router.delete('/:pollId', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await query('SELECT * FROM polls WHERE id = ?', [pollId]);
    if (!poll.length) return res.status(404).json({ error: 'Poll not found' });
    if (poll[0].created_by !== req.userId) {
      return res.status(403).json({ error: 'Only the creator can delete this poll' });
    }
    // CASCADE will delete options and votes
    await run('DELETE FROM polls WHERE id = ?', [pollId]);
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

export default router;
