const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, customer } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// @route   GET /api/customers/me
// @desc    Get current customer's profile
// @access  Private (Customer)
router.get('/me', auth, customer, customerController.getMyProfile);

// @route   PUT /api/customers/me
// @desc    Update current customer's profile
// @access  Private (Customer)
router.put(
  '/me',
  [
    auth,
    customer,
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
      check('gender', 'Gender is required').isIn(['male', 'female', 'other', 'prefer-not-to-say']),
      check('phone', 'Phone number is required').not().isEmpty(),
      check('employmentStatus', 'Employment status is required').isIn([
        'employed', 'self-employed', 'unemployed', 'retired', 'student'
      ]),
      check('annualIncome', 'Annual income is required').isNumeric(),
      check('accountType', 'Account type is required').isIn([
        'savings', 'checking', 'both', 'other'
      ]),
      check('averageAccountBalance', 'Average account balance is required').isNumeric(),
      check('monthlyTransactionAmount', 'Monthly transaction amount is required').isNumeric()
    ]
  ],
  customerController.updateMyProfile
);

// @route   GET /api/customers/segmentation
// @desc    Get customer's segmentation data
// @access  Private (Customer)
router.get('/segmentation', auth, customer, customerController.getSegmentationData);

// @route   POST /api/customers/feedback
// @desc    Submit customer feedback
// @access  Private (Customer)
router.post(
  '/feedback',
  [
    auth,
    customer,
    [
      check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
      check('comments', 'Comments are required').not().isEmpty()
    ]
  ],
  customerController.submitFeedback
);

module.exports = router;
