import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPhone, FiMapPin, FiPackage } from 'react-icons/fi';
import apiService from '../services/api';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopDetail();
  }, [id]);

  const loadShopDetail = async () => {
    try {
      setLoading(true);

      // Load shop details
      const shopRes = await apiService.getShopDetail(id);
      setShop(shopRes.data);

      // Load shop products
      const productsRes = await apiService.getProducts({ shop: id });
      setProducts(productsRes.data.results || []);
    } catch (error) {
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Shop Banner with Background Image */}
      <div
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        style={{
          backgroundImage: shop.shop_image ? `url(${shop.shop_image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Shop Logo/Icon */}
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

              {/* Shop Info */}
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
                    <span className="text-lg">{shop.product_count} Products Available</span>
                  </div>
                </div>

                {/* Call Button */}
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

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Products from {shop.shop_name}</h2>
          <p className="text-gray-600">{products.length} products available</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No products available from this shop yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;