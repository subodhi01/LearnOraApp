import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

// Note: CORS configuration for Firebase Storage should be set using the Firebase CLI
// Run the following command in your terminal:
// gsutil cors set cors.json gs://learnora-5d358.appspot.com
//
// Where cors.json contains:
// [
//   {
//     "origin": ["http://localhost:3000"],
//     "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     "maxAgeSeconds": 3600,
//     "responseHeader": ["Content-Type", "Authorization"]
//   }
// ] 