import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Orders',
      value: '45',
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Products',
      value: '156',
      change: '+5.7%',
      trend: 'up',
      icon: Package,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Rajesh Kumar', product: 'Anniversary Hamper', amount: '₹4,999', status: 'Pending', date: '2024-01-15' },
    { id: '#ORD-002', customer: 'Priya Sharma', product: 'Birthday Gift Set', amount: '₹3,499', status: 'Completed', date: '2024-01-14' },
    { id: '#ORD-003', customer: 'Amit Patel', product: 'Wedding Box', amount: '₹5,299', status: 'Processing', date: '2024-01-14' },
    { id: '#ORD-004', customer: 'Sneha Reddy', product: 'Corporate Hamper', amount: '₹6,999', status: 'Completed', date: '2024-01-13' },
    { id: '#ORD-005', customer: 'Vikram Singh', product: 'Custom Gift Box', amount: '₹3,999', status: 'Pending', date: '2024-01-13' },
  ];

  const topProducts = [
    { name: 'Anniversary Hamper', sales: 234, revenue: '₹11,67,666' },
    { name: 'Birthday Gift Set', sales: 189, revenue: '₹6,61,311' },
    { name: 'Wedding Box', sales: 156, revenue: '₹8,26,644' },
    { name: 'Corporate Hamper', sales: 142, revenue: '₹9,93,858' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
          Business Overview
        </h1>
        <p className="text-emerald-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-emerald-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`text-${stat.color.split('-')[1]}-600`} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-emerald-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-emerald-900">Recent Orders</h2>
            <button className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-mint-50 to-white rounded-xl hover:shadow-md transition-all border border-emerald-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-emerald-900">{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">{order.customer}</p>
                  <p className="text-xs text-emerald-600">{order.product}</p>
                  <p className="text-xs text-emerald-500 mt-1">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-900">{order.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-emerald-900">Top Products</h2>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-mint-50 to-white rounded-xl hover:shadow-md transition-all border border-emerald-100"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{product.name}</p>
                    <p className="text-xs text-emerald-600">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-900">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <Users className="mb-3" size={32} />
          <h3 className="text-2xl font-bold mb-1">1,234</h3>
          <p className="text-emerald-50">Total Customers</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <Package className="mb-3" size={32} />
          <h3 className="text-2xl font-bold mb-1">98.5%</h3>
          <p className="text-blue-50">Order Fulfillment Rate</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <TrendingUp className="mb-3" size={32} />
          <h3 className="text-2xl font-bold mb-1">+24.3%</h3>
          <p className="text-pink-50">Growth This Month</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

