import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheck, FiChevronRight, FiEdit2, FiPackage, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, calculateTotals, clearCart } = useCart();
  const totals = calculateTotals();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const isOrderPlaced = useRef(false); // Track if order was successfully placed
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Get applied coupon from Cart.jsx via navigation state
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone?.replace('+91', '') || '',
    delivery_address: '',
    city: 'Amravati',
    pincode: '',
    landmark: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Helper function to get the first image from product
  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (product.main_image) return product.main_image;
    if (product.image1) return product.image1;
    if (product.image) return product.image;
    return null;
  };

  // Calculate MRP totals and savings
  const calculateMRPTotals = useMemo(() => {
    let totalMRP = 0;
    let totalDisplayPrice = 0;
    let hasMRPProducts = false;

    cart.forEach(item => {
      const displayPrice = item.product.display_price * item.quantity;
      totalDisplayPrice += displayPrice;

      if (item.product.mrp && item.product.mrp > item.product.display_price) {
        totalMRP += item.product.mrp * item.quantity;
        hasMRPProducts = true;
      } else {
        totalMRP += displayPrice;
      }
    });

    const productSavings = totalMRP - totalDisplayPrice;

    return {
      totalMRP,
      totalDisplayPrice,
      productSavings,
      hasMRPProducts,
      totalSavings: productSavings + (appliedCoupon?.discount_amount || 0)
    };
  }, [cart, appliedCoupon]);

  // Calculate final total with coupon discount
  const getFinalTotal = () => {
    if (appliedCoupon && appliedCoupon.discount_amount) {
      return Math.max(0, totals.total - appliedCoupon.discount_amount);
    }
    return totals.total;
  };

  useEffect(() => {
    // Only redirect to cart if cart is empty AND order hasn't been placed
    if (cart.length === 0 && !isOrderPlaced.current) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.customer_name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!formData.delivery_address.trim()) {
      toast.error('Please enter delivery address');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        cart_items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null
        })),
        ...formData,
        coupon_code: appliedCoupon ? appliedCoupon.coupon.code : null
      };

      const response = await apiService.createOrder(orderData);

      // Mark that order was successfully placed BEFORE clearing cart
      isOrderPlaced.current = true;

      toast.success('Order placed successfully!');
      clearCart();

      // Navigate to order success page
      navigate(`/order-success/${response.data.order.order_number}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsConditions = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Checkout - Step ${step} of 3 | Amravati Wears Market`}
        description={`Complete your order checkout. ${step === 1
          ? 'Enter delivery address.'
          : step === 2
            ? 'Select payment method.'
            : 'Review and place your order.'
          } Total: ₹${getFinalTotal().toFixed(2)}`}
        url="https://awm27.shop/checkout"
        noindex={true}
      />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <button onClick={() => navigate('/cart')} className="text-gray-500 hover:text-black transition">
              Cart
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">CHECKOUT</h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Delivery Address' },
              { num: 2, label: 'Payment Method' },
              { num: 3, label: 'Review Order' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition ${step >= s.num
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {step > s.num ? <FiCheck className="w-6 h-6" /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden md:block ${step >= s.num ? 'text-black' : 'text-gray-400'
                    }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 w-20 md:w-32 mx-2 transition ${step > s.num ? 'bg-black' : 'bg-gray-200'
                    }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step 1: Delivery Address */}
          {step === 1 && (
            <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition resize-none"
                    placeholder="House no., Building name, Street name, Area"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="444601"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="mt-8 w-full py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              {/* Address Summary */}
              <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">Delivery Address</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-sm font-medium text-black hover:underline"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-black">{formData.customer_name}</p>
                  <p>{formData.customer_phone}</p>
                  <p>
                    {formData.delivery_address}, {formData.city} - {formData.pincode}
                  </p>
                  {formData.landmark && <p>Landmark: {formData.landmark}</p>}
                </div>
              </div>

              {/* Applied Coupon Display */}
              {appliedCoupon && (
                <div className="mb-6 p-5 bg-green-50 rounded-2xl border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-5 h-5 text-green-700" />
                      <h3 className="font-bold text-green-900">Coupon Applied</h3>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {appliedCoupon.coupon.code}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    You're saving ₹{appliedCoupon.discount_amount.toFixed(2)} with this coupon!
                  </p>
                </div>
              )}

              {/* Payment Options */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold mb-3">Select Payment Method</h3>

                <div className="border-2 border-black rounded-2xl p-5 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="mt-1 w-5 h-5 text-black"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1">Cash on Delivery</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Pay with cash when your order is delivered
                      </p>
                      <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {totals.codFee > 0 ? `COD Fee: ₹${totals.codFee}` : '✓ FREE COD'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-2xl p-5 bg-gray-100 opacity-60 cursor-not-allowed">
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1 text-gray-500">Online Payment</p>
                      <p className="text-sm text-gray-500">UPI, Cards, Net Banking (Coming Soon)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">Order Items ({cart.length})</h3>
                <div className="space-y-3">
                  {cart.map((item) => {
                    const imageUrl = getProductImage(item.product);
                    const priceInfo = item.product.mrp && item.product.mrp > item.product.display_price
                      ? {
                        discountPercent: Math.round(
                          ((item.product.mrp - item.product.display_price) / item.product.mrp) * 100
                        ),
                        mrp: item.product.mrp,
                        hasDiscount: true
                      }
                      : { hasDiscount: false };

                    return (
                      <div
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        className="flex gap-4 p-4 border-2 border-gray-200 rounded-2xl"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1 line-clamp-2">{item.product.name}</p>
                          <p className="text-xs text-gray-600 mb-2">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{item.product.display_price}
                            </p>
                            {priceInfo.hasDiscount && (
                              <>
                                <p className="text-xs text-gray-500 line-through">
                                  ₹{priceInfo.mrp}
                                </p>
                                <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  -{priceInfo.discountPercent}%
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </p>
                            <p className="font-bold text-sm">
                              ₹{(item.product.display_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">Delivery Address</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-black hover:underline flex items-center gap-1"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-black">{formData.customer_name}</p>
                  <p>{formData.customer_phone}</p>
                  <p>
                    {formData.delivery_address}, {formData.city} - {formData.pincode}
                  </p>
                  {formData.landmark && <p>Landmark: {formData.landmark}</p>}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 p-5 border-2 border-gray-200 rounded-2xl">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {/* MRP Total */}
                  {calculateMRPTotals.hasMRPProducts && (
                    <div className="flex justify-between text-gray-500">
                      <span>Total MRP</span>
                      <span className="line-through">₹{calculateMRPTotals.totalMRP.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Product Discount */}
                  {calculateMRPTotals.hasMRPProducts && calculateMRPTotals.productSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Product Discount</span>
                      <span className="font-bold">
                        -₹{calculateMRPTotals.productSavings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black">₹{totals.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Coupon Discount */}
                  {appliedCoupon && appliedCoupon.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-2">
                        <FiTag className="w-4 h-4" />
                        Coupon ({appliedCoupon.coupon.code})
                      </span>
                      <span className="font-semibold">
                        -₹{appliedCoupon.discount_amount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-black">
                      {totals.codFee > 0 ? `₹${totals.codFee.toFixed(2)}` : (
                        <span className="text-green-600">FREE</span>
                      )}
                    </span>
                  </div>

                  {/* Total Savings Summary */}
                  {calculateMRPTotals.totalSavings > 0 && (
                    <>
                      <hr className="border-gray-300" />
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-green-700">Total Savings</span>
                          <span className="text-lg font-bold text-green-700">
                            ₹{calculateMRPTotals.totalSavings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-sm font-medium">Payment Method: Cash on Delivery</p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      onClick={handleTermsConditions}
                      className="text-black font-semibold hover:underline"
                    >
                      Terms & Conditions
                    </button>{' '}
                    and confirm that I will pay{' '}
                    <span className="font-bold">₹{getFinalTotal().toFixed(2)}</span> in cash upon delivery.
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !agreedToTerms}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions - Beta Version</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="font-semibold text-yellow-800">🧪 Beta Testing Notice</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is an MVP (Minimum Viable Product) app to validate the city marketplace concept for Amravati.
                    We appreciate your participation in this testing phase!
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-800">💳 Payment Terms</p>
                  <p className="text-sm text-gray-600 mt-1">
                    • Currently accepting <strong>Cash on Delivery (COD)</strong> only<br />
                    • Payment to be made to delivery personnel upon receipt<br />
                    • Please keep exact change ready
                  </p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="font-semibold text-red-800">🔄 Returns & Refunds Policy</p>
                  <p className="text-sm text-red-700 mt-1">
                    Due to the beta testing phase, we are currently <strong>unable to provide return or refund services</strong>.
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    However, we may consider <strong>product replacement</strong> on a case-by-case basis, subject to:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                    <li>Manufacturing defects or damage during delivery</li>
                    <li>Wrong product delivered</li>
                    <li>Request made within 24 hours of delivery</li>
                    <li>Product in original condition with tags intact</li>
                  </ul>
                  <p className="text-sm text-red-700 mt-2">
                    Please contact customer support for replacement requests.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-800">📝 General Terms</p>
                  <p className="text-sm text-gray-600 mt-1">
                    • All prices are in Indian Rupees (₹)<br />
                    • Prices are subject to change without notice<br />
                    • Product availability is subject to stock<br />
                    • Orders are subject to seller confirmation<br />
                    • We reserve the right to cancel orders in case of pricing errors
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold text-blue-800">📞 Contact Us</p>
                  <p className="text-sm text-blue-700 mt-1">
                    For any queries or concerns, please contact us at:<br />
                    <strong>awm27shop@gmail.com</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;