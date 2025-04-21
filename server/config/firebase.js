import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

/**
 * Initialize Firebase Admin SDK and Firestore
 */
export const initFirebase = () => {
  try {
    // Check if credentials are available
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.error('Firebase credentials not found in environment variables');
      throw new Error('Firebase credentials missing');
    }

    // Use environment variables for Firebase configuration
    const firebaseConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    };

    // Initialize Firebase Admin
    const app = initializeApp(firebaseConfig);
    
    // Initialize Firestore
    db = getFirestore(app);
    db.settings({ ignoreUndefinedProperties: true });
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // If in development, create a mock database for testing
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock database for development');
    } else {
      // In production, we want to fail loudly
      throw error;
    }
  }
};

/**
 * Get Firestore database instance
 * @returns {FirebaseFirestore.Firestore} Firestore database instance
 */
export const getDb = () => {
  if (!db) {
    throw new Error('Firebase has not been initialized. Call initFirebase() first.');
  }
  return db;
};