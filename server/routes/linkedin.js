import express from 'express';
import axios from 'axios';
import { getUserById } from '../services/userService.js';
import {
  getScheduledPosts,
  schedulePost,
  savePublishedPost,
  cancelScheduledPost
} from '../services/postService.js';

const router = express.Router();

// -----------------------------
// 🔧 Helper functions
// -----------------------------
const registerImageUpload = async (accessToken, userId) => {
  const response = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        owner: `urn:li:person:${userId}`,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD']
      }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadUrl = response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = response.data.value.asset;
  return { uploadUrl, asset };
};

const fetchImageAsBuffer = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
};

const uploadImage = async (uploadUrl, imageBuffer) => {
  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': imageBuffer.length
    }
  });
};

// -----------------------------
// 🚀 Post content to LinkedIn
// -----------------------------
router.post('/post', async (req, res) => {
  const { userId, text, imageUrl, scheduleTime } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ error: 'User ID and text content are required' });
  }

  try {
    const user = await getUserById(userId);

    if (!user || !user.linkedin?.accessToken) {
      return res.status(401).json({ error: 'User not authenticated with LinkedIn' });
    }

    const accessToken = user.linkedin.accessToken;

    // ⏰ If scheduling for future
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      const postId = await schedulePost({
        userId,
        text,
        imageUrl,
        scheduleTime
      });

      return res.json({
        id: postId,
        status: 'scheduled',
        scheduleTime
      });
    }

    // 🚀 Post immediately
    let assetUrn = null;

    if (imageUrl) {
      const { uploadUrl, asset } = await registerImageUpload(accessToken, user.id);
      const imageBuffer = await fetchImageAsBuffer(imageUrl);
      await uploadImage(uploadUrl, imageBuffer);
      assetUrn = asset;
    }

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${user.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
            media: assetUrn ? [{
              status: 'READY',
              media: assetUrn,
              description: { text: 'Image Description' }
            }] : undefined
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const postId = await savePublishedPost({
      userId,
      text,
      imageUrl,
      linkedinPostId: response.data.id
    });

    res.json({
      id: postId,
      status: 'posted',
      postedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('LinkedIn post error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post to LinkedIn' });
  }
});

// -----------------------------
// 📅 Get scheduled posts
// -----------------------------
router.get('/scheduled', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const posts = await getScheduledPosts(userId);
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

// -----------------------------
// ❌ Cancel scheduled post
// -----------------------------
router.delete('/scheduled/:postId', async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const success = await cancelScheduledPost(postId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Scheduled post not found or already posted' });
    }

    res.json({ success: true, message: 'Scheduled post cancelled' });
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled post' });
  }
});

export default router;
