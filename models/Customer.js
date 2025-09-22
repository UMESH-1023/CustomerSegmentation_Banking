const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Financial Information
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed', 'retired', 'student'],
    required: true
  },
  annualIncome: {
    type: Number,
    required: true
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850
  },
  
  // Banking Behavior
  accountType: {
    type: String,
    enum: ['savings', 'checking', 'both', 'other'],
    required: true
  },
  averageAccountBalance: {
    type: Number,
    required: true
  },
  monthlyTransactionAmount: {
    type: Number,
    required: true
  },
  loanHistory: [{
    type: {
      type: String,
      enum: ['personal', 'home', 'auto', 'education', 'other']
    },
    amount: Number,
    status: String, // 'active', 'paid', 'defaulted'
    startDate: Date,
    endDate: Date
  }],
  
  // Customer Segmentation Data
  segment: {
    type: String,
    enum: ['young_saver', 'established_professional', 'mortgage_seeker', 'retired_affluent', null],
    default: null
  },
  riskProfile: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Additional Information
  preferredCommunication: {
    type: [String],
    enum: ['email', 'sms', 'phone', 'mail'],
    default: ['email']
  },
  lastLogin: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add text index for search functionality
customerSchema.index({
  'firstName': 'text',
  'lastName': 'text',
  'email': 'text',
  'phone': 'text'
});

module.exports = mongoose.model('Customer', customerSchema);
