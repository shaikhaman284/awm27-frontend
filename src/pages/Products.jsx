import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    shop: searchParams.get('shop') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest'
  });

  // Price range slider
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 10000
  ]);

  // Generate dynamic title based on filters
  const getPageTitle = () => {
    const parts = [];

    if (filters.search) {
      parts.push(`"${filters.search}"`);
    }

    if (filters.category) {
      const category = categories.find(c => String(c.id) === filters.category);
      if (category) {
        parts.push(category.name);
      } else {
        // Check subcategories
        for (const cat of categories) {
          if (cat.subcategories) {
            const subcat = cat.subcategories.find(s => String(s.id) === filters.category);
            if (subcat) {
              parts.push(subcat.name);
              break;
            }
          }
        }
      }
    }

    if (parts.length > 0) {
      return `${parts.join(' - ')} | Shop Online | Amravati Wears Market`;
    }

    return 'Shop Clothing Online - Latest Fashion Collection | Amravati Wears Market';
  };

  const getPageDescription = () => {
    if (filters.search) {
      return `Search results for "${filters.search}". Browse ${products.length}+ products from local Amravati stores. Cash on Delivery available. Free COD on orders ≥ ₹500.`;
    }

    if (filters.category) {
      const category = categories.find(c => String(c.id) === filters.category);
      const catName = category?.name || 'products';
      return `Shop ${catName} online from trusted Amravati stores. Wide collection with Cash on Delivery. ${products.length}+ items available. Free COD on orders ≥ ₹500.`;
    }

    return `Browse ${products.length}+ clothing products from local Amravati stores. Men's, women's, kids wear with Cash on Delivery. Free COD on orders ≥ ₹500. Shop now!`;
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    // Priority: main_image > images[0] > fallback
    if (product.main_image) {
      return product.main_image.startsWith('http')
        ? product.main_image
        : `https://awm27.shop${product.main_image}`;
    }
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return firstImage.startsWith('http')
        ? firstImage
        : `https://awm27.shop${firstImage}`;
    }
    // Fallback to a default product image
    return 'https://awm27.shop/static/images/default-product.jpg';
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await apiService.getProducts(params);
      setProducts(response.data.results || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePriceRangeApply = () => {
    handleFilterChange('min_price', priceRange[0]);
    handleFilterChange('max_price', priceRange[1]);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      shop: '',
      min_price: '',
      max_price: '',
      sort: 'newest'
    });
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        keywords="buy clothes online Amravati, fashion shopping, men clothing, women clothing, kids wear, ethnic wear, casual wear, formal wear, online shopping COD"
        url={`https://awm27.shop/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": getPageTitle(),
          "description": getPageDescription(),
          "url": `https://awm27.shop/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": products.length,
            "itemListElement": products.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "@id": `https://awm27.shop/products/${product.id}`,
                "name": product.name,
                "image": getProductImageUrl(product),
                "description": product.description || product.name,
                "url": `https://awm27.shop/products/${product.id}`,
                "offers": {
                  "@type": "Offer",
                  "price": product.display_price || product.price,
                  "priceCurrency": "INR",
                  "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  "seller": {
                    "@type": "Organization",
                    "name": product.shop_name || "Amravati Wears Market"
                  }
                }
              }
            }))
          },
          "breadcrumb": {
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
              }
            ]
          }
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-black transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-black font-medium">Shop</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${showFilters ? 'fixed inset-0 z-50 bg-white' : 'hidden'
              } md:block md:relative w-full md:w-72 lg:w-80 md:flex-shrink-0`}
          >
            <div className="h-full md:border md:border-gray-200 md:rounded-3xl p-6 overflow-y-auto">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Desktop Header */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                    />
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="font-bold text-base mb-4 uppercase text-gray-900">Categories</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <label className="flex items-center gap-3 cursor-pointer group py-2">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={filters.category === ''}
                          onChange={(e) => handleFilterChange('category', '')}
                          className="w-4 h-4 text-black focus:ring-black"
                        />
                        <span className="text-gray-700 group-hover:text-black transition">
                          All Categories
                        </span>
                      </label>
                      {categories.map((cat) => (
                        <React.Fragment key={cat.id}>
                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            <>
                              <div className="font-semibold text-sm text-gray-500 mt-3 mb-1">
                                {cat.name}
                              </div>
                              {cat.subcategories.map((sub) => (
                                <label key={sub.id} className="flex items-center gap-3 cursor-pointer group py-2 pl-4">
                                  <input
                                    type="radio"
                                    name="category"
                                    value={sub.id}
                                    checked={filters.category === String(sub.id)}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-4 h-4 text-black focus:ring-black"
                                  />
                                  <span className="text-gray-700 group-hover:text-black transition text-sm">
                                    {sub.name}
                                  </span>
                                </label>
                              ))}
                            </>
                          ) : (
                            <label className="flex items-center gap-3 cursor-pointer group py-2">
                              <input
                                type="radio"
                                name="category"
                                value={cat.id}
                                checked={filters.category === String(cat.id)}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-4 h-4 text-black focus:ring-black"
                              />
                              <span className="text-gray-700 group-hover:text-black transition">
                                {cat.name}
                              </span>
                            </label>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-gray-200" />

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-base mb-4 uppercase text-gray-900">Price</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          placeholder="Min"
                          className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          placeholder="Max"
                          className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePriceRangeApply}
                      className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Apply Button */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                >
                  Show {products.length} Products
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Casual</h1>
                <p className="text-gray-600 text-sm">
                  {loading ? 'Loading...' : `Showing 1-${products.length} of ${products.length} Products`}
                </p>
              </div>

              {/* Sort & Filter */}
              <div className="flex gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="md:hidden flex-1 sm:flex-none px-6 py-3 bg-gray-100 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition font-medium"
                >
                  <FiFilter className="w-5 h-5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full appearance-none px-6 py-3 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black cursor-pointer font-medium hover:bg-gray-200 transition"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Responsive Pagination */}
                <div className="mt-12 mb-8">
                  <hr className="border-gray-200 mb-8" />

                  {/* Desktop Pagination */}
                  <div className="hidden md:flex items-center justify-between">
                    <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
                      <FiChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {[1, 2, 3, '...', 8, 9, 10].map((page, idx) => (
                        <button
                          key={idx}
                          className={`w-10 h-10 rounded-lg font-medium transition ${page === 1
                            ? 'bg-gray-100 text-black'
                            : 'hover:bg-gray-50 text-gray-600'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
                      Next
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Pagination */}
                  <div className="flex md:hidden items-center justify-between gap-2">
                    <button className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center gap-1 flex-1 justify-center">
                      <FiChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, '...', 10].map((page, idx) => (
                        <button
                          key={idx}
                          className={`w-9 h-9 rounded-lg font-medium transition text-sm ${page === 1
                            ? 'bg-gray-100 text-black'
                            : page === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'hover:bg-gray-50 text-gray-600'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm flex items-center gap-1 flex-1 justify-center">
                      Next
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-32">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <FiSearch className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;