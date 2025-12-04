import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, BarChart3, PieChart } from 'lucide-react';

const Analytics: React.FC = () => {
  const salesData = [
    { month: 'Jan', sales: 45000, orders: 45 },
    { month: 'Feb', sales: 52000, orders: 52 },
    { month: 'Mar', sales: 48000, orders: 48 },
    { month: 'Apr', sales: 61000, orders: 61 },
    { month: 'May', sales: 55000, orders: 55 },
    { month: 'Jun', sales: 67000, orders: 67 },
  ];

  const categoryData = [
    { name: 'Anniversary', value: 35, color: 'bg-emerald-500' },
    { name: 'Birthday', value: 25, color: 'bg-blue-500' },
    { name: 'Wedding', value: 20, color: 'bg-pink-500' },
    { name: 'Corporate', value: 15, color: 'bg-amber-500' },
    { name: 'Custom', value: 5, color: 'bg-purple-500' },
  ];

  const topCustomers = [
    { name: 'Rajesh Kumar', orders: 12, spent: '₹59,988' },
    { name: 'Priya Sharma', orders: 10, spent: '₹34,990' },
    { name: 'Amit Patel', orders: 8, spent: '₹84,784' },
    { name: 'Sneha Reddy', orders: 7, spent: '₹97,986' },
    { name: 'Vikram Singh', orders: 6, spent: '₹23,994' },
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-emerald-600">Comprehensive insights into your business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">₹3,28,000</h3>
          <p className="text-sm text-emerald-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">328</h3>
          <p className="text-sm text-emerald-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-50 rounded-xl">
              <Users className="text-pink-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-pink-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">1,234</h3>
          <p className="text-sm text-emerald-600">Total Customers</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Package className="text-amber-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <TrendingDown size={16} />
              <span className="text-sm font-medium">-2.1%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">156</h3>
          <p className="text-sm text-emerald-600">Total Products</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-emerald-900">Sales Overview</h2>
            <BarChart3 className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-900">{data.month}</span>
                  <span className="text-emerald-600">₹{data.sales.toLocaleString('en-IN')} • {data.orders} orders</span>
                </div>
                <div className="w-full bg-mint-50 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${(data.sales / maxSales) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{data.orders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-emerald-900">Category Distribution</h2>
            <PieChart className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${category.color}`}></div>
                    <span className="font-medium text-emerald-900">{category.name}</span>
                  </div>
                  <span className="text-emerald-600 font-semibold">{category.value}%</span>
                </div>
                <div className="w-full bg-mint-50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${category.color} h-full rounded-full transition-all`}
                    style={{ width: `${category.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <h2 className="text-xl font-serif font-bold text-emerald-900 mb-6">Top Customers</h2>
        <div className="space-y-4">
          {topCustomers.map((customer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-mint-50 to-white rounded-xl border border-emerald-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">{customer.name}</p>
                  <p className="text-sm text-emerald-600">{customer.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-900 text-lg">{customer.spent}</p>
                <p className="text-xs text-emerald-600">Total Spent</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

