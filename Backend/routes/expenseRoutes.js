const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

// All routes require authentication
router.use(authenticate);

router.post('/', expenseController.createExpense);
router.get('/user', expenseController.getUserExpenses);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.put('/:expenseId', expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;
