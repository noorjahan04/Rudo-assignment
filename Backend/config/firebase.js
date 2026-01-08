const admin = require('firebase-admin');

// Initialize Firebase Admin
// Note: In production, use service account key file
// For now, using the provided config
const firebaseConfig = {
   apiKey: "AIzaSyAvDufKV5tdRQcL4N2cO1nvFZikQ8bbGSE",
  authDomain: "rudo-backend.firebaseapp.com",
  projectId: "rudo-backend",
  storageBucket: "rudo-backend.firebasestorage.app",
  messagingSenderId: "39813852194",
  appId: "1:39813852194:web:1ec5fd8583ae65dc172e7b",
  measurementId: "G-X56XL8GMQS"
};

if (!admin.apps.length) {
  try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId
      });
    } else {
      // Initialize with project ID (requires GOOGLE_APPLICATION_CREDENTIALS or default credentials)
      admin.initializeApp({
        projectId: firebaseConfig.projectId
      });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback: initialize with minimal config
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
  }
}

module.exports = admin;