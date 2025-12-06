import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { itemsAPI, reviewsAPI, favoritesAPI, cartAPI, getUser, Item, Review, ReviewStats } from '../utils/api';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customMessage, setCustomMessage] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review: '',
    userName: '',
    userEmail: ''
  });

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (id) {
      fetchProduct();
      fetchReviews();
      if (currentUser) {
        checkFavoriteStatus();
      }
    }
  }, [id]);

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;
    try {
      const favorited = await favoritesAPI.checkFavorite(id, user.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      alert('Please login to add items to favorites');
      return;
    }

    if (!product) return;

    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await favoritesAPI.removeFavorite(product.id, user.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.addFavorite(product.id, user.id);
        setIsFavorited(true);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(error.message || 'Failed to update favorite. Please try again.');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, user.id, quantity, customMessage);
      alert('Item added to cart successfully!');
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const item = await itemsAPI.getItem(id!);
      setProduct(item);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewsAPI.getReviews(id!);
      setReviews(data.reviews);
      setReviewStats({
        averageRating: data.averageRating,
        ratingCount: data.ratingCount,
        ratingDistribution: data.ratingDistribution
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewForm.review.trim() || !reviewForm.userName.trim() || !reviewForm.userEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmittingReview(true);
      // For now, using a temporary userId. In production, get from auth context
      const tempUserId = `user_${Date.now()}`;
      await reviewsAPI.addReview(
        product.id,
        tempUserId,
        reviewForm.userName,
        reviewForm.userEmail,
        reviewForm.rating,
        reviewForm.review
      );
      setReviewForm({ rating: 5, review: '', userName: '', userEmail: '' });
      setShowReviewForm(false);
      await fetchReviews(); // Refresh reviews
      alert('Review submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper function to check if discount is currently active
  const isDiscountActive = (item: Item): boolean => {
    if (!item.discount || item.discount <= 0) return false;
    if (!item.discountStartDate || !item.discountEndDate) return true;
    
    const now = new Date();
    const startDate = new Date(item.discountStartDate);
    const endDate = new Date(item.discountEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Convert base64 image to data URL
  const getImageSrc = () => {
    if (!product || !product.image) {
      return PLACEHOLDER_IMAGE;
    }
    
    let image = product.image;
    const imageType = product.imageType || 'image/jpeg';
    
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/') && image.length < 200) return image;
    
    if (image.includes(',')) {
      const parts = image.split(',');
      if (parts.length > 1) {
        image = parts[parts.length - 1];
      }
    }
    
    return `data:${imageType};base64,${image}`;
  };

  const renderStars = (rating: number, size: number = 20) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Product not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount && product.discount > 0 && isDiscountActive(product)
    ? (product.price * (100 - product.discount)) / 100
    : product.price;

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={getImageSrc()}
              alt={product.title}
              className="w-full h-[600px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-serif font-bold text-emerald-900 mb-4">
              {product.title}
            </h1>

            {/* Rating Summary */}
            {reviewStats && reviewStats.ratingCount > 0 && (
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(reviewStats.averageRating))}
                  <span className="text-2xl font-bold text-emerald-900">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-emerald-600">
                  ({reviewStats.ratingCount} {reviewStats.ratingCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              {product.discount && product.discount > 0 && isDiscountActive(product) ? (
                <div>
                  <p className="text-2xl text-gray-500 line-through mb-2">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-4xl font-bold text-emerald-900 mb-2">
                    ₹{finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                    {product.discountTitle && (
                      <span className="text-sm text-purple-600 font-medium">
                        {product.discountTitle}
                      </span>
                    )}
                  </div>
                  {product.discountStartDate && product.discountEndDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Valid: {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-4xl font-bold text-emerald-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">Description</h2>
              <p className="text-emerald-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mb-6 pb-6 border-b border-emerald-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-emerald-600 mb-1">Category</p>
                  <p className="font-semibold text-emerald-900">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-600 mb-1">Stock</p>
                  <p className="font-semibold text-emerald-900">
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity and Custom Message */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter customization message..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !user || !product}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleFavoriteClick}
                  disabled={isFavoriteLoading || !user}
                  className={`px-6 py-4 rounded-xl transition-all ${
                    isFavorited
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={user ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
                >
                  <Heart 
                    size={20} 
                    className={isFavorited ? 'fill-current' : ''}
                  />
                </button>
                <button className="px-6 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* Ask Query Button */}
              <button
                onClick={() => {
                  if (!user) {
                    alert('Please login to ask a query');
                    return;
                  }
                  // Dispatch event to open chat with product context
                  window.dispatchEvent(new CustomEvent('openChat', { 
                    detail: { productId: product?.id } 
                  }));
                }}
                disabled={!user}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle size={20} />
                Ask Query About This Product
              </button>
            </div>
          </div>
        </div>

        {/* Ratings and Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-emerald-900">
              Ratings & Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-mint-50 rounded-xl border-2 border-emerald-100">
              <h3 className="text-xl font-semibold text-emerald-900 mb-4">Write Your Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={reviewForm.userEmail}
                    onChange={(e) => setReviewForm({ ...reviewForm, userEmail: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-emerald-700 font-medium">
                      {reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    required
                    minLength={10}
                    rows={5}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 5, review: '', userName: '', userEmail: '' });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rating Distribution */}
          {reviewStats && reviewStats.ratingCount > 0 && (
            <div className="mb-8 p-6 bg-mint-50 rounded-xl">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.ratingDistribution[star as keyof typeof reviewStats.ratingDistribution];
                  const percentage = reviewStats.ratingCount > 0 ? (count / reviewStats.ratingCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium text-emerald-900">{star}</span>
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-400 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-emerald-700 w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-emerald-600">
                <p className="text-lg">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-6 bg-mint-50 rounded-xl border border-emerald-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-emerald-900">{review.userName}</h4>
                        {review.isVerified && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle size={14} />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 18)}
                        <span className="text-sm text-emerald-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-emerald-700 leading-relaxed">{review.review}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

