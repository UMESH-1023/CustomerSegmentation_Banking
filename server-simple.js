require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demo purposes
const mockUsers = {
  'admin@bankseg.com': {
    id: 'admin-123',
    email: 'admin@bankseg.com',
    role: 'admin',
    name: 'Admin User'
  },
  'john.doe@example.com': {
    id: 'user-123',
    email: 'john.doe@example.com',
    role: 'customer',
    name: 'John Doe',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      averageAccountBalance: 15420.50,
      monthlyTransactionAmount: 45,
      segment: 'Young Saver'
    }
  }
};

const mockTransactions = [
  {
    _id: 'demo-transaction-1',
    user: 'user-123',
    type: 'debit',
    amount: 45.67,
    description: 'Starbucks Coffee',
    category: 'food',
    date: '2024-01-15T10:30:00Z',
    balance: 12300.33
  },
  {
    _id: 'demo-transaction-2',
    user: 'user-123',
    type: 'credit',
    amount: 2500.00,
    description: 'Salary Deposit',
    category: 'income',
    date: '2024-01-14T09:00:00Z',
    balance: 12346.00
  }
];

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers[email];

  if (user && password === 'password123') {
    res.json({
      token: 'demo-token-12345',
      user: user
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, ...userData } = req.body;

  if (mockUsers[email]) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: 'new-user-' + Date.now(),
    email: email,
    role: 'customer',
    name: userData.firstName + ' ' + userData.lastName,
    profile: userData
  };

  mockUsers[email] = newUser;

  res.json({
    token: 'demo-token-12345',
    user: newUser
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === 'demo-token-12345') {
    const email = Object.keys(mockUsers).find(email => mockUsers[email].id);
    if (email) {
      res.json(mockUsers[email]);
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Transaction routes
app.get('/api/transactions', (req, res) => {
  res.json(mockTransactions);
});

app.get('/api/transactions/stats', (req, res) => {
  res.json({
    totalIncome: 2500,
    totalExpenses: 45.67,
    netAmount: 2454.33,
    transactionCount: 2,
    categoryTotals: { food: 45.67 },
    averageTransaction: 22.835
  });
});

// Basic API routes
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
  res.json({
    message: 'Bank Customer Segmentation API is running!',
    status: 'success',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at: http://localhost:3000`);
});
