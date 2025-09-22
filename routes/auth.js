const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('role', 'Please specify a valid role').isIn(['customer', 'admin'])
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get current user's data
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   POST api/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  authController.forgotPassword
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password/:token',
  [
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    check('confirmPassword', 'Passwords must match').custom((value, { req }) => value === req.body.password)
  ],
  authController.resetPassword
);

module.exports = router;
