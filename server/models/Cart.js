import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  customMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Custom message cannot exceed 500 characters']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  items: {
    type: [cartItemSchema],
    default: []
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
  collection: 'carts'
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create or retrieve the Cart model
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;

