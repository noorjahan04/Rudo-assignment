const { getGroupSimplifiedDebts, getGlobalSimplifiedDebts } = require('../services/debtSimplificationService');
const Group = require('../models/Group');

/**
 * Get simplified debts for a group
 */
const getGroupSimplifiedDebtsHandler = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const settlements = await getGroupSimplifiedDebts(groupId);
    res.json({
      success: true,
      data: {
        group: {
          id: group._id,
          name: group.name
        },
        settlements,
        count: settlements.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get global simplified debts
 */
const getGlobalSimplifiedDebtsHandler = async (req, res) => {
  try {
    const settlements = await getGlobalSimplifiedDebts();
    res.json({
      success: true,
      data: {
        settlements,
        count: settlements.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getGroupSimplifiedDebtsHandler,
  getGlobalSimplifiedDebtsHandler
};
