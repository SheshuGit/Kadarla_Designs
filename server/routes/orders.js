import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Item from '../models/Item.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please try again later.'
    });
  }
  next();
};

// Middleware to verify user authentication
const verifyUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  req.userId = userId;
  next();
};

// Helper function to check if discount is active
function checkDiscountActive(item) {
  if (!item.discount || item.discount <= 0) return false;
  if (!item.discountStartDate || !item.discountEndDate) return true;
  
  const now = new Date();
  const startDate = new Date(item.discountStartDate);
  const endDate = new Date(item.discountEndDate);
  
  return now >= startDate && now <= endDate;
}

// Place order
router.post('/place', checkDBConnection, verifyUser, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.userId;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.email || !shippingAddress.addressLine1 || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required'
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cod', 'online', 'upi', 'card'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items to cart before checkout.'
      });
    }

    // Fetch item details for all cart items
    const itemIds = cart.items.map(item => item.itemId);
    const items = await Item.find({
      _id: { $in: itemIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    // Create items map
    const itemsMap = new Map();
    items.forEach(item => {
      itemsMap.set(item._id.toString(), item);
    });

    // Prepare order items and calculate totals
    const orderItems = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const cartItem of cart.items) {
      const item = itemsMap.get(cartItem.itemId.toString());
      if (!item) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${cartItem.itemId} not found`
        });
      }

      // Check stock availability
      if (item.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.title}. Only ${item.stock} available.`
        });
      }

      // Calculate prices
      const originalPrice = item.price;
      const discount = item.discount || 0;
      const isDiscountActive = checkDiscountActive(item);
      const discountedPrice = isDiscountActive && discount > 0
        ? (originalPrice * (100 - discount)) / 100
        : originalPrice;

      const itemSubtotal = discountedPrice * cartItem.quantity;
      const itemDiscount = isDiscountActive && discount > 0
        ? (originalPrice - discountedPrice) * cartItem.quantity
        : 0;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;

      orderItems.push({
        itemId: item._id,
        title: item.title,
        price: originalPrice,
        discountedPrice: discountedPrice,
        quantity: cartItem.quantity,
        customMessage: cartItem.customMessage || '',
        image: item.image,
        imageType: item.imageType || 'image/jpeg'
      });
    }

    // Calculate shipping charges (free shipping for orders above ₹500)
    const shippingCharges = subtotal >= 500 ? 0 : 50;
    const totalAmount = subtotal + shippingCharges;

    // Generate unique order number
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'pending',
      subtotal,
      totalDiscount,
      shippingCharges,
      totalAmount,
      notes: notes || ''
    });

    await order.save();

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: userId,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentDate: paymentMethod === 'cod' ? null : new Date(),
      notes: notes || ''
    });

    await payment.save();

    // Update item stock
    for (const orderItem of orderItems) {
      await Item.findByIdAndUpdate(orderItem.itemId, {
        $inc: { stock: -orderItem.quantity }
      });
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          placedAt: order.placedAt
        },
        payment: {
          id: payment._id.toString(),
          paymentStatus: payment.paymentStatus,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount
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

// Get user orders
router.get('/user/:userId', checkDBConnection, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          items: order.items,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          subtotal: order.subtotal,
          totalDiscount: order.totalDiscount,
          shippingCharges: order.shippingCharges,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt
        })),
        count: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get single order by ID
router.get('/:orderId', checkDBConnection, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: order.userId.toString(),
          items: order.items,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          subtotal: order.subtotal,
          totalDiscount: order.totalDiscount,
          shippingCharges: order.shippingCharges,
          totalAmount: order.totalAmount,
          notes: order.notes,
          placedAt: order.placedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt
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

// Get all orders (Admin only)
router.get('/', checkDBConnection, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'fullName email phone');

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: order.userId?._id?.toString() || order.userId?.toString(),
          customerName: order.userId?.fullName || 'Unknown',
          customerEmail: order.userId?.email || '',
          customerPhone: order.userId?.phone || '',
          items: order.items,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          subtotal: order.subtotal,
          totalDiscount: order.totalDiscount,
          shippingCharges: order.shippingCharges,
          totalAmount: order.totalAmount,
          notes: order.notes,
          placedAt: order.placedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        })),
        count: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update order status (Admin only)
router.put('/:orderId/status', checkDBConnection, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const updateData = {};
    if (orderStatus) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }
      updateData.orderStatus = orderStatus;
      if (orderStatus === 'delivered') {
        updateData.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      updateData.paymentStatus = paymentStatus;
      
      // Update payment record if it exists
      const payment = await Payment.findOne({ orderId });
      if (payment) {
        payment.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid' && !payment.paymentDate) {
          payment.paymentDate = new Date();
        }
        await payment.save();
      }
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('userId', 'fullName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          deliveredAt: order.deliveredAt
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

export default router;

