import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiPackage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const averageRating = product.average_rating
    ? parseFloat(product.average_rating)
    : 4.5;

  const reviewCount = product.review_count || 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.sizes?.length > 0 || product.colors?.length > 0) {
      return;
    }

    addToCart(product, 1);
  };

  const hasVariants = product.variants && product.variants.length > 0;
  const hasSizeColorOptions = product.sizes?.length > 0 || product.colors?.length > 0;
  const inCart = isInCart(product.id, null, null);

  // Calculate discount percentage
  const discountPercent = 20;
  const fakeOriginalPrice = Math.round(product.display_price / (1 - discountPercent / 100));

  // Get variant stock info
  const getVariantStockInfo = () => {
    if (!hasVariants) {
      return {
        totalStock: product.stock_quantity,
        hasLowStock: product.stock_quantity < 10 && product.stock_quantity > 0,
        isOutOfStock: product.stock_quantity === 0,
        outOfStockCount: 0,
        lowStockCount: 0,
      };
    }

    const activeVariants = product.variants.filter(v => v.is_active);
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
    const outOfStockCount = activeVariants.filter(v => v.stock_quantity === 0).length;
    const lowStockCount = activeVariants.filter(v => v.stock_quantity > 0 && v.stock_quantity < 10).length;

    return {
      totalStock,
      hasLowStock: totalStock < 10 && totalStock > 0,
      isOutOfStock: totalStock === 0,
      outOfStockCount,
      lowStockCount,
      variantCount: activeVariants.length,
    };
  };

  const stockInfo = getVariantStockInfo();

  return (
    <Link to={`/products/${product.id}`} className="group block">
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

        {/* Variant-aware stock badges */}
        {stockInfo.isOutOfStock ? (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Out of Stock
          </div>
        ) : hasVariants && stockInfo.outOfStockCount > 0 ? (
          <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {stockInfo.outOfStockCount} variant{stockInfo.outOfStockCount > 1 ? 's' : ''} unavailable
          </div>
        ) : hasVariants && stockInfo.lowStockCount > 0 ? (
          <div className="absolute top-3 right-3 bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {stockInfo.lowStockCount} variant{stockInfo.lowStockCount > 1 ? 's' : ''} low
          </div>
        ) : stockInfo.hasLowStock ? (
          <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Low Stock
          </div>
        ) : null}

        {/* Variant count badge */}
        {hasVariants && (
          <div className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <FiPackage className="w-3.5 h-3.5" />
            {stockInfo.variantCount} variant{stockInfo.variantCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {/* Product Name */}
        <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition">
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
          <span className="text-sm font-semibold text-gray-900">
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
              <span className="text-lg md:text-xl font-bold text-gray-500 line-through">
                ₹{fakeOriginalPrice}
              </span>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Additional Info */}
        {hasVariants ? (
          <div className="mt-2 space-y-1">
            {product.sizes?.length > 0 && (
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Sizes:</span> {product.sizes.slice(0, 3).join(', ')}
                {product.sizes.length > 3 && ` +${product.sizes.length - 3} more`}
              </p>
            )}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-700 font-semibold">Colors:</span>
                <div className="flex gap-1">
                  {product.colors.slice(0, 4).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                      style={{
                        backgroundColor:
                          color === 'olive'
                            ? '#808000'
                            : color === 'green'
                              ? '#008000'
                              : color === 'navy'
                                ? '#000080'
                                : color.toLowerCase(),
                      }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-gray-700 font-medium">
                      +{product.colors.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
            {!stockInfo.isOutOfStock && (
              <p className="text-xs text-green-700 font-semibold">
                {stockInfo.totalStock} total in stock
              </p>
            )}
          </div>
        ) : hasSizeColorOptions ? (
          <p className="text-xs text-gray-700 font-medium mt-2">
            Multiple options available
          </p>
        ) : null}
      </div>
    </Link>
  );
};

export default ProductCard;
