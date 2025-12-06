import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle, Download, Calendar, Loader2 } from 'lucide-react';
import { ordersAPI, Order } from '../../utils/api';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

interface OrderWithCustomer extends Order {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const CompletedOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [dateFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const allOrders = await ordersAPI.getAllOrders();
      
      // Filter for only delivered orders (completed orders)
      const completedOrders = allOrders.filter(
        order => order.orderStatus === 'delivered'
      );
      
      // Apply date filter
      let filtered = completedOrders;
      if (dateFilter !== 'all') {
        const now = new Date();
        filtered = completedOrders.filter(order => {
          const orderDate = new Date(order.deliveredAt || order.placedAt || order.createdAt);
          switch (dateFilter) {
            case 'today':
              return orderDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return orderDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return orderDate >= monthAgo;
            default:
              return true;
          }
        });
      }
      
      setOrders(filtered as OrderWithCustomer[]);
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
      (order.shippingAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return sum + (typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount.toString()));
  }, 0);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
            Completed Orders
          </h1>
          <p className="text-emerald-600">View all successfully completed orders</p>
        </div>
        <div className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <p className="text-sm text-emerald-50">Total Revenue</p>
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <input
              type="text"
              placeholder="Search completed orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 font-medium appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = typeof order.totalAmount === 'number' 
            ? order.totalAmount 
            : parseFloat(order.totalAmount.toString());

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-emerald-100"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-emerald-900">{order.orderNumber}</h3>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600">
                        Completed: {order.deliveredAt 
                          ? new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-emerald-600">
                        Placed: {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-900">
                        ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-emerald-600">Items: {totalQuantity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-1">Customer</p>
                      <p className="text-emerald-900 font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p className="text-sm text-emerald-600">{order.shippingAddress?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-1">Order Items</p>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <img
                              src={getImageSrc(item)}
                              alt={item.title}
                              className="w-8 h-8 object-cover rounded bg-gray-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-emerald-900 truncate">{item.title}</p>
                              <p className="text-xs text-emerald-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-emerald-500">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-mint-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-emerald-300 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all">
                    <Download size={18} />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <CheckCircle className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No completed orders found</p>
        </div>
      )}
    </div>
  );
};

export default CompletedOrders;
