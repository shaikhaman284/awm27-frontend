import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPhone, FiMapPin, FiPackage, FiFilter, FiSearch } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const ShopDetail = () => {
  const { id } = useParams();
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
      const productsRes = await apiService.getProducts({ shop: id });
      setAllProducts(productsRes.data.results || []);
    } catch (error) {
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category === parseInt(filters.category)
      );
    }

    if (filters.min_price) {
      filtered = filtered.filter(product =>
        product.display_price >= parseFloat(filters.min_price)
      );
    }
    if (filters.max_price) {
      filtered = filtered.filter(product =>
        product.display_price <= parseFloat(filters.max_price)
      );
    }

    switch (filters.sort) {
      case 'price_low':
        filtered.sort((a, b) => a.display_price - b.display_price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.display_price - a.display_price);
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

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      sort: 'newest'
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Shop not found</p>
          <Link to="/products" className="text-blue-600 hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        style={{
          backgroundImage: shop.shop_image ? `url(${shop.shop_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-white rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                {shop.shop_image ? (
                  <img
                    src={shop.shop_image}
                    alt={shop.shop_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600">
                    <span className="text-5xl">🏪</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{shop.shop_name}</h1>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg">{shop.address}</p>
                      <p className="text-lg">{shop.city} - {shop.pincode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    <span className="text-lg">{allProducts.length} Products Available</span>
                  </div>
                </div>

                <a
                  href={`tel:${shop.contact_number}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg text-lg"
                >
                  <FiPhone />
                  Call Shop
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Products from {shop.shop_name}</h2>
            <p className="text-gray-600">{products.length} products found</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <FiFilter />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside
            className={`${showFilters ? 'block' : 'hidden'
              } md:block w-full md:w-64 bg-white p-6 rounded-lg shadow-md h-fit sticky top-20`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <React.Fragment key={cat.id}>
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <optgroup label={cat.name}>
                          {cat.subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ) : (
                        <option value={cat.id}>{cat.name}</option>
                      )}
                    </React.Fragment>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {allProducts.length === 0
                    ? 'No products available from this shop yet'
                    : 'No products match your filters'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:underline"
                  >
                    Clear filters and try again
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;