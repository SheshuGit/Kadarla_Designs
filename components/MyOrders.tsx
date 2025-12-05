import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Loader2, 
  Eye, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle
} from 'lucide-react';
import { getUser, ordersAPI, Order } from '../utils/api';

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    
    if (currentUser) {
      fetchOrders(currentUser.id);
    } else {
      setIsLoading(false);
      navigate('/');
    }
  }, [filterStatus]);

  const fetchOrders = async (userId: string) => {
    try {
      setIsLoading(true);
      const userOrders = await ordersAPI.getUserOrders(userId);
      
      // Sort by most recent first
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = new Date(a.placedAt || a.createdAt).getTime();
        const dateB = new Date(b.placedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
      order.orderStatus.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

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
        return <CheckCircle size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'processing':
      case 'confirmed':
        return <Clock size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getImageSrc = (item: any) => {
    if (!item || !item.image) return '/images/placeholder.png';
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
      <div className="min-h-screen bg-mint-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-mint-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Package className="mx-auto text-emerald-300 mb-4" size={64} />
          <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
            Please Login
          </h2>
          <p className="text-emerald-600 mb-6">
            You need to be logged in to view your orders.
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

  return (
    <div className="min-h-screen bg-mint-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 mb-2 flex items-center gap-3">
            <Package className="text-emerald-600" size={32} />
            My Orders
          </h1>
          <p className="text-emerald-600">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
              <input
                type="text"
                placeholder="Search orders by order number or product name..."
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
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const totalAmount = typeof order.totalAmount === 'number' 
              ? order.totalAmount 
              : parseFloat(order.totalAmount.toString());
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-emerald-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-emerald-900">{order.orderNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                              {getStatusIcon(order.orderStatus)}
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-emerald-600">
                            <Calendar size={14} />
                            <span>
                              Placed on {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                          <p className="text-2xl font-bold text-emerald-900">
                            ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-emerald-600">{totalQuantity} item{totalQuantity > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-mint-50 rounded-xl">
                            <img
                              src={getImageSrc(item)}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-emerald-900 truncate">{item.title}</p>
                              <p className="text-xs text-emerald-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center p-3 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200">
                            <p className="text-sm font-medium text-emerald-700">
                              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quick Status Preview */}
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

                    {/* Action Button */}
                    <div className="flex items-center lg:items-start lg:justify-end">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-2xl border border-emerald-100">
            <Package className="mx-auto text-emerald-300 mb-4" size={64} />
            <h2 className="text-2xl font-serif font-bold text-emerald-900 mb-2">
              No Orders Found
            </h2>
            <p className="text-emerald-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
              >
                Start Shopping
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

