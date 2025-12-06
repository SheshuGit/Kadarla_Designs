import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowLeft, X } from 'lucide-react';
import { getUser, cartAPI, Cart as CartType, CartItem } from '../utils/api';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (currentUser) {
      fetchCart(currentUser.id);
    } else {
      setIsLoading(false);
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedUser = getUser();
      if (updatedUser) {
        fetchCart(updatedUser.id);
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchCart = async (userId: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const cartData = await cartAPI.getCart(userId);
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    setIsUpdating(cartItemId);
    try {
      await cartAPI.updateCartItem(cartItemId, user.id, newQuantity);
      await fetchCart(user.id);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      alert(error.message || 'Failed to update quantity. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }

    setIsUpdating(cartItemId);
    try {
      await cartAPI.removeCartItem(cartItemId, user.id);
      await fetchCart(user.id);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error removing item:', error);
      alert(error.message || 'Failed to remove item. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      await cartAPI.clearCart(user.id);
      await fetchCart(user.id);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      alert(error.message || 'Failed to clear cart. Please try again.');
    }
  };

  // Helper function to get image source
  const getImageSrc = (item: any) => {
    if (!item || !item.image) return PLACEHOLDER_IMAGE;
    
    let image = item.image;
    const imageType = item.imageType || 'image/jpeg';
    
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

  // Helper function to check if discount is active
  const isDiscountActive = (item: any): boolean => {
    if (!item.discount || item.discount <= 0) return false;
    if (!item.discountStartDate || !item.discountEndDate) return true;
    
    const now = new Date();
    const startDate = new Date(item.discountStartDate);
    const endDate = new Date(item.discountEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Calculate item price with discount
  const getItemPrice = (item: any): number => {
    if (!item) return 0;
    const discount = item.discount || 0;
    const isActive = isDiscountActive(item);
    if (isActive && discount > 0) {
      return (item.price * (100 - discount)) / 100;
    }
    return item.price;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShoppingCart className="mx-auto text-emerald-300 mb-4" size={64} />
          <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
            Please Login
          </h2>
          <p className="text-emerald-600 mb-6">
            You need to be logged in to view your cart.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-emerald-700" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
              <ShoppingCart className="text-emerald-600" size={32} />
              Shopping Cart
            </h1>
          </div>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
            >
              Clear Cart
            </button>
          )}
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-emerald-100">
            <ShoppingCart className="mx-auto text-emerald-300 mb-4" size={64} />
            <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-emerald-600 mb-6">
              Start adding items to your cart to see them here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((cartItem) => {
                const item = cartItem.item;
                if (!item) return null;

                const itemPrice = getItemPrice(item);
                const totalPrice = itemPrice * cartItem.quantity;
                const isUpdatingItem = isUpdating === cartItem.id;

                return (
                  <div
                    key={cartItem.id}
                    className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getImageSrc(item)}
                          alt={item.title}
                          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-serif font-bold text-emerald-900 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-emerald-600 mb-2">
                              {item.category}
                            </p>
                            {item.discount && item.discount > 0 && isDiscountActive(item) && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                  {item.discount}% OFF
                                </span>
                                {item.discountTitle && (
                                  <span className="text-xs text-purple-600 font-medium">
                                    {item.discountTitle}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(cartItem.id)}
                            disabled={isUpdatingItem}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          {item.discount && item.discount > 0 && isDiscountActive(item) ? (
                            <div>
                              <p className="text-sm text-gray-500 line-through">
                                ₹{item.price.toLocaleString('en-IN')}
                              </p>
                              <p className="text-xl font-bold text-emerald-700">
                                ₹{itemPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-emerald-700">
                              ₹{itemPrice.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-emerald-900">Quantity:</span>
                            <div className="flex items-center gap-2 border border-emerald-200 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity - 1)}
                                disabled={isUpdatingItem || cartItem.quantity <= 1}
                                className="p-2 hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-2 min-w-[3rem] text-center font-semibold text-emerald-900">
                                {isUpdatingItem ? (
                                  <Loader2 className="animate-spin inline" size={16} />
                                ) : (
                                  cartItem.quantity
                                )}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(cartItem.id, cartItem.quantity + 1)}
                                disabled={isUpdatingItem}
                                className="p-2 hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-emerald-700">
                              ₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Custom Message */}
                        {cartItem.customMessage && (
                          <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                            <p className="text-xs text-emerald-700 font-medium mb-1">Custom Message:</p>
                            <p className="text-sm text-emerald-800">{cartItem.customMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-8">
                <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-emerald-700">
                    <span>Items ({cart.itemCount})</span>
                    <span className="font-semibold">₹{parseFloat(cart.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  {parseFloat(cart.totalDiscount) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{parseFloat(cart.totalDiscount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="border-t border-emerald-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-emerald-900">
                      <span>Total</span>
                      <span>₹{parseFloat(cart.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-4 px-6 py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

