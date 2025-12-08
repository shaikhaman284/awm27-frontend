import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';
import { setErrorContext, generateErrorId } from '../utils/errorUtils';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// PERFORMANCE: In-memory cache for frequently accessed data
const cache = new Map();
const pendingRequests = new Map(); // Request deduplication

// Cache configuration
const CACHE_TTL = {
  categories: 5 * 60 * 1000, // 5 minutes
  shops: 2 * 60 * 1000, // 2 minutes
  products: 1 * 60 * 1000, // 1 minute
  default: 30 * 1000, // 30 seconds
};

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > cached.ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
const setCachedData = (key, data, ttl) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Create a cacheable request wrapper
 * @param {Function} requestFn - Axios request function
 * @param {string} cacheKey - Cache key
 * @param {number} ttl - Cache TTL
 */
const cacheableRequest = async (requestFn, cacheKey, ttl) => {
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return { data: cachedData };
  }

  // Check if request is already pending (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Make request
  const requestPromise = requestFn()
    .then((response) => {
      // Cache the response
      setCachedData(cacheKey, response.data, ttl);
      pendingRequests.delete(cacheKey);
      return response;
    })
    .catch((error) => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
};


// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle specific error statuses
      if (status === 401) {
        // Unauthorized - clear token and redirect to unauthorized page
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        toast.error('Session expired. Please login again.');

        // Small delay to allow toast to show
        setTimeout(() => {
          window.location.href = '/unauthorized';
        }, 500);
      } else if (status === 403) {
        // Forbidden - redirect to unauthorized page
        const errorId = generateErrorId();
        setErrorContext({
          errorId,
          message: data.error || 'Access forbidden',
          statusCode: 403,
        });
        toast.error(data.error || 'Access forbidden');

        setTimeout(() => {
          window.location.href = '/unauthorized';
        }, 500);
      } else if (status === 404) {
        // Not Found - show toast only (page-level handling)
        toast.error(data.error || 'Resource not found');
      } else if (status >= 500) {
        // Server Error - redirect to server error page
        const errorId = generateErrorId();
        setErrorContext({
          errorId,
          message: data.error || 'Server error. Please try again later.',
          statusCode: status,
        });
        toast.error('Server error. Please try again later.');

        setTimeout(() => {
          window.location.href = '/error/server';
        }, 500);
      } else {
        // Other errors - show toast
        toast.error(data.error || 'Something went wrong');
      }
    } else if (error.request) {
      // Network error - redirect to network error page
      const errorId = generateErrorId();
      setErrorContext({
        errorId,
        message: 'Network error. Please check your connection.',
        type: 'network',
      });
      toast.error('Network error. Please check your connection.');

      setTimeout(() => {
        window.location.href = '/error/network';
      }, 500);
    }


    return Promise.reject(error);
  }
);


// API Methods
const apiService = {
  // Generic methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),


  // Auth
  testRegister: (data) => api.post('/auth/test-register/', data),
  getCurrentUser: () => api.get('/auth/me/'),
  logout: () => api.post('/auth/logout/'),


  // Categories (with caching)
  getCategories: () => cacheableRequest(
    () => api.get('/shops/categories/'),
    'categories',
    CACHE_TTL.categories
  ),


  // Shops (with caching)
  getApprovedShops: (city) => cacheableRequest(
    () => api.get('/shops/approved/', { params: { city } }),
    `shops_${city}`,
    CACHE_TTL.shops
  ),
  getShopDetail: (shopId) => api.get(`/shops/${shopId}/`),
  getPromotedShops: () => cacheableRequest(
    () => api.get('/shops/promoted/'),
    'promoted_shops',
    CACHE_TTL.shops
  ),


  // Products
  getProducts: (params) => api.get('/products/', { params }),
  getProductDetail: (productId) => api.get(`/products/${productId}/`),


  // Orders
  createOrder: (data) => api.post('/orders/create/', data),
  getMyOrders: (status) => api.get('/orders/my-orders/', { params: { status } }),
  getOrderDetail: (orderNumber) => api.get(`/orders/${orderNumber}/`),
  cancelOrder: (orderNumber) => api.patch(`/orders/${orderNumber}/cancel/`, { order_status: 'cancelled' }),


  // Reviews
  createReview: (data) => api.post('/reviews/create/', data),
  getProductReviews: (productId, sort) =>
    api.get(`/reviews/product/${productId}/`, { params: { sort } }),


  // Coupons
  validateCoupon: (data) => api.post('/coupons/validate/', data),


  // Platform Stats
  getPlatformStats: () => api.get('/shops/stats/'),


  // Newsletter
  subscribeNewsletter: (email) => api.post('/shops/newsletter/subscribe/', { email }),
};


export default apiService;