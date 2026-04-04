import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, MapPin, Menu, X, LogIn } from 'lucide-react';
import { useStore } from './store';

import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';

const API_URL = 'https://delivery-app-system.onrender.com';

function Navbar() {
  const { cart, isAuthenticated, user } = useStore();
  const [authModal, setAuthModal] = useState(false);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="navbar">
        <div className="app-container nav-content">
          <Link to="/" className="brand">
            <ShoppingBag color="#0c831f" size={28} />
            Loopie
          </Link>

          <div className="nav-actions">
            <button className="btn-icon-only">
              <Search size={20} />
            </button>
            <Link to="/cart" className="btn-icon-only" style={{ position: 'relative' }}>
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="badge">{cartItemsCount}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="btn-icon-only" style={{ background: '#0c831f', color: '#fff', border: 'none' }}>
                <User size={20} />
              </Link>
            ) : (
              <button className="btn btn-primary" onClick={() => setAuthModal(true)}>
                <LogIn size={18} /> Login
              </button>
            )}
          </div>
        </div>
      </nav>
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
