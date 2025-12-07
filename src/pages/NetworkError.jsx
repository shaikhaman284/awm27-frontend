import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';
import { isOnline, clearErrorContext } from '../utils/errorUtils';
import SEO from '../components/common/SEO';

const NetworkError = () => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [online, setOnline] = useState(isOnline());

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-redirect when connection is restored
    useEffect(() => {
        if (online) {
            const timer = setTimeout(() => {
                clearErrorContext();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    navigate('/');
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [online, navigate]);

    const handleCheckConnection = () => {
        setChecking(true);

        // Try to fetch a small resource to check connectivity
        fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
            .then(() => {
                setOnline(true);
                clearErrorContext();
                setTimeout(() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        navigate('/');
                    }
                }, 1000);
            })
            .catch(() => {
                setOnline(false);
            })
            .finally(() => {
                setChecking(false);
            });
    };

    const handleGoHome = () => {
        clearErrorContext();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <SEO
                title="Network Error | Amravati Wears Market"
                description="Unable to connect to the internet."
                noIndex={true}
            />

            <div className="max-w-2xl w-full text-center">
                {/* WiFi Off Icon */}
                <div className="mb-8">
                    <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition ${online ? 'bg-green-50' : 'bg-orange-50'
                        }`}>
                        <FiWifiOff className={`w-16 h-16 transition ${online ? 'text-green-500' : 'text-orange-500'
                            }`} />
                    </div>
                </div>

                {/* Error Message */}
                {online ? (
                    <>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Connection Restored!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            Your internet connection is back. Redirecting you now...
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            No Internet Connection
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            Please check your internet connection and try again.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={handleCheckConnection}
                                disabled={checking}
                                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiRefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                                {checking ? 'Checking...' : 'Check Connection'}
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                            >
                                <FiHome className="w-5 h-5" />
                                Go Home
                            </button>
                        </div>

                        {/* Troubleshooting Tips */}
                        <div className="border-t border-gray-200 pt-8">
                            <p className="text-sm font-semibold text-gray-700 mb-4">
                                Troubleshooting Tips:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
                                <li className="flex items-start gap-2">
                                    <span className="text-black font-bold">•</span>
                                    <span>Check if WiFi or mobile data is enabled</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black font-bold">•</span>
                                    <span>Try turning airplane mode on and off</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black font-bold">•</span>
                                    <span>Restart your router or modem</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-black font-bold">•</span>
                                    <span>Move closer to your WiFi router</span>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkError;
