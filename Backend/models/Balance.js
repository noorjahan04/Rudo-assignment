const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  owesTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique balance per user-owesTo-group combination
balanceSchema.index({ user: 1, owesTo: 1, group: 1 }, { unique: true });

balanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Balance', balanceSchema);