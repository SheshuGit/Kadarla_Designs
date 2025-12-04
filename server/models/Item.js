import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Birthday', 'Anniversary', 'Wedding', 'Corporate', 'Best Sellers', 'Custom'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  image: {
    type: String, // Base64 encoded image or URL
    required: [true, 'Product image is required']
  },
  imageType: {
    type: String, // e.g., 'image/png', 'image/jpeg'
    default: 'image/jpeg'
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  discountTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Discount title cannot exceed 100 characters']
  },
  discountStartDate: {
    type: Date
  },
  discountEndDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
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
  collection: 'items' // Explicitly set collection name
});

// Create or retrieve the Item model
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;

