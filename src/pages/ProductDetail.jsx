import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiChevronRight, FiCheck, FiAlertCircle } from 'react-icons/fi';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');

  // Variant state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableStock, setAvailableStock] = useState(0);

  // PERFORMANCE FIX: Memoize complex calculations
  const images = useMemo(() => product?.images || [], [product?.images]);
  const hasVariants = useMemo(() => product?.variants && product.variants.length > 0, [product?.variants]);
  const averageRating = useMemo(() => product?.average_rating ? parseFloat(product.average_rating) : 0, [product?.average_rating]);
  const reviewCount = useMemo(() => product?.review_count || reviews.length, [product?.review_count, reviews.length]);

  // NEW: Real discount calculation from MRP
  const priceInfo = useMemo(() => {
    if (!product) return { hasDiscount: false, discountPercent: 0, mrp: null };

    if (product.mrp && product.mrp > product.display_price) {
      const discountPercent = Math.round(
        ((product.mrp - product.display_price) / product.mrp) * 100
      );
      return {
        hasDiscount: true,
        discountPercent,
        mrp: product.mrp
      };
    }

    return { hasDiscount: false, discountPercent: 0, mrp: null };
  }, [product?.mrp, product?.display_price]);

  // Helper function to format price (remove .00)
  const formatPrice = (price) => {
    return Number(price) % 1 === 0 ? Math.floor(price) : price;
  };

  // Helper function to get color CSS value
  const getColorStyle = (color) => {
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
  };
  // Generate dynamic product schema with variants
  // Generate dynamic product schema with variants
  const getProductSchema = () => {
    if (!product) return {};

    // Determine availability
    let availability = "https://schema.org/OutOfStock";
    if (hasVariants) {
      const hasStock = product.variants.some(v => v.stock_quantity > 0);
      availability = hasStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
    } else {
      availability = product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    }

    // CRITICAL FIX: Build proper image array with absolute URLs
    const productImages = [];

    // First, add all product images if available
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        if (img) {
          // Ensure absolute URL
          const imageUrl = img.startsWith('http') ? img : `https://awm27.shop${img}`;
          productImages.push(imageUrl);
        }
      });
    }

    // If no images array but main_image exists, use it
    if (productImages.length === 0 && product.main_image) {
      const mainImageUrl = product.main_image.startsWith('http')
        ? product.main_image
        : `https://awm27.shop${product.main_image}`;
      productImages.push(mainImageUrl);
    }

    // Fallback: If still no images, use a default placeholder
    if (productImages.length === 0) {
      productImages.push("https://awm27.shop/logo512.png");
    }

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://awm27.shop/products/${product.id}`,
      "name": product.name,
      "description": product.description || `${product.name} available at ${product.shop_name} in Amravati`,
      "image": productImages,
      "sku": product.id.toString(),
      "gtin": product.gtin || `AWM${product.id.toString().padStart(12, '0')}`,
      "mpn": product.mpn || `AWM-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": product.shop_name || "Amravati Wears Market"
      },
      "category": product.category_name,
      "offers": {
        "@type": "Offer",
        "url": `https://awm27.shop/products/${product.id}`,
        "priceCurrency": "INR",
        "price": product.display_price.toString(),
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "availability": availability,
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": product.shop_name || "Amravati Wears Market"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "INR"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "IN",
            "addressRegion": "Maharashtra"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "businessDays": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            "cutoffTime": "18:00:00",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 2,
              "maxValue": 5,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 7,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      }
    };

    // Add aggregate rating if reviews exist
    if (averageRating > 0 && reviewCount > 0) {
      baseSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    // Add reviews if they exist
    if (reviews.length > 0) {
      baseSchema.review = reviews.slice(0, 5).map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.customer_name
        },
        "datePublished": review.created_at,
        "reviewBody": review.review_text || "",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        }
      }));
    }

    // Add variant information
    if (product.sizes && product.sizes.length > 0) {
      baseSchema.size = product.sizes;
    }
    if (product.colors && product.colors.length > 0) {
      baseSchema.color = product.colors;
    }

    // Add breadcrumb
    baseSchema.breadcrumb = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://awm27.shop"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop",
          "item": "https://awm27.shop/products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.category_name || "Products",
          "item": `https://awm27.shop/products?category=${product.category_id || ''}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": product.name,
          "item": `https://awm27.shop/products/${product.id}`
        }
      ]
    };

    return baseSchema;
  };

  useEffect(() => {
    loadProductDetail();
    loadReviews();
    loadRelatedProducts();
  }, [id]);

  useEffect(() => {
    if (product) {
      updateAvailableStock();
    }
  }, [selectedSize, selectedColor, product]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductDetail(id);
      setProduct(response.data);

      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }

      setAvailableStock(response.data.stock_quantity);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await apiService.getProductReviews(id, 'newest');
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const response = await apiService.getProducts({ page_size: 4 });
      setRelatedProducts(response.data.results || []);
    } catch (error) {
      console.error('Failed to load related products');
    }
  };

  const updateAvailableStock = () => {
    if (!product) return;

    if (product.variants && product.variants.length > 0) {
      // Determine what attributes this product has
      const hasColors = product.colors && product.colors.length > 0;
      const hasSizes = product.sizes && product.sizes.length > 0;

      let variant;

      if (hasSizes && hasColors) {
        // Product has both size and color - match both
        variant = product.variants.find(
          v => v.size === selectedSize && v.color === selectedColor
        );
      } else if (hasSizes && !hasColors) {
        // Product has only sizes - match size and color should be null
        variant = product.variants.find(
          v => v.size === selectedSize && v.color === null
        );
      } else if (!hasSizes && hasColors) {
        // Product has only colors - match color and size should be null
        variant = product.variants.find(
          v => v.color === selectedColor && v.size === null
        );
      }

      if (variant) {
        setSelectedVariant(variant);
        setAvailableStock(variant.stock_quantity);
      } else {
        setSelectedVariant(null);
        setAvailableStock(0);
      }
    } else {
      setSelectedVariant(null);
      setAvailableStock(product.stock_quantity);
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (product.variants && product.variants.length > 0) {
      if (!selectedVariant) {
        toast.error('This variant is not available');
        return;
      }
      if (selectedVariant.stock_quantity === 0) {
        toast.error('This variant is out of stock');
        return;
      }
      if (quantity > selectedVariant.stock_quantity) {
        toast.error(`Only ${selectedVariant.stock_quantity} items available for this variant`);
        return;
      }
    } else {
      if (quantity > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} items available`);
        return;
      }
    }

    addToCart(
      product,
      quantity,
      selectedSize || null,
      selectedColor || null,
      selectedVariant ? selectedVariant.id : null
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!product) return null;

  const isVariantAvailable = hasVariants ? selectedVariant !== null : availableStock > 0;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${product.name} - ${product.shop_name} | Amravati Wears Market`}
        description={`Buy ${product.name} online from ${product.shop_name} in Amravati. ₹${product.display_price}. ${product.sizes?.length > 0 ? `Available in sizes: ${product.sizes.join(', ')}. ` : ''}${product.colors?.length > 0 ? `Colors: ${product.colors.join(', ')}. ` : ''}${averageRating > 0 ? `Rated ${averageRating}/5 (${reviewCount} reviews). ` : ''}Cash on Delivery available. Free COD on orders ≥ ₹500.`}
        keywords={`${product.name}, ${product.category_name}, ${product.shop_name}, buy online Amravati, ${product.sizes?.join(', ')}, ${product.colors?.join(', ')}, COD available`}
        url={`https://awm27.shop/products/${product.id}`}
        image={images[0] || "https://awm27.shop/default-product-image.jpg"}
        type="product"
        structuredData={getProductSchema()}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-black font-medium transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-500" />
            <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-black font-medium transition">
              Shop
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-500" />
            <button onClick={() => navigate(`/shop/${product.shop_id}`)} className="text-gray-600 hover:text-black font-medium transition">
              {product.category_name || 'Category'}
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-black font-semibold line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: Image Gallery - PERFORMANCE FIX: Added lazy loading */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            <div className="flex flex-col gap-3 w-24">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`border-2 rounded-2xl overflow-hidden aspect-square transition ${selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))
              ) : (
                <div className="border-2 border-gray-200 rounded-2xl aspect-square flex items-center justify-center">
                  <span className="text-3xl">👕</span>
                </div>
              )}
            </div>

            {/* Main Image - PERFORMANCE FIX: Added lazy loading except first image */}
            <div className="flex-1 bg-gray-50 rounded-3xl overflow-hidden aspect-square">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  loading={selectedImage === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  👕
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{averageRating.toFixed(1)}/5</span>
              </div>
            )}

            {/* Price Section - UPDATED with real MRP discount */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{formatPrice(product.display_price)}</span>
              {priceInfo.hasDiscount && (
                <>
                  <span className="text-2xl text-gray-500 font-bold line-through">
                    ₹{formatPrice(priceInfo.mrp)}
                  </span>
                  <span className="text-sm font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                    -{priceInfo.discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed font-medium">
              {product.description?.slice(0, 200) || 'No description available'}...
            </p>

            <hr className="border-gray-300 mb-6" />

            {/* Color Selector */}
            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-700 font-semibold">
                    Select Colors
                    {selectedColor && <span className="font-bold text-black ml-2">({selectedColor})</span>}
                  </label>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => {
                    let isColorAvailable = true;
                    if (hasVariants) {
                      // Check if product has sizes
                      const hasSizes = product.sizes && product.sizes.length > 0;
                      if (hasSizes && selectedSize) {
                        // Product has both sizes and colors - match both
                        isColorAvailable = product.variants.some(
                          v => v.color === color && v.size === selectedSize && v.stock_quantity > 0
                        );
                      } else if (!hasSizes) {
                        // Product has only colors - match color with null size
                        isColorAvailable = product.variants.some(
                          v => v.color === color && v.size === null && v.stock_quantity > 0
                        );
                      }
                    }

                    // Special case: Printed/Textured
                    if (color === 'Printed/Textured') {
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          disabled={!isColorAvailable}
                          className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition ${selectedColor === color
                            ? 'border-black bg-black text-white'
                            : isColorAvailable
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          🎨 Printed
                        </button>
                      );
                    }

                    // Regular color circle
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        disabled={!isColorAvailable}
                        className={`w-10 h-10 rounded-full border-2 transition relative ${selectedColor === color
                          ? 'border-black ring-2 ring-offset-2 ring-black'
                          : isColorAvailable
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 opacity-40 cursor-not-allowed'
                          }`}
                        style={{
                          backgroundColor: getColorStyle(color),
                        }}
                        title={color}
                      >
                        {!isColorAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <hr className="border-gray-300 mb-6" />

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Choose Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => {
                    let isSizeAvailable = true;
                    if (hasVariants) {
                      // Check if product has colors
                      const hasColors = product.colors && product.colors.length > 0;
                      if (hasColors && selectedColor) {
                        // Product has both sizes and colors - match both
                        isSizeAvailable = product.variants.some(
                          v => v.size === size && v.color === selectedColor && v.stock_quantity > 0
                        );
                      } else if (!hasColors) {
                        // Product has only sizes - match size with null color
                        isSizeAvailable = product.variants.some(
                          v => v.size === size && v.color === null && v.stock_quantity > 0
                        );
                      }
                    }

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isSizeAvailable}
                        className={`px-6 py-3 rounded-full font-bold transition relative ${selectedSize === size
                          ? 'bg-black text-white'
                          : isSizeAvailable
                            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {size}
                        {!isSizeAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-500"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <hr className="border-gray-300 mb-6" />

            {/* Stock Availability */}
            {(selectedSize || selectedColor || hasVariants) && (
              <div className="mb-6">
                {isVariantAvailable ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <FiCheck className="w-5 h-5" />
                    <span className="font-bold">
                      {availableStock > 10
                        ? 'In Stock'
                        : `Only ${availableStock} left in stock`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <FiAlertCircle className="w-5 h-5" />
                    <span className="font-bold">
                      {hasVariants
                        ? 'This combination is out of stock'
                        : 'Out of Stock'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-6">
              {isVariantAvailable && availableStock > 0 && (
                <div className="flex items-center bg-gray-100 rounded-full px-5 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isVariantAvailable && availableStock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition py-4"
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-400 text-white font-bold rounded-full cursor-not-allowed py-4"
                >
                  {hasVariants ? 'Variant Out of Stock' : 'Out of Stock'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-2 font-bold transition relative ${activeTab === 'details' ? 'text-black' : 'text-gray-600'
                }`}
            >
              Product Details
              {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 font-bold transition relative ${activeTab === 'reviews' ? 'text-black' : 'text-gray-600'
                }`}
            >
              Rating & Reviews
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`pb-4 px-2 font-bold transition relative ${activeTab === 'faqs' ? 'text-black' : 'text-gray-600'
                }`}
            >
              FAQs
              {activeTab === 'faqs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">
                  All Reviews <span className="text-gray-600">({reviewCount})</span>
                </h2>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-gray-100 rounded-full text-sm font-bold hover:bg-gray-200 transition">
                    Latest
                  </button>
                  <button className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition">
                    Write a Review
                  </button>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-2xl p-6">
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-gray-900">{review.customer_name}</h3>
                        {review.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-xs text-white bg-green-600 font-bold px-2 py-0.5 rounded-full">
                            <FiCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {review.review_text && <p className="text-gray-700 text-sm font-medium mb-3">{review.review_text}</p>}

                      <p className="text-xs text-gray-600 font-medium">
                        Posted on{' '}
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-600 font-medium">No reviews yet. Be the first to review!</p>
                </div>
              )}

              {reviews.length > 6 && (
                <div className="text-center mt-8">
                  <button className="px-12 py-3 border-2 border-gray-300 rounded-full font-bold hover:bg-gray-50 transition">
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="max-w-3xl">
              <p className="text-gray-700 font-medium">Frequently asked questions will appear here.</p>
            </div>
          )}
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;