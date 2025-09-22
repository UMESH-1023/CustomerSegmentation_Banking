require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');

const sampleUsers = [
  {
    email: 'admin@bankseg.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'customer',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    employmentStatus: 'employed',
    annualIncome: 75000,
    accountType: 'checking',
    averageAccountBalance: 15420.50,
    monthlyTransactionAmount: 45
  }
];

const sampleTransactions = [
  {
    type: 'debit',
    amount: 45.67,
    description: 'Starbucks Coffee',
    category: 'food',
    date: new Date('2024-01-15'),
    balance: 12300.33
  },
  {
    type: 'credit',
    amount: 2500.00,
    description: 'Salary Deposit',
    category: 'income',
    date: new Date('2024-01-14'),
    balance: 12346.00
  },
  {
    type: 'debit',
    amount: 89.32,
    description: 'Gas Station',
    category: 'transport',
    date: new Date('2024-01-13'),
    balance: 9846.00
  }
];

async function populateSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bank_segmentation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    for (const userData of sampleUsers) {
      const user = new User({
        email: userData.email,
        password: userData.password,
        role: userData.role
      });
      await user.save();
      console.log(`Created user: ${user.email}`);

      // If customer, create customer profile
      if (userData.role === 'customer') {
        const customerData = { ...userData };
        delete customerData.email;
        delete customerData.password;
        delete customerData.role;

        const customer = new Customer({
          user: user._id,
          ...customerData
        });
        await customer.save();
        console.log(`Created customer profile for: ${user.email}`);

        // Create sample transactions for the customer
        const transactionsWithUser = sampleTransactions.map(t => ({
          ...t,
          user: user._id
        }));

        for (const transaction of transactionsWithUser) {
          const newTransaction = new Transaction(transaction);
          await newTransaction.save();
        }
        console.log(`Created ${sampleTransactions.length} sample transactions`);
      }
    }

    console.log('Sample data populated successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin@bankseg.com / admin123');
    console.log('Customer: john.doe@example.com / password123');

  } catch (error) {
    console.error('Error populating sample data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
populateSampleData();
