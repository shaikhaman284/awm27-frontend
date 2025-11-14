import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiPackage, FiMenu, FiX } from 'react-icons/fi';
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
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold text-primary">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary">
              Products
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full" onClick={closeMobileMenu}>
              <FiShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Desktop User menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/orders"
                  className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiPackage className="w-5 h-5" />
                  <span>Orders</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiUser className="w-5 h-5" />
                  <span>{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
              onClick={closeMobileMenu}
            >
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  onClick={closeMobileMenu}
                >
                  <FiPackage className="w-5 h-5" />
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  onClick={closeMobileMenu}
                >
                  <FiUser className="w-5 h-5" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiLogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 bg-primary text-white rounded-lg text-center"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;