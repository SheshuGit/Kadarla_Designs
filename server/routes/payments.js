import express from 'express';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

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

// Get payment by order ID
router.get('/order/:orderId', checkDBConnection, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const payment = await Payment.findOne({ orderId }).populate('userId', 'fullName email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }

    res.json({
      success: true,
      data: {
        payment: {
          id: payment._id.toString(),
          orderId: payment.orderId.toString(),
          orderNumber: payment.orderNumber,
          userId: payment.userId?._id?.toString() || payment.userId?.toString(),
          customerName: payment.userId?.fullName || 'Unknown',
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId,
          paymentGateway: payment.paymentGateway,
          paymentDate: payment.paymentDate,
          failureReason: payment.failureReason,
          refundAmount: payment.refundAmount,
          refundDate: payment.refundDate,
          refundReason: payment.refundReason,
          paymentDetails: payment.paymentDetails,
          notes: payment.notes,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
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

// Get all payments for a user
router.get('/user/:userId', checkDBConnection, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment._id.toString(),
          orderId: payment.orderId.toString(),
          orderNumber: payment.orderNumber,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId,
          paymentDate: payment.paymentDate,
          createdAt: payment.createdAt
        })),
        count: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get all payments (Admin)
router.get('/', checkDBConnection, async (req, res) => {
  try {
    const { status, paymentMethod, limit = 100 } = req.query;
    
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment._id.toString(),
          orderId: payment.orderId.toString(),
          orderNumber: payment.orderNumber,
          userId: payment.userId?._id?.toString() || payment.userId?.toString(),
          customerName: payment.userId?.fullName || 'Unknown',
          customerEmail: payment.userId?.email || '',
          customerPhone: payment.userId?.phone || '',
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId,
          paymentGateway: payment.paymentGateway,
          paymentDate: payment.paymentDate,
          failureReason: payment.failureReason,
          refundAmount: payment.refundAmount,
          refundDate: payment.refundDate,
          refundReason: payment.refundReason,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        })),
        count: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Update payment status
router.put('/:paymentId/status', checkDBConnection, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentStatus, transactionId, paymentGateway, paymentDate, failureReason, paymentDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'cancelled'];
    if (paymentStatus && !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const updateData = {};
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && !paymentDate) {
        updateData.paymentDate = new Date();
      }
    }
    if (transactionId) updateData.transactionId = transactionId;
    if (paymentGateway) updateData.paymentGateway = paymentGateway;
    if (paymentDate) updateData.paymentDate = new Date(paymentDate);
    if (failureReason) updateData.failureReason = failureReason;
    if (paymentDetails) updateData.paymentDetails = paymentDetails;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    ).populate('userId', 'fullName email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update order payment status if payment status changed
    if (paymentStatus) {
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: paymentStatus
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        payment: {
          id: payment._id.toString(),
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId,
          paymentDate: payment.paymentDate
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

// Process refund
router.post('/:paymentId/refund', checkDBConnection, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, refundReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Only paid payments can be refunded'
      });
    }

    const refundAmt = refundAmount || payment.amount;

    if (refundAmt > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    payment.refundAmount = refundAmt;
    payment.refundDate = new Date();
    payment.refundReason = refundReason || '';
    payment.paymentStatus = refundAmt === payment.amount ? 'refunded' : 'paid';

    await payment.save();

    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: payment.paymentStatus
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        payment: {
          id: payment._id.toString(),
          paymentStatus: payment.paymentStatus,
          refundAmount: payment.refundAmount,
          refundDate: payment.refundDate
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

