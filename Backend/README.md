# Rudo Backend - Splitwise-like Expense Sharing API

A comprehensive backend API for managing shared expenses, groups, balances, and settlements with Firebase Authentication and debt simplification.

## Features
- ✅ **Firebase Authentication** (mandatory)
- ✅ User management
- ✅ Group management with admin controls
- ✅ Expense tracking with multiple split types (EQUAL, EXACT, PERCENT)
- ✅ Automatic balance calculation
- ✅ **Debt Simplification Algorithm** (mandatory)
- ✅ Settlement tracking
- ✅ Push notifications via FCM (optional)
- ✅ RESTful API design

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **Push Notifications**: Web Push API (FCM)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Authentication enabled
- Firebase service account key (for backend authentication)

### Installation
1. Clone the repository and navigate to Backend directory:
   ```bash
   cd Backend
2. Install dependencies:
   npm install
3. Set up environment variables
   Create a .env file in the Backend directory:

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/rudo-backend
    FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
    VAPID_PUBLIC_KEY=your_public_key
    VAPID_PRIVATE_KEY=your_private_key

4. Configure Firebase
   You need to set up Firebase Admin SDK. There are two ways:
Option 1: Service Account JSON (Recommended)
          Go to Firebase Console → Project Settings → Service Accounts
          Generate a new private key
          Copy the JSON content and set it as FIREBASE_SERVICE_ACCOUNT in .env (as a JSON string)

Option 2: Service Account Key File
          Download the service account key file
          Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the file path
          Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

5. Start MongoDB
   Make sure MongoDB is running locally or update MONGODB_URI to your cloud instance.

6. Start the server:
   npm start
   The server will start on http://localhost:3000

## How to Obtain Firebase Tokens for Testing
   Using Firebase Web SDK
   Initialize Firebase in your frontend:
   import { initializeApp } from "firebase/app";
   import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

  const firebaseConfig = {
  apiKey: "AIzaSyApGm7UXlf1hWGQgnNab4PtsRnno2BxmVU",
  authDomain: "rudobackend.firebaseapp.com",
  projectId: "rudobackend",
  storageBucket: "rudobackend.firebasestorage.app",
  messagingSenderId: "198504074090",
  appId: "1:198504074090:web:b99a960e137780f293f313"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  

1. Clone the repository and navigate to Backend directory:
   ```bash
   cd Backend
