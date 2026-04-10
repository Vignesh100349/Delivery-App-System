import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Package, Clock, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 15000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/customer/orders/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader-wrapper"><div className="spinner"></div></div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'var(--border-light)', padding: '24px', borderRadius: '50%', marginBottom: '20px' }}>
          <Package size={48} color="var(--text-muted)" />
        </div>
        <h2 style={{ color: 'var(--secondary)', fontSize: '28px', fontWeight: '800' }}>Login required</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>You must be logged in to view your past orders and receipts.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'var(--primary-light)', padding: '24px', borderRadius: '50%', marginBottom: '20px' }}>
          <Package size={48} color="var(--primary)" />
        </div>
        <h2 style={{ color: 'var(--secondary)', fontSize: '28px', fontWeight: '800' }}>No Orders Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Looks like you haven't bought anything from Loopie yet.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ margin: '40px 0 30px', fontSize: '32px', fontWeight: '900', color: 'var(--secondary)' }}>Your Orders</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.map(order => {
          let address = order.address;
          try {
             address = Object.values(JSON.parse(order.address)).filter(Boolean).join(', ');
          } catch(e) {}

          const isDelivered = order.status?.toLowerCase() === 'delivered';
          const isCancelled = order.status?.toLowerCase() === 'cancelled';
          const isPrepaid = (order.payment_status || 'unpaid').toLowerCase() === 'paid';

          return (
            <div key={order.id} className="glass-card" style={{ position: 'relative', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>
                    <Package size={22} color="var(--primary)" /> 
                    Order #{order.id}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ 
                    background: isDelivered ? 'var(--primary-light)' : (isCancelled ? 'rgba(239, 68, 68, 0.1)' : '#fef3c7'), 
                    color: isDelivered ? 'var(--primary)' : (isCancelled ? 'var(--danger)' : '#b45309'),
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isDelivered && <CheckCircle2 size={14} />}
                    {isCancelled && <XCircle size={14} />}
                    {order.status?.toUpperCase() || 'PENDING'}
                  </div>
                  <div>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>₹{order.total_amount}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Items Summary</h4>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: '500' }}>{item.quantity} × {item.name}</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--secondary)' }}>Delivery Directed To:</strong><br />
                {address}
              </div>

              {isPrepaid && !isDelivered && !isCancelled && (
                <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', display: 'block', fontSize: '16px' }}>🔐 Secure Delivery Pin</span>
                    <span style={{ fontSize: '12px', color: '#059669', marginTop: '2px', display: 'block' }}>Share this with your delivery partner</span>
                  </div>
                  <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '6px', color: '#064e3b', background: '#fff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>{order.delivery_otp || '1234'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;
