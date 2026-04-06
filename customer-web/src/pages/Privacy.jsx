import React from 'react';

function Privacy() {
  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().toLocaleDateString()}</p>
      <div className="glass-card" style={styles.card}>
        <h3 style={{ color: 'var(--text-dark)', marginTop: '10px' }}>1. Information We Collect</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>We only collect information essential for delivering grocery orders securely to your address. This includes your name, phone number, and delivery address. We do not store any sensitive bank or credit card details on our servers.</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>2. How We Use Your Information</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>Your information is used strictly to fulfill your orders, provide customer support, and initiate secure payment processing through our authorized payment gateways (like PhonePe).</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>3. Data Security</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>We deploy industry-standard encryption to protect your data. Your delivery location and order history is kept entirely confidential and is never sold to third parties.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' },
  title: { marginBottom: '5px', color: 'var(--primary)' },
  card: { marginTop: '20px', padding: '30px' }
};

export default Privacy;
