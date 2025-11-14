import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  // Safely parse average_rating - handle string, number, or null
  const averageRating = product.average_rating
    ? parseFloat(product.average_rating)
    : 0;

  const reviewCount = product.review_count || 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes/colors, redirect to detail page
    if (product.sizes?.length > 0 || product.colors?.length > 0) {
      return;
    }

    addToCart(product, 1);
  };

  const hasVariants = product.sizes?.length > 0 || product.colors?.length > 0;
  const inCart = isInCart(product.id, null, null);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-lg shadow hover:shadow-xl transition duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">👕</span>
          </div>
        )}

        {/* Stock badge */}
        {product.stock_quantity === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Shop */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{product.category_name}</span>
          <span>{product.shop_name}</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {product.name}
        </h3>

        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₹{product.display_price}
            </span>
          </div>

          {/* Quick Add Button */}
          {product.stock_quantity > 0 && (
            <button
              onClick={handleQuickAdd}
              disabled={hasVariants}
              className={`p-2 rounded-full transition ${
                hasVariants
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : inCart
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={hasVariants ? 'View details to select options' : 'Add to cart'}
            >
              <FiShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Variants hint */}
        {hasVariants && (
          <p className="text-xs text-gray-500 mt-2">
            Multiple options available
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;