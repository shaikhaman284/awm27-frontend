import React, { useState } from 'react';

/**
 * Test component to demonstrate ErrorBoundary functionality
 * This component can be temporarily added to any page to test error handling
 */
const ErrorBoundaryTest = () => {
    const [shouldThrowError, setShouldThrowError] = useState(false);

    // This will cause a runtime error that ErrorBoundary will catch
    if (shouldThrowError) {
        // Intentionally accessing property of null to trigger error
        const data = null;
        return <div>{data.name}</div>; // This will throw: Cannot read property 'name' of null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm font-semibold mb-2">ErrorBoundary Test</p>
                <button
                    onClick={() => setShouldThrowError(true)}
                    className="px-4 py-2 bg-white text-red-500 rounded font-medium hover:bg-gray-100 transition text-sm"
                >
                    Trigger Runtime Error
                </button>
                <p className="text-xs mt-2 opacity-75">
                    Click to test ErrorBoundary
                </p>
            </div>
        </div>
    );
};

export default ErrorBoundaryTest;
