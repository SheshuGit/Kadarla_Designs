import express from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';

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

// Create new item
router.post('/', checkDBConnection, async (req, res) => {
  try {
    console.log('📦 Add item request received:', {
      title: req.body.title,
      category: req.body.category,
      price: req.body.price
    });

    const { title, price, category, description, stock, image, imageType, discount, discountTitle, discountStartDate, discountEndDate } = req.body;

    // Validation
    if (!title || !price || !category || !description || stock === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }

    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative number'
      });
    }

    // Create new item
    console.log('💾 Creating item instance...');
    const item = new Item({
      title: title.trim(),
      price: Number(price),
      category: category.trim(),
      description: description.trim(),
      stock: Number(stock),
      image: image, // Base64 encoded image
      imageType: imageType || 'image/jpeg',
      discount: discount ? Number(discount) : 0,
      discountTitle: discountTitle ? discountTitle.trim() : undefined,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : undefined,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : undefined
    });

    // Validate the item document before saving
    const validationError = item.validateSync();
    if (validationError) {
      console.error('❌ Validation error before save:', validationError);
      const errors = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }

    console.log('✅ Item instance created and validated');
    console.log('💾 Attempting to save item...');
    console.log('🔗 Database connection:', {
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      host: mongoose.connection.host
    });

    const savedItem = await item.save();
    console.log('✅ Item saved successfully!');
    console.log('🆔 Item ID:', savedItem._id);
    console.log('📊 Saved item data:', {
      id: savedItem._id.toString(),
      title: savedItem.title,
      price: savedItem.price,
      category: savedItem.category,
      stock: savedItem.stock,
      createdAt: savedItem.createdAt
    });

    // Verify the item was actually saved to database
    try {
      const verifyItem = await Item.findById(savedItem._id);
      if (!verifyItem) {
        console.error('❌ CRITICAL: Item was not found in database after save!');
        throw new Error('Item was not saved to database');
      }
      console.log('✅ Verified: Item exists in database');

      // Also verify by querying the collection directly
      const db = mongoose.connection.db;
      const itemsCollection = db.collection('items');
      const count = await itemsCollection.countDocuments({ _id: savedItem._id });
      console.log('📊 Collection verification - Documents found:', count);

      if (count === 0) {
        console.error('❌ CRITICAL: Item not found in items collection!');
        throw new Error('Item was not saved to items collection');
      }
    } catch (verifyError) {
      console.error('❌ Verification error:', verifyError);
      throw verifyError;
    }

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: {
        item: {
          id: savedItem._id,
          title: savedItem.title,
          price: savedItem.price,
          category: savedItem.category,
          description: savedItem.description,
          stock: savedItem.stock,
          image: savedItem.image,
          imageType: savedItem.imageType,
          discount: savedItem.discount || 0,
          discountTitle: savedItem.discountTitle,
          discountStartDate: savedItem.discountStartDate,
          discountEndDate: savedItem.discountEndDate,
          isActive: savedItem.isActive,
          createdAt: savedItem.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Add item error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });

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

// Get all items
router.get('/', checkDBConnection, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    
    console.log('📦 Get items - Found items:', items.length);
    if (items.length > 0) {
      console.log('📦 Sample item:', {
        id: items[0]._id,
        title: items[0].title,
        hasImage: !!items[0].image,
        imageLength: items[0].image?.length || 0,
        imageType: items[0].imageType,
        imagePreview: items[0].image?.substring(0, 50) + '...'
      });
    }
    
    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          id: item._id,
          title: item.title,
          price: item.price,
          category: item.category,
          description: item.description,
          stock: item.stock,
          image: item.image, // Base64 string
          imageType: item.imageType || 'image/jpeg', // Ensure imageType is always present
          discount: item.discount || 0,
          discountTitle: item.discountTitle,
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate,
          isActive: item.isActive,
          createdAt: item.createdAt
        })),
        count: items.length
      }
    });
  } catch (error) {
    console.error('❌ Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get single item by ID
router.get('/:id', checkDBConnection, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: {
        item: {
          id: item._id,
          title: item.title,
          price: item.price,
          category: item.category,
          description: item.description,
          stock: item.stock,
          image: item.image,
          imageType: item.imageType,
          discount: item.discount || 0,
          discountTitle: item.discountTitle,
          discountStartDate: item.discountStartDate,
          discountEndDate: item.discountEndDate,
          isActive: item.isActive,
          createdAt: item.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update item
router.put('/:id', checkDBConnection, async (req, res) => {
  try {
    const { title, price, category, description, stock, image, imageType, isActive, discount, discountTitle, discountStartDate, discountEndDate } = req.body;

    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (title) item.title = title.trim();
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category.trim();
    if (description) item.description = description.trim();
    if (stock !== undefined) item.stock = Number(stock);
    if (image) item.image = image;
    if (imageType) item.imageType = imageType;
    if (isActive !== undefined) item.isActive = isActive;
    if (discount !== undefined) item.discount = Number(discount);
    if (discountTitle !== undefined) item.discountTitle = discountTitle ? discountTitle.trim() : null;
    if (discountStartDate !== undefined) item.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
    if (discountEndDate !== undefined) item.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;

    const updatedItem = await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: {
        item: {
          id: updatedItem._id,
          title: updatedItem.title,
          price: updatedItem.price,
          category: updatedItem.category,
          description: updatedItem.description,
          stock: updatedItem.stock,
          image: updatedItem.image,
          imageType: updatedItem.imageType,
          discount: updatedItem.discount || 0,
          discountTitle: updatedItem.discountTitle,
          discountStartDate: updatedItem.discountStartDate,
          discountEndDate: updatedItem.discountEndDate,
          isActive: updatedItem.isActive,
          createdAt: updatedItem.createdAt,
          updatedAt: updatedItem.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Delete item
router.delete('/:id', checkDBConnection, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

