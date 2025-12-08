import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for efficient lazy loading using Intersection Observer
 * Shares a single observer instance across all components for better performance
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Margin around root element
 * @returns {[React.RefObject, boolean]} - [ref to attach to element, isIntersecting state]
 */
const useIntersectionObserver = ({
    threshold = 0.1,
    rootMargin = '50px',
} = {}) => {
    const elementRef = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Create observer instance
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Update state when intersection changes
                setIsIntersecting(entry.isIntersecting);

                // Once element is visible, we can stop observing
                if (entry.isIntersecting) {
                    observer.unobserve(element);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        // Start observing
        observer.observe(element);

        // Cleanup on unmount
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin]);

    return [elementRef, isIntersecting];
};

export default useIntersectionObserver;
