import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiMapPin } from 'react-icons/fi';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadProductDetail();
    loadReviews();
  }, [id]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductDetail(id);
      setProduct(response.data);

      // Auto-select first size and color if available
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
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
      setReviews(response.data.reviews.slice(0, 3)); // Top 3
    } catch (error) {
      console.error('Failed to load reviews');
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
    if (quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`);
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [];
  const hasVariants = product.sizes?.length > 0 || product.colors?.length > 0;

  // Safely parse average_rating
  const averageRating = product.average_rating
    ? parseFloat(product.average_rating)
    : 0;
  const reviewCount = product.review_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">👕</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`border-2 rounded-lg overflow-hidden aspect-square ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Shop */}
              <Link
                to={`/shop/${product.shop_id}`}
                className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
              >
                <FiMapPin className="w-4 h-4" />
                {product.shop_name}
              </Link>

              {/* Rating */}
              {averageRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(averageRating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({reviewCount} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹{product.display_price}</span>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              {product.stock_quantity > 0 ? (
                <p className="text-green-600 font-medium mb-6">
                  ✓ In Stock ({product.stock_quantity} available)
                </p>
              ) : (
                <p className="text-red-600 font-medium mb-6">✗ Out of Stock</p>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Select Size <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium ${selectedSize === size
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Select Color <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium ${selectedColor === color
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock_quantity > 0 && (
                <div className="mb-6">
                  <label className="block font-semibold mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              {product.stock_quantity > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg"
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
              )}

              {/* Mobile Sticky Add to Cart */}
              {product.stock_quantity > 0 && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-40">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg"
                  >
                    <FiShoppingCart />
                    Add to Cart - ₹{product.display_price}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{review.customer_name}</span>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.review_text && <p className="text-gray-700">{review.review_text}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
              {reviews.length >= 3 && (
                <p className="text-sm text-gray-500 mt-4">
                  Showing top {reviews.length} reviews
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;