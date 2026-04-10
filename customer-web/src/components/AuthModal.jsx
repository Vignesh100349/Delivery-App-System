import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { X, Mail, Lock, Phone as PhoneIcon, User as UserIcon } from 'lucide-react';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary)' }}>
              {isLogin ? 'Welcome Back' : 'Join Loopie'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
              {isLogin ? 'Login to continue shopping' : 'Create an account to order fresh groceries'}
            </p>
          </div>
          <button className="btn-icon-only" style={{ padding: '10px', alignSelf: 'flex-start', background: 'transparent', boxShadow: 'none', border: '1px solid var(--border-light)' }} onClick={onClose}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                className="input-field" 
                style={{ paddingLeft: '45px' }}
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <PhoneIcon size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              required 
              className="input-field" 
              style={{ paddingLeft: '45px' }}
              placeholder="Phone Number" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              required 
              type="password" 
              className="input-field" 
              style={{ paddingLeft: '45px' }}
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', fontSize: '16px', width: '100%', padding: '16px' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }} 
            onClick={() => setIsLogin(!isLogin)}
            onMouseOver={e => e.target.style.color = '#059669'}
            onMouseOut={e => e.target.style.color = 'var(--primary)'}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
