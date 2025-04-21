import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const POSTS_COLLECTION = 'scheduledPosts';

/**
 * Get all scheduled posts for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} List of scheduled posts
 */
export const getScheduledPosts = async (userId) => {
  try {
    const db = getDb();
    const snapshot = await db.collection(POSTS_COLLECTION)
      .where('userId', '==', userId)
      .where('status', '==', 'scheduled')
      .orderBy('scheduleTime')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduleTime: doc.data().scheduleTime?.toDate()
    }));
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    throw error;
  }
};

/**
 * Schedule a post for future publishing
 * @param {Object} postData - Post data including userId, text, imageUrl, scheduleTime
 * @returns {Promise<string>} Post ID
 */
export const schedulePost = async (postData) => {
  try {
    const db = getDb();
    const postRef = db.collection(POSTS_COLLECTION).doc();
    
    await postRef.set({
      ...postData,
      status: 'scheduled',
      createdAt: FieldValue.serverTimestamp(),
      scheduleTime: new Date(postData.scheduleTime)
    });
    
    return postRef.id;
  } catch (error) {
    console.error('Error scheduling post:', error);
    throw error;
  }
};

/**
 * Save a published post
 * @param {Object} postData - Post data including userId, text, imageUrl
 * @returns {Promise<string>} Post ID
 */
export const savePublishedPost = async (postData) => {
  try {
    const db = getDb();
    const postRef = db.collection(POSTS_COLLECTION).doc();
    
    await postRef.set({
      ...postData,
      status: 'posted',
      postedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    });
    
    return postRef.id;
  } catch (error) {
    console.error('Error saving published post:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled post
 * @param {string} postId - The post ID
 * @param {string} userId - The user's ID (for verification)
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const cancelScheduledPost = async (postId, userId) => {
  try {
    const db = getDb();
    const postRef = db.collection(POSTS_COLLECTION).doc(postId);
    const post = await postRef.get();
    
    if (!post.exists) {
      return false;
    }
    
    const postData = post.data();
    
    if (postData.userId !== userId || postData.status !== 'scheduled') {
      return false;
    }
    
    await postRef.update({
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    throw error;
  }
};

/**
 * Get posts that need to be published now
 * @returns {Promise<Array>} List of posts ready for publishing
 */
export const getPostsDueForPublishing = async () => {
  try {
    const db = getDb();
    const now = new Date();
    
    const snapshot = await db.collection(POSTS_COLLECTION)
      .where('status', '==', 'scheduled')
      .where('scheduleTime', '<=', now)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduleTime: doc.data().scheduleTime?.toDate()
    }));
  } catch (error) {
    console.error('Error getting posts due for publishing:', error);
    throw error;
  }
};

/**
 * Update post status
 * @param {string} postId - The post ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updatePostStatus = async (postId, status) => {
  try {
    const db = getDb();
    await db.collection(POSTS_COLLECTION).doc(postId).update({
      status,
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
};

/**
 * Delete all posts with status 'posted' or 'cancelled'
 * @returns {Promise<number>} Number of deleted documents
 */
export const deleteOldScheduledPosts = async () => {
  try {
    const db = getDb();

    // Query posts with status 'posted' or 'cancelled'
    const snapshot = await db.collection(POSTS_COLLECTION)
      .where('status', 'in', ['posted', 'cancelled'])
      .get();

    if (snapshot.empty) {
      console.log('[Cleanup] No posts to delete.');
      return 0;
    }

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`[Cleanup] Deleted ${snapshot.size} posts.`);
    return snapshot.size;
  } catch (error) {
    console.error('Error deleting old scheduled posts:', error);
    throw error;
  }
};
