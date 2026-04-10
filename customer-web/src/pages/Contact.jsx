import React from 'react';
import { Mail, Phone, MapPin, Building2, HelpCircle } from 'lucide-react';

function Contact() {
  return (
    <div className="app-container" style={{ maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '15px', color: 'var(--secondary)', fontSize: '36px', fontWeight: '900' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>We are always here to help you out.</p>
      </div>
      
      <div className="glass-card" style={{ padding: '40px', background: '#fff' }}>
        <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Building2 size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>Business Name</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Loopie Retail Shop</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Mail size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>Email Address</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>support@loopiedelivery.com</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Phone size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>Phone Number</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>+91 99999 00000</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                    <MapPin size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>Physical Address</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Near Viswanatham Rotary<br/>Tamil Nadu, India.</p>
                </div>
            </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px dashed var(--border-light)', display: 'flex', gap: '15px', alignItems: 'flex-start', background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
            <HelpCircle size={32} color="var(--primary)" />
            <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>Support Grievances</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '15px' }}>
                    For any grievances or support issues with your grocery orders, please contact our support team at the email listed above. Our standard reply priority timeline is 24 hours.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
