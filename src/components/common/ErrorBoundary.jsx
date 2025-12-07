import React from 'react';
import { logError, reportError } from '../../utils/errorUtils';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error and generate error ID
        const errorId = reportError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });

        this.setState({
            error,
            errorInfo,
            errorId,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-8">
                            An unexpected error occurred. Please try refreshing the page or go back to the home page.
                        </p>

                        {/* Error ID */}
                        {this.state.errorId && (
                            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Error ID (for support)</p>
                                <p className="text-sm font-mono text-gray-700">{this.state.errorId}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium"
                            >
                                Go Home
                            </button>
                        </div>

                        {/* Development Mode: Show Error Details */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Development Error Details:
                                </p>
                                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-600 overflow-auto max-h-40 mt-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
