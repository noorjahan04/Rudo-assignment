const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { updateBalance } = require('./balanceService');
const { notifySettlement } = require('./notificationService');

/**
 * Create settlement
 */
const createSettlement = async (settlementData, createdById) => {
  const { fromUser, toUser, amount, group, description } = settlementData;

  if (fromUser.toString() === toUser.toString()) {
    throw new Error('Cannot settle with yourself');
  }

  if (amount <= 0) {
    throw new Error('Settlement amount must be positive');
  }

  // If group settlement, verify both users are group members
  if (group) {
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      throw new Error('Group not found');
    }
    
    const allMembers = groupDoc.members.map(m => m.toString());
    if (!allMembers.includes(fromUser.toString()) || !allMembers.includes(toUser.toString())) {
      throw new Error('Both users must be members of the group');
    }
  }

  // Create settlement record
  const settlement = await Settlement.create({
    fromUser,
    toUser,
    amount,
    group: group || null,
    description: description || ''
  });

  // Update balances (fromUser pays toUser, so fromUser's debt to toUser decreases)
  await updateBalance(fromUser, toUser, -amount, group || null);

  // Send notifications
  await notifySettlement(toUser, amount, fromUser);

  return await Settlement.findById(settlement._id)
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('group', 'name');
};

/**
 * Get settlement history for a group
 */
const getGroupSettlements = async (groupId, userId) => {
  // Verify user is member of group
  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }
  
  const isMember = group.members.some(m => m.toString() === userId);
  if (!isMember) {
    throw new Error('You are not a member of this group');
  }

  return await Settlement.find({ group: groupId })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .populate('group', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Get user's settlements (non-group)
 */
const getUserSettlements = async (userId) => {
  return await Settlement.find({
    group: null,
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ]
  })
    .populate('fromUser', 'name email')
    .populate('toUser', 'name email')
    .sort({ createdAt: -1 });
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  getUserSettlements
};
