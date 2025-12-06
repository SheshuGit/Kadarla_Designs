import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import ChatMessage from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Check if it's a hardcoded admin token (legacy support)
    if (token === process.env.ADMIN_TOKEN || token === 'admin-token') {
      req.user = {
        id: 'admin',
        role: 'admin'
      };
      return next();
    }

    // Decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Check if it's an admin JWT token (userId is 'admin')
    if (decoded.userId === 'admin') {
      req.user = {
        id: 'admin',
        role: 'admin'
      };
      return next();
    }

    // Regular user - find user in database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role || 'user'
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check MongoDB connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.'
    });
  }
  next();
};

// Send a message (user or admin)
router.post('/send', checkDBConnection, authenticateToken, async (req, res) => {
  try {
    const { message, productId, targetUserId } = req.body;
    const senderRole = req.user.role;
    const senderId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Determine sender and target user
    let userId, sender;
    if (senderRole === 'admin') {
      // Admin sending to a specific user
      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId is required for admin messages'
        });
      }
      userId = targetUserId;
      sender = 'admin';
    } else {
      // Regular user sending message - use their own ID
      userId = senderId;
      sender = 'user';
    }

    // Validate userId is a valid ObjectId for regular users
    if (senderRole !== 'admin' && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Convert to ObjectId if it's a valid ObjectId string
    const finalUserId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    const chatMessage = new ChatMessage({
      userId: finalUserId,
      productId: productId || null,
      message: message.trim(),
      sender: sender,
      isRead: sender === 'admin' ? true : false // Admin messages are auto-read
    });

    await chatMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        chatMessage: {
          id: chatMessage._id,
          userId: chatMessage.userId,
          productId: chatMessage.productId,
          message: chatMessage.message,
          sender: chatMessage.sender,
          isRead: chatMessage.isRead,
          createdAt: chatMessage.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get all messages for a user
router.get('/messages', checkDBConnection, authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    
    // If admin, they can see all messages or filter by userId
    if (userRole === 'admin') {
      const { userId: filterUserId } = req.query;
      if (filterUserId) {
        // Admin viewing specific user's messages
        query.userId = mongoose.Types.ObjectId.isValid(filterUserId) 
          ? new mongoose.Types.ObjectId(filterUserId) 
          : filterUserId;
      }
      // If no filterUserId, admin sees all messages (empty query)
    } else {
      // Regular users can only see their own messages
      query.userId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json({
      success: true,
      data: {
        messages: messages.map(msg => ({
          id: msg._id.toString(),
          userId: msg.userId.toString ? msg.userId.toString() : String(msg.userId),
          productId: msg.productId,
          message: msg.message,
          sender: msg.sender,
          isRead: msg.isRead,
          createdAt: msg.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get unread message count for a user
router.get('/unread-count', checkDBConnection, authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { isRead: false };
    
    if (userRole === 'admin') {
      // Admin sees unread messages from all users
      query.sender = 'user';
    } else {
      // Users see unread messages from admin
      query.userId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      query.sender = 'admin';
    }

    const count = await ChatMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Mark messages as read
router.put('/mark-read', checkDBConnection, authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = { isRead: false };
    
    if (userRole === 'admin') {
      // Admin marks user messages as read
      const { userId: targetUserId } = req.body;
      if (targetUserId) {
        query.userId = mongoose.Types.ObjectId.isValid(targetUserId) 
          ? new mongoose.Types.ObjectId(targetUserId) 
          : targetUserId;
        query.sender = 'user';
      } else {
        // Mark all user messages as read
        query.sender = 'user';
      }
    } else {
      // Users mark admin messages as read
      query.userId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      query.sender = 'admin';
    }

    await ChatMessage.updateMany(query, { isRead: true });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get all conversations (for admin)
router.get('/conversations', checkDBConnection, authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get distinct users who have sent messages
    const conversations = await ChatMessage.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$userId',
          lastMessageTime: { $max: '$createdAt' },
          lastMessageText: { $first: '$message' },
          lastMessageSender: { $first: '$sender' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isRead', false] }, { $eq: ['$sender', 'user'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    // Fetch user details separately for any conversations that didn't match in lookup
    const userIds = conversations
      .map(conv => {
        if (conv._id instanceof mongoose.Types.ObjectId) {
          return conv._id;
        }
        // Try to convert string to ObjectId if valid
        if (mongoose.Types.ObjectId.isValid(conv._id)) {
          return new mongoose.Types.ObjectId(conv._id);
        }
        return null;
      })
      .filter(id => id !== null);

    let userMap = new Map();
    if (userIds.length > 0) {
      const users = await User.find({ _id: { $in: userIds } });
      users.forEach(user => {
        userMap.set(user._id.toString(), user);
      });
    }

    res.json({
      success: true,
      data: {
        conversations: conversations.map(conv => {
          // Handle both ObjectId and string userId
          let userId, user;
          
          if (conv._id instanceof mongoose.Types.ObjectId) {
            userId = conv._id.toString();
            user = (conv.user && conv.user.length > 0) ? conv.user[0] : userMap.get(userId);
          } else {
            userId = String(conv._id);
            // Try to find user by string ID or converted ObjectId
            user = (conv.user && conv.user.length > 0) ? conv.user[0] : null;
            if (!user && mongoose.Types.ObjectId.isValid(userId)) {
              user = userMap.get(userId);
            }
          }
          
          return {
            userId: userId,
            userName: user ? user.fullName : 'Unknown User',
            userEmail: user ? user.email : '',
            lastMessage: conv.lastMessageTime,
            lastMessageText: conv.lastMessageText,
            unreadCount: conv.unreadCount
          };
        })
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

