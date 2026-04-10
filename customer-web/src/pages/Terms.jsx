import React from 'react';
import { ShieldCheck } from 'lucide-react';

function Terms() {
  return (
    <div className="app-container" style={{ maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <ShieldCheck size={40} color="var(--primary)" />
          <div>
            <h1 style={{ color: 'var(--secondary)', fontSize: '36px', fontWeight: '900' }}>Terms & Conditions</h1>
            <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600' }}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
      </div>
      
      <div className="glass-card" style={{ padding: '40px', background: '#fff' }}>
        <h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>1. Agreement to Terms</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>By accessing our application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.</p>
        
        <br/><h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>2. Grocery Deliveries & Timings</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>Our commitment to fast delivery is subject to traffic conditions, weather, and operational constraints within the Viswanatham service zone. We reserve the right to cancel orders if the location is completely inaccessible.</p>
        
        <br/><h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>3. Pricing & Cart Limitations</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>Product prices are dynamic and may change based on daily market value. Users are not permitted to use bots or automated systems to exploit pricing algorithms.</p>
      </div>
    </div>
  );
}

export default Terms;
