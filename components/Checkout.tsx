import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { getUser, cartAPI, ordersAPI, Cart as CartType, ShippingAddress } from '../utils/api';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'upi' | 'card'>('cod');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      }));
      fetchCart(currentUser.id);
    } else {
      setIsLoading(false);
      navigate('/');
    }
  }, []);

  const fetchCart = async (userId: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const cartData = await cartAPI.getCart(userId);
      setCart(cartData);
      
      if (!cartData || cartData.items.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      navigate('/cart');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !cart) return;

    if (!validateForm()) {
      return;
    }

    setIsPlacingOrder(true);
    try {
      const result = await ordersAPI.placeOrder(
        user.id,
        formData,
        paymentMethod,
        notes
      );
      
      setOrderDetails(result.order);
      setOrderPlaced(true);
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Helper function to get image source
  const getImageSrc = (item: any) => {
    if (!item || !item.image) return '/images/placeholder.png';
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-mint-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 text-center">
            <div className="mb-6">
              <CheckCircle2 className="mx-auto text-emerald-600" size={80} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-4">
              Order Placed Successfully!
            </h1>
            <div className="bg-emerald-50 rounded-xl p-6 mb-6">
              <p className="text-emerald-700 font-semibold mb-2">Order Number</p>
              <p className="text-2xl font-bold text-emerald-900">{orderDetails.orderNumber}</p>
            </div>
            <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-emerald-700">Total Amount:</span>
                <span className="font-bold text-emerald-900">₹{typeof orderDetails.totalAmount === 'number' 
                  ? orderDetails.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                  : parseFloat(orderDetails.totalAmount.toString()).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Payment Method:</span>
                <span className="font-semibold text-emerald-900 capitalize">{orderDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Order Status:</span>
                <span className="font-semibold text-emerald-900 capitalize">{orderDetails.orderStatus}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="px-6 py-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-100 transition-all"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto text-emerald-300 mb-4" size={64} />
          <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-emerald-600 mb-6">
            Please add items to your cart before checkout.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shippingCharges = parseFloat(cart.subtotal) >= 500 ? 0 : 50;
  const totalAmount = parseFloat(cart.subtotal) + shippingCharges;

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-emerald-700" />
          </button>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <ShoppingBag className="text-emerald-600" size={32} />
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-emerald-600" size={24} />
                <h2 className="text-2xl font-serif font-bold text-emerald-900">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.fullName ? 'border-red-500' : 'border-emerald-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.phone ? 'border-red-500' : 'border-emerald-200'
                      }`}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.email ? 'border-red-500' : 'border-emerald-200'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.addressLine1 ? 'border-red-500' : 'border-emerald-200'
                    }`}
                    placeholder="House/Flat No., Building Name"
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Street, Area, Colony"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.city ? 'border-red-500' : 'border-emerald-200'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.state ? 'border-red-500' : 'border-emerald-200'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.pincode ? 'border-red-500' : 'border-emerald-200'
                      }`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-emerald-600" size={24} />
                <h2 className="text-2xl font-serif font-bold text-emerald-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <Wallet className="text-emerald-600" size={24} />
                    <div>
                      <p className="font-semibold text-emerald-900">Cash on Delivery</p>
                      <p className="text-sm text-emerald-600">Pay when you receive</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <Smartphone className="text-emerald-600" size={24} />
                    <div>
                      <p className="font-semibold text-emerald-900">UPI</p>
                      <p className="text-sm text-emerald-600">Pay via UPI apps</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <CreditCard className="text-emerald-600" size={24} />
                    <div>
                      <p className="font-semibold text-emerald-900">Credit/Debit Card</p>
                      <p className="text-sm text-emerald-600">Pay with card</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <CreditCard className="text-emerald-600" size={24} />
                    <div>
                      <p className="font-semibold text-emerald-900">Online Payment</p>
                      <p className="text-sm text-emerald-600">Pay online securely</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-xl font-serif font-bold text-emerald-900 mb-4">
                Additional Notes (Optional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Any special instructions for delivery..."
                maxLength={500}
              />
              <p className="mt-2 text-sm text-emerald-600">
                {notes.length}/500 characters
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-8">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((cartItem) => {
                  const item = cartItem.item;
                  if (!item) return null;

                  return (
                    <div key={cartItem.id} className="flex gap-3">
                      <img
                        src={getImageSrc(item)}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-900 text-sm truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-emerald-600">
                          Qty: {cartItem.quantity} × ₹{(() => {
                            const discount = item.discount || 0;
                            const isDiscountActive = item.discount && item.discount > 0 &&
                              (!item.discountStartDate || new Date() >= new Date(item.discountStartDate)) &&
                              (!item.discountEndDate || new Date() <= new Date(item.discountEndDate));
                            const finalPrice = isDiscountActive && discount > 0
                              ? (item.price * (100 - discount)) / 100
                              : item.price;
                            return finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                          })()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 mb-6 border-t border-emerald-200 pt-4">
                <div className="flex justify-between text-emerald-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{parseFloat(cart.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                {parseFloat(cart.totalDiscount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{parseFloat(cart.totalDiscount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700">
                  <span className="flex items-center gap-2">
                    <Truck size={16} />
                    Shipping
                    {shippingCharges === 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">FREE</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="border-t border-emerald-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-emerald-900">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Place Order
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-center text-emerald-600">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

