const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const { recalculateExpenseBalances } = require('./balanceService');
const { notifyExpenseAdded } = require('./notificationService');

/**
 * Validate expense split
 */
const validateExpenseSplit = (splitType, participants, totalAmount) => {
  if (!participants || participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  let total = 0;

  switch (splitType) {
    case 'EQUAL':
      const equalShare = totalAmount / participants.length;
      participants.forEach(p => {
        p.amount = parseFloat(equalShare.toFixed(2));
        total += p.amount;
      });
      // Adjust last participant to account for rounding
      if (total !== totalAmount) {
        const diff = totalAmount - total;
        participants[participants.length - 1].amount += parseFloat(diff.toFixed(2));
      }
      break;

    case 'EXACT':
      participants.forEach(p => {
        if (p.amount === undefined || p.amount === null) {
          throw new Error('Amount required for each participant in EXACT split');
        }
        total += p.amount;
      });
      if (Math.abs(total - totalAmount) > 0.01) {
        throw new Error(`Total participant amounts (${total}) must equal expense amount (${totalAmount})`);
      }
      break;

    case 'PERCENT':
      let totalPercent = 0;
      participants.forEach(p => {
        if (p.percentage === undefined || p.percentage === null) {
          throw new Error('Percentage required for each participant in PERCENT split');
        }
        totalPercent += p.percentage;
        p.amount = parseFloat((totalAmount * p.percentage / 100).toFixed(2));
        total += p.amount;
      });
      if (Math.abs(totalPercent - 100) > 0.01) {
        throw new Error(`Total percentages (${totalPercent}%) must equal 100%`);
      }
      // Adjust last participant to account for rounding
      if (Math.abs(total - totalAmount) > 0.01) {
        const diff = totalAmount - total;
        participants[participants.length - 1].amount += parseFloat(diff.toFixed(2));
      }
      break;

    default:
      throw new Error('Invalid split type');
  }
};

/**
 * Create expense
 */
const createExpense = async (expenseData, createdById) => {
  const { description, amount, paidBy, group, splitType, participants } = expenseData;

  // Validate participants
  const participantIds = participants.map(p => p.user);
  const uniqueParticipants = [...new Set(participantIds.map(id => id.toString()))];
  if (uniqueParticipants.length !== participantIds.length) {
    throw new Error('Duplicate participants not allowed');
  }

  // Validate all participants exist
  const users = await User.find({ _id: { $in: participantIds } });
  if (users.length !== participantIds.length) {
    throw new Error('One or more participants not found');
  }

  // Validate paidBy is in participants
  if (!participantIds.some(id => id.toString() === paidBy.toString())) {
    throw new Error('Payer must be a participant');
  }

  // If group expense, validate all participants are group members
  if (group) {
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      throw new Error('Group not found');
    }
    
    const allMembers = groupDoc.members.map(m => m.toString());
    const allParticipantsAreMembers = participantIds.every(id => 
      allMembers.includes(id.toString())
    );
    
    if (!allParticipantsAreMembers) {
      throw new Error('All participants must be members of the group');
    }
  }

  // Validate and calculate split
  const participantsCopy = participants.map(p => ({ ...p }));
  validateExpenseSplit(splitType, participantsCopy, amount);

  // Create expense
  const expense = await Expense.create({
    description,
    amount,
    paidBy,
    createdBy: createdById,
    group: group || null,
    splitType,
    participants: participantsCopy
  });

  // Recalculate balances
  await recalculateExpenseBalances(expense);

  // Send notifications to participants (except payer)
  const notificationPromises = participantsCopy
    .filter(p => p.user.toString() !== paidBy.toString())
    .map(p => notifyExpenseAdded(p.user, description, paidBy));
  
  await Promise.all(notificationPromises);

  return await Expense.findById(expense._id)
    .populate('paidBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('group', 'name')
    .populate('participants.user', 'name email');
};

/**
 * Get expenses for a group
 */
const getGroupExpenses = async (groupId, userId) => {
  // Verify user is member of group
  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }
  
  const isMember = group.members.some(m => m.toString() === userId);
  if (!isMember) {
    throw new Error('You are not a member of this group');
  }

  return await Expense.find({ group: groupId })
    .populate('paidBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('group', 'name')
    .populate('participants.user', 'name email')
    .sort({ date: -1 });
};

/**
 * Get expenses for a user (non-group expenses)
 */
const getUserExpenses = async (userId) => {
  return await Expense.find({ 
    group: null,
    $or: [
      { paidBy: userId },
      { 'participants.user': userId }
    ]
  })
    .populate('paidBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('participants.user', 'name email')
    .sort({ date: -1 });
};

/**
 * Update expense
 */
const updateExpense = async (expenseId, updateData, userId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }

  // Check permission
  const isCreator = expense.createdBy.toString() === userId.toString();
  const isPayer = expense.paidBy.toString() === userId.toString();
  
  if (!isCreator && !isPayer) {
    throw new Error('Only expense creator or payer can update');
  }

  // Store old expense data for reversing balances
  const oldExpense = {
    paidBy: expense.paidBy,
    participants: expense.participants,
    group: expense.group
  };

  const { description, amount, paidBy, splitType, participants } = updateData;

  // Check if we need to reverse balances (if amount, paidBy, or participants changed)
  const needsBalanceRecalc = amount !== undefined || paidBy !== undefined || participants !== undefined;

  if (description !== undefined) expense.description = description;
  if (amount !== undefined) expense.amount = amount;
  if (paidBy !== undefined) expense.paidBy = paidBy;
  if (splitType !== undefined) expense.splitType = splitType;
  if (participants !== undefined) {
    // Validate new participants
    const participantIds = participants.map(p => p.user);
    const users = await User.find({ _id: { $in: participantIds } });
    if (users.length !== participantIds.length) {
      throw new Error('One or more participants not found');
    }

    // Validate split
    const participantsCopy = participants.map(p => ({ ...p }));
    validateExpenseSplit(splitType || expense.splitType, participantsCopy, amount || expense.amount);
    expense.participants = participantsCopy;
  }

  // If balances need recalculation, reverse old balances first
  if (needsBalanceRecalc) {
    // Reverse old balances
    const reversedExpense = {
      paidBy: oldExpense.paidBy,
      participants: oldExpense.participants.map(p => {
        const participant = p.toObject ? p.toObject() : p;
        return {
          ...participant,
          amount: -(participant.amount || 0)
        };
      }),
      group: oldExpense.group
    };
    await recalculateExpenseBalances(reversedExpense);
  }

  await expense.save();

  // Apply new balances
  if (needsBalanceRecalc) {
    await recalculateExpenseBalances(expense);
  }

  return await Expense.findById(expenseId)
    .populate('paidBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('group', 'name')
    .populate('participants.user', 'name email');
};

/**
 * Delete expense
 */
const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }

  // Check permission
  const isCreator = expense.createdBy.toString() === userId.toString();
  const isPayer = expense.paidBy.toString() === userId.toString();
  
  if (!isCreator && !isPayer) {
    throw new Error('Only expense creator or payer can delete');
  }

  // Reverse balances (subtract instead of add)
  const reversedExpense = {
    paidBy: expense.paidBy,
    participants: expense.participants.map(p => {
      const participant = p.toObject ? p.toObject() : p;
      return {
        ...participant,
        amount: -(participant.amount || 0)
      };
    }),
    group: expense.group
  };
  await recalculateExpenseBalances(reversedExpense);

  await Expense.deleteOne({ _id: expenseId });
  return { success: true };
};

module.exports = {
  createExpense,
  getGroupExpenses,
  getUserExpenses,
  updateExpense,
  deleteExpense
};