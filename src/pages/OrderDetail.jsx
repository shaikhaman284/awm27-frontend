import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiPhone, FiMapPin, FiAlertCircle, FiX, FiPackage, FiDownload, FiChevronRight } from 'react-icons/fi';
import apiService from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import toast from 'react-hot-toast';
import { generateInvoice } from '../utils/invoiceGenerator';

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    loadOrderDetail();
    // eslint-disable-next-line
  }, [orderNumber]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrderDetail(orderNumber);
      setOrder(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to load order details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      await apiService.cancelOrder(orderNumber);
      toast.success('Order cancelled successfully');
      await loadOrderDetail();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to cancel order';
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const handleWriteReview = (item) => {
    const productId = item.product || item.product_id;

    if (!productId) {
      toast.error('Unable to load product information. Please try again.');
      return;
    }

    navigate('/write-review', {
      state: {
        product: {
          id: productId,
          name: item.product_name,
          shop_name: order.shop_name
        },
        orderId: order.id
      }
    });
  };

  const handleDownloadInvoice = () => {
    try {
      setDownloadingInvoice(true);
      generateInvoice(order);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FiAlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Unable to Load Order</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadOrderDetail}
              className="block w-full px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition"
            >
              Try Again
            </button>
            <Link
              to="/orders"
              className="block w-full px-6 py-3 border-2 border-gray-300 font-semibold rounded-full hover:bg-gray-50 transition"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', time: order.created_at },
    { key: 'confirmed', label: 'Confirmed', time: order.confirmed_at },
    { key: 'shipped', label: 'Shipped', time: order.shipped_at },
    { key: 'delivered', label: 'Delivered', time: order.delivered_at }
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.order_status);
  const canCancel = ['placed', 'confirmed'].includes(order.order_status);

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
            <button onClick={() => navigate('/orders')} className="text-gray-500 hover:text-black transition">
              My Orders
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">#{order.order_number}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Order #{order.order_number}</h1>
                <p className="text-sm text-gray-600 mb-2">
                  Placed on{' '}
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="inline-block px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-sm font-semibold">
                    {order.payment_status === 'paid' ? 'Paid' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-black mb-4">₹{order.total_amount}</p>

                {/* Download Invoice Button */}
                {order.order_status === 'delivered' && (
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    <FiDownload className="w-5 h-5" />
                    {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
                  </button>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            {canCancel && (
              <div className="pt-6 border-t-2 border-gray-200">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <FiX className="w-5 h-5" />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  You can cancel this order before it is shipped
                </p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          {order.order_status !== 'cancelled' && (
            <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
              <h2 className="text-2xl font-bold mb-8">Order Status</h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Steps */}
                <div className="space-y-10">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="relative flex items-start gap-6">
                        {/* Status Icon */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white transition ${
                            isCompleted
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          {isCompleted ? (
                            <FiCheck className="w-5 h-5 text-white" />
                          ) : (
                            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                          )}
                        </div>

                        {/* Status Info */}
                        <div className="flex-1 pt-1">
                          <p
                            className={`font-bold text-lg mb-1 ${
                              isCurrent ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.time && (
                            <p className="text-sm text-gray-600">
                              {new Date(step.time).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          {!step.time && !isCompleted && (
                            <p className="text-sm text-gray-500">Pending</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Status */}
          {order.order_status === 'cancelled' && (
            <div className="border-2 border-red-200 bg-red-50 rounded-3xl p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <FiX className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl text-red-800">Order Cancelled</h3>
              </div>
              {order.cancelled_at && (
                <p className="text-sm text-red-600 mb-4">
                  Cancelled on{' '}
                  {new Date(order.cancelled_at).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {order.cancellation_reason && (
                <div className="p-4 bg-red-100 rounded-2xl border border-red-200">
                  <p className="text-sm font-bold text-red-800 mb-1">Cancellation Reason:</p>
                  <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition">
                  <div className="flex gap-4 p-5">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fallback-icon w-full h-full flex items-center justify-center"
                        style={{ display: item.product_image ? 'none' : 'flex' }}
                      >
                        <FiPackage className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-gray-900 mb-2">{item.product_name}</p>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 mb-2">
                          {item.size && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">Quantity: {item.quantity}</p>
                      <p className="font-bold text-xl text-black">
                        ₹{item.display_price} × {item.quantity} = ₹{item.item_subtotal}
                      </p>
                    </div>
                  </div>

                  {/* Review button */}
                  {order.order_status === 'delivered' && (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleWriteReview(item)}
                        className="w-full py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition"
                      >
                        Write Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Delivery Details */}
            <div className="border-2 border-gray-200 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-5">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-base text-black mb-1">{order.customer_name}</p>
                  <p className="text-gray-600 mb-2">{order.customer_phone}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {order.delivery_address}
                    <br />
                    {order.city} - {order.pincode}
                  </p>
                  {order.landmark && (
                    <p className="text-gray-600 mt-2">Landmark: {order.landmark}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="border-2 border-gray-200 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-5">Shop Details</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiPackage className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base mb-1">{order.shop_name}</p>
                  {order.shop_contact && (
                    <p className="text-sm text-gray-600 mb-3">{order.shop_contact}</p>
                  )}
                  {order.shop_contact && (

                      <a href={`tel:${order.shop_contact}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition text-sm"
                    >
                      <FiPhone className="w-4 h-4" />
                      Call Shop
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Payment Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Items Total</span>
                <span className="font-semibold text-black">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-black">
                  {order.cod_fee > 0 ? `₹${order.cod_fee}` : (
                    <span className="text-green-600">FREE</span>
                  )}
                </span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between font-bold text-2xl">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <p className="font-bold mb-1">Payment Method: Cash on Delivery</p>
                <p className="text-sm text-gray-600">
                  {order.payment_status === 'paid'
                    ? 'Payment completed'
                    : `Pay ₹${order.total_amount} when you receive the order`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;