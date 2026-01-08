const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const debtSimplificationController = require('../controllers/debtSimplificationController');

// All routes require authentication
router.use(authenticate);

router.get('/global', debtSimplificationController.getGlobalSimplifiedDebtsHandler);
router.get('/group/:groupId', debtSimplificationController.getGroupSimplifiedDebtsHandler);

module.exports = router;