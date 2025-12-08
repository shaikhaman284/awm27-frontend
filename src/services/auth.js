import { STORAGE_KEYS } from '../utils/constants';
import apiService from './api';

// PERFORMANCE: Lazy load Firebase - only when needed for login
// This saves ~90 KB from initial bundle
let auth = null;
let RecaptchaVerifier = null;
let signInWithPhoneNumber = null;
let signOut = null;

const loadFirebaseAuth = async () => {
  if (!auth) {
    const [firebaseModule, authModule] = await Promise.all([
      import('../config/firebase'),
      import('firebase/auth')
    ]);
    auth = firebaseModule.auth;
    RecaptchaVerifier = authModule.RecaptchaVerifier;
    signInWithPhoneNumber = authModule.signInWithPhoneNumber;
    signOut = authModule.signOut;
  }
  return { auth, RecaptchaVerifier, signInWithPhoneNumber, signOut };
};

const authService = {
  // Get auth token from localStorage
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Set auth token
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Setup reCAPTCHA v2 (visible)
  setupRecaptcha: async (elementId) => {
    const { auth, RecaptchaVerifier: ReCaptcha } = await loadFirebaseAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new ReCaptcha(auth, elementId, {
        size: 'normal', // Visible reCAPTCHA
        callback: (response) => {
          console.log('reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {
              console.error('Error clearing reCAPTCHA:', e);
            }
          }
          window.recaptchaVerifier = null;
        }
      });
    }
    return window.recaptchaVerifier;
  },

  // Send OTP
  sendOTP: async (phoneNumber) => {
    try {
      const { auth, signInWithPhoneNumber: sendOTP } = await loadFirebaseAuth();

      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('+91')
        ? phoneNumber
        : `+91${phoneNumber}`;

      // Setup reCAPTCHA
      const recaptchaVerifier = await authService.setupRecaptcha('recaptcha-container');

      // Send OTP with Firebase
      const confirmationResult = await sendOTP(
        auth,
        formattedPhone,
        recaptchaVerifier
      );

      console.log('OTP sent successfully');
      return {
        success: true,
        confirmationResult,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Send OTP error:', error);

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = null;
      }

      let errorMessage = 'Failed to send OTP';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number';
      } else if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Please complete the reCAPTCHA verification.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Verify OTP and login
  verifyOTP: async (confirmationResult, otp, name, phone) => {
    try {
      // Verify OTP with Firebase
      const userCredential = await confirmationResult.confirm(otp);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      console.log('Firebase verification successful, calling backend...');

      // Register/Login with backend
      const response = await apiService.post('/auth/register/', {
        firebase_token: idToken,
        name: name,
        phone: phone.startsWith('+91') ? phone : `+91${phone}`,
        user_type: 'customer'
      });

      const { token, user } = response.data;
      authService.setToken(token);
      authService.setUser(user);

      console.log('Backend login successful');

      // Clear reCAPTCHA after successful login
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = null;
      }

      return { success: true, user };
    } catch (error) {
      console.error('Verify OTP error:', error);

      let errorMessage = 'Invalid OTP';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP expired. Please request a new one.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Test Login (for development - keep as fallback)
  testLogin: async (phone, name) => {
    try {
      const response = await apiService.testRegister({
        phone,
        name,
        user_type: 'customer'
      });

      const { token, user } = response.data;
      authService.setToken(token);
      authService.setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiService.logout();
      // Only load Firebase if it was previously loaded
      if (auth) {
        const { auth: firebaseAuth, signOut: firebaseSignOut } = await loadFirebaseAuth();
        await firebaseSignOut(firebaseAuth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.CART);

      // Clear reCAPTCHA on logout
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
        window.recaptchaVerifier = null;
      }
    }
  },

  // Get current user from API
  fetchCurrentUser: async () => {
    try {
      const response = await apiService.getCurrentUser();
      const user = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      authService.logout();
      return null;
    }
  }
};

export default authService;