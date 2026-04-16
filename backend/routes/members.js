import express from 'express';
import { query, run } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router({ mergeParams: true });

// Get all members for a trip
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const members = await query(
      `SELECT tm.*, u.name, u.email, u.avatar 
       FROM trip_members tm 
       JOIN users u ON tm.user_id = u.id 
       WHERE tm.trip_id = ?`,
      [tripId]
    );
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get all invitations for a trip
router.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const invitations = await query(
      'SELECT * FROM invitations WHERE trip_id = ? AND status = ?',
      [tripId, 'pending']
    );
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Invite member via email link
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation
    await run(
      'INSERT INTO invitations (trip_id, email, invite_code, role, status, created_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tripId, email, token, role || 'viewer', 'pending', req.userId, expiresAt]
    );

  // Fetch sender info
    const senders = await query('SELECT name FROM users WHERE id = ?', [req.userId]);
    const senderName = senders.length > 0 && senders[0].name ? senders[0].name : "Une personne";

    // Fetch trip info
    const trips = await query('SELECT name FROM trips WHERE id = ?', [tripId]);
    const tripTitle = trips.length > 0 && trips[0].name ? trips[0].name : "un voyage";

    // Send email
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${token}`;
    await sendEmail(
      email,
      'Invitation à rejoindre un voyage sur HomeAway',
      `${senderName} vous a invité(e) à rejoindre un voyage collaboratif : ${inviteLink}`,
      `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfbf7; color: #162136; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #162136; font-size: 28px; font-weight: 700; margin: 0;">🌍 Home Away</h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 5px;">Centralisez vos voyages, partagez l'aventure.</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border: 1px solid #eef0f2;">
          <h2 style="font-size: 24px; margin-bottom: 20px;">Nouvelle invitation !</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            <b>${senderName}</b> vous a invité(e) à participer à l'organisation de son prochain voyage sur HomeAway pour le voyage : <b>"${tripTitle}"</b>.
          </p>
          
          <a href="${inviteLink}" style="display: inline-block; background-color: #f45d3d; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(244, 93, 61, 0.3);">
            Rejoindre le voyage
          </a>
          
          <p style="color: #64748b; font-size: 14px;">
            Vous pourrez consulter l'itinéraire, les logements et participer à la planification commune.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} HomeAway. Tous droits réservés.</p>
        </div>
      </div>
      `
    );

    res.status(201).json({ message: 'Invitation sent' });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Join trip via token
router.post('/join/:token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find invitation
    const invitations = await query('SELECT * FROM invitations WHERE invite_code = ? AND status = ? AND expires_at > ?', [token, 'pending', new Date()]);
    
    if (invitations.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }
    
    const invite = invitations[0];
    
    // Add user to trip_members
    await run(
      'INSERT INTO trip_members (trip_id, user_id, role) VALUES (?, ?, ?)',
      [invite.trip_id, req.userId, invite.role]
    );
    
    // Update invitation status
    await run('UPDATE invitations SET status = ?, user_id = ? WHERE id = ?', ['accepted', req.userId, invite.id]);
    
    res.json({ message: 'Joined trip successfully', tripId: invite.trip_id });
  } catch (error) {
    if (error.code === '23505' || error.message.includes('UNIQUE constraint failed') || error.message.includes('already a member')) {
      return res.status(400).json({ error: 'You are already a member of this trip' });
    }
    console.error('Join trip error:', error);
    res.status(500).json({ error: 'Failed to join trip' });
  }
});

// Remove member
router.delete('/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    await run('DELETE FROM trip_members WHERE id = ?', [memberId]);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Cancel invitation
router.delete('/invitations/:invitationId', authenticateToken, async (req, res) => {
  try {
    const { invitationId } = req.params;
    await run('DELETE FROM invitations WHERE id = ?', [invitationId]);
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

export default router;
