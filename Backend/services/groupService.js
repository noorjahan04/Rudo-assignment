const Group = require('../models/Group');
const User = require('../models/User');
const { notifyUserAddedToGroup } = require('./notificationService');

/**
 * Create a group
 */
const createGroup = async (name, description, creatorId) => {
  const group = await Group.create({
    name,
    description: description || '',
    creator: creatorId,
    members: [creatorId],
    admins: [creatorId]
  });
  
  return await Group.findById(group._id)
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('admins', 'name email');
};

/**
 * Add member to group
 */
const addMember = async (groupId, userId, addedById) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user has permission (creator or admin)
  const isAdmin = group.creator.toString() === addedById.toString() || 
                  group.admins.some(admin => admin.toString() === addedById.toString());
  
  if (!isAdmin) {
    throw new Error('Only group creators or admins can add members');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if already a member
  if (group.members.some(m => m.toString() === userId)) {
    throw new Error('User is already a member');
  }

  group.members.push(userId);
  await group.save();

  // Send notification
  await notifyUserAddedToGroup(userId, group.name, addedById);

  return await Group.findById(groupId)
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('admins', 'name email');
};

/**
 * Remove member from group
 */
const removeMember = async (groupId, userId, removedById) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user has permission
  const isAdmin = group.creator.toString() === removedById.toString() || 
                  group.admins.some(admin => admin.toString() === removedById.toString());
  
  if (!isAdmin) {
    throw new Error('Only group creators or admins can remove members');
  }

  // Cannot remove creator
  if (group.creator.toString() === userId) {
    throw new Error('Cannot remove group creator');
  }

  // Remove from members and admins
  group.members = group.members.filter(m => m.toString() !== userId);
  group.admins = group.admins.filter(a => a.toString() !== userId);
  await group.save();

  return await Group.findById(groupId)
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('admins', 'name email');
};

/**
 * Get user's groups
 */
const getUserGroups = async (userId) => {
  return await Group.find({ members: userId })
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('admins', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get group by ID (with permission check)
 */
const getGroupById = async (groupId, userId) => {
  const group = await Group.findById(groupId)
    .populate('creator', 'name email')
    .populate('members', 'name email')
    .populate('admins', 'name email');
  
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is a member
  const isMember = group.members.some(m => m.toString() === userId);
  if (!isMember) {
    throw new Error('You are not a member of this group');
  }

  return group;
};

module.exports = {
  createGroup,
  addMember,
  removeMember,
  getUserGroups,
  getGroupById
};