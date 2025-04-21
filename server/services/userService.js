import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const USERS_COLLECTION = 'users';

/**
 * Get a user by ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserById = async (userId) => {
  try {
    const db = getDb();
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Create or update a user
 * @param {string} userId - The user's ID
 * @param {Object} userData - User data to store
 * @returns {Promise<string>} User ID
 */
export const saveUser = async (userId, userData) => {
  try {
    const db = getDb();
    await db.collection(USERS_COLLECTION).doc(userId).set({
      ...userData,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    
    return userId;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

/**
 * Check if user's LinkedIn token is valid
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} Whether token is valid
 */
export const isLinkedInTokenValid = async (userId) => {
  try {
    const user = await getUserById(userId);
    
    if (!user || !user.linkedin || !user.linkedin.accessToken) {
      return false;
    }
    
    const expirationTime = user.linkedin.issuedAt + (user.linkedin.expiresIn * 1000);
    return Date.now() < expirationTime;
  } catch (error) {
    console.error('Error checking LinkedIn token:', error);
    return false;
  }
};

/**
 * Delete a user
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    const db = getDb();
    await db.collection(USERS_COLLECTION).doc(userId).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};