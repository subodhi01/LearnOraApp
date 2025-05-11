import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZD2ibGpFEKLXKUmtiRiXk0Iu6bYM3ndw",
  authDomain: "mern-state-c4955.firebaseapp.com",
  projectId: "mern-state-c4955",
  storageBucket: "mern-state-c4955.appspot.com",
  messagingSenderId: "793707996795",
  appId: "1:793707996795:web:a6e7793caa9ce26523e4de"
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