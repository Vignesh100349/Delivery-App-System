import React from 'react';

function Contact() {
  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Contact Us</h1>
      <p style={{ color: 'var(--text-muted)' }}>We are here to help!</p>
      <div className="glass-card" style={styles.card}>
        <p style={{ lineHeight: '1.6', marginTop: '10px' }}><strong>Business Name:</strong> Loopie Retail Shop (Viswanatham)</p>
        <p style={{ lineHeight: '1.6' }}><strong>Email address:</strong> support@loopiedelivery.com</p>
        <p style={{ lineHeight: '1.6' }}><strong>Phone Number:</strong> +91 99999 00000</p>
        <p style={{ lineHeight: '1.6' }}><strong>Physical Address:</strong> Near Viswanatham Rotary School, Tamil Nadu, India.</p>
        <p style={{ lineHeight: '1.6', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border-light)' }}>
          For any grievances or support issues with your grocery orders, please contact our support team at the email listed above. Our standard reply timeline is 24 hours.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' },
  title: { marginBottom: '5px', color: 'var(--primary)' },
  card: { marginTop: '20px', padding: '30px' }
};

export default Contact;
