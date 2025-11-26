import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiStar, FiChevronRight, FiCheck } from 'react-icons/fi';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    loadProductDetail();
    loadReviews();
    loadRelatedProducts();
  }, [id]);

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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [];
  const averageRating = product.average_rating ? parseFloat(product.average_rating) : 0;
  const reviewCount = product.review_count || reviews.length;

  // Calculate discount percentage from backend data
  const discountPercent = 20;
  const originalPrice = Math.round(product.display_price / (1 - discountPercent / 100));

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
            <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-black transition">
              Shop
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <button onClick={() => navigate(`/shop/${product.shop_id}`)} className="text-gray-500 hover:text-black transition">
              {product.category_name || 'Category'}
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            <div className="flex flex-col gap-3 w-24">
              {images.length > 0 ? (
                images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`border-2 rounded-2xl overflow-hidden aspect-square transition ${selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))
              ) : (
                <div className="border-2 border-gray-200 rounded-2xl aspect-square flex items-center justify-center">
                  <span className="text-3xl">👕</span>
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-gray-100 rounded-3xl overflow-hidden">
              <div className="aspect-square">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-8xl">👕</span>
                  </div>
                )}
              </div>
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
                <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">₹{product.display_price}</span>
              <span className="text-2xl text-gray-400 line-through">₹{originalPrice}</span>
              <span className="text-sm font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                -{discountPercent}%
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description?.slice(0, 200) || 'No description available'}...
            </p>

            <hr className="border-gray-300 mb-6" />

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-600 mb-3">Select Colors</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition ${selectedColor === color ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-gray-300'
                        }`}
                      style={{
                        backgroundColor: color === 'olive' ? '#808000' :
                          color === 'green' ? '#008000' :
                            color === 'navy' ? '#000080' :
                              color.toLowerCase()
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <hr className="border-gray-300 mb-6" />

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-600 mb-3">Choose Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full font-medium transition ${selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-gray-300 mb-6" />

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-6">
              {/* Quantity */}
              {product.stock_quantity > 0 && (
                <div className="flex items-center bg-gray-100 rounded-full px-5 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Add to Cart */}
              {product.stock_quantity > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition py-4"
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 font-semibold rounded-full cursor-not-allowed py-4"
                >
                  Out of Stock
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
              className={`pb-4 px-2 font-medium transition relative ${activeTab === 'details' ? 'text-black' : 'text-gray-400'
                }`}
            >
              Product Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 font-medium transition relative ${activeTab === 'reviews' ? 'text-black' : 'text-gray-400'
                }`}
            >
              Rating & Reviews
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`pb-4 px-2 font-medium transition relative ${activeTab === 'faqs' ? 'text-black' : 'text-gray-400'
                }`}
            >
              FAQs
              {activeTab === 'faqs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">
                  All Reviews <span className="text-gray-400">({reviewCount})</span>
                </h3>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                    Latest
                  </button>
                  <button className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition">
                    Write a Review
                  </button>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-2xl p-6">
                      {/* Stars */}
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>

                      {/* Name & Verified */}
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-bold">{review.customer_name}</h4>
                        {review.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-xs text-white bg-green-500 px-2 py-0.5 rounded-full">
                            <FiCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Review Text */}
                      {review.review_text && (
                        <p className="text-gray-600 text-sm mb-3">{review.review_text}</p>
                      )}

                      {/* Date */}
                      <p className="text-xs text-gray-400">
                        Posted on {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}

              {reviews.length > 6 && (
                <div className="text-center mt-8">
                  <button className="px-12 py-3 border-2 border-gray-300 rounded-full font-medium hover:bg-gray-50 transition">
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="max-w-3xl">
              <p className="text-gray-600">Frequently asked questions will appear here.</p>
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