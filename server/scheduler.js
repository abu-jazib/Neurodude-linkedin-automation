import cron from 'node-cron';
import axios from 'axios';
import { getUserById } from './services/userService.js';
import {
  getPostsDueForPublishing,
  savePublishedPost,
  updatePostStatus,
  deleteOldScheduledPosts // Import the cleanup function
} from './services/postService.js';

import {
  registerImageUpload,
  fetchImageAsBuffer,
  uploadImage
} from './utils/linkedinUpload.js';

export const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    console.log('[Scheduler] Running task to publish scheduled posts...');

    try {
      const postsToPublish = await getPostsDueForPublishing();

      for (const post of postsToPublish) {
        const { userId, text, imageUrl, id: postId } = post;

        const user = await getUserById(userId);
        if (!user?.linkedin?.accessToken) {
          console.warn(`[Scheduler] User ${userId} not authenticated with LinkedIn.`);
          await updatePostStatus(postId, 'cancelled');
          continue;
        }

        try {
          const accessToken = user.linkedin.accessToken;
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
                  shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
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

          await updatePostStatus(postId, 'posted');

          console.log(`[SUCCESS] Posted scheduled post ${postId} for user ${userId}`);
        } catch (err) {
          console.error(`[ERROR] Failed to post ${postId}:`, err.response?.data || err.message);
        }
      }

      // 🧹 Cleanup old posted/cancelled posts
      const deletedCount = await deleteOldScheduledPosts();
      console.log(`[CLEANUP] Deleted ${deletedCount} old posts.`);

    } catch (error) {
      console.error('[Scheduler] Error processing scheduled posts:', error);
    }
  });
};
