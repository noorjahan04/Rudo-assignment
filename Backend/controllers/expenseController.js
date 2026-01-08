const expenseService = require('../services/expenseService');

/**
 * Create expense
 */
const createExpense = async (req, res) => {
  try {
    const expense = await expenseService.createExpense(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get group expenses
 */
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await expenseService.getGroupExpenses(groupId, req.user._id);
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user expenses (non-group)
 */
const getUserExpenses = async (req, res) => {
  try {
    const expenses = await expenseService.getUserExpenses(req.user._id);
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update expense
 */
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await expenseService.updateExpense(expenseId, req.body, req.user._id);
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    await expenseService.deleteExpense(expenseId, req.user._id);
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createExpense,
  getGroupExpenses,
  getUserExpenses,
  updateExpense,
  deleteExpense
};