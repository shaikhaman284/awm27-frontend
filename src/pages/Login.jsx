import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiUser, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOTP, testLogin } = useAuth();

  const [step, setStep] = useState(1); // 1: phone & name, 2: OTP
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [useTestMode, setUseTestMode] = useState(true); // Toggle for test mode

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error('Please enter valid 10-digit phone number');
      return;
    }

    if (!name || name.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    const result = await loginWithOTP.sendOTP(phone);

    setLoading(false);

    if (result.success) {
      setConfirmationResult(result.confirmationResult);
      setStep(2);
      toast.success('OTP sent to your phone');
    } else {
      toast.error(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    const result = await loginWithOTP.verifyOTP(
      confirmationResult,
      otp,
      name,
      phone
    );

    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Invalid OTP');
    }
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error('Please enter valid 10-digit phone number');
      return;
    }

    if (!name || name.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    const result = await testLogin(phone, name);

    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 1 ? 'Welcome!' : 'Verify OTP'}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 1
              ? 'Login to continue shopping'
              : `Enter OTP sent to +91${phone}`}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Step 1: Phone & Name */}
          {step === 1 && (
            <form
              onSubmit={useTestMode ? handleTestLogin : handleSendOTP}
              className="space-y-6"
            >
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none border-r border-gray-300 pr-2">
                    <span className="text-gray-500 text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength="10"
                    className="block w-full pl-20 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading
                  ? 'Please wait...'
                  : useTestMode
                    ? 'Login (Test Mode)'
                    : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    maxLength="6"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Enter 6-digit OTP sent to your phone
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          {/* Mode Toggle (Development Only) */}
          {step === 1 && (
            <div className="mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-yellow-800 text-sm">
                      {useTestMode ? '🧪 Test Mode' : '🔐 Firebase OTP'}
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      {useTestMode
                        ? 'No OTP required - instant login'
                        : 'Real OTP verification'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseTestMode(!useTestMode)}
                    className="px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                  >
                    Switch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By logging in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;