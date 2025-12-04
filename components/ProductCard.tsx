import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { getUser, favoritesAPI } from "../utils/api";

const ProductCard = ({ product, onClick, isFavorited: externalIsFavorited }: any) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(externalIsFavorited || false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (externalIsFavorited !== undefined) {
      setIsFavorited(externalIsFavorited);
      setHasChecked(true);
    }
  }, [externalIsFavorited]);

  useEffect(() => {
    if (user && product?.id && !hasChecked && externalIsFavorited === undefined) {
      checkFavoriteStatus();
    }
  }, [user, product?.id, hasChecked]);

  const checkFavoriteStatus = async () => {
    if (!user || !product?.id || hasChecked) return;
    try {
      setHasChecked(true);
      const favorited = await favoritesAPI.checkFavorite(product.id, user.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      setHasChecked(false); // Retry on next render
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      alert('Please login to add items to favorites');
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };
  // Helper function to check if discount is currently active
  const isDiscountActive = (item: any): boolean => {
    if (!item.discount || item.discount <= 0) return false;
    if (!item.discountStartDate || !item.discountEndDate) return true; // If no dates, always active
    
    const now = new Date();
    const startDate = new Date(item.discountStartDate);
    const endDate = new Date(item.discountEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Convert base64 image to data URL if needed
  const getImageSrc = () => {
    if (!product || !product.image) {
      console.warn('ProductCard: No image found', { productTitle: product?.title });
      return '/images/placeholder.png';
    }
    
    let image = product.image;
    const imageType = product.imageType || 'image/jpeg';
    
    // If it already has data: prefix, return as is
    if (image.startsWith('data:')) {
      return image;
    }
    
    // If it's a full URL (starts with http or https), return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // Check if it's a relative path (starts with / but is a short path, not base64)
    // Base64 strings are typically very long (thousands of characters)
    // Relative paths are typically short
    if (image.startsWith('/') && image.length < 200) {
      return image; // It's likely a file path
    }
    
    // If it includes a comma, it might have a data: prefix already
    // Extract just the base64 part
    if (image.includes(',')) {
      const parts = image.split(',');
      if (parts.length > 1) {
        image = parts[parts.length - 1]; // Take the last part (the actual base64)
      }
    }
    
    // If image is long (likely base64) or starts with base64-like characters
    // Base64 JPEG often starts with /9j/ (which is the JPEG signature in base64)
    // Create data URL with proper format
    const dataUrl = `data:${imageType};base64,${image}`;
    
    return dataUrl;
  };

  return (
    <div
      className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition relative"
      onClick={handleClick}
    >
      {/* Favorite Heart Icon */}
      <button
        onClick={handleFavoriteClick}
        disabled={isLoading || !user}
        className={`absolute top-6 right-6 z-10 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isFavorited
            ? 'bg-red-500 text-white'
            : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
        } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={user ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
      >
        <Heart 
          size={20} 
          className={isFavorited ? 'fill-current' : ''}
        />
      </button>

      <img
        src={getImageSrc()}
        alt={product.title || 'Product'}
        className="rounded-lg w-full h-48 object-cover bg-gray-100"
        onError={(e) => {
          console.error('ProductCard: Image failed to load', {
            productTitle: product?.title,
            imageSrc: getImageSrc()?.substring(0, 100),
            hasImage: !!product?.image,
            imageLength: product?.image?.length
          });
          // Fallback if image fails to load
          (e.target as HTMLImageElement).src = '/images/placeholder.png';
        }}
      />

      <h3 className="mt-3 text-lg font-semibold text-emerald-900">
        {product.title}
      </h3>

      <div className="mt-2">
        {product.discount && product.discount > 0 && isDiscountActive(product) ? (
          <div>
            <p className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-xl font-bold text-emerald-700">
              ₹{((product.price * (100 - product.discount)) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-red-600 font-semibold">{product.discount}% OFF</span>
              {product.discountTitle && (
                <span className="text-xs text-purple-600 font-medium">• {product.discountTitle}</span>
              )}
            </div>
            {product.discountStartDate && product.discountEndDate && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xl font-bold text-emerald-700">₹{product.price.toLocaleString('en-IN')}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
