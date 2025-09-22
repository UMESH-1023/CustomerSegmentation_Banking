const Customer = require('../models/Customer');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');

// @desc    Get all customers with filtering and pagination
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getCustomers = async (req, res) => {
  try {
    // Build query object
    const queryObj = {};
    const { segment, search, page = 1, limit = 10 } = req.query;

    // Filter by segment if provided
    if (segment) {
      queryObj.segment = segment;
    }

    // Search functionality
    if (search) {
      queryObj.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const customers = await Customer.find(queryObj)
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const count = await Customer.countDocuments(queryObj);

    // Map segments to readable format
    const segmentMap = {
      'young_saver': 'Young Saver',
      'established_professional': 'Established Professional',
      'mortgage_seeker': 'Mortgage Seeker',
      'retired_affluent': 'Retired & Affluent'
    };

    // Format response
    const response = {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      customers: customers.map(customer => ({
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.user.email,
        phone: customer.phone,
        segment: customer.segment ? segmentMap[customer.segment] || customer.segment : 'Not Segmented',
        riskProfile: customer.riskProfile,
        lastLogin: customer.lastLogin,
        accountStatus: customer.accountStatus,
        createdAt: customer.createdAt
      }))
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('user', 'email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Format response
    const response = {
      id: customer._id,
      personalInfo: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        email: customer.user.email,
        phone: customer.phone,
        address: customer.address
      },
      financialInfo: {
        employmentStatus: customer.employmentStatus,
        annualIncome: customer.annualIncome,
        creditScore: customer.creditScore,
        accountType: customer.accountType,
        averageAccountBalance: customer.averageAccountBalance,
        monthlyTransactionAmount: customer.monthlyTransactionAmount,
        loanHistory: customer.loanHistory
      },
      segmentation: {
        segment: customer.segment,
        riskProfile: customer.riskProfile,
        lastUpdated: customer.updatedAt
      },
      preferences: {
        preferredCommunication: customer.preferredCommunication,
        lastLogin: customer.lastLogin,
        accountStatus: customer.accountStatus
      },
      metadata: {
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update customer segment
// @route   PUT /api/admin/customers/:id/segment
// @access  Private (Admin)
exports.updateCustomerSegment = async (req, res) => {
  try {
    const { segment } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Update segment
    customer.segment = segment;
    customer.updatedAt = Date.now();
    
    // Update risk profile based on segment (example logic)
    if (segment === 'retired_affluent' || segment === 'established_professional') {
      customer.riskProfile = 'low';
    } else if (segment === 'mortgage_seeker') {
      customer.riskProfile = 'medium';
    } else {
      customer.riskProfile = 'high';
    }
    
    await customer.save();
    
    res.json({
      message: 'Customer segment updated successfully',
      customer: {
        id: customer._id,
        segment: customer.segment,
        riskProfile: customer.riskProfile,
        updatedAt: customer.updatedAt
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get segmentation analytics
// @route   GET /api/admin/segments
// @access  Private (Admin)
exports.getSegmentationAnalytics = async (req, res) => {
  try {
    // Get segment counts
    const segmentCounts = await Customer.aggregate([
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          avgBalance: { $avg: '$averageAccountBalance' },
          avgIncome: { $avg: '$annualIncome' }
        }
      },
      {
        $project: {
          _id: 0,
          segment: '$_id',
          count: 1,
          avgBalance: { $round: ['$avgBalance', 2] },
          avgIncome: { $round: ['$avgIncome', 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get risk profile distribution
    const riskProfileCounts = await Customer.aggregate([
      {
        $group: {
          _id: '$riskProfile',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          riskProfile: '$_id',
          count: 1
        }
      }
    ]);

    // Get segment growth over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const segmentGrowth = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            segment: '$segment'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      segmentCounts,
      riskProfileCounts,
      segmentGrowth
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get banking patterns
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getBankingPatterns = async (req, res) => {
  try {
    // Transaction patterns by segment
    const transactionPatterns = await Customer.aggregate([
      {
        $group: {
          _id: '$segment',
          avgTransactionAmount: { $avg: '$monthlyTransactionAmount' },
          maxTransactionAmount: { $max: '$monthlyTransactionAmount' },
          minTransactionAmount: { $min: '$monthlyTransactionAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          segment: '$_id',
          avgTransactionAmount: { $round: ['$avgTransactionAmount', 2] },
          maxTransactionAmount: 1,
          minTransactionAmount: 1,
          count: 1
        }
      }
    ]);

    // Account type distribution
    const accountTypeDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$accountType',
          count: { $sum: 1 },
          avgBalance: { $avg: '$averageAccountBalance' }
        }
      },
      {
        $project: {
          _id: 0,
          accountType: '$_id',
          count: 1,
          avgBalance: { $round: ['$avgBalance', 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Employment status distribution
    const employmentDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$employmentStatus',
          count: { $sum: 1 },
          avgIncome: { $avg: '$annualIncome' }
        }
      },
      {
        $project: {
          _id: 0,
          employmentStatus: '$_id',
          count: 1,
          avgIncome: { $round: ['$avgIncome', 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      transactionPatterns,
      accountTypeDistribution,
      employmentDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Run customer segmentation algorithm
// @route   POST /api/admin/run-segmentation
// @access  Private (Admin)
exports.runSegmentation = async (req, res) => {
  try {
    // Get all customers
    const customers = await Customer.find({});
    
    let updatedCount = 0;
    
    // Simple segmentation logic (can be replaced with ML model)
    for (const customer of customers) {
      let segment = null;
      
      // Simple rules-based segmentation (example)
      const age = new Date().getFullYear() - new Date(customer.dateOfBirth).getFullYear();
      const income = customer.annualIncome || 0;
      const balance = customer.averageAccountBalance || 0;
      
      if (age >= 60 && income > 80000 && balance > 100000) {
        segment = 'retired_affluent';
      } else if (age >= 30 && age < 60 && income > 50000) {
        segment = 'established_professional';
      } else if (age >= 25 && age < 40 && (customer.loanHistory?.length > 0 || balance > 50000)) {
        segment = 'mortgage_seeker';
      } else if (age < 30 && income < 50000) {
        segment = 'young_saver';
      }
      
      // Only update if segment changed
      if (segment && segment !== customer.segment) {
        customer.segment = segment;
        await customer.save();
        updatedCount++;
      }
    }
    
    res.json({
      message: `Segmentation completed. ${updatedCount} customers updated.`,
      totalCustomers: customers.length,
      updatedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during segmentation' });
  }
};

// @desc    Export customer data
// @route   GET /api/admin/export/customers
// @access  Private (Admin)
exports.exportCustomerData = async (req, res) => {
  try {
    const customers = await Customer.find({}).populate('user', 'email');
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');
    
    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 28 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Segment', key: 'segment', width: 20 },
      { header: 'Risk Profile', key: 'riskProfile', width: 15 },
      { header: 'Employment Status', key: 'employmentStatus', width: 20 },
      { header: 'Annual Income', key: 'annualIncome', width: 15, style: { numFmt: '$#,##0.00' } },
      { header: 'Account Type', key: 'accountType', width: 15 },
      { header: 'Avg. Balance', key: 'averageAccountBalance', width: 15, style: { numFmt: '$#,##0.00' } },
      { header: 'Monthly Transactions', key: 'monthlyTransactionAmount', width: 20, style: { numFmt: '$#,##0.00' } },
      { header: 'Join Date', key: 'createdAt', width: 20, style: { numFmt: 'yyyy-mm-dd' } }
    ];
    
    // Add data rows
    customers.forEach(customer => {
      worksheet.addRow({
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.user?.email || '',
        phone: customer.phone || '',
        segment: customer.segment || 'Not Segmented',
        riskProfile: customer.riskProfile || 'medium',
        employmentStatus: customer.employmentStatus || '',
        annualIncome: customer.annualIncome || 0,
        accountType: customer.accountType || '',
        averageAccountBalance: customer.averageAccountBalance || 0,
        monthlyTransactionAmount: customer.monthlyTransactionAmount || 0,
        createdAt: customer.createdAt
      });
    });
    
    // Style header row
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=customers_export.xlsx'
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error exporting customer data' });
  }
};
