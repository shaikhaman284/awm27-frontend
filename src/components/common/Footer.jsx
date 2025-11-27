import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiTwitter, FiFacebook, FiInstagram, FiGithub, FiX } from 'react-icons/fi';
import { APP_NAME } from '../../utils/constants';
import apiService from '../../services/api';

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [email, setEmail] = useState('');

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await apiService.subscribeNewsletter(email);
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to subscribe. Please try again later.');
      }
      console.error('Newsletter subscription error:', error);
    }
  };

  const handleCustomerSupport = () => {
    openModal(
      'Customer Support',
      `
        <div class="space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p class="font-semibold text-blue-800">📧 Email Support</p>
            <p class="text-sm text-blue-700 mt-1">
              For any queries or concerns, please email us at:<br/>
              <strong>support@awm27.shop</strong>
            </p>
            <p class="text-sm text-blue-700 mt-2">
              We typically respond within 24-48 hours.
            </p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded">
            <p class="font-semibold text-gray-800">📍 Service Area</p>
            <p class="text-sm text-gray-600 mt-1">
              Currently serving <strong>Amravati City</strong> only
            </p>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p class="font-semibold text-yellow-800">🚀 Beta Phase Notice</p>
            <p class="text-sm text-yellow-700 mt-1">
              We're in MVP testing phase. Your feedback helps us improve!
            </p>
          </div>
        </div>
      `
    );
  };

  const handleDeliveryDetails = () => {
    openModal(
      'Delivery Details - Beta Testing Phase',
      `
        <div class="space-y-4">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p class="font-semibold text-yellow-800">🚀 MVP Testing Phase</p>
            <p class="text-sm text-yellow-700 mt-1">
              This is an MVP (Minimum Viable Product) app to test whether the city marketplace idea works in Amravati.
            </p>
          </div>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p class="font-semibold text-blue-800">💵 Payment Method</p>
            <p class="text-sm text-blue-700 mt-1">
              As we are in the beta testing phase, we currently provide <strong>Cash on Delivery (COD)</strong> only.
            </p>
            <p class="text-sm text-blue-700 mt-2">
              • Free COD on orders ≥ ₹500<br/>
              • ₹50 COD fee on orders below ₹500
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded">
            <p class="font-semibold text-gray-800">📦 Delivery Information</p>
            <p class="text-sm text-gray-600 mt-1">
              • Delivery within Amravati city<br/>
              • Expected delivery: 2-3 business days<br/>
              • Track your order from "My Orders" page
            </p>
          </div>
        </div>
      `
    );
  };

  const handleTermsConditions = () => {
    openModal(
      'Terms & Conditions - Beta Version',
      `
        <div class="space-y-4">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p class="font-semibold text-yellow-800">🧪 Beta Testing Notice</p>
            <p class="text-sm text-yellow-700 mt-1">
              This is an MVP (Minimum Viable Product) app to validate the city marketplace concept for Amravati. 
              We appreciate your participation in this testing phase!
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded">
            <p class="font-semibold text-gray-800">💳 Payment Terms</p>
            <p class="text-sm text-gray-600 mt-1">
              • Currently accepting <strong>Cash on Delivery (COD)</strong> only<br/>
              • Payment to be made to delivery personnel upon receipt<br/>
              • Please keep exact change ready
            </p>
          </div>

          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p class="font-semibold text-red-800">🔄 Returns & Refunds Policy</p>
            <p class="text-sm text-red-700 mt-1">
              Due to the beta testing phase, we are currently <strong>unable to provide return or refund services</strong>.
            </p>
            <p class="text-sm text-red-700 mt-2">
              However, we may consider <strong>product replacement</strong> on a case-by-case basis, subject to:
            </p>
            <ul class="text-sm text-red-700 mt-2 ml-4 list-disc">
              <li>Manufacturing defects or damage during delivery</li>
              <li>Wrong product delivered</li>
              <li>Request made within 24 hours of delivery</li>
              <li>Product in original condition with tags intact</li>
            </ul>
            <p class="text-sm text-red-700 mt-2">
              Please contact customer support for replacement requests.
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded">
            <p class="font-semibold text-gray-800">📝 General Terms</p>
            <p class="text-sm text-gray-600 mt-1">
              • All prices are in Indian Rupees (₹)<br/>
              • Prices are subject to change without notice<br/>
              • Product availability is subject to stock<br/>
              • Orders are subject to seller confirmation<br/>
              • We reserve the right to cancel orders in case of pricing errors
            </p>
          </div>

          <div class="bg-blue-50 p-4 rounded">
            <p class="font-semibold text-blue-800">📞 Contact Us</p>
            <p class="text-sm text-blue-700 mt-1">
              For any queries or concerns, please contact us at:<br/>
              <strong>support@awm27.shop</strong>
            </p>
          </div>
        </div>
      `
    );
  };

  const handlePrivacyPolicy = () => {
    openModal(
      'Privacy Policy',
      `
        <div class="space-y-4 text-sm text-gray-700">
          <p class="font-semibold text-gray-900">Effective Date: January 2025</p>
          
          <div class="space-y-3">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul class="ml-4 mt-1 list-disc space-y-1">
                <li>Name, phone number, and delivery address</li>
                <li>Order history and preferences</li>
                <li>Communication with customer support</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul class="ml-4 mt-1 list-disc space-y-1">
                <li>Process and deliver your orders</li>
                <li>Send order confirmations and updates</li>
                <li>Provide customer support</li>
                <li>Improve our services and user experience</li>
                <li>Send promotional offers (with your consent)</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
              <p>We may share your information with:</p>
              <ul class="ml-4 mt-1 list-disc space-y-1">
                <li><strong>Sellers:</strong> To fulfill your orders</li>
                <li><strong>Delivery Partners:</strong> To deliver your orders</li>
                <li><strong>Service Providers:</strong> Who assist in our operations</li>
              </ul>
              <p class="mt-2">We do not sell your personal information to third parties.</p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">4. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">5. Your Rights</h3>
              <p>You have the right to:</p>
              <ul class="ml-4 mt-1 list-disc space-y-1">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">6. Cookies</h3>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, 
                analyze site traffic, and personalize content.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">7. Children's Privacy</h3>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect 
                information from children under 13.
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-gray-900 mb-2">8. Changes to Privacy Policy</h3>
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                changes by posting the new policy on this page.
              </p>
            </div>

            <div class="bg-blue-50 p-4 rounded mt-4">
              <h3 class="font-semibold text-blue-900 mb-2">Contact Us</h3>
              <p class="text-blue-800">
                If you have any questions about this Privacy Policy, please contact us at:<br/>
                <strong>support@awm27.shop</strong>
              </p>
            </div>
          </div>
        </div>
      `
    );
  };

  return (
    <>
      <footer className="bg-gray-50 mt-auto border-t border-gray-200">
        {/* Newsletter Section */}
        <div className="bg-black text-white">
          <div className="container mx-auto px-4 py-10 md:py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-md leading-tight">
                STAY UPTO DATE ABOUT OUR LATEST OFFERS
              </h2>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col gap-3 w-full md:w-auto md:min-w-[350px]">
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  Subscribe to Newsletter
                </button>
              </form>
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
                <li>
                  <button
                    onClick={handleCustomerSupport}
                    className="text-gray-600 hover:text-black hover:underline transition text-left"
                  >
                    Customer Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleDeliveryDetails}
                    className="text-gray-600 hover:text-black hover:underline transition text-left"
                  >
                    Delivery Details
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleTermsConditions}
                    className="text-gray-600 hover:text-black hover:underline transition text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={handlePrivacyPolicy}
                    className="text-gray-600 hover:text-black hover:underline transition text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
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
                  COD
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{modalContent.title}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
              dangerouslySetInnerHTML={{ __html: modalContent.content }}
            />

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;