import express from 'express';
import { getUserById } from '../services/userService.js';

const router = express.Router();

/**
 * GET /api/user/:userId
 * Fetch LinkedIn user profile details from Firestore
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // You can modify this structure based on what you want to return
    res.json({
      id: userId,
      name: `${user.profile.given_name || ''} ${user.profile.family_name || ''}`.trim(),
      email: user.profile.email || null,
      picture: user.profile.picture || null,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

export default router;
