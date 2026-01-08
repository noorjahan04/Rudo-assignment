Rudo Backend - Splitwise-like Expense Sharing API
A comprehensive backend API for managing shared expenses, groups, balances, and settlements with Firebase Authentication and debt simplification.

Features
✅ Firebase Authentication (mandatory)
✅ User management
✅ Group management with admin controls
✅ Expense tracking with multiple split types (EQUAL, EXACT, PERCENT)
✅ Automatic balance calculation
✅ Debt Simplification Algorithm (mandatory)
✅ Settlement tracking
✅ Push notifications via FCM (optional)
✅ RESTful API design
Tech Stack
Backend: Node.js with Express
Database: MongoDB with Mongoose
Authentication: Firebase Admin SDK
Push Notifications: Web Push API (FCM)
Setup Instructions
Prerequisites
Node.js (v14 or higher)
MongoDB (local or cloud instance)
Firebase project with Authentication enabled
Firebase service account key (for backend authentication)
Installation
Clone the repository and navigate to Backend directory

cd Backend
Install dependencies

npm install
Set up environment variables

Create a .env file in the Backend directory:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/rudo-backend
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
Configure Firebase

You need to set up Firebase Admin SDK. There are two ways:

Option 1: Service Account JSON (Recommended)

Go to Firebase Console → Project Settings → Service Accounts
Generate a new private key
Copy the JSON content and set it as FIREBASE_SERVICE_ACCOUNT in .env (as a JSON string)
Option 2: Service Account Key File

Download the service account key file
Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the file path
Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
Start MongoDB

Make sure MongoDB is running locally or update MONGODB_URI to your cloud instance.

Start the server

npm start
The server will start on http://localhost:3000

How to Obtain Firebase Tokens for Testing
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
Sign in and get ID token:

// Sign in with email and password
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Get ID token
const idToken = await user.getIdToken();

// Use this token in API requests
fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
Create test users in Firebase Console:

Go to Firebase Console → Authentication → Users
Add users manually or enable Email/Password authentication
Users can then sign in to get their tokens
Using cURL or Postman
Get Firebase ID token from your frontend application
Use it in the Authorization header:
Authorization: Bearer <your-firebase-id-token>
API Documentation
Base URL
http://localhost:3000/api
All endpoints require authentication via Firebase ID token in the Authorization header:

Authorization: Bearer <firebase-id-token>
Response Format
All responses follow this format:

{
  "success": true/false,
  "data": {...},
  "message": "Error message (if success is false)"
}
User Endpoints
Get User Profile
GET /api/users/profile
Returns the current authenticated user's profile.

Response:

{
  "success": true,
  "data": {
    "_id": "user_id",
    "firebaseUID": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "fcmToken": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
Update FCM Token
PUT /api/users/fcm-token
Register or update FCM token for push notifications.

Request Body:

{
  "fcmToken": "fcm_token_string"
}
Get User Balances
GET /api/users/balances?groupId=optional_group_id
Get user's balances (who owes them and whom they owe).

Query Parameters:

groupId (optional): Filter balances for a specific group
Response:

{
  "success": true,
  "data": {
    "owes": [
      {
        "to": { "name": "User 2", "email": "user2@example.com" },
        "amount": 100.50,
        "group": { "name": "Trip to Goa" }
      }
    ],
    "owedBy": [
      {
        "from": { "name": "User 3", "email": "user3@example.com" },
        "amount": 50.25,
        "group": null
      }
    ],
    "netBalance": -50.25,
    "totalOwes": 100.50,
    "totalOwed": 50.25
  }
}
Group Endpoints
Create Group
POST /api/groups
Create a new group.

Request Body:

{
  "name": "Trip to Goa",
  "description": "Weekend trip expenses"
}
Response:

{
  "success": true,
  "data": {
    "_id": "group_id",
    "name": "Trip to Goa",
    "description": "Weekend trip expenses",
    "creator": { "name": "User 1", "email": "user1@example.com" },
    "members": [...],
    "admins": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
Get User's Groups
GET /api/groups
Get all groups the user is a member of.

Get Group by ID
GET /api/groups/:groupId
Get details of a specific group (must be a member).

Add Member to Group
POST /api/groups/:groupId/members
Add a user to a group (only creators/admins can add members).

Request Body:

{
  "userId": "user_id_to_add"
}
Remove Member from Group
DELETE /api/groups/:groupId/members
Remove a user from a group (only creators/admins can remove members).

Request Body:

{
  "userId": "user_id_to_remove"
}
Expense Endpoints
Create Expense
POST /api/expenses
Create a new expense.

Request Body:

{
  "description": "Dinner at restaurant",
  "amount": 1000,
  "paidBy": "user_id_who_paid",
  "group": "group_id",  // optional, null for non-group expenses
  "splitType": "EQUAL",  // EQUAL, EXACT, or PERCENT
  "participants": [
    {
      "user": "user_id_1"
      // For EQUAL: no amount/percentage needed
      // For EXACT: "amount": 300
      // For PERCENT: "percentage": 30
    },
    {
      "user": "user_id_2"
    }
  ]
}
Split Type Examples:

EQUAL Split:

{
  "splitType": "EQUAL",
  "participants": [
    { "user": "user_id_1" },
    { "user": "user_id_2" },
    { "user": "user_id_3" }
  ]
}
Each participant pays 1000/3 = ₹333.33

EXACT Split:

{
  "splitType": "EXACT",
  "participants": [
    { "user": "user_id_1", "amount": 400 },
    { "user": "user_id_2", "amount": 300 },
    { "user": "user_id_3", "amount": 300 }
  ]
}
Total must equal expense amount (1000)

PERCENT Split:

{
  "splitType": "PERCENT",
  "participants": [
    { "user": "user_id_1", "percentage": 50 },
    { "user": "user_id_2", "percentage": 30 },
    { "user": "user_id_3", "percentage": 20 }
  ]
}
Percentages must sum to 100%

Response:

{
  "success": true,
  "data": {
    "_id": "expense_id",
    "description": "Dinner at restaurant",
    "amount": 1000,
    "paidBy": { "name": "User 1", "email": "user1@example.com" },
    "splitType": "EQUAL",
    "participants": [...],
    "date": "2024-01-01T00:00:00.000Z"
  }
}
Get Group Expenses
GET /api/expenses/group/:groupId
Get all expenses for a specific group.

Get User Expenses (Non-group)
GET /api/expenses/user
Get all non-group expenses involving the user.

Update Expense
PUT /api/expenses/:expenseId
Update an expense (only creator or payer can update).

Request Body: Same as create expense, but all fields are optional.

Delete Expense
DELETE /api/expenses/:expenseId
Delete an expense (only creator or payer can delete). Balances are automatically reversed.

Settlement Endpoints
Create Settlement
POST /api/settlements
Record a settlement (one user paying another).

Request Body:

{
  "fromUser": "user_id_who_pays",
  "toUser": "user_id_who_receives",
  "amount": 500,
  "group": "group_id",  // optional
  "description": "Settled via UPI"
}
Response:

{
  "success": true,
  "data": {
    "_id": "settlement_id",
    "fromUser": { "name": "User 1", "email": "user1@example.com" },
    "toUser": { "name": "User 2", "email": "user2@example.com" },
    "amount": 500,
    "group": { "name": "Trip to Goa" },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
Get Group Settlements
GET /api/settlements/group/:groupId
Get settlement history for a group.

Get User Settlements (Non-group)
GET /api/settlements/user
Get non-group settlements involving the user.

Debt Simplification Endpoints
Get Global Simplified Debts
GET /api/debts/global
Get simplified debt settlement list across all groups (minimum transactions to settle all debts).

Response:

{
  "success": true,
  "data": {
    "settlements": [
      {
        "from": { "name": "User 1", "email": "user1@example.com" },
        "to": { "name": "User 2", "email": "user2@example.com" },
        "amount": 150.50
      },
      {
        "from": { "name": "User 3", "email": "user3@example.com" },
        "to": { "name": "User 2", "email": "user2@example.com" },
        "amount": 75.25
      }
    ],
    "count": 2
  }
}
Get Group Simplified Debts
GET /api/debts/group/:groupId
Get simplified debt settlement list for a specific group.

Response:

{
  "success": true,
  "data": {
    "group": {
      "id": "group_id",
      "name": "Trip to Goa"
    },
    "settlements": [
      {
        "from": { "name": "User 1", "email": "user1@example.com" },
        "to": { "name": "User 2", "email": "user2@example.com" },
        "amount": 100.00
      }
    ],
    "count": 1
  }
}
Note: This endpoint returns the minimum number of transactions needed to settle all debts. It does not modify actual balances unless you create settlements using the settlement endpoints.

Example Usage
Example 1: Creating an Expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dinner at restaurant",
    "amount": 1500,
    "paidBy": "user_id_1",
    "group": "group_id",
    "splitType": "EQUAL",
    "participants": [
      { "user": "user_id_1" },
      { "user": "user_id_2" },
      { "user": "user_id_3" }
    ]
  }'
Example 2: Viewing Balances
curl -X GET "http://localhost:3000/api/users/balances?groupId=group_id" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Example 3: Debt Simplification Output
curl -X GET http://localhost:3000/api/debts/group/group_id \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Output:

{
  "success": true,
  "data": {
    "group": {
      "id": "group_id",
      "name": "Trip to Goa"
    },
    "settlements": [
      {
        "from": {
          "_id": "user_id_1",
          "name": "Alice",
          "email": "alice@example.com"
        },
        "to": {
          "_id": "user_id_2",
          "name": "Bob",
          "email": "bob@example.com"
        },
        "amount": 250.75
      },
      {
        "from": {
          "_id": "user_id_3",
          "name": "Charlie",
          "email": "charlie@example.com"
        },
        "to": {
          "_id": "user_id_2",
          "name": "Bob",
          "email": "bob@example.com"
        },
        "amount": 100.50
      }
    ],
    "count": 2
  }
}
This means:

Alice should pay Bob ₹250.75
Charlie should pay Bob ₹100.50
After these 2 transactions, all debts in the group will be settled
Assumptions
Currency: All amounts are in the same currency (no currency conversion)
Rounding: Amounts are rounded to 2 decimal places
Balance Updates: Balances are automatically updated when expenses are created/updated/deleted
Settlements: Settlements immediately update balances
Group Membership: Users can only view/modify groups they are members of
Expense Permissions: Only expense creator or payer can update/delete expenses
Group Permissions: Only group creators or admins can add/remove members
Debt Simplification: The algorithm uses a greedy approach to minimize transactions
FCM Tokens: Push notifications are optional; the system works without them
Firebase Auth: All API endpoints (except health check) require valid Firebase ID tokens
Project Structure
Backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin configuration
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── expenseController.js
│   │   ├── settlementController.js
│   │   └── debtSimplificationController.js
│   ├── middleware/
│   │   └── auth.js              # Firebase authentication middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   ├── Settlement.js
│   │   └── Balance.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── settlementRoutes.js
│   │   └── debtSimplificationRoutes.js
│   ├── services/
│   │   ├── userService.js
│   │   ├── groupService.js
│   │   ├── expenseService.js
│   │   ├── balanceService.js
│   │   ├── settlementService.js
│   │   ├── debtSimplificationService.js
│   │   └── notificationService.js
│   └── index.js                 # Main server file
├── .env.example
├── package.json
└── README.md
Error Handling
All errors return a consistent format:

{
  "success": false,
  "message": "Error message describing what went wrong"
}
Common HTTP status codes:

200: Success
201: Created
400: Bad Request (validation errors, invalid input)
401: Unauthorized (missing or invalid token)
403: Forbidden (insufficient permissions)
404: Not Found
500: Internal Server Error
Security Features
Firebase Token Verification: Every protected endpoint verifies Firebase ID tokens
User Isolation: Users can only access resources they own or are part of
Group Permissions: Strict permission checks for group operations
Input Validation: All inputs are validated before processing
MongoDB Injection Protection: Using Mongoose ODM prevents injection attacks
Testing
To test the API:

Start the server: npm start
Use Postman, cURL, or any HTTP client
Get a Firebase ID token from your frontend
Include it in the Authorization header: Bearer <token>
Make requests to the endpoints
Future Enhancements
 Add pagination for expenses and settlements
 Add filtering and sorting options
 Implement expense categories
 Add currency support
 Implement expense attachments
 Add group expense summaries
 Implement recurring expenses
 Add email notifications
 Implement rate limiting
 Add comprehensive logging
License
ISC

Support
For issues or questions, please refer to the project documentation or contact the development team.