import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Package, Clock, CheckCircle2, XCircle, FileClock, ChefHat, Bike, MapPin, Phone } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000); // 10s live tracking
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

  const getStatusStep = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'out for delivery') return 3;
    if (s === 'preparing') return 2;
    if (s === 'pending') return 1;
    return 0; // cancelled or unknown
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ margin: '40px 0 30px', fontSize: '32px', fontWeight: '900', color: 'var(--secondary)' }}>Your Orders & Tracking</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {orders.map(order => {
          let address = order.address;
          try {
             address = Object.values(JSON.parse(order.address)).filter(Boolean).join(', ');
          } catch(e) {}

          const currentStatus = (order.status || 'PENDING').toUpperCase();
          const step = getStatusStep(currentStatus);
          const isDelivered = currentStatus === 'DELIVERED';
          const isCancelled = currentStatus === 'CANCELLED';
          const isPrepaid = (order.payment_status || 'unpaid').toLowerCase() === 'paid';

          return (
            <div key={order.id} className="glass-card" style={{ position: 'relative', padding: '0', overflow: 'hidden' }}>
              
              <div style={{ padding: '24px', background: isDelivered ? '#fff' : (isCancelled ? '#fff' : '#f8fafc') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>
                        <Package size={22} color={isCancelled ? "var(--text-muted)" : "var(--primary)"} /> 
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
                        {currentStatus}
                      </div>
                      <div>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* LIVE TRACKING TIMELINE */}
                  {!isCancelled && !isDelivered && (
                    <div style={{ padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="var(--primary)" /> Live Tracking
                        </h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {/* Connecting Line */}
                            <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '3px', background: 'var(--border-light)', zIndex: 1 }}>
                                <div style={{ height: '100%', background: 'var(--primary)', width: step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%', transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                            
                            {/* Step 1: Placed */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : '#fff', border: step >= 1 ? 'none' : '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 1 ? '#fff' : 'var(--text-muted)', marginBottom: '8px', boxShadow: step >= 1 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none', transition: 'all 0.3s' }}>
                                    <FileClock size={18} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: step >= 1 ? 'var(--secondary)' : 'var(--text-muted)' }}>Placed</span>
                            </div>

                            {/* Step 2: Preparing */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : '#fff', border: step >= 2 ? 'none' : '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 2 ? '#fff' : 'var(--text-muted)', marginBottom: '8px', boxShadow: step >= 2 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none', transition: 'all 0.3s' }}>
                                    <ChefHat size={18} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: step >= 2 ? 'var(--secondary)' : 'var(--text-muted)' }}>Preparing</span>
                            </div>

                            {/* Step 3: Out for Delivery */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 3 ? 'var(--primary)' : '#fff', border: step >= 3 ? 'none' : '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 3 ? '#fff' : 'var(--text-muted)', marginBottom: '8px', boxShadow: step >= 3 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none', transition: 'all 0.3s' }}>
                                    <Bike size={18} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: step >= 3 ? 'var(--secondary)' : 'var(--text-muted)' }}>Out</span>
                            </div>

                            {/* Step 4: Delivered */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '25%' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 4 ? 'var(--primary)' : '#fff', border: step >= 4 ? 'none' : '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 4 ? '#fff' : 'var(--text-muted)', marginBottom: '8px', transition: 'all 0.3s' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: step >= 4 ? 'var(--secondary)' : 'var(--text-muted)' }}>Done</span>
                            </div>
                        </div>

                        {step === 3 && order.rider_name && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border-light)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bike size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rider Assigned</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{order.rider_name}</div>
                                    </div>
                                </div>
                                <a href={`tel:${order.rider_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', padding: '8px 16px', borderRadius: '20px', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                                    <Phone size={14} /> Call
                                </a>
                            </div>
                        )}
                    </div>
                  )}

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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;
