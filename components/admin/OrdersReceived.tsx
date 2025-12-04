import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, X, Package, Clock } from 'lucide-react';

const OrdersReceived: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    {
      id: '#ORD-001',
      customer: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      product: 'Anniversary Hamper',
      quantity: 1,
      amount: '₹4,999',
      status: 'Pending',
      date: '2024-01-15',
      address: '123 Main St, Mumbai, Maharashtra 400001',
    },
    {
      id: '#ORD-002',
      customer: 'Amit Patel',
      email: 'amit@example.com',
      phone: '+91 98765 43211',
      product: 'Wedding Box',
      quantity: 2,
      amount: '₹10,598',
      status: 'Processing',
      date: '2024-01-14',
      address: '456 Park Ave, Delhi, Delhi 110001',
    },
    {
      id: '#ORD-003',
      customer: 'Vikram Singh',
      email: 'vikram@example.com',
      phone: '+91 98765 43212',
      product: 'Custom Gift Box',
      quantity: 1,
      amount: '₹3,999',
      status: 'Pending',
      date: '2024-01-13',
      address: '789 Garden Rd, Bangalore, Karnataka 560001',
    },
    {
      id: '#ORD-004',
      customer: 'Neha Gupta',
      email: 'neha@example.com',
      phone: '+91 98765 43213',
      product: 'Birthday Gift Set',
      quantity: 1,
      amount: '₹3,499',
      status: 'Processing',
      date: '2024-01-12',
      address: '321 Ocean View, Chennai, Tamil Nadu 600001',
    },
    {
      id: '#ORD-005',
      customer: 'Ravi Verma',
      email: 'ravi@example.com',
      phone: '+91 98765 43214',
      product: 'Corporate Hamper',
      quantity: 3,
      amount: '₹20,997',
      status: 'Pending',
      date: '2024-01-11',
      address: '654 Hill Top, Pune, Maharashtra 411001',
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAccept = (orderId: string) => {
    console.log('Accept order:', orderId);
    // Handle accept logic
  };

  const handleReject = (orderId: string) => {
    console.log('Reject order:', orderId);
    // Handle reject logic
  };

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
              placeholder="Search orders by ID, customer, or product..."
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
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
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
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-emerald-900">{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status === 'Processing' ? (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {order.status}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {order.status}
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600">Order Date: {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-900">{order.amount}</p>
                    <p className="text-sm text-emerald-600">Qty: {order.quantity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Customer Details</p>
                    <p className="text-emerald-900 font-medium">{order.customer}</p>
                    <p className="text-sm text-emerald-600">{order.email}</p>
                    <p className="text-sm text-emerald-600">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Product & Delivery</p>
                    <p className="text-emerald-900 font-medium">{order.product}</p>
                    <p className="text-sm text-emerald-600 mt-1">{order.address}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 lg:w-48">
                <button
                  onClick={() => handleAccept(order.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                >
                  <CheckCircle size={18} />
                  Accept Order
                </button>
                <button
                  onClick={() => handleReject(order.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all"
                >
                  <X size={18} />
                  Reject
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-mint-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all">
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <Package className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrdersReceived;

