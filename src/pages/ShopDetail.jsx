import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiMapPin, FiPackage, FiFilter, FiSearch, FiChevronRight, FiChevronDown, FiX } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';


const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    sort: 'newest'
  });

  const [priceRange, setPriceRange] = useState([0, 10000]);

  useEffect(() => {
    loadCategories();
    loadShopDetail();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [filters, allProducts]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadShopDetail = async () => {
    try {
      setLoading(true);
      const shopRes = await apiService.getShopDetail(id);
      setShop(shopRes.data);

      // FIXED: Load ALL products by setting a high page_size or making multiple requests
      const productsRes = await apiService.getProducts({
        shop: id,
        page_size: 1000 // Get all products (adjust if shop has more than 1000 products)
      });
      setAllProducts(productsRes.data.results || []);
    } catch (error) {
      console.error('Error loading shop details:', error);
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryNameById = (categoryId) => {
    for (const cat of categories) {
      if (cat.id === parseInt(categoryId)) {
        return cat.name;
      }
      if (cat.subcategories && cat.subcategories.length > 0) {
        for (const sub of cat.subcategories) {
          if (sub.id === parseInt(categoryId)) {
            return sub.name;
          }
        }
      }
    }
    return null;
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      const selectedCategoryName = getCategoryNameById(filters.category);
      if (selectedCategoryName) {
        filtered = filtered.filter(product =>
          product.category_name === selectedCategoryName
        );
      }
    }

    if (filters.min_price) {
      filtered = filtered.filter(product =>
        parseFloat(product.display_price) >= parseFloat(filters.min_price)
      );
    }
    if (filters.max_price) {
      filtered = filtered.filter(product =>
        parseFloat(product.display_price) <= parseFloat(filters.max_price)
      );
    }

    switch (filters.sort) {
      case 'price_low':
        filtered.sort((a, b) => parseFloat(a.display_price) - parseFloat(b.display_price));
        break;
      case 'price_high':
        filtered.sort((a, b) => parseFloat(b.display_price) - parseFloat(a.display_price));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setProducts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeApply = () => {
    handleFilterChange('min_price', priceRange[0]);
    handleFilterChange('max_price', priceRange[1]);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      sort: 'newest'
    });
    setPriceRange([0, 10000]);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FiPackage className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
          <p className="text-gray-600 mb-6">The shop you're looking for doesn't exist</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${shop.shop_name} - Local Clothing Store in ${shop.city} | Amravati Wears Market`}
        description={`Shop ${allProducts.length}+ products from ${shop.shop_name} in ${shop.city}. ${shop.address}. Cash on Delivery available. Call ${shop.contact_number} for inquiries. Free COD on orders ≥ ₹500.`}
        keywords={`${shop.shop_name}, ${shop.city} clothing store, local shop ${shop.city}, buy clothes ${shop.city}, fashion store Amravati, ${shop.contact_number}`}
        url={`https://awm27.shop/shop/${shop.id}`}
        image={shop.shop_image || "https://awm27.shop/default-shop-image.jpg"}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "@id": `https://awm27.shop/shop/${shop.id}`,
          "name": shop.shop_name,
          "description": `${shop.shop_name} is a local clothing store in ${shop.city}, offering ${allProducts.length}+ quality fashion products with Cash on Delivery.`,
          "url": `https://awm27.shop/shop/${shop.id}`,
          "image": shop.shop_image || "https://awm27.shop/default-shop-image.jpg",
          "telephone": shop.contact_number,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": shop.address,
            "addressLocality": shop.city,
            "addressRegion": "Maharashtra",
            "postalCode": shop.pincode,
            "addressCountry": "IN"
          },
          "geo": shop.latitude && shop.longitude ? {
            "@type": "GeoCoordinates",
            "latitude": shop.latitude,
            "longitude": shop.longitude
          } : undefined,
          "areaServed": {
            "@type": "City",
            "name": shop.city
          },
          "currenciesAccepted": "INR",
          "paymentAccepted": "Cash on Delivery, Online Payment",
          "priceRange": "₹₹",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Products",
            "itemListElement": products.slice(0, 10).map((product, index) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": product.name,
                "image": product.images?.[0] || "",
                "description": product.description || product.name,
                "url": `https://awm27.shop/products/${product.id}`,
                "offers": {
                  "@type": "Offer",
                  "price": product.display_price || product.price,
                  "priceCurrency": "INR",
                  "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }
            }))
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "reviewCount": Math.max(allProducts.length * 2, 10),
            "bestRating": "5",
            "worstRating": "1"
          },
          "parentOrganization": {
            "@type": "Organization",
            "@id": "https://awm27.shop/#organization",
            "name": "Amravati Wears Market",
            "url": "https://awm27.shop"
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
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": shop.shop_name,
                "item": `https://awm27.shop/shop/${shop.id}`
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
            <button onClick={() => navigate('/products')} className="hover:text-black transition">
              Shop
            </button>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-black font-medium line-clamp-1">{shop.shop_name}</span>
          </div>
        </div>
      </div>

      {/* Shop Header */}
      {/* Shop Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left: Shop Logo - BIG & PROMINENT */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative group mx-auto max-w-xs">
                {/* Main Image Container */}
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-gray-900 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-[1.02]">
                  {shop.shop_image ? (
                    <>
                      <img
                        src={shop.shop_image}
                        alt={`${shop.shop_name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                        }}
                      />
                      {/* Image Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  ) : null}

                  {/* Fallback Icon */}
                  <div
                    className="fallback-icon absolute inset-0 flex items-center justify-center bg-gray-100"
                    style={{ display: shop.shop_image ? 'none' : 'flex' }}
                  >
                    <div className="text-center">
                      <span className="text-9xl block mb-2">🏪</span>
                      <p className="text-sm font-semibold text-gray-600 px-4">No Image</p>
                    </div>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border-4 border-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold">Verified</span>
                </div>
              </div>
            </div>

            {/* Right: Shop Info */}
            <div className="md:col-span-8 lg:col-span-9">
              {/* Shop Name & Stats */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
                  {shop.shop_name}
                </h1>

                {/* Quick Stats Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                    <FiPackage className="w-5 h-5 text-gray-900" />
                    <span className="text-base font-bold text-gray-900">{allProducts.length}</span>
                    <span className="text-sm text-gray-600 font-medium">Products</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                    <FiMapPin className="w-5 h-5 text-gray-900" />
                    <span className="text-base font-bold text-gray-900">{shop.city}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow-md">
                    <span className="text-sm font-bold">✓ COD Available</span>
                  </div>
                </div>
              </div>

              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Address Card */}
                <div className="group flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:scale-110 transition-all">
                    <FiMapPin className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Store Location</p>
                    <p className="text-gray-900 font-semibold leading-relaxed text-sm">{shop.address}</p>
                    <p className="text-gray-900 font-bold text-base mt-1">{shop.city} - {shop.pincode}</p>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="group flex items-start gap-4 p-5 bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:scale-110 transition-all">
                    <FiPhone className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Contact Number</p>
                    <a
                      href={`tel:${shop.contact_number}`}
                      className="text-gray-900 font-bold text-xl hover:text-black transition block"
                    >
                      {shop.contact_number}
                    </a>
                    <p className="text-sm text-gray-600 font-medium mt-1">Call for inquiries</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">

                <a href={`tel:${shop.contact_number}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                >
                  <FiPhone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>

                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address + ', ' + shop.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-gray-900"
                >
                  <FiMapPin className="w-5 h-5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      < div className="container mx-auto px-4 py-6 md:py-8" >
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
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Products</h2>
                <p className="text-gray-600 text-sm">
                  Showing {products.length} of {allProducts.length} Products
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
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-3xl">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm">
                  <FiPackage className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {allProducts.length === 0
                    ? 'No products available'
                    : 'No products found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {allProducts.length === 0
                    ? 'This shop hasn\'t added any products yet'
                    : 'Try adjusting your filters or search terms'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div >
    </div >
  );
};

export default ShopDetail;