import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wallet, User as UserIcon } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function Profile() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState('0.00');

  useEffect(() => {
    if (!user?.id) {
       navigate('/');
       return;
    }
    
    axios.get(`${API_URL}/users/${user.id}`)
      .then(r => setWalletBalance(Number(r.data.wallet_balance || 0).toFixed(2)))
      .catch(console.error);
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
          <UserIcon size={40} color="#fff" />
        </div>
        <h2 style={{ marginBottom: '5px' }}>{user.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{user.phone}</p>
      </div>

      <div className="glass-card" style={{ background: 'var(--primary-light)', borderColor: '#bbf7d0', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Wallet size={24} color="var(--primary)" />
          <h3 style={{ color: '#166534' }}>Digital Wallet</h3>
        </div>
        <p style={{ color: '#15803d', fontSize: '14px', marginBottom: '15px' }}>
          Refunds for missing deliveries are instantly sent here securely.
        </p>
        <h1 style={{ fontSize: '36px', color: 'var(--primary)', fontWeight: '900' }}>₹{walletBalance}</h1>
      </div>

      <button 
        className="btn" 
        style={{ width: '100%', background: '#ffe5e5', color: 'var(--danger)', padding: '16px' }} 
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}

export default Profile;
