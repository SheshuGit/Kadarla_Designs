import express from 'express';
import Cart from '../models/Cart.js';
import Item from '../models/Item.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.'
    });
  }
  next();
};

// Middleware to verify user authentication
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId || req.params.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  req.userId = userId;
  next();
};

// Get user's cart with items populated
router.get('/user/:userId', checkDBConnection, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    let cart = await Cart.findOne({ userId });

    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Fetch item details for all cart items
    const itemIds = cart.items.map(item => item.itemId);
    const items = await Item.find({
      _id: { $in: itemIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    // Create items map
    const itemsMap = new Map();
    items.forEach(item => {
      itemsMap.set(item._id.toString(), {
        id: item._id.toString(),
        title: item.title,
        price: item.price,
        category: item.category,
        description: item.description,
        stock: item.stock,
        image: item.image,
        imageType: item.imageType || 'image/jpeg',
        discount: item.discount || 0,
        discountTitle: item.discountTitle,
        discountStartDate: item.discountStartDate,
        discountEndDate: item.discountEndDate,
        isActive: item.isActive
      });
    });

    // Map cart items with item details
    const cartItems = cart.items.map(cartItem => {
      const item = itemsMap.get(cartItem.itemId.toString());
      return {
        id: cartItem._id.toString(),
        itemId: cartItem.itemId.toString(),
        item: item || null,
        quantity: cartItem.quantity,
        customMessage: cartItem.customMessage || '',
        addedAt: cartItem.addedAt
      };
    });

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    cartItems.forEach(cartItem => {
      if (cartItem.item) {
        const itemPrice = cartItem.item.price;
        const discount = cartItem.item.discount || 0;
        const isDiscountActive = checkDiscountActive(cartItem.item);
        const finalPrice = isDiscountActive && discount > 0
          ? (itemPrice * (100 - discount)) / 100
          : itemPrice;
        
        subtotal += finalPrice * cartItem.quantity;
        if (isDiscountActive && discount > 0) {
          totalDiscount += (itemPrice - finalPrice) * cartItem.quantity;
        }
      }
    });

    const total = subtotal; // subtotal already includes discount applied

    res.json({
      success: true,
      data: {
        cart: {
          id: cart._id.toString(),
          userId: cart.userId.toString(),
          items: cartItems,
          subtotal: subtotal.toFixed(2),
          totalDiscount: totalDiscount.toFixed(2),
          total: total.toFixed(2),
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Helper function to check if discount is active
function checkDiscountActive(item) {
  if (!item.discount || item.discount <= 0) return false;
  if (!item.discountStartDate || !item.discountEndDate) return true;
  
  const now = new Date();
  const startDate = new Date(item.discountStartDate);
  const endDate = new Date(item.discountEndDate);
  
  return now >= startDate && now <= endDate;
}

// Add item to cart
router.post('/add', checkDBConnection, verifyUser, async (req, res) => {
  try {
    const { itemId, quantity, customMessage } = req.body;
    const userId = req.userId;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID or user ID'
      });
    }

    // Check if item exists and is active
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (!item.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Item is not available'
      });
    }

    // Check stock availability
    const qty = quantity || 1;
    if (item.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock} items available in stock`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.itemId.toString() === itemId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const newQuantity = cart.items[existingItemIndex].quantity + qty;
      if (item.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.stock} items available in stock`
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      if (customMessage) {
        cart.items[existingItemIndex].customMessage = customMessage;
      }
    } else {
      // Add new item to cart
      cart.items.push({
        itemId,
        quantity: qty,
        customMessage: customMessage || ''
      });
    }

    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cartItem: {
          itemId,
          quantity: existingItemIndex !== -1 
            ? cart.items[existingItemIndex].quantity 
            : qty,
          customMessage: customMessage || ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update cart item quantity
router.put('/item/:cartItemId', checkDBConnection, verifyUser, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity, customMessage } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(cartItemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID or user ID'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const cartItem = cart.items.id(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock if quantity is being updated
    if (quantity !== undefined) {
      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      const item = await Item.findById(cartItem.itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      if (item.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.stock} items available in stock`
        });
      }

      cartItem.quantity = quantity;
    }

    if (customMessage !== undefined) {
      cartItem.customMessage = customMessage;
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: {
          id: cartItem._id.toString(),
          itemId: cartItem.itemId.toString(),
          quantity: cartItem.quantity,
          customMessage: cartItem.customMessage || ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Remove item from cart
router.delete('/item/:cartItemId/:userId', checkDBConnection, async (req, res) => {
  try {
    const { cartItemId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cartItemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID or user ID'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items.pull(cartItemId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Clear entire cart
router.delete('/user/:userId', checkDBConnection, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

