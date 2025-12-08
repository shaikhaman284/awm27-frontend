import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PromotedCarousel = ({ shops }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const intervalRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-rotate carousel
    useEffect(() => {
        if (!shops || shops.length === 0) return;

        const startRotation = () => {
            intervalRef.current = setInterval(() => {
                if (!isTransitioning && !isDragging) {
                    setCurrentIndex((prev) => (prev + 1) % shops.length);
                }
            }, 4000);
        };

        startRotation();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [shops, isTransitioning, isDragging]);

    if (!shops || shops.length === 0) return null;

    const nextSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % shops.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + shops.length) % shops.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const goToSlide = (index) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleShopClick = (shopId, index) => {
        if (index === currentIndex) {
            navigate(`/shop/${shopId}`);
        } else {
            goToSlide(index);
        }
    };

    // Mouse/Touch drag handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.pageX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            setIsDragging(false);
        }
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].pageX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (isTransitioning) return;

        if (e.deltaY > 0 || e.deltaX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    };

    // Get visible shops (current + prev + next)
    const getVisibleShops = () => {
        const prevIndex = (currentIndex - 1 + shops.length) % shops.length;
        const nextIndex = (currentIndex + 1) % shops.length;

        return [
            { shop: shops[prevIndex], index: prevIndex, position: 'left' },
            { shop: shops[currentIndex], index: currentIndex, position: 'center' },
            { shop: shops[nextIndex], index: nextIndex, position: 'right' }
        ];
    };

    const visibleShops = getVisibleShops();

    return (
        <div className="relative w-full h-full">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-2 z-30 pointer-events-none">
                <button
                    onClick={prevSlide}
                    disabled={isTransitioning}
                    className="pointer-events-auto p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 hover:bg-white hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    aria-label="Previous shop"
                >
                    <FiChevronLeft className="w-5 h-5 text-black" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={isTransitioning}
                    className="pointer-events-auto p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 hover:bg-white hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    aria-label="Next shop"
                >
                    <FiChevronRight className="w-5 h-5 text-black" />
                </button>
            </div>

            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="relative w-full flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing"
                style={{ height: '450px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                onWheel={handleWheel}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    {visibleShops.map(({ shop, index, position }) => {
                        const isCenter = position === 'center';
                        const isLeft = position === 'left';
                        const isRight = position === 'right';

                        return (
                            <div
                                key={`${shop.id}-${index}-${position}`}
                                className={`absolute transition-all duration-500 ease-out ${isDragging ? 'transition-none' : ''
                                    }`}
                                style={{
                                    width: isCenter ? '320px' : '260px',
                                    height: isCenter ? '420px' : '360px',
                                    transform: `translateX(${isLeft ? '-300px' : isRight ? '300px' : '0px'
                                        }) scale(${isCenter ? 1 : 0.85})`,
                                    opacity: isCenter ? 1 : 0.5,
                                    filter: isCenter ? 'blur(0px)' : 'blur(2px)',
                                    zIndex: isCenter ? 20 : 10,
                                }}
                                onClick={() => handleShopClick(shop.id, index)}
                            >
                                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-2xl group cursor-pointer">
                                    {/* Shop Image Background */}
                                    {shop.shop_image ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={shop.shop_image}
                                                alt={shop.shop_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading={isCenter ? "eager" : "lazy"}
                                                decoding="async"
                                                width="320"
                                                height="420"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                                            <FiShoppingBag className="w-20 h-20 text-gray-600 opacity-20" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col justify-end p-5">
                                        {isCenter && (
                                            <>
                                                <div className="mb-3">
                                                    <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
                                                        Featured
                                                    </div>
                                                    <h3 className="text-white font-bold text-xl md:text-2xl mb-1 line-clamp-2">
                                                        {shop.shop_name}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm mb-3 font-medium">
                                                        {shop.product_count} Products • {shop.city}
                                                    </p>
                                                </div>

                                                {/* Product Thumbnails */}
                                                {shop.featured_products && shop.featured_products.length > 0 && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center -space-x-2">
                                                            {shop.featured_products.slice(0, 3).map((product, pIdx) => (
                                                                <div
                                                                    key={product.id}
                                                                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg"
                                                                    style={{ zIndex: 3 - pIdx }}
                                                                >
                                                                    {product.image ? (
                                                                        <img
                                                                            src={product.image}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover"
                                                                            loading="lazy"
                                                                            decoding="async"
                                                                            width="32"
                                                                            height="32"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                                                            <FiShoppingBag className="w-4 h-4 text-gray-700" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {shop.featured_products.length > 3 && (
                                                            <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                                                +{shop.featured_products.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* View Shop Button */}
                                                <button className="flex items-center justify-center gap-2 text-white bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300 border border-white/20 shadow-lg">
                                                    <span>View Shop</span>
                                                    <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </button>
                                            </>
                                        )}

                                        {!isCenter && (
                                            <div className="text-center">
                                                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                                                    {shop.shop_name}
                                                </h3>
                                                <p className="text-gray-300 text-xs">
                                                    {shop.product_count} Products
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
                {shops.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        disabled={isTransitioning}
                        className={`transition-all duration-300 rounded-full ${idx === currentIndex
                            ? 'bg-black w-8 h-2.5'
                            : 'bg-gray-300 w-2.5 h-2.5 hover:bg-gray-500'
                            } disabled:cursor-not-allowed`}
                        aria-label={`Go to shop ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Scroll Hint */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-xs text-gray-500 animate-pulse">
                    ← Drag or scroll to explore →
                </p>
            </div>
        </div>
    );
};

export default PromotedCarousel;