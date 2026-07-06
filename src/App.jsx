import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ToyMatDesigner from './components/ToyMatDesigner';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AccountSettings from './components/auth/AccountSettings';
import SavedMats from './components/mats/SavedMats';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import MapBackgroundExporter from './components/MapBackgroundExporter';
import { AppDialogProvider } from './contexts/AppDialogContext';
import './App.css';

const HashScroller = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const scrollToHash = () => {
      const target = document.querySelector(location.hash);
      if (!target) return;

      const headerOffset = 84;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    };

    const timeoutId = window.setTimeout(scrollToHash, 0);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash]);

  return null;
};

function App() {
  return (
    <AppDialogProvider>
      <HashScroller />
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Home page - no login required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<ToyMatDesigner />} />
        <Route path="/map-background-export" element={<MapBackgroundExporter />} />
        {/* Protected routes - require login */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-mats"
          element={
            <ProtectedRoute>
              <SavedMats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={<Cart />}
        />
        <Route
          path="/checkout"
          element={<Checkout />}
        />
      </Routes>
    </AppDialogProvider>
  );
}

export default App;
