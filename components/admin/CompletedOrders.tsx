import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, Download, Calendar } from 'lucide-react';

const CompletedOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const orders = [
    {
      id: '#ORD-101',
      customer: 'Priya Sharma',
      email: 'priya@example.com',
      product: 'Birthday Gift Set',
      quantity: 1,
      amount: '₹3,499',
      completedDate: '2024-01-14',
      deliveryDate: '2024-01-16',
      rating: 5,
    },
    {
      id: '#ORD-102',
      customer: 'Sneha Reddy',
      email: 'sneha@example.com',
      product: 'Corporate Hamper',
      quantity: 2,
      amount: '₹13,998',
      completedDate: '2024-01-13',
      deliveryDate: '2024-01-15',
      rating: 4,
    },
    {
      id: '#ORD-103',
      customer: 'Anjali Mehta',
      email: 'anjali@example.com',
      product: 'Anniversary Hamper',
      quantity: 1,
      amount: '₹4,999',
      completedDate: '2024-01-12',
      deliveryDate: '2024-01-14',
      rating: 5,
    },
    {
      id: '#ORD-104',
      customer: 'Kavita Nair',
      email: 'kavita@example.com',
      product: 'Wedding Box',
      quantity: 1,
      amount: '₹5,299',
      completedDate: '2024-01-11',
      deliveryDate: '2024-01-13',
      rating: 5,
    },
    {
      id: '#ORD-105',
      customer: 'Meera Joshi',
      email: 'meera@example.com',
      product: 'Custom Gift Box',
      quantity: 3,
      amount: '₹11,997',
      completedDate: '2024-01-10',
      deliveryDate: '2024-01-12',
      rating: 4,
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return sum + parseInt(order.amount.replace(/[₹,]/g, ''));
  }, 0);

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
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
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
        {filteredOrders.map((order) => (
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
                      <h3 className="text-xl font-bold text-emerald-900">{order.id}</h3>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600">Completed: {order.completedDate}</p>
                    <p className="text-sm text-emerald-600">Delivered: {order.deliveryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-900">{order.amount}</p>
                    <p className="text-sm text-emerald-600">Qty: {order.quantity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Customer</p>
                    <p className="text-emerald-900 font-medium">{order.customer}</p>
                    <p className="text-sm text-emerald-600">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Product</p>
                    <p className="text-emerald-900 font-medium">{order.product}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-emerald-600">Rating: </span>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < order.rating ? 'text-amber-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 lg:w-48">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-mint-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all">
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
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <CheckCircle className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No completed orders found</p>
        </div>
      )}
    </div>
  );
};

export default CompletedOrders;

