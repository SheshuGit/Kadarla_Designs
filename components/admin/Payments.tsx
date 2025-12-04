import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from 'lucide-react';

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const payments = [
    {
      id: '#PAY-001',
      orderId: '#ORD-001',
      customer: 'Rajesh Kumar',
      amount: '₹4,999',
      method: 'UPI',
      status: 'Completed',
      date: '2024-01-15',
      transactionId: 'TXN123456789',
    },
    {
      id: '#PAY-002',
      orderId: '#ORD-002',
      customer: 'Priya Sharma',
      amount: '₹3,499',
      method: 'Credit Card',
      status: 'Completed',
      date: '2024-01-14',
      transactionId: 'TXN123456790',
    },
    {
      id: '#PAY-003',
      orderId: '#ORD-003',
      customer: 'Amit Patel',
      amount: '₹10,598',
      method: 'Net Banking',
      status: 'Pending',
      date: '2024-01-14',
      transactionId: 'TXN123456791',
    },
    {
      id: '#PAY-004',
      orderId: '#ORD-004',
      customer: 'Sneha Reddy',
      amount: '₹13,998',
      method: 'UPI',
      status: 'Completed',
      date: '2024-01-13',
      transactionId: 'TXN123456792',
    },
    {
      id: '#PAY-005',
      orderId: '#ORD-005',
      customer: 'Vikram Singh',
      amount: '₹3,999',
      method: 'Debit Card',
      status: 'Failed',
      date: '2024-01-13',
      transactionId: 'TXN123456793',
    },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/[₹,]/g, '')), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/[₹,]/g, '')), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="text-emerald-600" size={18} />;
      case 'Pending':
        return <Clock className="text-amber-600" size={18} />;
      case 'Failed':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2">
          Payments
        </h1>
        <p className="text-emerald-600">Manage and track all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-emerald-50 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-amber-50 text-sm mb-1">Pending Payments</p>
          <p className="text-3xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-blue-50 text-sm mb-1">Completed Transactions</p>
          <p className="text-3xl font-bold">
            {payments.filter(p => p.status === 'Completed').length}
          </p>
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
              placeholder="Search payments by ID, order ID, or customer..."
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
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Payment ID</th>
                <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Amount</th>
                <th className="px-6 py-4 text-left font-semibold">Method</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-mint-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-900">{payment.id}</td>
                  <td className="px-6 py-4 text-emerald-700">{payment.orderId}</td>
                  <td className="px-6 py-4 text-emerald-900 font-medium">{payment.customer}</td>
                  <td className="px-6 py-4 font-bold text-emerald-900">{payment.amount}</td>
                  <td className="px-6 py-4 text-emerald-700">{payment.method}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-600">{payment.date}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-mint-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium">
                      <Download size={14} />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <DollarSign className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No payments found</p>
        </div>
      )}
    </div>
  );
};

export default Payments;

