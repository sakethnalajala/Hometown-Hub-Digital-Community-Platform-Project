"use strict";
// Firebase Admin is imported LAZILY (dynamic import inside each function) on
// purpose. firebase-admin/auth transitively requires jwks-rsa -> jose, and
// jose@6 is ESM-only; require()-ing it crashes on Node < 22.12. Keeping these
// imports out of module scope means nothing Firebase-related loads at startup.
// In demo mode (no FIREBASE_SERVICE_ACCOUNT_KEY) it is never loaded at all.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = exports.initFirebaseAdmin = void 0;
// Initialize Firebase Admin SDK.
// Set FIREBASE_SERVICE_ACCOUNT_KEY (base64-encoded service-account JSON) to enable.
const initFirebaseAdmin = async () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin not initialized.');
            return;
        }
        const { getApps, initializeApp, cert } = await Promise.resolve().then(() => __importStar(require('firebase-admin/app')));
        if (!getApps().length) {
            const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
            initializeApp({
                credential: cert(serviceAccount),
            });
            console.log('Firebase Admin Initialized');
        }
    }
    catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
};
exports.initFirebaseAdmin = initFirebaseAdmin;
const verifyFirebaseToken = async (idToken) => {
    const { getAuth } = await Promise.resolve().then(() => __importStar(require('firebase-admin/auth')));
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
};
exports.verifyFirebaseToken = verifyFirebaseToken;
//# sourceMappingURL=firebase.js.map