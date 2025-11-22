import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.product.id}`}
                  className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                >
                  {item.product.main_image ? (
                    <img
                      src={item.product.main_image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl">👕</span>
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                  >
                    {item.product.name}
                  </Link>

                  <p className="text-sm text-gray-600 mb-2">{item.product.shop_name}</p>

                  {/* Variants */}
                  <div className="flex gap-3 text-sm mb-3">
                    {item.size && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Size: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Color: {item.color}
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold">₹{item.product.display_price}</span>
                      <span className="text-sm text-gray-500"> × {item.quantity}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
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
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="mt-2 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{(item.product.display_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 p-2"
                  title="Remove from cart"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">COD Fee</span>
                  <span className="font-semibold">
                    {totals.codFee > 0 ? `₹${totals.codFee.toFixed(2)}` : 'FREE'}
                  </span>
                </div>

                {totals.codFee === 0 && totals.subtotal >= COD_FEE_THRESHOLD && (
                  <p className="text-xs text-green-600">
                    🎉 You've unlocked FREE COD!
                  </p>
                )}

                {totals.codFee > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(COD_FEE_THRESHOLD - totals.subtotal).toFixed(2)} more for FREE COD
                  </p>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-blue-600 hover:underline"
              >
                Continue Shopping
              </Link>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                <p className="font-semibold mb-2">📦 Delivery Information</p>
                <ul className="text-gray-700 space-y-1">
                  <li>• Cash on Delivery only</li>
                  <li>• Delivery within Amravati city</li>
                  <li>• 3-5 days estimated delivery</li>
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