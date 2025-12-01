import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome, FiChevronRight } from 'react-icons/fi';
import apiService from '../services/api';
import SEO from '../components/common/SEO';


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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SEO
          title="Order Not Found | Amravati Wears Market"
          description="The order confirmation could not be found."
          url="https://awm27.shop/order-success"
          noindex={true}
        />
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FiPackage className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Order Confirmed - #${order.order_number} | Amravati Wears Market`}
        description={`Your order #${order.order_number} has been placed successfully. Total: ₹${order.total_amount}. Payment: Cash on Delivery. Estimated delivery: 2-3 business days.`}
        url={`https://awm27.shop/order-success/${order.order_number}`}
        noindex={true}
      />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-black transition">
              Home
            </Link>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/orders" className="text-gray-500 hover:text-black transition">
              Orders
            </Link>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">Order Confirmation</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 relative">
              <FiCheckCircle className="w-14 h-14 text-green-600" />
              <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for shopping with us
            </p>
          </div>

          {/* Order Number */}
          <div className="border-2 border-gray-200 rounded-3xl p-8 mb-6 text-center bg-gray-50">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order Number
            </p>
            <p className="text-3xl md:text-4xl font-bold text-black tracking-wide">
              {order.order_number}
            </p>
          </div>

          {/* What Happens Next */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">What Happens Next?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Order Confirmation</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The seller will review and confirm your order within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Shipping Updates</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We'll notify you when your order is shipped. Track status in "My Orders"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Delivery & Payment</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pay cash on delivery. Estimated delivery: 2-3 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Delivery Address */}
            <div className="border-2 border-gray-200 rounded-3xl p-6">
              <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
              <div className="text-sm space-y-1">
                <p className="font-bold text-black text-base">{order.customer_name}</p>
                <p className="text-gray-600">{order.customer_phone}</p>
                <p className="text-gray-700 leading-relaxed pt-2">
                  {order.delivery_address}
                  <br />
                  {order.city} - {order.pincode}
                </p>
                {order.landmark && (
                  <p className="text-gray-600 pt-1">Landmark: {order.landmark}</p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-2 border-black rounded-3xl p-6 bg-gray-50">
              <h2 className="text-lg font-bold mb-4">Payment Details</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Amount to Pay on Delivery</p>
                <p className="text-4xl font-bold text-black">₹{order.total_amount}</p>
              </div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Cash on Delivery
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition"
            >
              <FiPackage className="w-5 h-5" />
              View My Orders
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition"
            >
              <FiHome className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info 
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              Order Confirmation Sent
            </h3>
            <p className="text-sm text-gray-600">
              We've sent order details to your registered phone number. You can track your order status anytime from the "My Orders" section.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;