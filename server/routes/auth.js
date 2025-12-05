import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to check MongoDB connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please try again later.'
    });
  }
  next();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '7d'
  });
};

// Signup Route
router.post('/signup', checkDBConnection, async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Clean phone number (remove all non-digit characters)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      password: password // Password will be hashed by pre-save hook
    });
    
    // Validate the user document before saving
    const validationError = user.validateSync();
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    // Save with explicit error handling
    let savedUser;
    try {
      savedUser = await user.save({ validateBeforeSave: true });
    } catch (saveError) {
      throw saveError;
    }
    
    // Verify the user was actually saved to database
    try {
      const verifyUser = await User.findById(savedUser._id);
      if (!verifyUser) {
        throw new Error('User was not saved to database');
      }
      
      // Also verify by querying the collection directly
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      const count = await usersCollection.countDocuments({ _id: savedUser._id });
      
      if (count === 0) {
        throw new Error('User was not saved to users collection');
      }
    } catch (verifyError) {
      throw verifyError;
    }

    // Generate token
    const token = generateToken(savedUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: savedUser._id,
          fullName: savedUser.fullName,
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role
        },
        token
      }
    });
  } catch (error) {
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Login Route
router.post('/login', checkDBConnection, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get current user (protected route)
router.get('/me', checkDBConnection, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Debug endpoint to test database write
router.post('/test-write', async (req, res) => {
  try {
    const testUser = new User({
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'testpassword123'
    });
    
    const saved = await testUser.save();
    
    // Verify it exists
    const found = await User.findById(saved._id);
    
    // Clean up
    await User.findByIdAndDelete(saved._id);
    
    res.json({
      success: true,
      message: 'Database write test successful',
      data: {
        saved: !!saved,
        found: !!found,
        userId: saved._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database write test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint to check database connection and model
router.get('/test', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Get database info
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const collections = await db.listCollections().toArray();
    
    // Try to query the User collection
    const userCount = await User.countDocuments();
    
    // Try to list all users (limit 5)
    const users = await User.find().limit(5).lean();

    res.json({
      success: true,
      message: 'Database test successful',
      data: {
        connectionStatus: dbStates[dbStatus],
        isConnected: dbStatus === 1,
        databaseName: dbName,
        collections: collections.map(c => c.name),
        userCount: userCount,
        sampleUsers: users
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;

