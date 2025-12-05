import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { paymentsAPI, Payment } from '../../utils/api';

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus.toLowerCase();
      const paymentsData = await paymentsAPI.getAllPayments(status);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => {
      return sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount.toString()));
    }, 0);

  const pendingAmount = payments
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, p) => {
      return sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount.toString()));
    }, 0);

  const completedCount = payments.filter(p => p.paymentStatus === 'paid').length;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="text-emerald-600" size={18} />;
      case 'pending':
        return <Clock className="text-amber-600" size={18} />;
      case 'failed':
        return <XCircle className="text-red-600" size={18} />;
      case 'refunded':
        return <XCircle className="text-purple-600" size={18} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
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
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-amber-50 text-sm mb-1">Pending Payments</p>
          <p className="text-3xl font-bold">₹{pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-blue-50 text-sm mb-1">Completed Transactions</p>
          <p className="text-3xl font-bold">{completedCount}</p>
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
              placeholder="Search payments by ID, order number, customer, or transaction ID..."
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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
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
                <th className="px-6 py-4 text-left font-semibold">Order Number</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Amount</th>
                <th className="px-6 py-4 text-left font-semibold">Method</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Transaction ID</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredPayments.map((payment) => {
                const amount = typeof payment.amount === 'number' 
                  ? payment.amount 
                  : parseFloat(payment.amount.toString());
                
                return (
                  <tr key={payment.id} className="hover:bg-mint-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-emerald-900">#{payment.id.slice(-8)}</td>
                    <td className="px-6 py-4 text-emerald-700 font-medium">{payment.orderNumber}</td>
                    <td className="px-6 py-4 text-emerald-900 font-medium">{payment.customerName || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-900">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-emerald-700 capitalize">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.paymentStatus)}`}>
                        {getStatusIcon(payment.paymentStatus)}
                        {getStatusLabel(payment.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-600">
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : new Date(payment.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 text-sm">
                      {payment.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-mint-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium">
                        <Download size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-emerald-100">
          <DollarSign className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No payments found</p>
        </div>
      )}
    </div>
  );
};

export default Payments;
