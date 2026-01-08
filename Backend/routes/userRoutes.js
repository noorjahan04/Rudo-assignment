const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/fcm-token', userController.updateFCMToken);
router.get('/balances', userController.getBalances);

module.exports = router;