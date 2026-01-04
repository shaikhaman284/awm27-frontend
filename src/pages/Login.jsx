import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiUser, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOTP } = useAuth();

  const [step, setStep] = useState(1); // 1: phone & name, 2: OTP
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Cleanup reCAPTCHA when step changes back to 1
  useEffect(() => {
    if (step === 1) {
      const container = document.getElementById('recaptcha-container');
      if (container) {
        // Clear any previous reCAPTCHA instances
        container.innerHTML = '';
      }
    }
  }, [step]);

  // Generate dynamic title based on step
  const getPageTitle = () => {
    if (step === 1) {
      return 'Login to Your Account | Amravati Wears Market';
    }
    return 'Verify OTP | Amravati Wears Market';
  };

  const getPageDescription = () => {
    if (step === 1) {
      return 'Login to Amravati Wears Market. Shop from local clothing stores with Cash on Delivery. Secure OTP-based authentication.';
    }
    return 'Verify the OTP sent to your phone to complete login. Secure authentication for Amravati Wears Market.';
  };

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

    try {
      const result = await loginWithOTP.sendOTP(phone);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep(2);
        toast.success('OTP sent to your phone');
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithOTP.verifyOTP(
        confirmationResult,
        otp,
        name,
        phone
      );

      if (result.success) {
        toast.success('Login successful!');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        url="https://awm27.shop/login"
        noindex={true}
      />

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
            <form onSubmit={handleSendOTP} className="space-y-6">
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

              {/* reCAPTCHA Container - VISIBLE for user interaction */}
              <div className="flex justify-center py-4">
                <div id="recaptcha-container"></div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-black text-white font-semibold rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>

              {/* Security Note */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Secure OTP Login</p>
                    <p className="text-gray-600 text-xs mt-1">
                      We'll send a one-time password to verify your phone number
                    </p>
                  </div>
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
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                    }}
                    className="text-black font-semibold hover:underline"
                  >
                    Resend OTP
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