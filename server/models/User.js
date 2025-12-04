import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Remove all non-digit characters and check if it's 10 digits
        const digitsOnly = v.replace(/\D/g, '');
        return digitsOnly.length === 10;
      },
      message: 'Phone number must be 10 digits'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users' // Explicitly set collection name
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log('🔐 Pre-save hook triggered');
  console.log('  - Password modified:', this.isModified('password'));
  console.log('  - Is new document:', this.isNew);
  
  if (!this.isModified('password')) {
    console.log('  - Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('  - Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('  - Password hashed successfully');
    next();
  } catch (error) {
    console.error('  - Password hashing error:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create or retrieve the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

