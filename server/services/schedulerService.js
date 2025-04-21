import { getPostsDueForPublishing, updatePostStatus } from './postService.js';
import { getUserById } from './userService.js';
import axios from 'axios';

/**
 * Process scheduled posts due for publishing
 * @returns {Promise<Array>} List of processed posts
 */
export const processScheduledPosts = async () => {
  try {
    // Get posts that need to be published
    const posts = await getPostsDueForPublishing();
    const results = [];
    
    for (const post of posts) {
      try {
        // Get user to check for valid token
        const user = await getUserById(post.userId);
        
        if (!user || !user.linkedin?.accessToken) {
          // Mark as failed if user not found or no LinkedIn token
          await updatePostStatus(post.id, 'failed');
          results.push({ id: post.id, status: 'failed', reason: 'User not authenticated' });
          continue;
        }
        
        // Post to LinkedIn
        const response = await axios.post(
          'https://api.linkedin.com/v2/ugcPosts',
          {
            author: `urn:li:person:${user.id}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: post.text
                },
                shareMediaCategory: post.imageUrl ? 'IMAGE' : 'NONE',
                media: post.imageUrl ? [{
                  status: 'READY',
                  description: {
                    text: 'Image Description'
                  },
                  media: 'urn:li:image:1234567890' // This would need proper image upload first
                }] : undefined
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          },
          {
            headers: {
              Authorization: `Bearer ${user.linkedin.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update post status to posted
        await updatePostStatus(post.id, 'posted');
        results.push({ id: post.id, status: 'posted', linkedInId: response.data.id });
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        await updatePostStatus(post.id, 'failed');
        results.push({ id: post.id, status: 'failed', reason: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
    throw error;
  }
};

/**
 * Initialize scheduler to run at regular intervals
 * @param {number} intervalMs - Interval in milliseconds (default: 1 minute)
 */
export const initScheduler = (intervalMs = 60000) => {
  console.log(`Scheduling post processor to run every ${intervalMs / 1000} seconds`);
  
  setInterval(async () => {
    try {
      console.log('Running scheduled post processor...');
      const results = await processScheduledPosts();
      
      if (results.length > 0) {
        console.log(`Processed ${results.length} scheduled posts:`, results);
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, intervalMs);
};