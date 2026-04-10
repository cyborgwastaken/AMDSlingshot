// TODO: Fill in your Firebase project config from Firebase Console → Project Settings
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// getFirestore is available in firebase v9+; may need: import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'nutriquest-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'nutriquest-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:000:web:000',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// TODO: export const db = getFirestore(app); — requires Firebase Firestore config
export const db = null;
export const googleProvider = new GoogleAuthProvider();
