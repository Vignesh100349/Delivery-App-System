import React from 'react';

function Terms() {
  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Terms & Conditions</h1>
      <p style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().toLocaleDateString()}</p>
      <div className="glass-card" style={styles.card}>
        <h3 style={{ color: 'var(--text-dark)', marginTop: '10px' }}>1. Agreement to Terms</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>By accessing our application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>2. Grocery Deliveries & Timings</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>Our commitment to fast delivery is subject to traffic conditions, weather, and operational constraints within the Viswanatham service zone. We reserve the right to cancel orders if the location is completely inaccessible.</p>
        
        <br/><h3 style={{ color: 'var(--text-dark)' }}>3. Pricing & Cart Limitations</h3>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}>Product prices are dynamic and may change based on daily market value. Users are not permitted to use bots or automated systems to exploit pricing algorithms.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' },
  title: { marginBottom: '5px', color: 'var(--primary)' },
  card: { marginTop: '20px', padding: '30px' }
};

export default Terms;
