const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// @route   GET /api/admin/customers
// @desc    Get all customers with filtering and pagination
// @access  Private (Admin)
router.get(
  '/customers',
  auth,
  admin,
  adminController.getCustomers
);

// @route   GET /api/admin/customers/:id
// @desc    Get customer by ID
// @access  Private (Admin)
router.get(
  '/customers/:id',
  auth,
  admin,
  adminController.getCustomerById
);

// @route   PUT /api/admin/customers/:id/segment
// @desc    Update customer segment
// @access  Private (Admin)
router.put(
  '/customers/:id/segment',
  [
    auth,
    admin,
    [
      check('segment', 'Valid segment is required').isIn([
        'young_saver',
        'established_professional',
        'mortgage_seeker',
        'retired_affluent'
      ])
    ]
  ],
  adminController.updateCustomerSegment
);

// @route   GET /api/admin/segments
// @desc    Get segmentation analytics
// @access  Private (Admin)
router.get(
  '/segments',
  auth,
  admin,
  adminController.getSegmentationAnalytics
);

// @route   GET /api/admin/analytics
// @desc    Get banking patterns analytics
// @access  Private (Admin)
router.get(
  '/analytics',
  auth,
  admin,
  adminController.getBankingPatterns
);

// @route   POST /api/admin/run-segmentation
// @desc    Run customer segmentation algorithm
// @access  Private (Admin)
router.post(
  '/run-segmentation',
  auth,
  admin,
  adminController.runSegmentation
);

// @route   GET /api/admin/export/customers
// @desc    Export customer data
// @access  Private (Admin)
router.get(
  '/export/customers',
  auth,
  admin,
  adminController.exportCustomerData
);

module.exports = router;
