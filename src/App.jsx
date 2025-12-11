import { Routes, Route } from 'react-router-dom';
import ToyMatDesigner from './components/ToyMatDesigner';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AccountSettings from './components/auth/AccountSettings';
import SavedMats from './components/mats/SavedMats';
import Cart from './components/cart/Cart';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Home page - no login required */}
        <Route path="/" element={<ToyMatDesigner />} />
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
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
