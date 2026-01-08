const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const groupController = require('../controllers/groupController');

// All routes require authentication
router.use(authenticate);

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:groupId', groupController.getGroup);
router.post('/:groupId/members', groupController.addMember);
router.delete('/:groupId/members', groupController.removeMember);

module.exports = router;
