import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import reviewsRoutes from './routes/reviews.js';
import favoritesRoutes from './routes/favorites.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';
import chatRoutes from './routes/chat.js';

// Load environment variables
dotenv.config();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ;
    const dbName = process.env.DBName || 'kadarladesigns';
    
    if (!mongoURI) {
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    console.log('📊 Database Name:', dbName);
    
    // Connect to MongoDB with explicit database name
    const conn = await mongoose.connect(mongoURI, {
      dbName: dbName // Explicitly set the database name
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', conn.connection.name);
    console.log('🏠 Host:', conn.connection.host);
  } catch (error) {
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  // Connection error handled silently
});

mongoose.connection.on('disconnected', () => {
  // Disconnection handled silently
});

mongoose.connection.on('reconnected', () => {
  // Reconnection handled silently
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server only after MongoDB connection is established
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((error) => {
  process.exit(1);
});

