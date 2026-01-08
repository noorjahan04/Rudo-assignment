const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Ensure creator is in admins and members
  const creatorId = this.creator.toString();
  const isInAdmins = this.admins.some(admin => admin.toString() === creatorId);
  const isInMembers = this.members.some(member => member.toString() === creatorId);
  
  if (!isInAdmins) {
    this.admins.push(this.creator);
  }
  if (!isInMembers) {
    this.members.push(this.creator);
  }
});

module.exports = mongoose.model('Group', groupSchema);