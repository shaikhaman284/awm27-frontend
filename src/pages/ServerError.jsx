import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiServer, FiHome, FiRefreshCw } from 'react-icons/fi';
import { getErrorContext, formatErrorTime, clearErrorContext } from '../utils/errorUtils';
import SEO from '../components/common/SEO';

const ServerError = () => {
    const navigate = useNavigate();
    const [retrying, setRetrying] = useState(false);
    const errorContext = getErrorContext();

    const handleRetry = () => {
        setRetrying(true);
        clearErrorContext();

        // Wait a moment then go back or reload
        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.reload();
            }
        }, 500);
    };

    const handleGoHome = () => {
        clearErrorContext();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <SEO
                title="Server Error | Amravati Wears Market"
                description="We're experiencing technical difficulties."
                noIndex={true}
            />

            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 bg-red-50 rounded-full mx-auto flex items-center justify-center">
                        <FiServer className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Oops! Something went wrong
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Our servers are having trouble processing your request.
                    We're working to fix it as quickly as possible.
                </p>

                {/* Error Details */}
                {errorContext && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl max-w-md mx-auto">
                        {errorContext.errorId && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1">Error ID</p>
                                <p className="text-sm font-mono text-gray-700 break-all">
                                    {errorContext.errorId}
                                </p>
                            </div>
                        )}
                        {errorContext.timestamp && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Time</p>
                                <p className="text-sm text-gray-700">
                                    {formatErrorTime(errorContext.timestamp)}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiRefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
                        {retrying ? 'Retrying...' : 'Try Again'}
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                    >
                        <FiHome className="w-5 h-5" />
                        Go Home
                    </button>
                </div>

                {/* Support Info */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-600">
                        If the problem persists, please contact our support team.
                    </p>
                    {errorContext?.errorId && (
                        <p className="text-xs text-gray-500 mt-2">
                            Please provide the Error ID when contacting support.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServerError;
