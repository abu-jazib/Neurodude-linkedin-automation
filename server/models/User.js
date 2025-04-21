/**
 * User model schema representation
 * @typedef {Object} User
 * @property {string} id - Unique user identifier (LinkedIn sub ID)
 * @property {Object} profile - User profile information from LinkedIn
 * @property {string} profile.given_name - User's first name
 * @property {string} profile.family_name - User's last name
 * @property {string} profile.email - User's email address
 * @property {string} profile.picture - URL to user's profile picture
 * @property {string} profile.sub - LinkedIn subject identifier
 * @property {Object} linkedin - LinkedIn connection information
 * @property {string} linkedin.accessToken - OAuth access token
 * @property {number} linkedin.expiresIn - Token expiration time in seconds
 * @property {number} linkedin.issuedAt - Timestamp when token was issued
 * @property {string} lastLogin - ISO date string of last login
 * @property {string} createdAt - Firestore server timestamp of user creation
 * @property {string} updatedAt - Firestore server timestamp of last update
 */

/**
 * Validate user object structure
 * @param {Object} userData - User data to validate
 * @returns {boolean} Whether the user data is valid
 */
export const validateUser = (userData) => {
    if (!userData) return false;
    
    // Check required fields
    if (!userData.profile || !userData.linkedin) return false;
    
    // Check LinkedIn credentials
    if (!userData.linkedin.accessToken || 
        !userData.linkedin.expiresIn || 
        !userData.linkedin.issuedAt) {
      return false;
    }
    
    return true;
  };
  
  /**
   * Create a user object with default values
   * @param {string} userId - User ID
   * @param {Object} profile - Profile information
   * @param {Object} linkedin - LinkedIn credentials
   * @returns {User} User object
   */
  export const createUserObject = (userId, profile, linkedin) => {
    return {
      id: userId,
      profile: {
        given_name: profile.given_name || '',
        family_name: profile.family_name || '',
        email: profile.email || '',
        picture: profile.picture || '',
        sub: profile.sub || userId
      },
      linkedin: {
        accessToken: linkedin.accessToken,
        expiresIn: linkedin.expiresIn,
        issuedAt: linkedin.issuedAt || Date.now()
      },
      lastLogin: new Date().toISOString(),
      createdAt: null, // Will be set by Firestore
      updatedAt: null  // Will be set by Firestore
    };
  };