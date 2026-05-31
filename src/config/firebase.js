import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
];

export const isFirebaseConfigured = requiredConfigValues.every(Boolean);

// Initialize Firebase only when local environment variables are available.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

if (!isFirebaseConfigured) {
  console.warn(
    'Firebase is not configured. Auth and saved mat features are disabled until VITE_FIREBASE_* env vars are set.'
  );
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

// Initialize Firebase Storage for generated mat previews
export const storage = app ? getStorage(app) : null;

export default app;
