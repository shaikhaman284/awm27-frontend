import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi';
import { getErrorContext, formatErrorTime, clearErrorContext } from '../utils/errorUtils';
import SEO from '../components/common/SEO';

const GeneralError = () => {
    const navigate = useNavigate();
    const errorContext = getErrorContext();

    const handleRetry = () => {
        clearErrorContext();
        window.location.reload();
    };

    const handleGoHome = () => {
        clearErrorContext();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <SEO
                title="Error | Amravati Wears Market"
                description="An unexpected error occurred."
                noIndex={true}
            />

            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 bg-orange-50 rounded-full mx-auto flex items-center justify-center">
                        <FiAlertTriangle className="w-16 h-16 text-orange-500" />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Something Went Wrong
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    {errorContext?.message ||
                        'An unexpected error occurred. Please try refreshing the page or return to the home page.'}
                </p>

                {/* Error Details */}
                {errorContext && (errorContext.errorId || errorContext.timestamp) && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl max-w-md mx-auto">
                        {errorContext.errorId && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1">Error Reference</p>
                                <p className="text-sm font-mono text-gray-700 break-all">
                                    {errorContext.errorId}
                                </p>
                            </div>
                        )}
                        {errorContext.timestamp && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Occurred At</p>
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
                        className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                        Refresh Page
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
                    <p className="text-sm text-gray-600 mb-2">
                        If this problem continues, please contact our support team.
                    </p>
                    {errorContext?.errorId && (
                        <p className="text-xs text-gray-500">
                            Reference the Error ID above when reporting this issue.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralError;
