import express from 'express';
import axios from 'axios';
import { getUserById, saveUser, isLinkedInTokenValid } from '../services/userService.js';

const router = express.Router();

// LinkedIn OAuth routes
router.get('/linkedin/connect', (req, res) => {
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=openid%20profile%20w_member_social%20email`;
  res.json({ authUrl: linkedinAuthUrl });
});

router.get('/linkedin/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }
  
  try {
    console.log('Received authorization code:', code);
    // Exchange authorization code for access token
    let tokenResponse;
    
    try {
      tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (tokenErr) {
      console.error('❌ Token exchange failed:', tokenErr.response?.data || tokenErr.message);
      return res.status(500).json({ error: 'Failed to exchange token' });
    }

    const { access_token, expires_in } = tokenResponse.data;

    // Get user profile information
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!profileResponse.data || !profileResponse.data.sub) {
      throw new Error('Failed to retrieve LinkedIn profile information.');
    }

    const userId = profileResponse.data.sub;

    // Store user information in Firestore
    await saveUser(userId, {
      profile: profileResponse.data,
      linkedin: {
        accessToken: access_token,
        expiresIn: expires_in,
        issuedAt: Date.now()
      },
      lastLogin: new Date().toISOString()
    });

    // Redirect to frontend with user ID
    res.redirect(`${process.env.NODE_ENV === 'production' ? '/create' : 'http://localhost:5173/create'}?userId=${userId}`);
  } catch (error) {
    console.error('LinkedIn auth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/status', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    // Get user from Firestore
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    // Check if token is valid
    const isValid = await isLinkedInTokenValid(userId);
    
    if (!isValid) {
      return res.status(401).json({ authenticated: false, reason: 'Token expired' });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: `${user.profile.given_name || ''} ${user.profile.family_name || ''}`.trim(),
        picture: user.profile.picture || null,
        email: user.profile.email || null
      }
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;