import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiHome, FiShoppingBag, FiSearch } from 'react-icons/fi';
import SEO from '../components/common/SEO';

const NotFound = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <SEO
                title="404 - Page Not Found | Amravati Wears Market"
                description="The page you're looking for doesn't exist."
                noIndex={true}
            />

            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                        <FiAlertCircle className="w-16 h-16 text-gray-400" />
                    </div>
                </div>

                {/* 404 Text */}
                <h1 className="text-8xl md:text-9xl font-bold text-black mb-4">404</h1>

                {/* Error Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-gray-600 mb-12 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                    >
                        <FiHome className="w-5 h-5" />
                        Go Home
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                    >
                        <FiShoppingBag className="w-5 h-5" />
                        Browse Products
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-12">
                    <p className="text-sm text-gray-500 mb-4">Or search for products:</p>
                    <form onSubmit={handleSearch} className="max-w-md mx-auto">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                            />
                        </div>
                    </form>
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-700 hover:text-black transition font-medium"
                        >
                            Home
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate('/products')}
                            className="text-gray-700 hover:text-black transition font-medium"
                        >
                            Products
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                            onClick={() => navigate('/cart')}
                            className="text-gray-700 hover:text-black transition font-medium"
                        >
                            Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
