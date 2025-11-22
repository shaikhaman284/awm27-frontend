import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiPhone, FiMapPin, FiAlertCircle, FiX, FiPackage, FiDownload } from 'react-icons/fi';
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadOrderDetail}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              to="/orders"
              className="block w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Orders
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{order.order_number}</h1>
                <p className="text-sm text-gray-600">
                  Placed on{' '}
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">₹{order.total_amount}</p>
                <p className="text-sm text-gray-600">
                  {order.payment_status === 'paid' ? 'Paid' : 'Pay on Delivery'}
                </p>
                {/* Download Invoice Button - Only for delivered orders */}
                {order.order_status === 'delivered' && (
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
                  </button>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            {canCancel && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FiX className="w-5 h-5" />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  You can cancel this order before it is shipped
                </p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          {order.order_status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Order Status</h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Steps */}
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        {/* Status Icon */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                          {isCompleted ? (
                            <FiCheck className="w-5 h-5" />
                          ) : (
                            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                          )}
                        </div>

                        {/* Status Info */}
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'
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

          {/* Cancelled Status - ✅ UPDATED WITH SELLER CANCELLATION REASON */}
          {order.order_status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FiX className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-800">Order Cancelled</p>
              </div>
              {order.cancelled_at && (
                <p className="text-sm text-red-600">
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
              {/* ✅ DISPLAY CANCELLATION REASON */}
              {order.cancellation_reason && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Order Items - ✅ WITH PRODUCT IMAGES */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-4">
                    {/* ✅ Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fallback-icon w-full h-full flex items-center justify-center"
                        style={{ display: item.product_image ? 'none' : 'flex' }}
                      >
                        <FiPackage className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product_name}</p>
                      {(item.size || item.color) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="font-semibold mt-2 text-gray-900">
                        ₹{item.display_price} × {item.quantity} = ₹{item.item_subtotal}
                      </p>
                    </div>
                  </div>

                  {/* Review button - only show for delivered orders */}
                  {order.order_status === 'delivered' && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleWriteReview(item)}
                        className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Write Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-semibold">{order.customer_name}</p>
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
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Total</span>
                <span className="font-semibold">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">COD Fee</span>
                <span className="font-semibold">
                  {order.cod_fee > 0 ? `₹${order.cod_fee}` : 'FREE'}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium">Payment Method: Cash on Delivery</p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.payment_status === 'paid'
                    ? 'Payment completed'
                    : `Pay ₹${order.total_amount} when you receive the order`}
                </p>
              </div>
            </div>
          </div>

          {/* Shop Details - ✅ FIXED SYNTAX ERROR */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Shop Details</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{order.shop_name}</p>
                {order.shop_contact && (
                  <p className="text-sm text-gray-600">{order.shop_contact}</p>
                )}
              </div>
              {order.shop_contact && (
                <a
                  href={`tel:${order.shop_contact}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPhone />
                  Call Shop
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
