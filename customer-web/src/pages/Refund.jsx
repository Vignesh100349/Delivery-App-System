import React from 'react';

function Refund() {
  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Refund & Cancellation Policy</h1>
      <p style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().toLocaleDateString()}</p>
      <div className="glass-card" style={styles.card}>
        <h3 style={{ color: 'var(--text-dark)', marginTop: '10px' }}>1. Cancellations</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>You may cancel an order free of charge before it is dispatched by our delivery partner. Once out for delivery, cancellations are not permitted.</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>2. Missing or Damaged Items</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>If an item is missing or damaged, our delivery partner will immediately mark it as missing at your doorstep. The exact value of that item will instantly be refunded back into your digital wallet or original payment source.</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>3. Bank Refund Timelines</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>For prepaid online orders, if a complete cancellation occurs, please allow 3-5 business days for the funds to reflect back in your bank account depending on your Bank's processing speed.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' },
  title: { marginBottom: '5px', color: 'var(--primary)' },
  card: { marginTop: '20px', padding: '30px' }
};

export default Refund;
