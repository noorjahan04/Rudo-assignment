const User = require('../models/User');
const { getUserBalances, getNetBalance } = require('./balanceService');

/**
 * Get or create user
 */
const getOrCreateUser = async (firebaseUID, email, name) => {
  let user = await User.findOne({ firebaseUID });
  
  if (!user) {
    user = await User.create({
      firebaseUID,
      email: email || '',
      name: name || ''
    });
  }
  
  return user;
};

/**
 * Update user FCM token
 */
const updateFCMToken = async (userId, fcmToken) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.fcmToken = fcmToken;
  await user.save();
  return user;
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Get user balances
 */
const getUserBalancesData = async (userId, groupId = null) => {
  return await getUserBalances(userId, groupId);
};

module.exports = {
  getOrCreateUser,
  updateFCMToken,
  getUserProfile,
  getUserBalancesData
};