const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const settlementController = require('../controllers/settlementController');

// All routes require authentication
router.use(authenticate);

router.post('/', settlementController.createSettlement);
router.get('/user', settlementController.getUserSettlements);
router.get('/group/:groupId', settlementController.getGroupSettlements);

module.exports = router;