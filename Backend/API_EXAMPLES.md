API Usage Examples
This document provides practical examples of how to use the Rudo Backend API.

Prerequisites
Get a Firebase ID token from your frontend application
Replace YOUR_FIREBASE_TOKEN with your actual token
Replace user_id, group_id, etc. with actual IDs from your database
Example 1: Complete Expense Flow
Step 1: Get User Profile
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Step 2: Create a Group
curl -X POST http://localhost:3000/api/groups \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Trip",
    "description": "Expenses for weekend trip to Goa"
  }'
Response will include _id - save this as group_id.

Step 3: Add Members to Group
curl -X POST http://localhost:3000/api/groups/group_id/members \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "other_user_id"
  }'
Step 4: Create an Expense (EQUAL Split)
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Hotel booking",
    "amount": 3000,
    "paidBy": "your_user_id",
    "group": "group_id",
    "splitType": "EQUAL",
    "participants": [
      { "user": "your_user_id" },
      { "user": "user_id_2" },
      { "user": "user_id_3" }
    ]
  }'
Step 5: Create an Expense (EXACT Split)
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Restaurant dinner",
    "amount": 1500,
    "paidBy": "your_user_id",
    "group": "group_id",
    "splitType": "EXACT",
    "participants": [
      { "user": "your_user_id", "amount": 500 },
      { "user": "user_id_2", "amount": 600 },
      { "user": "user_id_3", "amount": 400 }
    ]
  }'
Step 6: Create an Expense (PERCENT Split)
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Taxi fare",
    "amount": 2000,
    "paidBy": "your_user_id",
    "group": "group_id",
    "splitType": "PERCENT",
    "participants": [
      { "user": "your_user_id", "percentage": 50 },
      { "user": "user_id_2", "percentage": 30 },
      { "user": "user_id_3", "percentage": 20 }
    ]
  }'
Step 7: View Balances
curl -X GET "http://localhost:3000/api/users/balances?groupId=group_id" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Step 8: Get Debt Simplification
curl -X GET http://localhost:3000/api/debts/group/group_id \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Step 9: Record a Settlement
curl -X POST http://localhost:3000/api/settlements \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromUser": "user_id_2",
    "toUser": "your_user_id",
    "amount": 500,
    "group": "group_id",
    "description": "Paid via UPI"
  }'
Example 2: Non-Group Expenses
Create Non-Group Expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Shared cab with friend",
    "amount": 500,
    "paidBy": "your_user_id",
    "group": null,
    "splitType": "EQUAL",
    "participants": [
      { "user": "your_user_id" },
      { "user": "friend_user_id" }
    ]
  }'
Get Non-Group Expenses
curl -X GET http://localhost:3000/api/expenses/user \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Example 3: Global Debt Simplification
curl -X GET http://localhost:3000/api/debts/global \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
This returns the minimum number of transactions needed to settle all debts across all groups.

Example 4: Update FCM Token for Push Notifications
curl -X PUT http://localhost:3000/api/users/fcm-token \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "your_fcm_token_from_frontend"
  }'
Example 5: View Group Expenses
curl -X GET http://localhost:3000/api/expenses/group/group_id \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
Example 6: Update an Expense
curl -X PUT http://localhost:3000/api/expenses/expense_id \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "amount": 3500
  }'
Example 7: Delete an Expense
curl -X DELETE http://localhost:3000/api/expenses/expense_id \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
JavaScript/Node.js Example
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const FIREBASE_TOKEN = 'YOUR_FIREBASE_TOKEN';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get user profile
async function getUserProfile() {
  try {
    const response = await api.get('/users/profile');
    console.log('User Profile:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Create a group
async function createGroup(name, description) {
  try {
    const response = await api.post('/groups', { name, description });
    console.log('Group Created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Create an expense
async function createExpense(expenseData) {
  try {
    const response = await api.post('/expenses', expenseData);
    console.log('Expense Created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get balances
async function getBalances(groupId = null) {
  try {
    const url = groupId 
      ? `/users/balances?groupId=${groupId}`
      : '/users/balances';
    const response = await api.get(url);
    console.log('Balances:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get debt simplification
async function getSimplifiedDebts(groupId = null) {
  try {
    const url = groupId 
      ? `/debts/group/${groupId}`
      : '/debts/global';
    const response = await api.get(url);
    console.log('Simplified Debts:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
(async () => {
  const user = await getUserProfile();
  const group = await createGroup('Test Group', 'Testing expenses');
  
  if (group) {
    await createExpense({
      description: 'Test expense',
      amount: 1000,
      paidBy: user._id,
      group: group._id,
      splitType: 'EQUAL',
      participants: [
        { user: user._id }
      ]
    });
    
    await getBalances(group._id);
    await getSimplifiedDebts(group._id);
  }
})();
Postman Collection
You can import these examples into Postman:

Create a new collection
Set collection variable: base_url = http://localhost:3000/api
Set collection variable: token = YOUR_FIREBASE_TOKEN
Use {{base_url}} and {{token}} in your requests
Error Handling Example
try {
  const response = await api.post('/expenses', expenseData);
  if (response.data.success) {
    console.log('Success:', response.data.data);
  }
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
    console.error('Status:', error.response.status);
  } else {
    // Network error
    console.error('Network Error:', error.message);
  }
}