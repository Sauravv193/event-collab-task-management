import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';

import AuthLayout from './components/layouts/AuthLayout';
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardSkeleton } from './components/ui/SkeletonLoader';
import Loader from './components/ui/Loader';

// Lazy load page components
const MyEvents = lazy(() => import('./pages/MyEvents'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for different route types
const RouteLoader = ({ type = 'default' }) => {
  switch (type) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'auth':
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      );
    default:
      return (
        <div className="container mx-auto p-6">
          <Loader />
        </div>
      );
  }
};

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AuthLayout />}>
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<RouteLoader type="auth" />}>
                <Login />
              </Suspense>
            } 
          />
        </Route>
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<RouteLoader type="dashboard" />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/my-events" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <MyEvents />
              </Suspense>
            } 
          />
          <Route 
            path="/event/:id" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <EventDetails />
              </Suspense>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <CalendarView />
              </Suspense>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <Profile />
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
        </Route>

        <Route 
          path="*" 
          element={
            <Suspense fallback={<RouteLoader />}>
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;