import React, { createContext, useState, useContext, useEffect } from 'react';
import { STORAGE_KEYS, COD_FEE_THRESHOLD, COD_FEE_AMOUNT } from '../utils/constants';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Add item to cart with variant support
  const addToCart = (product, quantity = 1, size = null, color = null, variantId = null) => {
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      item =>
        item.product.id === product.id &&
        item.size === size &&
        item.color === color
    );

    // Determine available stock (variant-specific or total)
    let availableStock = product.stock_quantity;

    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        availableStock = variant.stock_quantity;
      }
    }

    if (existingItemIndex > -1) {
      // Update quantity
      const newCart = [...cart];
      const newQuantity = newCart[existingItemIndex].quantity + quantity;

      // Check stock
      if (newQuantity > availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        return;
      }

      newCart[existingItemIndex].quantity = newQuantity;
      setCart(newCart);
      toast.success('Cart updated');
    } else {
      // Add new item
      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        return;
      }

      setCart([
        ...cart,
        {
          product,
          quantity,
          size,
          color,
          variantId, // NEW: Store variant ID
        },
      ]);
      toast.success('Added to cart');
    }
  };

  // Update item quantity with variant awareness
  const updateQuantity = (productId, size, color, newQuantity) => {
    const item = cart.find(
      item =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color
    );

    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    // Determine available stock
    let availableStock = item.product.stock_quantity;

    if (item.variantId && item.product.variants) {
      const variant = item.product.variants.find(v => v.id === item.variantId);
      if (variant) {
        availableStock = variant.stock_quantity;
      }
    }

    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    const newCart = cart.map(cartItem =>
      cartItem.product.id === productId &&
        cartItem.size === size &&
        cartItem.color === color
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCart(newCart);
  };

  // Remove item from cart
  const removeFromCart = (productId, size, color) => {
    const newCart = cart.filter(
      item => !(
        item.product.id === productId &&
        item.size === size &&
        item.color === color
      )
    );
    setCart(newCart);
    toast.success('Removed from cart');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (total, item) => total + (item.product.display_price * item.quantity),
      0
    );

    // COD Fee Logic: ₹50 if subtotal < ₹500, else ₹0
    const codFee = subtotal < COD_FEE_THRESHOLD ? COD_FEE_AMOUNT : 0;

    const total = subtotal + codFee;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      codFee: parseFloat(codFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    };
  };

  // Get item count
  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId, size, color) => {
    return cart.some(
      item =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color
    );
  };

  // NEW: Get cart items formatted for checkout
  const getCheckoutItems = () => {
    return cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    }));
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateTotals,
    getItemCount,
    isInCart,
    getCheckoutItems, // NEW
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;