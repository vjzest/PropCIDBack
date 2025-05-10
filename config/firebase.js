// firebase.js (for backend Node.js)

import {
  initializeApp as initializeClientApp,
  getApps,
  getApp,
} from "firebase/app";
import { getFirestore as getClientFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// --- Client SDK (for limited Firebase features in Node, like storage access if needed)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Prevent duplicate client app initialization
const clientApp = getApps().length
  ? getApp()
  : initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp);
const clientStorage = getStorage(clientApp);

// --- Admin SDK (for server-side usage like verifying tokens, managing users)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();
const bucket = admin.storage().bucket();

export {
  // Admin SDK
  admin,
  adminAuth as auth,
  adminDb as db,
  adminStorage,
  bucket,

  // Client SDK (optional on backend)
  clientApp,
  clientDb,
  clientStorage,
};
