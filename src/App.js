import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/common/Layout';
import ScrollToTop from './utils/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';

// PERFORMANCE OPTIMIZATION: Lazy load all pages for code splitting
// This reduces initial bundle size significantly
const Home = lazy(() => import(/* webpackChunkName: "home" */ './pages/Home'));
const Products = lazy(() => import(/* webpackChunkName: "products" */ './pages/Products'));
const ProductDetail = lazy(() => import(/* webpackChunkName: "product-detail" */ './pages/ProductDetail'));
const ShopDetail = lazy(() => import(/* webpackChunkName: "shop-detail" */ './pages/ShopDetail'));
const Cart = lazy(() => import(/* webpackChunkName: "cart" */ './pages/Cart'));
const Checkout = lazy(() => import(/* webpackChunkName: "checkout" */ './pages/Checkout'));
const Orders = lazy(() => import(/* webpackChunkName: "orders" */ './pages/Orders'));
const OrderSuccess = lazy(() => import(/* webpackChunkName: "order-success" */ './pages/OrderSuccess'));
const OrderDetail = lazy(() => import(/* webpackChunkName: "order-detail" */ './pages/OrderDetail'));
const WriteReview = lazy(() => import(/* webpackChunkName: "write-review" */ './pages/WriteReview'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ './pages/Profile'));
const Login = lazy(() => import(/* webpackChunkName: "login" */ './pages/Login'));

// PERFORMANCE: Memoized Protected Route Component to prevent unnecessary re-renders
const ProtectedRoute = React.memo(({ children }) => {
  const token = localStorage.getItem('awm_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// PERFORMANCE: Optimized Loading Boundary Component
const SuspenseBoundary = React.memo(({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
));

SuspenseBoundary.displayName = 'SuspenseBoundary';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <Layout>
              <SuspenseBoundary>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/shop/:id" element={<ShopDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes - Each wrapped individually for better code splitting */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <Checkout />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <Orders />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderNumber"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <OrderDetail />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success/:orderNumber"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <OrderSuccess />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <Profile />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/write-review"
                    element={
                      <ProtectedRoute>
                        <SuspenseBoundary>
                          <WriteReview />
                        </SuspenseBoundary>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SuspenseBoundary>
            </Layout>

            {/* Toast Notifications - Optimized configuration */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '12px 20px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
              containerStyle={{
                top: 20,
              }}
              gutter={8}
            />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

// PERFORMANCE: Export memoized App to prevent unnecessary re-renders at root level
export default React.memo(App);