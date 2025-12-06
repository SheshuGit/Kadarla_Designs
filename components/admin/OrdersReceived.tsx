import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, X, Package, Clock, Loader2, AlertCircle } from 'lucide-react';
import { ordersAPI, Order } from '../../utils/api';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

interface OrderWithCustomer extends Order {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const OrdersReceived: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      let allOrders = await ordersAPI.getAllOrders();
      
      // Filter based on selected status
      if (filterStatus === 'all') {
        // Show all orders except delivered and cancelled
        allOrders = allOrders.filter(
          order => order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled'
        );
      } else {
        // Filter by specific status
        allOrders = allOrders.filter(
          order => order.orderStatus.toLowerCase() === filterStatus.toLowerCase()
        );
      }
      
      setOrders(allOrders as OrderWithCustomer[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await ordersAPI.updateOrderStatus(orderId, { orderStatus: newStatus });
      await fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
          Orders Received
        </h1>
        <p className="text-emerald-600">Manage and process incoming orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by order number, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 font-medium appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const isUpdating = updatingOrderId === order.id;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-emerald-100"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-emerald-900">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus === 'processing' || order.orderStatus === 'confirmed' ? (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          ) : order.orderStatus === 'shipped' ? (
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              Shipped
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Package size={14} />
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600">
                        Order Date: {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-900">
                        ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-emerald-600">Items: {totalQuantity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-1">Customer Details</p>
                      <p className="text-emerald-900 font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p className="text-sm text-emerald-600">{order.shippingAddress?.email || 'N/A'}</p>
                      <p className="text-sm text-emerald-600">{order.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-1">Delivery Address</p>
                      <p className="text-sm text-emerald-600">{formatAddress(order.shippingAddress)}</p>
                      {order.shippingAddress?.landmark && (
                        <p className="text-sm text-emerald-500 mt-1">Landmark: {order.shippingAddress.landmark}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="pt-4 border-t border-emerald-100">
                    <p className="text-sm font-semibold text-emerald-700 mb-3">Order Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={getImageSrc(item)}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-emerald-900">{item.title}</p>
                            <p className="text-xs text-emerald-600">
                              Qty: {item.quantity} × ₹{item.discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </p>
                            {item.customMessage && (
                              <p className="text-xs text-emerald-500 mt-1">Note: {item.customMessage}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="pt-4 border-t border-emerald-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">Payment Method:</span>
                      <span className="font-semibold text-emerald-900 capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-emerald-700">Payment Status:</span>
                      <span className={`font-semibold capitalize ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Package size={18} />
                      )}
                      Mark as Shipped
                    </button>
                  )}
                  {order.orderStatus === 'shipped' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        Mark as Delivered
                      </button>
                      <p className="text-xs text-center text-emerald-600 mt-1">
                        Order will move to Completed Orders
                      </p>
                    </>
                  )}
                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          handleUpdateStatus(order.id, 'cancelled');
                        }
                      }}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={18} />
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-mint-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <Package className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrdersReceived;
