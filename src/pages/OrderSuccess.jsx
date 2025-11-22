import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';
import apiService from '../services/api';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderNumber]);

  const loadOrderDetails = async () => {
    try {
      const response = await apiService.getOrderDetail(orderNumber);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          {/* Order Number */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-3xl font-bold text-gray-900">{order.order_number}</p>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold">Seller will confirm your order</p>
                  <p className="text-sm text-gray-600">
                    The seller will review and confirm your order within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold">We'll notify you when shipped</p>
                  <p className="text-sm text-gray-600">
                    Track your order status in "My Orders" section
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold">Pay cash on delivery</p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery: 3-5 days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">Delivery Address</h2>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
            <p className="text-sm text-gray-600 mt-2">
              {order.delivery_address}
              <br />
              {order.city} - {order.pincode}
            </p>
            {order.landmark && (
              <p className="text-sm text-gray-600">Landmark: {order.landmark}</p>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h2 className="text-lg font-bold mb-3">Amount to Pay on Delivery</h2>
            <p className="text-4xl font-bold text-blue-600">₹{order.total_amount}</p>
            <p className="text-sm text-gray-600 mt-2">Payment Method: Cash on Delivery</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to={`/orders`}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              <FiPackage />
              Track Order
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              <FiHome />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;