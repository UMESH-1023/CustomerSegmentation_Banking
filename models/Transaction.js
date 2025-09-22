const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'entertainment', 'shopping', 'bills', 'healthcare', 'education', 'travel', 'investment', 'other'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  balance: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

// Virtual for month/year grouping
transactionSchema.virtual('monthYear').get(function() {
  const date = new Date(this.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return this.amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
});

module.exports = mongoose.model('Transaction', transactionSchema);
