import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiPackage, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { APP_NAME } from '../../utils/constants';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 px-4 text-xs sm:text-sm">
        <p>
          Sign up and place your first order online.{' '}
          <Link to="/login" className="underline font-semibold hover:text-gray-300">
            Sign Up Now
          </Link>
        </p>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* FIXED: Mobile menu button - added aria-label */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center"
              onClick={closeMobileMenu}
              aria-label="Go to home page"
            >
              <span className="text-2xl md:text-3xl font-bold tracking-tight uppercase">{APP_NAME}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-900 hover:text-gray-600 transition font-medium">
                Home
              </Link>
              <Link to="/products" className="text-gray-900 hover:text-gray-600 transition font-medium">
                Shop
              </Link>
            </nav>

            {/* Search Bar - Desktop only */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                  aria-label="Search for products"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/products?search=${e.target.value}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* FIXED: Search icon for mobile/tablet - added aria-label */}
              <button
                onClick={() => navigate('/products')}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Search products"
              >
                <FiSearch className="w-5 h-5 text-gray-700" aria-hidden="true" />
              </button>

              {/* FIXED: Cart - added aria-label with item count */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
                onClick={closeMobileMenu}
                aria-label={`Shopping cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              >
                <FiShoppingCart className="w-5 h-5 text-gray-700" aria-hidden="true" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                    aria-hidden="true"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Desktop User menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/orders"
                    className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="View my orders"
                  >
                    <FiPackage className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Orders</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    aria-label={`View profile for ${user?.name}`}
                  >
                    <FiUser className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                  </Link>

                  {/* FIXED: Logout button - added aria-label */}
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    aria-label="Logout"
                  >
                    <FiLogOut className="w-5 h-5 text-gray-700" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-1" aria-label="Mobile navigation">
              <Link
                to="/"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium transition"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium transition"
                onClick={closeMobileMenu}
              >
                Shop
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 my-2" aria-hidden="true"></div>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={closeMobileMenu}
                    aria-label="View my orders"
                  >
                    <FiPackage className="w-5 h-5" aria-hidden="true" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                    onClick={closeMobileMenu}
                    aria-label={`View profile for ${user?.name}`}
                  >
                    <FiUser className="w-5 h-5" aria-hidden="true" />
                    <span>Profile ({user?.name})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                    aria-label="Logout from your account"
                  >
                    <FiLogOut className="w-5 h-5" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2" aria-hidden="true"></div>
                  <Link
                    to="/login"
                    className="block px-4 py-3 bg-black text-white rounded-lg text-center font-medium hover:bg-gray-800 transition"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;