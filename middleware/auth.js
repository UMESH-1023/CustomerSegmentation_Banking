const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Something went wrong with auth middleware');
    res.status(500).json({ message: 'Server Error' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is customer
const customer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Customer account required.' });
  }
};

module.exports = { auth, admin, customer };
