import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { X } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin ? { phone, password } : { name, phone, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      login(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <button className="btn-icon-only" style={{ padding: '8px', border: 'none', boxShadow: 'none' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              required 
              className="input-field" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          )}
          <input 
            required 
            className="input-field" 
            placeholder="Phone Number" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
          <input 
            required 
            type="password" 
            className="input-field" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
