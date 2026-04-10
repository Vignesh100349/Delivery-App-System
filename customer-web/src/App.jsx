import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, MapPin, Menu, X, LogIn, Leaf, Percent, HeartHandshake } from 'lucide-react';
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
          <Link to="/" className="brand" style={{ gap: '12px' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
              <Leaf color="#fff" size={24} />
            </div>
            Loopie
          </Link>

          <div style={{ flex: '1', maxWidth: '400px', margin: '0 20px', position: 'relative' }} className="nav-search-bar">
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search for fresh tomatoes, milk..." 
              style={{ width: '100%', padding: '12px 15px 12px 45px', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div className="nav-actions">
            <Link to="/cart" className="btn-icon-only" style={{ position: 'relative' }}>
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="badge">{cartItemsCount}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="btn-icon-only" style={{ background: 'var(--primary)', color: '#fff', border: 'none', boxShadow: '0 4px 15px var(--primary-glow)' }}>
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
    <footer style={{ marginTop: '80px', padding: '60px 0 40px', backgroundColor: '#fff', borderTop: '1px solid var(--border-light)' }}>
      <div className="app-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <Leaf size={32} />
            <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>Loopie</span>
          </div>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>
            Delivering the freshest groceries directly from Viswanatham to your doorstep in 10 minutes flat. Experience grocery shopping reimagined.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '25px 0' }}>
          <Link to="/privacy" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>Terms & Conditions</Link>
          <Link to="/refund" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>Refund Policy</Link>
          <Link to="/contact" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>Contact Us</Link>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '30px' }}>
          &copy; {new Date().getFullYear()} Loopie Delivery. Crafted for speed and freshness.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-container" style={{ minHeight: '65vh', paddingBottom: '40px' }}>
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
