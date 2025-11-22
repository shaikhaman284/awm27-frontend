import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import apiService from '../services/api';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Write a Review</h1>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Product Info */}
            <div className="flex gap-4 mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                <span className="text-3xl flex items-center justify-center h-full">👕</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.shop_name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block font-semibold mb-3">
                  Rate this product <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <FiStar
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    You rated: {rating} {rating === 1 ? 'star' : 'stars'}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Tell others what you think about this product..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {reviewText.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
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