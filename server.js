require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bank_segmentation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('MongoDB connection failed, running without database for demo purposes');
    console.log('To enable full functionality, please install MongoDB');
    // Don't exit, continue running without database
  }
};

// Mock data for demo purposes when MongoDB is not available
const mockResponses = {
  '/api/auth/login': {
    token: 'demo-token-12345',
    user: {
      id: 'demo-user-123',
      email: 'demo@bankseg.com',
      role: 'customer'
    }
  },
  '/api/auth/register': {
    token: 'demo-token-12345',
    user: {
      id: 'demo-user-123',
      email: 'demo@bankseg.com',
      role: 'customer'
    }
  },
  '/api/auth/me': {
    id: 'demo-user-123',
    email: 'demo@bankseg.com',
    role: 'customer',
    profile: {
      firstName: 'Demo',
      lastName: 'User',
      averageAccountBalance: 15420.50,
      monthlyTransactionAmount: 45,
      segment: 'Young Saver'
    }
  },
  '/api/transactions': [
    {
      _id: 'demo-transaction-1',
      type: 'debit',
      amount: 45.67,
      description: 'Starbucks Coffee',
      category: 'food',
      date: '2024-01-15T10:30:00Z',
      balance: 12300.33
    },
    {
      _id: 'demo-transaction-2',
      type: 'credit',
      amount: 2500.00,
      description: 'Salary Deposit',
      category: 'income',
      date: '2024-01-14T09:00:00Z',
      balance: 12346.00
    }
  ],
  '/api/transactions/stats': {
    totalIncome: 2500,
    totalExpenses: 45.67,
    netAmount: 2454.33,
    transactionCount: 2,
    categoryTotals: { food: 45.67 },
    averageTransaction: 22.835
  }
};

// Demo mode middleware
app.use('/api', (req, res, next) => {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    const mockResponse = mockResponses[req.path];
    if (mockResponse) {
      console.log(`[DEMO MODE] Serving mock response for ${req.path}`);
      return res.json(mockResponse);
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Basic API routes for frontend integration
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ success: true, message: 'Message received successfully' });
});

app.post('/api/newsletter', (req, res) => {
  console.log('Newsletter subscription:', req.body);
  res.json({ success: true, message: 'Successfully subscribed to newsletter' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Bank Customer Segmentation API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
