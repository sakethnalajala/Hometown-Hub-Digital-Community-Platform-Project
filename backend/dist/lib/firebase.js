"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = exports.initFirebaseAdmin = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
// Initialize Firebase Admin SDK
// You need to set the FIREBASE_SERVICE_ACCOUNT_KEY in your .env
// It should be a base64 encoded string of your service account json
const initFirebaseAdmin = () => {
    try {
        if (!(0, app_1.getApps)().length) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
                (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                });
                console.log('Firebase Admin Initialized');
            }
            else {
                console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin not initialized.');
            }
        }
    }
    catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
};
exports.initFirebaseAdmin = initFirebaseAdmin;
const verifyFirebaseToken = async (idToken) => {
    try {
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        throw error;
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
//# sourceMappingURL=firebase.js.map