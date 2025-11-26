import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiChevronRight, FiTag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COD_FEE_THRESHOLD } from '../utils/constants';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, updateQuantity, removeFromCart, calculateTotals } = useCart();
  const totals = calculateTotals();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  // Helper function to get the first image from product
  const getProductImage = (product) => {
    // Check if images array exists and has items
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback checks
    if (product.main_image) return product.main_image;
    if (product.image1) return product.image1;
    if (product.image) return product.image;
    return null;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FiShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="inline-block px-12 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

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
            <span className="text-black font-medium">Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">YOUR CART</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border-2 border-gray-200 rounded-3xl divide-y-2 divide-gray-200">
              {cart.map((item) => {
                const imageUrl = getProductImage(item.product);

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="p-4 md:p-6 flex gap-4"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.product.id}`}
                      className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 bg-gray-100 rounded-2xl overflow-hidden"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">👕</span>
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-2">
                        <Link
                          to={`/products/${item.product.id}`}
                          className="font-bold text-lg text-gray-900 hover:text-gray-600 transition line-clamp-2"
                        >
                          {item.product.name}
                        </Link>

                        {/* Remove Button - Desktop */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          className="hidden md:block flex-shrink-0 text-red-500 hover:text-red-700 transition"
                          title="Remove from cart"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{item.product.shop_name}</p>

                      {/* Variants */}
                      {(item.size || item.color) && (
                        <div className="flex gap-2 text-sm mb-3">
                          {item.size && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full font-medium capitalize">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-2xl font-bold">₹{item.product.display_price}</div>

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button - Mobile */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className="md:hidden mt-3 flex items-center gap-2 text-red-500 hover:text-red-700 transition text-sm font-medium"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border-2 border-gray-200 rounded-3xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">₹{totals.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Discount (-20%)</span>
                  <span className="font-bold text-red-500">-₹{(totals.subtotal * 0.2).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">
                    {totals.codFee > 0 ? `₹${totals.codFee.toFixed(2)}` : (
                      <span className="text-green-600">FREE</span>
                    )}
                  </span>
                </div>

                {totals.codFee === 0 && totals.subtotal >= COD_FEE_THRESHOLD && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-green-700 font-medium">
                      🎉 You've unlocked FREE Delivery!
                    </p>
                  </div>
                )}

                {totals.codFee > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs text-gray-600">
                      Add ₹{(COD_FEE_THRESHOLD - totals.subtotal).toFixed(2)} more for FREE delivery
                    </p>
                  </div>
                )}

                <hr className="border-gray-300" />

                <div className="flex justify-between text-xl">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add promo code"
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                  </div>
                  <button className="px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition">
                    Apply
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition mb-4 flex items-center justify-center gap-2"
              >
                Go to Checkout
                <FiArrowRight className="w-5 h-5" />
              </button>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <p className="font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="text-xl">📦</span>
                  Delivery Information
                </p>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Cash on Delivery available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Delivery within Amravati city</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>3-5 days estimated delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;