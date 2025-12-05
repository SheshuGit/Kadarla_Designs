import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { ordersAPI, paymentsAPI, itemsAPI, Order, Payment, Item } from '../../utils/api';

const Analytics: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, paymentsData, itemsData] = await Promise.all([
        ordersAPI.getAllOrders(),
        paymentsAPI.getAllPayments(),
        itemsAPI.getItems()
      ]);
      setOrders(ordersData);
      setPayments(paymentsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total revenue from paid payments
  const totalRevenue = payments
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => {
      return sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount.toString()));
    }, 0);

  const totalOrders = orders.length;
  const totalProducts = items.length;

  // Calculate unique customers (from orders)
  const uniqueCustomers = new Set(orders.map(order => order.userId)).size;

  // Calculate monthly sales data (last 6 months)
  const getMonthlySales = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
      
      // Get payments for this month
      const monthPayments = payments.filter(p => {
        if (p.paymentStatus !== 'paid') return false;
        const paymentDate = p.paymentDate ? new Date(p.paymentDate) : new Date(p.createdAt);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      const sales = monthPayments.reduce((sum, p) => {
        return sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount.toString()));
      }, 0);
      
      // Get orders for this month
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.placedAt || o.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthName,
        sales: sales,
        orders: monthOrders.length
      });
    }
    
    return months;
  };

  const salesData = getMonthlySales();

  // Calculate category distribution from orders
  // Shows which categories have orders and their total order value
  const getCategoryDistribution = () => {
    const categoryMap = new Map<string, { orderIds: Set<string>; totalValue: number }>();
    
    orders.forEach(order => {
      const orderTotal = typeof order.totalAmount === 'number' 
        ? order.totalAmount 
        : parseFloat(order.totalAmount.toString());
      const orderId = order.id || order._id?.toString() || '';
      
      // Get unique categories from items in this order
      const categoriesInOrder = new Set<string>();
      order.items.forEach(item => {
        const category = item.category || 'Other';
        categoriesInOrder.add(category);
      });
      
      // For each category in this order, add the full order value
      // (If an order has items from multiple categories, it counts towards all of them)
      categoriesInOrder.forEach(category => {
        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!;
          existing.orderIds.add(orderId);
          existing.totalValue += orderTotal;
        } else {
          categoryMap.set(category, {
            orderIds: new Set([orderId]),
            totalValue: orderTotal
          });
        }
      });
    });
    
    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val.totalValue, 0);
    
    // Get all unique categories from the map
    const allCategories = Array.from(categoryMap.keys());
    
    const categoryColors: Record<string, string> = {
      'Anniversary': 'bg-emerald-500',
      'Birthday': 'bg-blue-500',
      'Wedding': 'bg-pink-500',
      'Corporate': 'bg-amber-500',
      'Best Sellers': 'bg-purple-500',
      'Other': 'bg-gray-500'
    };
    
    return allCategories.map(categoryName => {
      const data = categoryMap.get(categoryName)!;
      const orderCount = data.orderIds.size;
      const percentage = total > 0 ? Math.round((data.totalValue / total) * 100) : 0;
      return {
        name: categoryName,
        color: categoryColors[categoryName] || 'bg-gray-500',
        value: percentage,
        amount: data.totalValue,
        orderCount: orderCount
      };
    }).sort((a, b) => b.amount - a.amount);
  };

  const categoryData = getCategoryDistribution();

  // Calculate top customers
  const getTopCustomers = () => {
    const customerMap = new Map<string, { name: string; orders: number; spent: number }>();
    
    orders.forEach(order => {
      const userId = order.userId;
      const customerName = order.shippingAddress?.fullName || 'Unknown';
      const amount = typeof order.totalAmount === 'number' 
        ? order.totalAmount 
        : parseFloat(order.totalAmount.toString());
      
      if (customerMap.has(userId)) {
        const existing = customerMap.get(userId)!;
        existing.orders += 1;
        existing.spent += amount;
      } else {
        customerMap.set(userId, {
          name: customerName,
          orders: 1,
          spent: amount
        });
      }
    });
    
    return Array.from(customerMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  };

  const topCustomers = getTopCustomers();

  const maxSales = Math.max(...salesData.map(d => d.sales), 1);

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
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </h3>
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
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">{totalOrders}</h3>
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
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">{uniqueCustomers}</h3>
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
          <h3 className="text-2xl font-bold text-emerald-900 mb-1">{totalProducts}</h3>
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
            {salesData.length > 0 ? (
              salesData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-emerald-900">{data.month}</span>
                    <span className="text-emerald-600">
                      ₹{data.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })} • {data.orders} orders
                    </span>
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
              ))
            ) : (
              <div className="text-center py-8 text-emerald-600">
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-emerald-900">Category Distribution</h2>
            <PieChart className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-4">
            {categoryData.length > 0 ? (
              categoryData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${category.color}`}></div>
                      <span className="font-medium text-emerald-900">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-900 font-bold">
                        ₹{category.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-emerald-600 font-semibold">({category.value}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-mint-50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${category.color} h-full rounded-full transition-all`}
                      style={{ width: `${category.value}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-emerald-600 ml-6">
                    {category.orderCount} {category.orderCount === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-emerald-600">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <h2 className="text-xl font-serif font-bold text-emerald-900 mb-6">Top Customers</h2>
        <div className="space-y-4">
          {topCustomers.length > 0 ? (
            topCustomers.map((customer, index) => (
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
                  <p className="font-bold text-emerald-900 text-lg">
                    ₹{customer.spent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-600">Total Spent</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-emerald-600">
              <p>No customer data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
