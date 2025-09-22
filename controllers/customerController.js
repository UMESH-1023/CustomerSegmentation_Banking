const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

// @desc    Get current customer's profile
// @route   GET /api/customers/me
// @access  Private (Customer)
exports.getMyProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    // Format response
    const response = {
      personalInfo: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        phone: customer.phone,
        address: customer.address
      },
      financialInfo: {
        employmentStatus: customer.employmentStatus,
        annualIncome: customer.annualIncome,
        creditScore: customer.creditScore,
        accountType: customer.accountType,
        averageAccountBalance: customer.averageAccountBalance,
        monthlyTransactionAmount: customer.monthlyTransactionAmount
      },
      preferences: {
        preferredCommunication: customer.preferredCommunication
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current customer's profile
// @route   PUT /api/customers/me
// @access  Private (Customer)
exports.updateMyProfile = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
      employmentStatus,
      annualIncome,
      accountType,
      averageAccountBalance,
      monthlyTransactionAmount,
      preferredCommunication
    } = req.body;
    
    // Find and update customer profile
    let customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      // If no profile exists, create a new one
      customer = new Customer({
        user: req.user.id,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        address,
        employmentStatus,
        annualIncome,
        accountType,
        averageAccountBalance,
        monthlyTransactionAmount,
        preferredCommunication
      });
    } else {
      // Update existing profile
      customer.firstName = firstName;
      customer.lastName = lastName;
      customer.dateOfBirth = dateOfBirth;
      customer.gender = gender;
      customer.phone = phone;
      customer.address = address;
      customer.employmentStatus = employmentStatus;
      customer.annualIncome = annualIncome;
      customer.accountType = accountType;
      customer.averageAccountBalance = averageAccountBalance;
      customer.monthlyTransactionAmount = monthlyTransactionAmount;
      customer.preferredCommunication = preferredCommunication;
      customer.updatedAt = Date.now();
    }
    
    await customer.save();
    
    res.json({
      message: 'Profile updated successfully',
      customer: {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: req.user.email,
        phone: customer.phone
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer's segmentation data
// @route   GET /api/customers/segmentation
// @access  Private (Customer)
exports.getSegmentationData = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    
    // Segment descriptions
    const segmentDescriptions = {
      'young_saver': {
        name: 'Young Saver',
        description: 'Young individuals starting their financial journey',
        characteristics: [
          'Age: 18-30 years',
          'Low to medium income',
          'Growing savings',
          'Digital banking preference'
        ],
        recommendations: [
          'Start a savings plan',
          'Explore student/young professional accounts',
          'Consider investment options for beginners'
        ]
      },
      'established_professional': {
        name: 'Established Professional',
        description: 'Mid-career professionals with stable income',
        characteristics: [
          'Age: 30-50 years',
          'Stable and growing income',
          'Multiple financial goals',
          'Investing for future'
        ],
        recommendations: [
          'Maximize retirement contributions',
          'Explore investment portfolios',
          'Consider premium banking services'
        ]
      },
      'mortgage_seeker': {
        name: 'Mortgage Seeker',
        description: 'Individuals looking to purchase property',
        characteristics: [
          'Age: 25-40 years',
          'Stable employment',
          'Good credit history',
          'Saving for down payment'
        ],
        recommendations: [
          'Check mortgage eligibility',
          'Explore first-time homebuyer programs',
          'Improve credit score if needed'
        ]
      },
      'retired_affluent': {
        name: 'Retired & Affluent',
        description: 'Retired individuals with significant assets',
        characteristics: [
          'Age: 60+ years',
          'Substantial savings and investments',
          'Focus on wealth preservation',
          'Estate planning'
        ],
        recommendations: [
          'Review retirement withdrawal strategy',
          'Estate planning services',
          'Wealth management options'
        ]
      }
    };
    
    // Get segment data if available
    let segmentData = null;
    if (customer.segment && segmentDescriptions[customer.segment]) {
      segmentData = segmentDescriptions[customer.segment];
      segmentData.segment = customer.segment;
    }
    
    // Calculate financial health score (example)
    const financialHealth = calculateFinancialHealth(customer);
    
    res.json({
      segment: segmentData || { name: 'Not Yet Segmented', description: 'Your segment will be determined based on your profile and banking behavior.' },
      riskProfile: customer.riskProfile || 'medium',
      financialHealth,
      lastUpdated: customer.updatedAt || customer.createdAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit customer feedback
// @route   POST /api/customers/feedback
// @access  Private (Customer)
exports.submitFeedback = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { rating, comments } = req.body;
  
  try {
    // In a real application, you would save this to a feedback collection
    // For now, we'll just log it
    console.log('New feedback received:', {
      userId: req.user.id,
      rating,
      comments,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      rating,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate financial health score
function calculateFinancialHealth(customer) {
  // Simple scoring system (0-100)
  let score = 50; // Base score
  
  // Income factor (higher is better)
  const income = customer.annualIncome || 0;
  if (income > 100000) score += 20;
  else if (income > 60000) score += 15;
  else if (income > 30000) score += 10;
  else if (income > 15000) score += 5;
  
  // Savings factor (higher is better)
  const savingsRatio = ((customer.averageAccountBalance || 0) / (income || 1)) * 12; // Months of expenses
  if (savingsRatio > 12) score += 20;
  else if (savingsRatio > 6) score += 15;
  else if (savingsRatio > 3) score += 10;
  else if (savingsRatio > 1) score += 5;
  
  // Debt factor (lower is better)
  const totalDebt = (customer.loanHistory || []).reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const debtToIncome = income > 0 ? (totalDebt / income) : 0;
  
  if (debtToIncome < 0.1) score += 20;
  else if (debtToIncome < 0.3) score += 15;
  else if (debtToIncome < 0.5) score += 10;
  else if (debtToIncome < 1) score += 5;
  
  // Transaction activity (moderate is best)
  const monthlyTransactions = customer.monthlyTransactionAmount || 0;
  if (monthlyTransactions > 0 && monthlyTransactions < income / 3) score += 10;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine rating
  let rating = 'Fair';
  if (score >= 80) rating = 'Excellent';
  else if (score >= 65) rating = 'Good';
  else if (score >= 45) rating = 'Average';
  else rating = 'Needs Improvement';
  
  return {
    score: Math.round(score),
    rating,
    factors: {
      income: income > 0 ? 'Good' : 'Not Provided',
      savings: savingsRatio > 3 ? 'Good' : 'Could be Improved',
      debt: debtToIncome < 0.5 ? 'Manageable' : 'High',
      activity: monthlyTransactions > 0 ? 'Active' : 'Inactive'
    }
  };
}
