import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-600">Customer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiPhone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiUser className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-semibold">#{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition"
              >
                <FiPackage className="w-5 h-5 text-gray-600" />
                <span className="font-medium">My Orders</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
          >
            <FiLogOut />
            Logout
          </button>

          {/* App Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Amravati Wears Market</p>
            <p>Version 1.0.0 (Beta)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;