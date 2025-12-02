import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
        </div>
    );
};

export default LoadingSpinner;
