import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, LogOut, RefreshCw, BarChart3, Clock, CheckCircle, Truck, CreditCard, AlertCircle } from 'lucide-react';
import OrderTable from '../components/OrderTable';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Order } from '../types/database';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid session');
        fetchOrders();
      } catch {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem('admin_token');
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  };

  // Filter out pending payment orders for stats (they're not confirmed orders)
  const confirmedOrders = orders.filter(o => o.status !== 'Pending Payment');
  const pendingPaymentOrders = orders.filter(o => o.status === 'Pending Payment');
  
  const stats = {
    total: confirmedOrders.length,
    pendingPayment: pendingPaymentOrders.length,
    new: confirmedOrders.filter(o => o.status === 'New').length,
    preparing: confirmedOrders.filter(o => o.status === 'Preparing').length,
    completed: confirmedOrders.filter(o => o.status === 'Completed').length,
    delivered: confirmedOrders.filter(o => o.status === 'Delivered').length,
    totalRevenue: confirmedOrders.reduce((sum, o) => sum + Number(o.total_price), 0),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-800 to-pink-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-rose-200 text-sm">Manage your orders & payments</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue (Paid Orders)</p>
              <p className="text-4xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
            </div>
          </motion.div>

          {stats.pendingPayment > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-xl shadow-md p-4 border-2 border-red-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingPayment}</p>
                  <p className="text-sm text-gray-500">Pending Pay</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                <p className="text-sm text-gray-500">New</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <RefreshCw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.preparing}</p>
                <p className="text-sm text-gray-500">Preparing</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-white text-gray-600 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
            <p className="text-gray-400">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <OrderTable orders={orders} onUpdateStatus={handleUpdateStatus} />
        )}
      </div>
    </div>
  );
}
