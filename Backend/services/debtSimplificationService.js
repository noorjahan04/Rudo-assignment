const Balance = require('../models/Balance');
const User = require('../models/User');

/**
 * Debt Simplification Algorithm
 * Uses a greedy approach to minimize the number of transactions
 * 
 * Algorithm:
 * 1. Calculate net balance for each user (owed - owes)
 * 2. Separate users into creditors (positive balance) and debtors (negative balance)
 * 3. Use greedy matching to settle debts with minimum transactions
 */
const simplifyDebts = async (groupId = null) => {
  // Get all balances
  const query = groupId ? { group: groupId } : { group: null };
  const balances = await Balance.find(query).populate('user', 'name email').populate('owesTo', 'name email');

  // Calculate net balance for each user
  const netBalances = new Map();
  const userIds = new Set();

  balances.forEach(balance => {
    const userId = balance.user._id.toString();
    const owesToId = balance.owesTo._id.toString();
    
    userIds.add(userId);
    userIds.add(owesToId);

    // User owes money
    if (!netBalances.has(userId)) {
      netBalances.set(userId, { user: balance.user, amount: 0 });
    }
    netBalances.get(userId).amount -= balance.amount;

    // User is owed money
    if (!netBalances.has(owesToId)) {
      netBalances.set(owesToId, { user: balance.owesTo, amount: 0 });
    }
    netBalances.get(owesToId).amount += balance.amount;
  });

  // Separate into creditors (positive) and debtors (negative)
  const creditors = [];
  const debtors = [];

  netBalances.forEach((value, userId) => {
    if (Math.abs(value.amount) > 0.01) { // Ignore very small amounts
      if (value.amount > 0) {
        creditors.push({ userId, user: value.user, amount: value.amount });
      } else {
        debtors.push({ userId, user: value.user, amount: Math.abs(value.amount) });
      }
    }
  });

  // Sort: largest creditors first, largest debtors first
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy matching algorithm
  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    if (creditor.amount === 0) {
      creditorIndex++;
      continue;
    }

    if (debtor.amount === 0) {
      debtorIndex++;
      continue;
    }

    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.user,
      to: creditor.user,
      amount: parseFloat(settlementAmount.toFixed(2))
    });

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
};

/**
 * Get simplified debts for a specific group
 */
const getGroupSimplifiedDebts = async (groupId) => {
  return await simplifyDebts(groupId);
};

/**
 * Get simplified debts globally (across all groups)
 */
const getGlobalSimplifiedDebts = async () => {
  return await simplifyDebts(null);
};

module.exports = {
  simplifyDebts,
  getGroupSimplifiedDebts,
  getGlobalSimplifiedDebts
};
