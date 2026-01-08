const Balance = require('../models/Balance');
const User = require('../models/User');

/**
 * Update balance between two users
 */
const updateBalance = async (fromUser, toUser, amount, groupId = null) => {
  if (fromUser.toString() === toUser.toString()) {
    return; // No balance for same user
  }

  // Find existing balance
  let balance = await Balance.findOne({
    user: fromUser,
    owesTo: toUser,
    group: groupId
  });

  if (balance) {
    balance.amount += amount;
    if (balance.amount < 0) {
      // If amount becomes negative, reverse the balance
      const reverseAmount = Math.abs(balance.amount);
      balance.amount = 0;
      await balance.save();
      
      // Update reverse balance
      await updateBalance(toUser, fromUser, reverseAmount, groupId);
      return;
    } else if (balance.amount === 0) {
      await Balance.deleteOne({ _id: balance._id });
      return;
    }
    await balance.save();
  } else {
    if (amount > 0) {
      await Balance.create({
        user: fromUser,
        owesTo: toUser,
        amount: amount,
        group: groupId
      });
    } else if (amount < 0) {
      // Create reverse balance
      await updateBalance(toUser, fromUser, Math.abs(amount), groupId);
    }
  }
};

/**
 * Get all balances for a user
 */
const getUserBalances = async (userId, groupId = null) => {
  const query = { user: userId };
  const owedByQuery = { owesTo: userId };
  
  if (groupId !== null && groupId !== undefined) {
    query.group = groupId;
    owedByQuery.group = groupId;
  } else {
    // When groupId is null, get only non-group balances
    query.group = null;
    owedByQuery.group = null;
  }

  const balances = await Balance.find(query)
    .populate('owesTo', 'name email firebaseUID')
    .populate('group', 'name');

  const owedBy = await Balance.find(owedByQuery)
    .populate('user', 'name email firebaseUID')
    .populate('group', 'name');

  return {
    owes: balances.map(b => ({
      to: b.owesTo,
      amount: b.amount,
      group: b.group
    })),
    owedBy: owedBy.map(b => ({
      from: b.user,
      amount: b.amount,
      group: b.group
    }))
  };
};

/**
 * Get net balance for a user (total owed - total owes)
 */
const getNetBalance = async (userId, groupId = null) => {
  const query = { user: userId };
  const owedByQuery = { owesTo: userId };
  
  if (groupId !== null && groupId !== undefined) {
    query.group = groupId;
    owedByQuery.group = groupId;
  } else {
    // When groupId is null, get only non-group balances
    query.group = null;
    owedByQuery.group = null;
  }

  const totalOwes = await Balance.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalOwedBy = await Balance.aggregate([
    { $match: owedByQuery },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const owes = (totalOwes[0] && totalOwes[0].total) ? totalOwes[0].total : 0;
  const owed = (totalOwedBy[0] && totalOwedBy[0].total) ? totalOwedBy[0].total : 0;

  return {
    netBalance: owed - owes,
    totalOwes: owes,
    totalOwed: owed
  };
};

/**
 * Recalculate balances for an expense
 */
const recalculateExpenseBalances = async (expense) => {
  // Handle both Mongoose document and plain object
  let paidBy = expense.paidBy;
  if (paidBy && paidBy._id) {
    paidBy = paidBy._id;
  }
  
  const participants = expense.participants || [];
  
  let group = expense.group;
  if (group && group._id) {
    group = group._id;
  }

  // Update balances
  for (const participant of participants) {
    let participantUser = participant.user;
    if (participantUser && participantUser._id) {
      participantUser = participantUser._id;
    }
    
    const share = participant.amount || 0;

    if (participantUser && participantUser.toString() !== paidBy.toString()) {
      // Participant owes the payer
      await updateBalance(participantUser, paidBy, share, group || null);
    }
  }
};

module.exports = {
  updateBalance,
  getUserBalances,
  getNetBalance,
  recalculateExpenseBalances
};
