import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  MapPin, 
  CreditCard, 
  User, 
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  X,
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { getUser, ordersAPI, Order } from '../utils/api';
import { PLACEHOLDER_IMAGE } from '../utils/constants';

const UserOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (!currentUser) {
      navigate('/');
      return;
    }

    if (orderId) {
      fetchOrderDetails(currentUser.id);
    }
  }, [orderId]);

  const fetchOrderDetails = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await ordersAPI.getOrder(orderId!);
      
      // Verify this order belongs to the current user
      // Convert both to strings for comparison to handle ObjectId vs string
      const orderUserId = orderData.userId ? String(orderData.userId).trim() : '';
      const currentUserId = userId ? String(userId).trim() : '';
      
      if (!orderUserId || !currentUserId || orderUserId !== currentUserId) {
        console.error('User ID mismatch:', { 
          orderUserId, 
          currentUserId, 
          orderId: orderData.id,
          orderNumber: orderData.orderNumber 
        });
        setError('You do not have permission to view this order');
        return;
      }
      
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
      { key: 'processing', label: 'Processing', icon: Clock },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    ];

    const currentStatus = order?.orderStatus.toLowerCase() || 'pending';
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.key);
      const isCompleted = stepIndex <= currentIndex;
      const isCurrent = stepIndex === currentIndex;
      const isCancelled = currentStatus === 'cancelled';

      return {
        ...step,
        isCompleted: isCompleted && !isCancelled,
        isCurrent: isCurrent && !isCancelled,
        isCancelled
      };
    });
  };

  const getImageSrc = (item: any) => {
    if (!item || !item.image) return PLACEHOLDER_IMAGE;
    let image = item.image;
    const imageType = item.imageType || 'image/jpeg';
    if (image.startsWith('data:')) return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/') && image.length < 200) return image;
    if (image.includes(',')) {
      const parts = image.split(',');
      if (parts.length > 1) image = parts[parts.length - 1];
    }
    return `data:${imageType};base64,${image}`;
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
            {error ? 'Access Denied' : 'Order Not Found'}
          </h2>
          <p className="text-emerald-600 mb-6">
            {error || 'The order you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = typeof order.totalAmount === 'number' 
    ? order.totalAmount 
    : parseFloat(order.totalAmount.toString());
  const subtotal = typeof order.subtotal === 'number' 
    ? order.subtotal 
    : parseFloat(order.subtotal.toString());
  const totalDiscount = typeof order.totalDiscount === 'number' 
    ? order.totalDiscount 
    : parseFloat(order.totalDiscount.toString());
  const shippingCharges = typeof order.shippingCharges === 'number' 
    ? order.shippingCharges 
    : parseFloat(order.shippingCharges.toString());

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-emerald-700" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-emerald-900">
                Order Details
              </h1>
              <p className="text-emerald-600 mt-1">{order.orderNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6">
                Order Status
              </h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-200"></div>
                
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === statusSteps.length - 1;
                    
                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        {/* Icon Circle */}
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                          step.isCancelled
                            ? 'bg-red-100 border-red-300 text-red-600'
                            : step.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                            : step.isCurrent
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-600 animate-pulse'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          {step.isCompleted ? (
                            <CheckCircle2 size={24} />
                          ) : (
                            <Icon size={24} />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-bold ${
                              step.isCompleted || step.isCurrent
                                ? 'text-emerald-900'
                                : 'text-gray-500'
                            }`}>
                              {step.label}
                            </h3>
                            {step.isCurrent && !step.isCancelled && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                Current
                              </span>
                            )}
                            {step.isCompleted && (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Completed
                              </span>
                            )}
                          </div>
                          {step.isCurrent && order.orderStatus !== 'cancelled' && (
                            <p className="text-sm text-emerald-600">
                              Your order is currently at this stage
                            </p>
                          )}
                          {step.isCompleted && (
                            <p className="text-xs text-emerald-500 mt-1">
                              {step.key === 'delivered' && order.deliveredAt
                                ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}`
                                : 'Step completed'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.orderStatus === 'cancelled' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700">
                    <X size={20} />
                    <span className="font-semibold">This order has been cancelled</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <Package className="text-emerald-600" size={24} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gradient-to-r from-mint-50 to-white rounded-xl border border-emerald-100 hover:shadow-md transition-all"
                  >
                    <img
                      src={getImageSrc(item)}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-emerald-900 mb-2">{item.title}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-emerald-600 mb-1">Quantity</p>
                          <p className="font-semibold text-emerald-900">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-emerald-600 mb-1">Price</p>
                          <div>
                            {item.price > item.discountedPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </p>
                            )}
                            <p className="font-semibold text-emerald-900">
                              ₹{item.discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-emerald-600 mb-1">Total</p>
                          <p className="font-bold text-lg text-emerald-900">
                            ₹{(item.discountedPrice * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        {item.customMessage && (
                          <div className="col-span-2 mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs font-semibold text-emerald-700 mb-1">Custom Message:</p>
                            <p className="text-sm text-emerald-800">{item.customMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <MapPin className="text-emerald-600" size={24} />
                Delivery Address
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-1">Full Name</p>
                  <p className="text-emerald-900 font-medium text-lg">{order.shippingAddress?.fullName || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Phone</p>
                    <p className="text-emerald-900">{order.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Email</p>
                    <p className="text-emerald-900">{order.shippingAddress?.email || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-1">Address</p>
                  <p className="text-emerald-900">{formatAddress(order.shippingAddress)}</p>
                </div>
                {order.shippingAddress?.landmark && (
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Landmark</p>
                    <p className="text-emerald-900">{order.shippingAddress.landmark}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                <h2 className="text-xl font-serif font-bold text-emerald-900 mb-4">Additional Notes</h2>
                <p className="text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <CreditCard className="text-emerald-600" size={24} />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-emerald-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="border-t border-emerald-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-emerald-900">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="pt-6 border-t border-emerald-200 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Payment Method</span>
                  <span className="font-semibold text-emerald-900 capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Payment Status</span>
                  <span className={`font-semibold capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Dates */}
              <div className="pt-6 border-t border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <Calendar size={16} />
                  <span>Placed:</span>
                  <span className="font-semibold text-emerald-900 ml-auto">
                    {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {order.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 size={16} />
                    <span>Delivered:</span>
                    <span className="font-semibold text-emerald-900 ml-auto">
                      {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;

