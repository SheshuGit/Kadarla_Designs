import express from 'express';
import Favorite from '../models/Favorite.js';
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

// Middleware to verify user authentication (you can enhance this with JWT)
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

// Get all favorites for a user (with optional items)
router.get('/user/:userId', checkDBConnection, async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeItems } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 });

    const favoritesData = favorites.map(fav => ({
      id: fav._id.toString(),
      userId: fav.userId.toString(),
      itemId: fav.itemId.toString(),
      createdAt: fav.createdAt
    }));

    // If includeItems is true, fetch items in batch
    if (includeItems === 'true' && favorites.length > 0) {
      const itemIds = favorites.map(fav => fav.itemId);
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
          isActive: item.isActive,
          createdAt: item.createdAt
        });
      });

      // Add items to favorites data
      favoritesData.forEach(fav => {
        fav.item = itemsMap.get(fav.itemId) || null;
      });
    }

    res.json({
      success: true,
      data: {
        favorites: favoritesData,
        count: favorites.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Check if an item is favorited by a user
router.get('/check/:itemId/:userId', checkDBConnection, async (req, res) => {
  try {
    const { itemId, userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID or user ID'
      });
    }

    const favorite = await Favorite.findOne({ itemId, userId });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite?._id || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Batch check favorites for multiple items
router.post('/check-batch', checkDBConnection, async (req, res) => {
  try {
    const { itemIds, userId } = req.body;
    
    if (!Array.isArray(itemIds) || !userId) {
      return res.status(400).json({
        success: false,
        message: 'itemIds array and userId are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Validate all item IDs
    const validItemIds = itemIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validItemIds.length === 0) {
      return res.json({
        success: true,
        data: {}
      });
    }

    const favorites = await Favorite.find({ 
      userId, 
      itemId: { $in: validItemIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    // Create a map of itemId -> isFavorited
    const favoritesMap = {};
    favorites.forEach(fav => {
      favoritesMap[fav.itemId.toString()] = true;
    });

    // Create result map for all requested items
    const result = {};
    validItemIds.forEach(itemId => {
      result[itemId] = !!favoritesMap[itemId];
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Add item to favorites
router.post('/', checkDBConnection, verifyUser, async (req, res) => {
  try {
    const { itemId } = req.body;
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

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ itemId, userId });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Item is already in favorites'
      });
    }

    // Create new favorite
    const favorite = new Favorite({
      itemId,
      userId
    });

    const savedFavorite = await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Item added to favorites',
      data: {
        favorite: {
          id: savedFavorite._id,
          userId: savedFavorite.userId,
          itemId: savedFavorite.itemId,
          createdAt: savedFavorite.createdAt
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Item is already in favorites'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Remove item from favorites
router.delete('/:itemId/:userId', checkDBConnection, async (req, res) => {
  try {
    const { itemId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID or user ID'
      });
    }

    const favorite = await Favorite.findOneAndDelete({ itemId, userId });
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

