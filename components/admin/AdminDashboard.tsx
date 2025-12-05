import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { ordersAPI, itemsAPI, Order, Item } from '../../utils/api';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, itemsData] = await Promise.all([
        ordersAPI.getAllOrders(),
        itemsAPI.getItems()
      ]);
      setOrders(ordersData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalRevenue = orders
    .filter(order => order.orderStatus === 'delivered')
    .reduce((sum, order) => {
      const amount = typeof order.totalAmount === 'number' 
        ? order.totalAmount 
        : parseFloat(order.totalAmount.toString());
      return sum + amount;
    }, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    order => order.orderStatus === 'pending' || 
             order.orderStatus === 'confirmed' || 
             order.orderStatus === 'processing'
  ).length;
  const totalProducts = items.length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString('en-IN'),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      change: '+5.7%',
      trend: 'up',
      icon: Package,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => {
      const dateA = new Date(a.placedAt || a.createdAt).getTime();
      const dateB = new Date(b.placedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(order => {
      const totalAmount = typeof order.totalAmount === 'number' 
        ? order.totalAmount 
        : parseFloat(order.totalAmount.toString());
      return {
        id: order.orderNumber,
        customer: order.shippingAddress?.fullName || 'Unknown',
        product: order.items.length > 0 
          ? `${order.items[0].title}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}`
          : 'N/A',
        amount: `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        status: order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1),
        date: new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className="text-emerald-600" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-emerald-50' : 'text-red-200'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-emerald-50 text-sm sm:text-base font-medium mb-1">{stat.title}</h3>
              <p className="text-white text-2xl sm:text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-emerald-900">Recent Orders</h2>
            <button className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-mint-50 to-white rounded-lg sm:rounded-xl hover:shadow-md transition-all border border-emerald-100"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className="font-semibold text-sm sm:text-base text-emerald-900">{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium">{order.customer}</p>
                    <p className="text-xs text-emerald-600">{order.product}</p>
                    <p className="text-xs text-emerald-500 mt-1">{order.date}</p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-base sm:text-lg font-bold text-emerald-900">{order.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto text-emerald-300 mb-2" size={32} />
                <p className="text-emerald-600 text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-emerald-900">Top Products</h2>
            <button className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {items.slice(0, 4).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-mint-50 to-white rounded-lg sm:rounded-xl hover:shadow-md transition-all border border-emerald-100"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Package className="text-emerald-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base text-emerald-900 truncate">{item.title}</p>
                  <p className="text-xs sm:text-sm text-emerald-600">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-lg sm:text-xl font-bold text-emerald-600">#{index + 1}</span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto text-emerald-300 mb-2" size={32} />
                <p className="text-emerald-600 text-sm">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
