import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Enable Fast Refresh for better development experience
            fastRefresh: true,
            // Babel configuration for production optimizations
            babel: {
                plugins: [
                    // Remove console.log in production
                    process.env.NODE_ENV === 'production' && [
                        'transform-remove-console',
                        { exclude: ['error', 'warn'] },
                    ],
                ].filter(Boolean),
            },
        }),

        // Gzip compression for production builds
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024, // Only compress files larger than 1KB
            deleteOriginFile: false,
        }),

        // Brotli compression for modern browsers
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
            deleteOriginFile: false,
        }),

        // Bundle analyzer - generates stats.html to visualize bundle size
        visualizer({
            filename: './dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ],

    // Build optimizations
    build: {
        // Target modern browsers for smaller bundles
        target: 'es2015',

        // Reduce chunk size warnings threshold
        chunkSizeWarningLimit: 600,

        // Minification options
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true,
                pure_funcs: ['console.log'], // Remove specific function calls
            },
            format: {
                comments: false, // Remove all comments
            },
        },

        // Rollup options for advanced code splitting
        rollupOptions: {
            output: {
                // Manual chunks for better caching
                manualChunks: {
                    // Vendor chunks - rarely change, better caching
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'firebase-vendor': ['firebase/app', 'firebase/auth'],
                    'ui-vendor': ['react-hot-toast', 'react-helmet-async'],
                    'icons': ['react-icons/fi'],
                },

                // Optimize asset file names for better caching
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];

                    // Organize assets by type
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                        return `assets/images/[name]-[hash][extname]`;
                    } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
                        return `assets/fonts/[name]-[hash][extname]`;
                    }
                    return `assets/[name]-[hash][extname]`;
                },

                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },

        // Source maps for production debugging (optional)
        sourcemap: false, // Set to true if you need source maps

        // CSS code splitting
        cssCodeSplit: true,

        // Report compressed size
        reportCompressedSize: true,

        // Optimize CSS
        cssMinify: true,
    },

    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'react-hot-toast',
            'react-helmet-async',
            'react-icons/fi',
        ],
        exclude: [],
    },

    // Server configuration for development
    server: {
        port: 3000,
        strictPort: false,
        host: true,
        open: true,

        // HMR optimization
        hmr: {
            overlay: true,
        },
    },

    // Preview server configuration
    preview: {
        port: 3000,
        strictPort: false,
        host: true,
        open: true,
    },

    // Define global constants
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    // ESBuild options
    esbuild: {
        // Remove console and debugger in production
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        // Tree shaking
        treeShaking: true,
    },
});