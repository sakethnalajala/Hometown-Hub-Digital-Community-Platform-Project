import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase when a real API key is present. In demo mode
// (NEXT_PUBLIC_DEMO_MODE=true) the keys are intentionally absent and Firebase
// is never used, so initializing would throw `auth/invalid-api-key` and break
// the production build during static prerendering.
const hasFirebaseConfig = Boolean(firebaseConfig.apiKey);

const app = hasFirebaseConfig
  ? !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
const db = app ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);
const googleProvider = hasFirebaseConfig ? new GoogleAuthProvider() : (null as unknown as GoogleAuthProvider);

export { app, auth, db, googleProvider };
