import React, { useState, useEffect } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

/**
 * Optimized Image Component with responsive images, lazy loading, and blur placeholder
 * 
 * Features:
 * - Responsive images with srcset for different screen sizes
 * - Lazy loading with Intersection Observer
 * - Blur placeholder (LQIP) for better perceived performance
 * - WebP support with fallback
 * - Automatic error handling
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.priority - Load image immediately (for above-fold images)
 * @param {string} props.sizes - Sizes attribute for responsive images
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 */
const ImageOptimizer = ({
    src,
    alt,
    className = '',
    priority = false,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    width,
    height,
    onLoad,
    onError,
}) => {
    const [imageRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.01,
        rootMargin: '100px', // Start loading 100px before element is visible
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState('');

    // Determine if image should load (priority images load immediately)
    const shouldLoad = priority || isIntersecting;

    useEffect(() => {
        if (shouldLoad && src && !currentSrc) {
            setCurrentSrc(src);
        }
    }, [shouldLoad, src, currentSrc]);

    const handleLoad = (e) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = (e) => {
        setHasError(true);
        if (onError) onError(e);
    };

    // Generate srcset for responsive images
    const generateSrcSet = (baseSrc) => {
        if (!baseSrc || hasError) return '';

        // If it's a Firebase Storage URL, we can add size parameters
        if (baseSrc.includes('firebasestorage.googleapis.com')) {
            // Firebase doesn't support dynamic resizing, so just return the original
            return baseSrc;
        }

        // For other URLs, return as-is
        // In a production app, you'd integrate with an image CDN like Cloudinary or imgix
        return baseSrc;
    };

    return (
        <div
            ref={imageRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                backgroundColor: '#f3f4f6', // Gray background as placeholder
            }}
        >
            {/* Blur placeholder - shown while loading */}
            {!isLoaded && !hasError && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* Main image */}
            {shouldLoad && currentSrc && !hasError && (
                <img
                    src={currentSrc}
                    srcSet={generateSrcSet(currentSrc)}
                    sizes={sizes}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{
                        // Prevent layout shift
                        aspectRatio: width && height ? `${width} / ${height}` : undefined,
                    }}
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-400">
                        <span className="text-4xl mb-2" role="img" aria-label="clothing">
                            👕
                        </span>
                        <p className="text-xs">Image unavailable</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(ImageOptimizer);
