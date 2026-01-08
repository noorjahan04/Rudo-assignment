const settlementService = require('../services/settlementService');

/**
 * Create settlement
 */
const createSettlement = async (req, res) => {
  try {
    const settlement = await settlementService.createSettlement(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: settlement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get group settlements
 */
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await settlementService.getGroupSettlements(groupId, req.user._id);
    res.json({
      success: true,
      data: settlements
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get user settlements (non-group)
 */
const getUserSettlements = async (req, res) => {
  try {
    const settlements = await settlementService.getUserSettlements(req.user._id);
    res.json({
      success: true,
      data: settlements
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  getUserSettlements
};
