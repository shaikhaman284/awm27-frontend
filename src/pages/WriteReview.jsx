import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiStar, FiChevronRight } from 'react-icons/fi';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';


const WriteReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, orderId } = location.state || {};

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!product || !orderId) {
    toast.error('Missing order or product information');
    navigate('/orders');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const productId = product.id || product.product_id || product.product;

    if (!productId) {
      toast.error('Product ID is missing. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        product: productId,
        order: orderId,
        rating,
        review_text: reviewText.trim() || ''
      };

      await apiService.createReview(reviewData);

      toast.success('Review submitted successfully!');
      navigate('/orders');
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData.error) {
          toast.error(errorData.error);
        } else if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(', ');
          toast.error(errorMessages || 'Failed to submit review');
        } else {
          toast.error('Failed to submit review');
        }
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`Write Review - ${product.name} | Amravati Wears Market`}
        description={`Share your experience with ${product.name} from ${product.shop_name}. Help other shoppers make informed decisions.`}
        url="https://awm27.shop/write-review"
        noindex={true}
      />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <button onClick={() => navigate('/orders')} className="text-gray-500 hover:text-black transition">
              My Orders
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">Write Review</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">WRITE A REVIEW</h1>

          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8">
            {/* Product Info */}
            <div className="flex gap-4 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center">
                <span className="text-4xl">👕</span>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.shop_name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Star Rating */}
              <div className="mb-8">
                <label className="block font-bold text-lg mb-4">
                  Rate this product <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-all hover:scale-110"
                    >
                      <FiStar
                        className={`w-12 h-12 transition-colors ${star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    You rated: {rating}/5 {rating === 1 ? 'star' : 'stars'}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-8">
                <label className="block font-bold text-lg mb-3">
                  Share Your Experience (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  rows={6}
                  placeholder="Tell others what you think about this product. What did you like or dislike?"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none transition"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Help others make informed decisions
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {reviewText.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Note:</span> Your review will be visible to all shoppers and will help others make informed purchase decisions.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;