import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, MapPin, Menu, X, LogIn } from 'lucide-react';
import { useStore } from './store';

import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Contact from './pages/Contact';

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

function Footer() {
  return (
    <footer style={{ marginTop: '60px', padding: '40px 0', borderTop: '1px solid var(--border-light)', backgroundColor: '#fff' }}>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Terms & Conditions</Link>
          <Link to="/refund" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Cancellation & Refund</Link>
          <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link>
        </div>
        <p style={{ color: '#aaa', fontSize: '12px' }}>&copy; {new Date().getFullYear()} Loopie Grocery. All rights reserved.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-container" style={{ minHeight: '60vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
