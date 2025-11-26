import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiTwitter, FiFacebook, FiInstagram, FiGithub } from 'react-icons/fi';
import { APP_NAME } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-auto border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-md leading-tight">
              STAY UPTO DATE ABOUT OUR LATEST OFFERS
            </h2>
            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[350px]">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button className="w-full px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition">
                Subscribe to Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4 uppercase">{APP_NAME}</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-md">
              Shop from your favorite local cloth stores in Amravati. Quality products, delivered to your doorstep.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                <FiGithub className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-6 text-base uppercase tracking-wider">COMPANY</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products" className="text-gray-600 hover:text-black hover:underline transition">Browse Products</Link></li>
              <li><Link to="/orders" className="text-gray-600 hover:text-black hover:underline transition">My Orders</Link></li>
              <li><Link to="/cart" className="text-gray-600 hover:text-black hover:underline transition">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-bold mb-6 text-base uppercase tracking-wider">HELP</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-black hover:underline transition">Customer Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black hover:underline transition">Delivery Details</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black hover:underline transition">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black hover:underline transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-6 text-base uppercase tracking-wider">CONTACT</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Email: support@awm27.shop</li>
              <li>Location: Amravati, Maharashtra</li>
              <li className="text-xs mt-4 text-gray-500">
                Beta Testing Phase
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 text-center md:text-left">
            {APP_NAME} © 2025. All Rights Reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Accepted Payments:</span>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold">
                VISA
              </div>
              <div className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold">
                COD
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;