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
  Edit
} from 'lucide-react';
import { ordersAPI, Order } from '../../utils/api';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await ordersAPI.getOrder(orderId!);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      await ordersAPI.updateOrderStatus(order.id, { orderStatus: newStatus });
      await fetchOrderDetails();
      alert('Order status updated successfully!');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={20} />;
      case 'shipped':
        return <Truck size={20} />;
      case 'processing':
      case 'confirmed':
        return <Clock size={20} />;
      default:
        return <Package size={20} />;
    }
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
      <div className="flex items-center justify-center min-h-screen bg-mint-50">
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
            Order Not Found
          </h2>
          <p className="text-emerald-600 mb-6">
            {error || 'The order you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/admin/orders/received')}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Back to Orders
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
            <div>
              <h1 className="text-3xl font-serif font-bold text-emerald-900">
                Order Details
              </h1>
              <p className="text-emerald-600 mt-1">{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <Package className="text-emerald-600" size={24} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-mint-50 rounded-xl border border-emerald-100"
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

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <User className="text-emerald-600" size={24} />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Full Name</p>
                  <p className="text-emerald-900 font-medium text-lg">{order.shippingAddress?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Email</p>
                  <p className="text-emerald-900">{order.shippingAddress?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Phone Number</p>
                  <p className="text-emerald-900">{order.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <MapPin className="text-emerald-600" size={24} />
                Shipping Address
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-1">Address Line 1</p>
                  <p className="text-emerald-900">{order.shippingAddress?.addressLine1 || 'N/A'}</p>
                </div>
                {order.shippingAddress?.addressLine2 && (
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Address Line 2</p>
                    <p className="text-emerald-900">{order.shippingAddress.addressLine2}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">City</p>
                    <p className="text-emerald-900">{order.shippingAddress?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">State</p>
                    <p className="text-emerald-900">{order.shippingAddress?.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Pincode</p>
                    <p className="text-emerald-900">{order.shippingAddress?.pincode || 'N/A'}</p>
                  </div>
                </div>
                {order.shippingAddress?.landmark && (
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Landmark</p>
                    <p className="text-emerald-900">{order.shippingAddress.landmark}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                <h2 className="text-xl font-serif font-bold text-emerald-900 mb-4">Additional Notes</h2>
                <p className="text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
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
                  <span>Shipping Charges</span>
                  <span className="font-semibold">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className="border-t border-emerald-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-emerald-900">
                    <span>Total Amount</span>
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
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {order.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle size={16} />
                    <span>Delivered:</span>
                    <span className="font-semibold text-emerald-900 ml-auto">
                      {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Actions */}
            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                <h2 className="text-xl font-serif font-bold text-emerald-900 mb-4 flex items-center gap-3">
                  <Edit className="text-emerald-600" size={20} />
                  Update Status
                </h2>
                <div className="space-y-3">
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Confirm Order
                    </button>
                  )}
                  {order.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus('processing')}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                      Start Processing
                    </button>
                  )}
                  {order.orderStatus === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus('shipped')}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Truck size={18} />
                      )}
                      Mark as Shipped
                    </button>
                  )}
                  {order.orderStatus === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus('delivered')}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        handleUpdateStatus('cancelled');
                      }
                    }}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={18} />
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

