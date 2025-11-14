import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, calculateTotals, clearCart } = useCart();
  const totals = calculateTotals();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone?.replace('+91', '') || '',
    delivery_address: '',
    city: 'Amravati',
    pincode: '',
    landmark: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
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
        ...formData
      };

      const response = await apiService.createOrder(orderData);

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/order-success/${response.data.order.order_number}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step > s ? <FiCheck /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-20 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-sm">
            <span>Address</span>
            <span>Payment</span>
            <span>Review</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step 1: Delivery Address */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="House no., Building name, Street"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="444601"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Near temple"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              {/* Address Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{formData.customer_name}</p>
                    <p className="text-sm text-gray-600">{formData.customer_phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.delivery_address}, {formData.city} - {formData.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3 mb-6">
                <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">
                        Pay when you receive your order
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {totals.codFee > 0 ? `COD Fee: ₹${totals.codFee}` : 'FREE COD'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 opacity-60">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-semibold text-gray-500">Online Payment</p>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-3 p-3 border rounded"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                        {item.product.main_image && (
                          <img
                            src={item.product.main_image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-sm">
                          ₹{item.product.display_price} × {item.quantity}
                        </p>
                      </div>
                      <div className="font-semibold">
                        ₹{(item.product.display_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p>{formData.customer_name}</p>
                <p className="text-sm text-gray-600">{formData.customer_phone}</p>
                <p className="text-sm text-gray-600">
                  {formData.delivery_address}, {formData.city} - {formData.pincode}
                </p>
                {formData.landmark && (
                  <p className="text-sm text-gray-600">Landmark: {formData.landmark}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 p-4 border rounded">
                <div className="flex justify-between mb-2">
                  <span>Items Total</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>COD Fee</span>
                  <span>{totals.codFee > 0 ? `₹${totals.codFee}` : 'FREE'}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Payment Method: Cash on Delivery</p>
              </div>

              {/* Terms */}
              <div className="mb-6">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I agree to the Terms & Conditions and understand that I need to pay ₹
                    {totals.total.toFixed(2)} in cash when I receive the order.
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !agreedToTerms}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;