import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiPackage } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import ImageOptimizer from '../common/ImageOptimizer';

// PERFORMANCE: Memoize the entire component to prevent unnecessary re-renders
const ProductCard = React.memo(({ product }) => {
  const { addToCart, isInCart } = useCart();

  // PERFORMANCE: Memoize expensive calculations
  const averageRating = useMemo(
    () => (product.average_rating ? parseFloat(product.average_rating) : 4.5),
    [product.average_rating]
  );

  const reviewCount = useMemo(
    () => product.review_count || 0,
    [product.review_count]
  );

  const hasVariants = useMemo(
    () => product.variants && product.variants.length > 0,
    [product.variants]
  );

  const hasSizeColorOptions = useMemo(
    () => product.sizes?.length > 0 || product.colors?.length > 0,
    [product.sizes, product.colors]
  );

  const inCart = useMemo(
    () => isInCart(product.id, null, null),
    [isInCart, product.id]
  );

  // NEW: Real discount calculation from MRP
  const priceInfo = useMemo(() => {
    // Check if product has MRP and MRP is higher than display price
    if (product.mrp && product.mrp > product.display_price) {
      const discountPercent = Math.round(
        ((product.mrp - product.display_price) / product.mrp) * 100
      );
      return {
        discountPercent,
        mrp: product.mrp,
        hasDiscount: true
      };
    }
    // No discount to show
    return {
      discountPercent: 0,
      mrp: null,
      hasDiscount: false
    };
  }, [product.mrp, product.display_price]);

  // PERFORMANCE: Memoize stock info calculation (expensive operation)
  const stockInfo = useMemo(() => {
    if (!hasVariants) {
      return {
        totalStock: product.stock_quantity,
        hasLowStock: product.stock_quantity < 10 && product.stock_quantity > 0,
        isOutOfStock: product.stock_quantity === 0,
        outOfStockCount: 0,
        lowStockCount: 0,
      };
    }

    const activeVariants = product.variants.filter((v) => v.is_active);
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
    const outOfStockCount = activeVariants.filter((v) => v.stock_quantity === 0).length;
    const lowStockCount = activeVariants.filter(
      (v) => v.stock_quantity > 0 && v.stock_quantity < 10
    ).length;

    return {
      totalStock,
      hasLowStock: totalStock < 10 && totalStock > 0,
      isOutOfStock: totalStock === 0,
      outOfStockCount,
      lowStockCount,
      variantCount: activeVariants.length,
    };
  }, [hasVariants, product.stock_quantity, product.variants]);

  // Helper function to format price (remove .00)
  const formatPrice = useCallback((price) => {
    return Number(price) % 1 === 0 ? Math.floor(price) : price;
  }, []);

  // PERFORMANCE: Memoize event handler to prevent recreation on each render
  const handleQuickAdd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (product.sizes?.length > 0 || product.colors?.length > 0) {
        return;
      }

      addToCart(product, 1);
    },
    [product, addToCart]
  );

  // PERFORMANCE: Memoize color style calculation
  const getColorStyle = useCallback((color) => {
    const colorMap = {
      // Existing
      'olive': '#808000',
      'green': '#008000',
      'navy': '#000080',

      // New light/dark shades
      'light grey': '#D3D3D3',
      'dark grey': '#696969',
      'dark red': '#8B0000',
      'maroon': '#800000',
      'light pink': '#FFB6C1',
      'hot pink': '#FF69B4',
      'light blue': '#ADD8E6',
      'dark blue': '#00008B',
      'navy blue': '#000080',
      'sky blue': '#87CEEB',
      'turquoise': '#40E0D0',
      'light green': '#90EE90',
      'dark green': '#006400',
      'mint green': '#98FF98',
      'light yellow': '#FFFFE0',
      'dark orange': '#FF8C00',
      'peach': '#FFDAB9',
      'lavender': '#E6E6FA',
      'light brown': '#CD853F',
      'beige': '#F5F5DC',
      'cream': '#FFFDD0',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
    };
    return colorMap[color.toLowerCase()] || color.toLowerCase();
  }, []);

  return (
    <Link to={`/products/${product.id}`} className="group block">
      {/* Image Container */}
      <div className="relative bg-gray-100 rounded-3xl overflow-hidden mb-3 product-card-image">
        <div className="aspect-square">
          {product.main_image ? (
            <ImageOptimizer
              src={product.main_image}
              alt={product.name}
              width={400}
              height={400}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl" role="img" aria-label="clothing">
                👕
              </span>
            </div>
          )}
        </div>

        {/* Variant-aware stock badges - PERFORMANCE: Conditional rendering optimized */}
        {stockInfo.isOutOfStock ? (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Out of Stock
          </div>
        ) : hasVariants && stockInfo.outOfStockCount > 0 ? (
          <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {stockInfo.outOfStockCount} variant{stockInfo.outOfStockCount > 1 ? 's' : ''}{' '}
            unavailable
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
            <FiPackage className="w-3.5 h-3.5" aria-hidden="true" />
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

        {/* Rating - PERFORMANCE: Optimized star rendering */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center" role="img" aria-label={`Rating: ${averageRating} out of 5`}>
            {[...Array(5)].map((_, index) => (
              <FiStar
                key={index}
                className={`w-4 h-4 ${index < Math.floor(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
                  }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {averageRating.toFixed(1)}/5
          </span>
        </div>

        {/* Price Section - UPDATED with real MRP discount */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl md:text-2xl font-bold text-gray-900">
            ₹{formatPrice(product.display_price)}
          </span>
          {priceInfo.hasDiscount && (
            <>
              <span className="text-lg md:text-xl font-bold text-gray-500 line-through">
                ₹{formatPrice(priceInfo.mrp)}
              </span>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                -{priceInfo.discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Additional Info - PERFORMANCE: Conditional rendering optimized */}
        {hasVariants ? (
          <div className="mt-2 space-y-1">
            {product.sizes?.length > 0 && (
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Sizes:</span>{' '}
                {product.sizes.slice(0, 3).join(', ')}
                {product.sizes.length > 3 && ` +${product.sizes.length - 3} more`}
              </p>
            )}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-700 font-semibold">Colors:</span>
                <div className="flex gap-1 flex-wrap">
                  {product.colors.slice(0, 4).map((color, idx) => {
                    // Special case: Printed/Textured
                    if (color === 'Printed/Textured') {
                      return (
                        <span
                          key={`${color}-${idx}`}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold"
                          title={color}
                        >
                          🎨
                        </span>
                      );
                    }

                    // Regular color circle
                    return (
                      <div
                        key={`${color}-${idx}`}
                        className="w-4 h-4 rounded-full border-2 border-gray-400 shadow-sm"
                        style={{
                          backgroundColor: getColorStyle(color),
                        }}
                        title={color}
                        aria-label={color}
                      />
                    );
                  })}
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
}, (prevProps, nextProps) => {
  // PERFORMANCE: Custom comparison function for React.memo
  // Only re-render if product data actually changes
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.stock_quantity === nextProps.product.stock_quantity &&
    prevProps.product.display_price === nextProps.product.display_price &&
    prevProps.product.mrp === nextProps.product.mrp &&
    prevProps.product.main_image === nextProps.product.main_image
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;