/**
 * Post model schema representation
 * @typedef {Object} Post
 * @property {string} id - Unique post identifier
 * @property {string} userId - Reference to user who created the post
 * @property {string} text - Post content text
 * @property {string} [imageUrl] - Optional URL to post image
 * @property {Date} [scheduleTime] - Optional time when post should be published
 * @property {string} status - Post status (scheduled, posted, cancelled, failed)
 * @property {Date} [postedAt] - When the post was published to LinkedIn
 * @property {Date} [cancelledAt] - When the post was cancelled
 * @property {string} [linkedinPostId] - ID of the post on LinkedIn after publishing
 * @property {Date} createdAt - Firestore server timestamp of post creation
 * @property {Date} updatedAt - Firestore server timestamp of last update
 */

/**
 * Post status enum
 */
export const PostStatus = {
  SCHEDULED: 'scheduled',
  POSTED: 'posted',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};

/**
 * Validate post object structure
 * @param {Object} postData - Post data to validate
 * @returns {boolean} Whether the post data is valid
 */
export const validatePost = (postData) => {
  if (!postData) return false;
  
  // Check required fields
  if (!postData.userId || !postData.text) return false;
  
  // Check status validity
  const validStatuses = Object.values(PostStatus);
  if (postData.status && !validStatuses.includes(postData.status)) {
    return false;
  }
  
  // If scheduled, must have scheduleTime
  if (postData.status === PostStatus.SCHEDULED && !postData.scheduleTime) {
    return false;
  }
  
  return true;
};

/**
 * Create a post object with default values
 * @param {string} userId - User ID
 * @param {string} text - Post text content
 * @param {Object} options - Additional post options
 * @returns {Post} Post object
 */
export const createPostObject = (userId, text, options = {}) => {
  const { imageUrl, scheduleTime } = options;
  
  const status = scheduleTime && new Date(scheduleTime) > new Date() 
    ? PostStatus.SCHEDULED 
    : PostStatus.POSTED;
  
  return {
    userId,
    text,
    imageUrl,
    scheduleTime: scheduleTime ? new Date(scheduleTime) : null,
    status,
    postedAt: status === PostStatus.POSTED ? new Date() : null,
    createdAt: null, // Will be set by Firestore
    updatedAt: null  // Will be set by Firestore
  };
};