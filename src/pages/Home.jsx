import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiTruck, FiShield, FiStar } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalVisitors: 0
  });

  useEffect(() => {
    loadHomeData();

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
      const mainCategories = categoriesRes.data.filter(cat =>
        !cat.parent && !cat.parent_id
      );
      setCategories(mainCategories);

      // Load shops
      const shopsRes = await apiService.getApprovedShops('Amravati');
      setShops(shopsRes.data.slice(0, 4));

      // Load featured products
      const productsRes = await apiService.getProducts({
        page_size: 8,
        sort: 'newest'
      });
      setFeaturedProducts(productsRes.data.results || []);

      // Try to load real platform stats from backend
      try {
        const statsRes = await apiService.getPlatformStats();
        setStats({
          totalShops: statsRes.data.total_shops || 0,
          totalProducts: statsRes.data.total_products || 0,
          totalOrders: statsRes.data.total_customers || 0,
          totalVisitors: statsRes.data.total_visitors || 0
        });
      } catch (statsError) {
        // Fallback to calculated stats if API endpoint doesn't exist yet
        console.warn('Stats API not available, using fallback data');
        setStats({
          totalShops: shopsRes.data.length || 0,
          totalProducts: productsRes.data.count || 0,
          totalOrders: Math.floor((productsRes.data.count || 0) * 0.3),
          totalVisitors: Math.floor((productsRes.data.count || 0) * 10)
        });
      }

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

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Men': '👔',
      'Women': '👗',
      'Kids': '👶',
      'Boys': '👦',
      'Girls': '👧',
      'Accessories': '👜',
      'Footwear': '👟',
      'Ethnic': '🥻',
      'Western': '👕',
      'Traditional': '🎽',
      'Casual': '👖',
      'Formal': '🤵',
      'Shirt': '👕',
      'Pant': '👖',
      'Jean': '👖',
      'Dress': '👗',
      'Saree': '🥻',
      'Kurta': '🎽',
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '👕';
  };

  // Format large numbers with null safety
  const formatNumber = (num) => {
    return (num || 0).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white">

      <SEO
        title="Amravati Wears Market - Local Clothing & Fashion Marketplace"
        description="Shop from trusted local clothing stores in Amravati. Wide collection of men's, women's, kids wear, ethnic, western & casual clothing with Cash on Delivery. Free COD on orders ≥ ₹500."
        keywords="Amravati clothing, local cloth market, fashion Amravati, online shopping Amravati, ethnic wear, western wear, kids clothing, sarees, kurta, jeans, shirts, COD available"
        url="https://awm27.shop"
        image="https://awm27.shop/og-image.jpg"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Amravati Wears Market",
          "url": "https://awm27.shop",
          "description": "Amravati's first local cloth marketplace connecting customers with trusted local clothing stores",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://awm27.shop/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://awm27.shop/#organization",
            "name": "Amravati Wears Market",
            "url": "https://awm27.shop",
            "logo": "https://awm27.shop/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Amravati",
              "addressRegion": "Maharashtra",
              "addressCountry": "IN"
            },
            "areaServed": {
              "@type": "City",
              "name": "Amravati"
            }
          }
        }}
      />

      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Welcome! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Discover Amravati's first local cloth marketplace. Shop from your favorite local stores with home delivery.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>✓ Cash on Delivery available</li>
              <li>✓ Free COD on orders ≥ ₹500</li>
              <li>✓ Support local businesses</li>
            </ul>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* FIXED: Main H1 - Moved here to be first heading on page */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              FIND CLOTHES<br />
              THAT MATCHES<br />
              YOUR STYLE
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
              Browse through our diverse range of meticulously crafted garments from trusted Amravati stores, designed to bring out your individuality.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-10">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search for shirts, jeans, sarees..."
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 text-gray-800 focus:outline-none focus:border-black transition"
                  aria-label="Search for products"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <Link
              to="/products"
              className="inline-block px-16 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition text-lg"
            >
              Shop Now
            </Link>

            {/* Dynamic Stats - 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-4xl">
              <div>
                <div className="text-2xl md:text-3xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                  ) : (
                    `${formatNumber(stats.totalShops)}+`
                  )}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">Local Stores</div>
              </div>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="text-2xl md:text-3xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
                  ) : (
                    `${formatNumber(stats.totalProducts)}+`
                  )}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">Products</div>
              </div>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="text-2xl md:text-3xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
                  ) : (
                    `${formatNumber(stats.totalOrders)}+`
                  )}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">Customers</div>
              </div>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="text-2xl md:text-3xl font-bold">
                  {loading ? (
                    <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
                  ) : (
                    `${formatNumber(stats.totalVisitors)}+`
                  )}
                </div>
                <div className="text-gray-600 text-xs md:text-sm">Visitors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIXED: Brand/Features Bar - Changed h3 to p with strong styling */}
      <section className="bg-black py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <FiShoppingBag className="w-8 h-8 text-white" aria-hidden="true" />
              <div className="text-left">
                <p className="text-white font-bold text-lg">Local Stores</p>
                <p className="text-gray-400 text-sm">Trusted Amravati Shops</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FiTruck className="w-8 h-8 text-white" aria-hidden="true" />
              <div className="text-left">
                <p className="text-white font-bold text-lg">Fast Delivery</p>
                <p className="text-gray-400 text-sm">To Your Doorstep</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FiShield className="w-8 h-8 text-white" aria-hidden="true" />
              <div className="text-left">
                <p className="text-white font-bold text-lg">COD Available</p>
                <p className="text-gray-400 text-sm">Free on Orders ≥ ₹500</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      {!loading && shops.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">FEATURED SHOPS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300"
                  aria-label={`View ${shop.shop_name} shop`}
                >
                  {shop.shop_image ? (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={shop.shop_image}
                        alt={`${shop.shop_name} storefront`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FiShoppingBag className="w-16 h-16 text-gray-400" aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-gray-600 transition">
                      {shop.shop_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{shop.city}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-sm font-semibold text-black">
                        {shop.product_count} Products
                      </p>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span className="text-xs font-semibold">4.5</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section >
      )}

      {/* Categories Section */}
      {
        !loading && categories.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold">BROWSE BY DRESS STYLE</h2>
                <Link
                  to="/products"
                  className="hidden md:block text-black hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              {/* Horizontal Scrollable Container */}
              <div className="relative">
                <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categories.map((category, index) => (
                    <Link
                      key={`category-${category.id}-${index}`}
                      to={`/products?category=${category.id}`}
                      className="group relative bg-white rounded-2xl p-6 overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0 snap-start"
                      style={{ width: '200px', height: '160px' }}
                      aria-label={`Browse ${category.name} category`}
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300" aria-hidden="true" />

                      {/* Icon decoration */}
                      <div className="absolute right-4 bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
                        {getCategoryIcon(category.name)}
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition line-clamp-2">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Scroll indicator for mobile */}
                <div className="md:hidden text-center mt-2 text-xs text-gray-500" aria-hidden="true">
                  ← Swipe to see more →
                </div>
              </div>
            </div>

            <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          </section>
        )
      }

      {/* Featured Products */}
      {
        !loading && featuredProducts.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold">NEW ARRIVALS</h2>
                <Link
                  to="/products"
                  className="hidden md:block text-black hover:underline font-medium text-lg"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  to="/products"
                  className="inline-block px-16 py-4 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition font-medium text-lg"
                >
                  View All
                </Link>
              </div>
            </div>
          </section>
        )
      }

      {/* Loading State */}
      {
        loading && (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
        )
      }
    </div >
  );
};

export default Home;