const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Send notification to a user using FCM
 */
const sendNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return { success: false, message: 'User not found or no FCM token' };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        title,
        body
      },
      token: user.fcmToken
    };

    try {
      await admin.messaging().send(message);
      return { success: true };
    } catch (error) {
      // If token is invalid, remove it
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        user.fcmToken = null;
        await user.save();
      }
      return { success: false, message: error.message };
    }
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send notification to multiple users
 */
const sendBulkNotifications = async (userIds, title, body, data = {}) => {
  const results = await Promise.all(
    userIds.map(userId => sendNotification(userId, title, body, data))
  );
  return results;
};

/**
 * Notify user added to group
 */
const notifyUserAddedToGroup = async (userId, groupName, addedBy) => {
  const addedByUser = await User.findById(addedBy);
  const addedByName = (addedByUser && addedByUser.name) ? addedByUser.name : 'Someone';
  return await sendNotification(
    userId,
    'Added to Group',
    `${addedByName} added you to the group "${groupName}"`,
    { type: 'group_added', groupId: groupName }
  );
};

/**
 * Notify expense added
 */
const notifyExpenseAdded = async (userId, expenseDescription, paidBy) => {
  const paidByUser = await User.findById(paidBy);
  const paidByName = (paidByUser && paidByUser.name) ? paidByUser.name : 'Someone';
  return await sendNotification(
    userId,
    'New Expense',
    `${paidByName} added expense: "${expenseDescription}"`,
    { type: 'expense_added' }
  );
};

/**
 * Notify settlement recorded
 */
const notifySettlement = async (userId, amount, fromUser) => {
  const fromUserDoc = await User.findById(fromUser);
  const fromUserName = (fromUserDoc && fromUserDoc.name) ? fromUserDoc.name : 'Someone';
  return await sendNotification(
    userId,
    'Settlement Recorded',
    `${fromUserName} settled ₹${amount} with you`,
    { type: 'settlement' }
  );
};

/**
 * Notify debt simplification
 */
const notifyDebtSimplification = async (userId, groupName = null) => {
  const message = groupName 
    ? `Debts simplified for group "${groupName}"`
    : 'Your debts have been simplified';
  
  return await sendNotification(
    userId,
    'Debt Simplification',
    message,
    { type: 'debt_simplification', groupName }
  );
};

module.exports = {
  sendNotification,
  sendBulkNotifications,
  notifyUserAddedToGroup,
  notifyExpenseAdded,
  notifySettlement,
  notifyDebtSimplification
};