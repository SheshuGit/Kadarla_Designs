// Simple test script to check server setup
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 Testing server setup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');
console.log('  DBName:', process.env.DBName || '❌ Not set (will use default: kadarladesigns)');
console.log('  PORT:', process.env.PORT || '5000 (default)');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set\n');

// Test MongoDB connection
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.DBName || 'kadarladesigns';

if (!mongoURI) {
  console.error('❌ MongoDB URI not found!');
  process.exit(1);
}

console.log('🔌 Testing MongoDB connection...');
console.log('  URI:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
console.log('  Database:', dbName);
console.log('');

mongoose.connect(mongoURI, { dbName })
  .then((conn) => {
    console.log('✅ MongoDB connection successful!');
    console.log('  Database:', conn.connection.name);
    console.log('  Host:', conn.connection.host);
    console.log('  Ready State:', conn.connection.readyState);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed!');
    console.error('  Error:', error.message);
    console.error('  Full error:', error);
    process.exit(1);
  });

