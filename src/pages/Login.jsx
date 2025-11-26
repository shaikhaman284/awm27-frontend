import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiUser, FiLock, FiArrowLeft } from 'react-icons/fi';
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
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-8 group"
        >
          <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {step === 1 ? 'Welcome Back' : 'Verify OTP'}
          </h1>
          <p className="text-lg text-gray-600">
            {step === 1
              ? 'Login to continue shopping amazing products'
              : `We've sent a 6-digit code to +91${phone}`}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-2 border-gray-200 p-8 rounded-3xl">
          {/* Step 1: Phone & Name */}
          {step === 1 && (
            <form
              onSubmit={useTestMode ? handleTestLogin : handleSendOTP}
              className="space-y-6"
            >
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400 w-5 h-5" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none border-r border-gray-300 pr-3">
                    <span className="text-gray-600 font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength="10"
                    className="block w-full pl-24 pr-4 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition text-lg"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Enter your 10-digit mobile number</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition text-lg"
                    required
                  />
                </div>
              </div>

              {/* reCAPTCHA Container */}
              {!useTestMode && (
                <div className="flex justify-center py-4">
                  <div id="recaptcha-container"></div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-black text-white font-semibold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl"
              >
                {loading
                  ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Please wait...
                    </span>
                  )
                  : useTestMode
                    ? 'Continue'
                    : 'Send OTP'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>

              </div>


            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    maxLength="6"
                    className="block w-full px-4 py-6 border-2 border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-center text-3xl tracking-[1rem] font-bold"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-3 text-sm text-gray-600 text-center">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-black font-semibold hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-black text-white font-semibold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* Change Number */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                }}
                className="w-full py-3 text-gray-600 hover:text-black font-medium transition flex items-center justify-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Change Phone Number
              </button>
            </form>
          )}

          {/* Mode Toggle (Development Only) */}
          {step === 1 && (
            <div className="mt-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      {useTestMode ? '🧪 Test Mode Active' : '🔐 Live OTP Mode'}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {useTestMode
                        ? 'No OTP required - instant login for testing'
                        : 'Real OTP verification with reCAPTCHA'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseTestMode(!useTestMode)}
                    className="px-4 py-2 text-xs bg-black text-white rounded-full hover:bg-gray-800 transition font-semibold"
                  >
                    Switch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-black hover:underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-black hover:underline font-medium">
            Privacy Policy
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;