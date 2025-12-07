import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiLogIn, FiArrowLeft } from 'react-icons/fi';
import SEO from '../components/common/SEO';

const Unauthorized = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem('awm_auth_token');

    const handleLogin = () => {
        // Store the current path to redirect back after login
        sessionStorage.setItem('awm_redirect_after_login', location.pathname);
        navigate('/login');
    };

    const handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <SEO
                title="Access Restricted | Amravati Wears Market"
                description="You need to be logged in to access this page."
                noIndex={true}
            />

            <div className="max-w-2xl w-full text-center">
                {/* Lock Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 bg-yellow-50 rounded-full mx-auto flex items-center justify-center">
                        <FiLock className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Access Restricted
                </h1>

                {!isLoggedIn ? (
                    <>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            You need to be logged in to access this page.
                            Please log in to continue.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={handleLogin}
                                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                            >
                                <FiLogIn className="w-5 h-5" />
                                Login
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                                Go Back
                            </button>
                        </div>

                        {/* Sign Up Prompt */}
                        <div className="border-t border-gray-200 pt-8">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-black font-semibold hover:underline"
                                >
                                    Sign up to start shopping
                                </button>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            You don't have permission to access this resource.
                            If you believe this is an error, please contact support.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={handleGoBack}
                                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                                Go Back
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium"
                            >
                                Go Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Unauthorized;
