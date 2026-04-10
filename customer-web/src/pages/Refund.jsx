import React from 'react';
import { ShieldCheck } from 'lucide-react';

function Refund() {
  return (
    <div className="app-container" style={{ maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <ShieldCheck size={40} color="var(--primary)" />
          <div>
            <h1 style={{ color: 'var(--secondary)', fontSize: '36px', fontWeight: '900' }}>Refund & Cancellation Policy</h1>
            <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600' }}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
      </div>
      
      <div className="glass-card" style={{ padding: '40px', background: '#fff' }}>
        <h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>1. Cancellations</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>You may cancel an order free of charge before it is dispatched by our delivery partner. Once out for delivery, cancellations are not permitted.</p>
        
        <br/><h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>2. Missing or Damaged Items</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>If an item is missing or damaged, our delivery partner will immediately mark it as missing at your doorstep. The exact value of that item will instantly be refunded back into your digital wallet or original payment source.</p>
        
        <br/><h3 style={{ color: 'var(--secondary)', marginTop: '10px', fontSize: '20px', fontWeight: '800' }}>3. Bank Refund Timelines</h3>
        <p style={{ lineHeight: '1.8', marginTop: '10px', color: 'var(--text-muted)' }}>For prepaid online orders, if a complete cancellation occurs, please allow 3-5 business days for the funds to reflect back in your bank account depending on your Bank's processing speed.</p>
      </div>
    </div>
  );
}

export default Refund;
