const userService = require('../services/userService');
const { getUserBalances, getNetBalance } = require('../services/balanceService');

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update FCM token
 */
const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const user = await userService.updateFCMToken(req.user._id, fcmToken);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user balances
 */
const getBalances = async (req, res) => {
  try {
    const { groupId } = req.query;
    const balances = await getUserBalances(req.user._id, groupId || null);
    const netBalance = await getNetBalance(req.user._id, groupId || null);
    
    res.json({
      success: true,
      data: {
        ...balances,
        netBalance: netBalance.netBalance,
        totalOwes: netBalance.totalOwes,
        totalOwed: netBalance.totalOwed
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateFCMToken,
  getBalances
};