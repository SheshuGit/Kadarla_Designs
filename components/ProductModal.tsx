import React from "react";
import { PLACEHOLDER_IMAGE } from "../utils/constants";

const ProductModal = ({ product, onClose }: any) => {
  if (!product) return null;

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
      return PLACEHOLDER_IMAGE;
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
    if (image.startsWith('/') && image.length < 200) {
      return image; // It's likely a file path
    }
    
    // If it includes a comma, extract just the base64 part
    if (image.includes(',')) {
      const parts = image.split(',');
      if (parts.length > 1) {
        image = parts[parts.length - 1]; // Take the last part (the actual base64)
      }
    }
    
    // Create data URL with proper format
    // Base64 JPEG often starts with /9j/ (JPEG signature in base64)
    return `data:${imageType};base64,${image}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <img 
          src={getImageSrc()} 
          className="rounded-xl w-full h-60 object-cover"
          alt={product.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />

        <h2 className="text-2xl font-bold mt-4 text-emerald-900">
          {product.title}
        </h2>

        <div className="mt-2">
          {product.discount && product.discount > 0 && isDiscountActive(product) ? (
            <div>
              <p className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString('en-IN')}</p>
              <p className="text-xl text-emerald-700 font-semibold">
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
                  Valid: {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xl text-emerald-700 font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
          )}
        </div>

        <label className="block mt-4 font-semibold">Quantity</label>
        <input
          type="number"
          min="1"
          defaultValue="1"
          className="w-full border p-2 rounded-lg mt-1"
        />

        <label className="block mt-4 font-semibold">Custom Message</label>
        <textarea
          className="w-full border p-2 rounded-lg mt-1"
          placeholder="Enter customization message..."
        />

        <button className="w-full mt-5 bg-emerald-700 text-white p-3 rounded-lg font-bold hover:bg-emerald-800">
          Add to Cart
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-red-600 font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
