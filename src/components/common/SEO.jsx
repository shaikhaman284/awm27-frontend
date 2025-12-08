import React, { useEffect, useState } from 'react';

// PERFORMANCE: Lazy load Helmet to reduce initial bundle
let Helmet = null;

const SEO = ({
    title = 'Amravati Wears Market',
    description = 'Amravati Wears Market - Your local clothing marketplace. Shop from trusted Amravati stores with home delivery, COD available.',
    keywords = 'amravati, clothing, marketplace, local stores, fashion, online shopping, COD, cash on delivery',
    image = 'https://awm27.shop/logo192.png',
    url = 'https://awm27.shop',
    type = 'website',
    noindex = false,
    structuredData = null,
}) => {
    const [isHelmetLoaded, setIsHelmetLoaded] = useState(false);
    const siteTitle = 'Amravati Wears Market';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

    useEffect(() => {
        // Load Helmet after component mounts (non-blocking)
        if (!Helmet) {
            import('react-helmet-async').then((module) => {
                Helmet = module.Helmet;
                setIsHelmetLoaded(true);
            });
        } else {
            setIsHelmetLoaded(true);
        }
    }, []);

    // Return null until Helmet is loaded (prevents blocking)
    if (!isHelmetLoaded || !Helmet) {
        return null;
    }

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Additional Meta Tags */}
            <meta name="author" content="Amravati Wears Market" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
