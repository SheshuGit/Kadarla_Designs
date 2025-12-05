import express from 'express';
import Review from '../models/Review.js';
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

// Get all reviews for a specific item
router.get('/item/:itemId', checkDBConnection, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    const reviews = await Review.find({ itemId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const ratingCount = reviews.length;

    // Count ratings by star
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          id: review._id,
          itemId: review.itemId,
          userId: review.userId,
          userName: review.userName,
          userEmail: review.userEmail,
          rating: review.rating,
          review: review.review,
          isVerified: review.isVerified,
          createdAt: review.createdAt
        })),
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingCount,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Create a new review
router.post('/', checkDBConnection, async (req, res) => {
  try {
    const { itemId, userId, userName, userEmail, rating, review } = req.body;

    // Validation
    if (!itemId || !userId || !userName || !userEmail || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (review.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review must be at least 10 characters'
      });
    }

    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({ itemId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create new review
    const newReview = new Review({
      itemId,
      userId,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      rating: Number(rating),
      review: review.trim()
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: {
          id: savedReview._id,
          itemId: savedReview.itemId,
          userId: savedReview.userId,
          userName: savedReview.userName,
          userEmail: savedReview.userEmail,
          rating: savedReview.rating,
          review: savedReview.review,
          isVerified: savedReview.isVerified,
          createdAt: savedReview.createdAt
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

// Update a review
router.put('/:id', checkDBConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const reviewDoc = await Review.findById(id);
    if (!reviewDoc) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      reviewDoc.rating = Number(rating);
    }

    if (review !== undefined) {
      if (review.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Review must be at least 10 characters'
        });
      }
      reviewDoc.review = review.trim();
    }

    const updatedReview = await reviewDoc.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: {
          id: updatedReview._id,
          itemId: updatedReview.itemId,
          userId: updatedReview.userId,
          userName: updatedReview.userName,
          userEmail: updatedReview.userEmail,
          rating: updatedReview.rating,
          review: updatedReview.review,
          isVerified: updatedReview.isVerified,
          createdAt: updatedReview.createdAt,
          updatedAt: updatedReview.updatedAt
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

// Delete a review
router.delete('/:id', checkDBConnection, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;

