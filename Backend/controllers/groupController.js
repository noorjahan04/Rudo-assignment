const groupService = require('../services/groupService');

/**
 * Create group
 */
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    const group = await groupService.createGroup(name, description, req.user._id);
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add member to group
 */
const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const group = await groupService.addMember(groupId, userId, req.user._id);
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove member from group
 */
const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const group = await groupService.removeMember(groupId, userId, req.user._id);
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user's groups
 */
const getGroups = async (req, res) => {
  try {
    const groups = await groupService.getUserGroups(req.user._id);
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get group by ID
 */
const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await groupService.getGroupById(groupId, req.user._id);
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createGroup,
  addMember,
  removeMember,
  getGroups,
  getGroup
};