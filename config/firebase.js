// firebase.js

import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// --- Client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const clientApp = initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp);
const storage = getStorage(clientApp);

// --- Admin SDK (for backend)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const auth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { auth, adminDb as db, admin, storage, adminStorage };
