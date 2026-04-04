import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Package, Clock } from 'lucide-react';

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
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Login required</h2>
        <p>You must be logged in to view your orders.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>No Orders Found</h2>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: '30px 0 20px' }}>Your Order History</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => {
          let address = order.address;
          try {
             address = Object.values(JSON.parse(order.address)).filter(Boolean).join(', ');
          } catch(e) {}

          const isDelivered = order.status?.toLowerCase() === 'delivered';
          const isCancelled = order.status?.toLowerCase() === 'cancelled';
          const isPrepaid = (order.payment_status || 'unpaid').toLowerCase() === 'paid';

          return (
            <div key={order.id} className="glass-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={20} color="var(--primary)" /> 
                    Order #{order.id}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/>
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    background: isDelivered ? 'var(--primary-light)' : (isCancelled ? '#fee2e2' : '#fef3c7'), 
                    color: isDelivered ? 'var(--primary)' : (isCancelled ? 'var(--danger)' : '#b45309'),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '5px'
                  }}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </div>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{order.total_amount}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid var(--border-light)' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{item.quantity} × {item.name}</span>
                    <span style={{ fontWeight: '500' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>Delivery Address:</strong><br />
                {address}
              </div>

              {isPrepaid && !isDelivered && !isCancelled && (
                <div style={{ marginTop: '15px', background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>🔐 Secret OTP: </span>
                  <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '4px', color: '#166534' }}>{order.delivery_otp || '1234'}</span>
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
