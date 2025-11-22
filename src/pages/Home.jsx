import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiTruck, FiShield } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    loadHomeData();

    // Show welcome popup for first visit
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('has_visited', 'true');
    }
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesRes = await apiService.getCategories();
      setCategories(categoriesRes.data.slice(0, 6)); // First 6 categories

      // Load shops
      const shopsRes = await apiService.getApprovedShops('Amravati');
      setShops(shopsRes.data.slice(0, 4)); // First 4 shops

      // Load featured products
      const productsRes = await apiService.getProducts({
        page_size: 8,
        sort: 'newest'
      });
      setFeaturedProducts(productsRes.data.results || []);

    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value;
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to Beta Testing! 🎉</h2>
            <p className="text-gray-600 mb-4">
              You're testing Amravati's first local cloth marketplace platform.
              Shop from your favorite local stores with home delivery.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>✓ Cash on Delivery available</li>
              <li>✓ Free COD on orders ≥ ₹500</li>
              <li>✓ Support local businesses</li>
            </ul>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop Your Favorite Local Clothes Online
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover quality clothing from trusted Amravati stores
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search for shirts, jeans, sarees..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100"
              >
                Search
              </button>
            </form>

            <Link
              to="/products"
              className="inline-block mt-6 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FiShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Stores</h3>
              <p className="text-gray-600">Shop from trusted local cloth stores in Amravati</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FiTruck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Home Delivery</h3>
              <p className="text-gray-600">Get your orders delivered right to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <FiShield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cash on Delivery</h3>
              <p className="text-gray-600">Pay when you receive (Free COD on orders ≥ ₹500)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl">👕</span>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Shops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  {shop.shop_image ? (
                    <img
                      src={shop.shop_image}
                      alt={shop.shop_name}
                      className="w-full h-32 object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{shop.shop_name}</h3>
                    <p className="text-sm text-gray-600">{shop.city}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      {shop.product_count} Products
                    </p>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest Products</h2>
              <Link to="/products" className="text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default Home;