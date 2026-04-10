import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wallet, User as UserIcon, ShieldCheck } from 'lucide-react';

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
    <div style={{ maxWidth: '650px', margin: '40px auto 0' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', padding: '40px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(236, 253, 245, 0.9) 100%)' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 25px var(--primary-glow)' }}>
          <UserIcon size={48} color="#fff" />
        </div>
        <h2 style={{ marginBottom: '5px', fontSize: '28px', fontWeight: '900', color: 'var(--secondary)' }}>{user.name}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: '500' }}>+91 {user.phone}</p>
      </div>

      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderColor: 'rgba(16, 185, 129, 0.2)', marginBottom: '30px', padding: '35px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <Wallet size={24} color="var(--primary)" />
            </div>
            <h3 style={{ color: '#064e3b', fontSize: '22px', fontWeight: '800' }}>Loopie Wallet</h3>
            </div>
            <ShieldCheck size={28} color="#059669" opacity={0.5} />
        </div>
        <p style={{ color: '#047857', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6', fontWeight: '500' }}>
          Refunds for missing or returned deliveries are instantly sent here securely. Wallet balances are auto-applied on your next checkout.
        </p>
        <h1 style={{ fontSize: '48px', color: '#064e3b', fontWeight: '900', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '28px', color: '#10b981' }}>₹</span>{walletBalance}
        </h1>
      </div>

      <button 
        className="btn" 
        style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', padding: '18px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '16px', fontWeight: '700' }} 
        onClick={() => {
          logout();
          navigate('/');
        }}
      >
        <LogOut size={20} /> Secure Logout
      </button>
    </div>
  );
}

export default Profile;
