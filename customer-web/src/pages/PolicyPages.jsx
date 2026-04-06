import React from 'react';

export const PrivacyPolicy = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>Privacy Policy</h1>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <div style={styles.card}>
      <h3>1. Information We Collect</h3>
      <p>We only collect information essential for delivering grocery orders securely to your address. This includes your name, phone number, and delivery address. We do not store any sensitive bank or credit card details on our servers.</p>
      
      <br/><h3>2. How We Use Your Information</h3>
      <p>Your information is used strictly to fulfill your orders, provide customer support, and initiate secure payment processing through our authorized payment gateways (like PhonePe).</p>
      
      <br/><h3>3. Data Security</h3>
      <p>We deploy industry-standard encryption to protect your data. Your delivery location and order history is kept entirely confidential and is never sold to third parties.</p>
    </div>
  </div>
);

export const TermsConditions = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>Terms & Conditions</h1>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <div style={styles.card}>
      <h3>1. Agreement to Terms</h3>
      <p>By accessing our application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.</p>
      
      <br/><h3>2. Grocery Deliveries & Timings</h3>
      <p>Our commitment to 10-minute delivery is subject to traffic conditions, weather, and operational constraints within the Viswanatham service zone. We reserve the right to cancel orders if the location is completely inaccessible.</p>
      
      <br/><h3>3. Pricing & Cart Limitations</h3>
      <p>Product prices are dynamic and may change based on daily market value. Users are not permitted to use bots or automated systems to exploit pricing algorithms.</p>
    </div>
  </div>
);

export const RefundPolicy = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>Refund & Cancellation Policy</h1>
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <div style={styles.card}>
      <h3>1. Cancellations</h3>
      <p>You may cancel an order free of charge before it is dispatched by our delivery partner. Once out for delivery, cancellations are not permitted.</p>
      
      <br/><h3>2. Missing or Damaged Items</h3>
      <p>If an item is missing or damaged, our delivery partner will immediately mark it as missing at your doorstep. The exact value of that item will instantly be refunded back into your digital wallet or original payment source.</p>
      
      <br/><h3>3. Bank Refund Timelines</h3>
      <p>For prepaid online orders, if a complete cancellation occurs, please allow 3-5 business days for the funds to reflect back in your bank account depending on your Bank's processing speed.</p>
    </div>
  </div>
);

export const ContactUs = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>Contact Us</h1>
    <p>We are here to help!</p>
    <div style={styles.card}>
      <p><strong>Business Name:</strong> Loopie Retail Shop (Viswanatham)</p>
      <p><strong>Email address:</strong> support@loopiedelivery.com</p>
      <p><strong>Phone Number:</strong> +91 99999 00000</p>
      <p><strong>Physical Address:</strong> Near Viswanatham Rotary School, Tamil Nadu, India.</p>
      <p><br/>For any grievances or support issues with your grocery orders, please contact our support team at the email listed above. Our standard reply timeline is 24 hours.</p>
    </div>
  </div>
);

const styles = {
  container: { maxWidth: '800px', margin: '40px auto 0', padding: '0 20px', lineHeight: '1.6' },
  title: { marginBottom: '10px', color: 'var(--primary)' },
  card: { background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: 'var(--shadow-sm)', marginTop: '20px', border: '1px solid var(--border-light)' }
};
