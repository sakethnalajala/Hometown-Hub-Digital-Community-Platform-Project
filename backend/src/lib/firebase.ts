// Firebase Admin is imported LAZILY (dynamic import inside each function) on
// purpose. firebase-admin/auth transitively requires jwks-rsa -> jose, and
// jose@6 is ESM-only; require()-ing it crashes on Node < 22.12. Keeping these
// imports out of module scope means nothing Firebase-related loads at startup.
// In demo mode (no FIREBASE_SERVICE_ACCOUNT_KEY) it is never loaded at all.

// Initialize Firebase Admin SDK.
// Set FIREBASE_SERVICE_ACCOUNT_KEY (base64-encoded service-account JSON) to enable.
export const initFirebaseAdmin = async () => {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin not initialized.');
      return;
    }
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    if (!getApps().length) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
};

export const verifyFirebaseToken = async (idToken: string) => {
  const { getAuth } = await import('firebase-admin/auth');
  const decodedToken = await getAuth().verifyIdToken(idToken);
  return decodedToken;
};
