import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiLogOut, FiPackage, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black transition">
              Home
            </button>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-black font-medium">My Profile</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">MY PROFILE</h1>

          {/* Profile Card */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-600 font-medium">Customer Account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                  <p className="font-bold text-lg">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-1">User ID</p>
                  <p className="font-bold text-lg">#{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-2 border-gray-200 rounded-3xl p-6 md:p-8 mb-6">
            <h3 className="font-bold text-xl mb-5">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">My Orders</p>
                    <p className="text-sm text-gray-600">View your order history</p>
                  </div>
                </div>
                <FiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black transition" />
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>

          {/* App Info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 text-center">
            <p className="font-bold text-gray-900 mb-1">Amravati Wears Market</p>
            <p className="text-sm text-gray-600">Version 1.0.0 (Beta)</p>
            <p className="text-xs text-gray-500 mt-2">
              Thank you for being part of our journey! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;