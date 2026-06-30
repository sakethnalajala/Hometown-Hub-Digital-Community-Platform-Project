import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
// You need to set the FIREBASE_SERVICE_ACCOUNT_KEY in your .env
// It should be a base64 encoded string of your service account json
export const initFirebaseAdmin = () => {
  try {
    if (!getApps().length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
        );
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('Firebase Admin Initialized');
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin not initialized.');
      }
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
};

export const verifyFirebaseToken = async (idToken: string) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw error;
  }
};
