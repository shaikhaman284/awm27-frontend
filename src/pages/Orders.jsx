import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiRefreshCw, FiChevronRight, FiClock, FiCheckCircle } from 'react-icons/fi';
import apiService from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      let statusFilter = null;
      if (activeTab === 'active') {
        statusFilter = null;
      } else if (activeTab === 'completed') {
        statusFilter = 'delivered';
      } else if (activeTab === 'cancelled') {
        statusFilter = 'cancelled';
      }

      const response = await apiService.getMyOrders(statusFilter);
      let ordersData = response.data;

      if (activeTab === 'active') {
        ordersData = ordersData.filter(order =>
          ['placed', 'confirmed', 'shipped'].includes(order.order_status)
        );
      }

      setOrders(ordersData);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <FiCheckCircle className="w-4 h-4" />;
    return <FiClock className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">MY ORDERS</h1>
            <p className="text-gray-600">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-full hover:bg-gray-50 transition font-medium"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.order_number}`}
                className="block border-2 border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-bold text-xl">#{order.order_number}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(
                          order.order_status
                        )}`}
                      >
                        {getStatusIcon(order.order_status)}
                        {ORDER_STATUS_LABELS[order.order_status]}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-900 mb-1">{order.shop_name}</p>
                    <p className="text-sm text-gray-600">
                      {order.items_count} {order.items_count === 1 ? 'item' : 'items'} • Placed on{' '}
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-bold text-black mb-1">₹{order.total_amount}</p>
                    <p className="text-sm text-gray-600 font-medium">
                      {order.payment_status === 'paid' ? 'Paid' : 'Cash on Delivery'}
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-4 border-t-2 border-gray-100">
                  <span className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all">
                    View Order Details
                    <FiChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FiPackage className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Orders Found</h2>
            <p className="text-gray-600 mb-8 text-lg">
              {activeTab === 'all'
                ? "You haven't placed any orders yet"
                : `No ${activeTab} orders found`}
            </p>
            <Link
              to="/products"
              className="inline-block px-12 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;