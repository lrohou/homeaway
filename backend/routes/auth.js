import express from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await run('DELETE FROM verification_codes WHERE email = ?', [email]);
    await run('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)', [email, code, expiresAt]);

    // Send email
    const emailSent = await sendEmail(
      email,
      'Votre code de vérification HomeAway',
      `Votre code de vérification est : ${code}`,
      `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfbf7; color: #162136; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #162136; font-size: 28px; font-weight: 700; margin: 0;">🌍 Home Away</h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 5px;">Centralisez vos voyages, partagez l'aventure.</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border: 1px solid #eef0f2;">
          <h2 style="font-size: 24px; margin-bottom: 20px;">Vérification de votre compte</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Bienvenue sur HomeAway ! Pour finaliser la création de votre compte, veuillez utiliser le code de sécurité ci-dessous :
          </p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #f45d3d; margin-bottom: 30px;">
            ${code}
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Ce code expirera dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} HomeAway. Tous droits réservés.</p>
        </div>
      </div>
      `
    );

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send verification email. Please check server logs." });
    }

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const result = await query('SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ?', [email, code, new Date()]);

    if (result.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    res.json({ message: 'Code verified' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, avatar, code } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Verify code again during final registration
    const codeCheck = await query('SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ?', [email, code, new Date()]);
    if (codeCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await run(
      'INSERT INTO users (email, password, name, avatar, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, avatar, 'email', 1]
    );

    // Clean up verification codes
    await run('DELETE FROM verification_codes WHERE email = ?', [email]);

    const token = generateToken(result.lastID);

    // Fetch user data to return
    const users = await query('SELECT id, email, name, avatar FROM users WHERE id = ?', [result.lastID]);
    const user = users[0];

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const users = await query('SELECT * FROM users WHERE email = ? AND auth_provider = ?', [email, 'email']);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google Auth - Get Auth URL
router.get('/google/auth-url', (req, res) => {
  const scopes = ['profile', 'email'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: Math.random().toString(36).substring(7)
  });

  res.json({ authUrl });
});

// Google Auth - Callback
router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Fetch user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const payload = await response.json();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists by Google ID
    let users = await query('SELECT * FROM users WHERE google_id = ?', [googleId]);

    let userId;
    if (users.length > 0) {
      userId = users[0].id;
      // Update info if changed
      await run('UPDATE users SET avatar = ?, name = ? WHERE id = ?', [picture || users[0].avatar, name || users[0].name, userId]);
    } else {
      // Check if user exists by Email
      let usersByEmail = await query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (usersByEmail.length > 0) {
        // Link Google ID to existing account
        userId = usersByEmail[0].id;
        await run('UPDATE users SET google_id = ?, avatar = ?, is_verified = 1 WHERE id = ?', [googleId, picture || usersByEmail[0].avatar, userId]);
      } else {
        // Create new user
        const result = await run(
          'INSERT INTO users (email, name, avatar, auth_provider, google_id, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
          [email, name, picture, 'google', googleId, 1]
        );
        userId = result.lastID;
      }
    }

    const token = generateToken(userId);

    // Fetch user data
    const userResults = await query('SELECT id, email, name, avatar FROM users WHERE id = ?', [userId]);
    const user = userResults[0];

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update current user
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    await run(
      'UPDATE users SET name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, avatar, req.userId]
    );

    const users = await query('SELECT id, email, name, avatar, created_at FROM users WHERE id = ?', [req.userId]);
    res.json(users[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete current user
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    // Delete user (cascade delete should be handled if FK are on, otherwise we do it manually)
    // For now, let's at least delete the user.
    await run('DELETE FROM users WHERE id = ?', [req.userId]);
    // Also delete trip memberships
    await run('DELETE FROM trip_members WHERE user_id = ?', [req.userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Logout (client-side primarily, but can be used for token blacklisting in production)
router.post('/logout', authenticateToken, (req, res) => {
  // In a production app, you might invalidate the token here
  res.json({ message: 'Logged out successfully' });
});

// Get all users (for testing)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await query('SELECT id, email, name, avatar, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
