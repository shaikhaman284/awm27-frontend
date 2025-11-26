import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const averageRating = product.average_rating
    ? parseFloat(product.average_rating)
    : 4.5; // Default rating for display

  const reviewCount = product.review_count || 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.sizes?.length > 0 || product.colors?.length > 0) {
      return;
    }

    addToCart(product, 1);
  };

  const hasVariants = product.sizes?.length > 0 || product.colors?.length > 0;
  const inCart = isInCart(product.id, null, null);

  // Calculate discount percentage
  const discountPercent = 20; // You can make this dynamic based on your backend
  const fakeOriginalPrice = Math.round(product.display_price / (1 - discountPercent / 100));

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 rounded-3xl overflow-hidden mb-3">
        <div className="aspect-square">
          {product.main_image ? (
            <img
              src={product.main_image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl">👕</span>
            </div>
          )}
        </div>

        {/* Stock badge - top right */}
        {product.stock_quantity === 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Out of Stock
          </div>
        )}

        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Low Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {/* Product Name */}
        <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-600 transition">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <FiStar
                key={index}
                className={`w-4 h-4 ${index < Math.floor(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {averageRating.toFixed(1)}/5
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl md:text-2xl font-bold text-gray-900">
            ₹{product.display_price}
          </span>

          {discountPercent > 0 && (
            <>
              <span className="text-lg md:text-xl font-bold text-gray-400 line-through">
                ₹{fakeOriginalPrice}
              </span>
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Additional Info */}
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