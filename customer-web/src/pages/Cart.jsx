import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import { Minus, Plus, Trash2, MapPin, Receipt, ShieldCheck, CreditCard, Banknote, Wallet } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function Cart() {
    const { cart, cartTotal, addToCart, decrementQuantity, removeFromCart, user, deliveryAddressDetails, updateDeliveryAddress, clearCart } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    const total = cartTotal();
    const deliveryFee = total > 0 ? 15 : 0; 
    const grandTotal = total + parseInt(deliveryFee);

    const handleCheckout = async () => {
        if (!user?.id) {
            alert("Please login first!");
            return;
        }
        if (!deliveryAddressDetails.doorNo || !deliveryAddressDetails.street) {
            alert("Please provide complete delivery details.");
            return;
        }

        setLoading(true);
        try {
            const orderPayload = {
                user_id: user.id,
                address: JSON.stringify(deliveryAddressDetails),
                payment_method: paymentMethod,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            const res = await axios.post(`${API_URL}/order`, orderPayload);

            if (paymentMethod === 'online') {
                const loadRazorpayScript = () => new Promise(resolve => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
                
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    alert('Razorpay SDK failed to load. Are you offline?');
                    setLoading(false);
                    return;
                }

                const rzRes = await axios.post(`${API_URL}/create-razorpay-order`, {
                    amount: grandTotal,
                    orderId: res.data.orderId
                });
                
                const options = {
                    key: 'rzp_live_SbsaLniHNb908C', 
                    amount: rzRes.data.amount,
                    currency: "INR",
                    name: "Loopie Delivery",
                    description: "Order Payment",
                    order_id: rzRes.data.id,
                    handler: async function (response) {
                        try {
                            await axios.post(`${API_URL}/verify-razorpay-payment`, {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: res.data.orderId
                            });
                            clearCart();
                            navigate('/orders');
                        } catch (e) {
                            alert("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: user?.name,
                        contact: user?.phone || "9999999999"
                    },
                    theme: { color: "#059669" }
                };
                
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert(`Payment Failed: ${response.error.description}`);
                });
                rzp.open();
                return;
            } else {
                clearCart();
                navigate('/orders');
            }
        } catch (err) {
            alert(`Checkout Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-light)', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
                    <Receipt size={64} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--secondary)' }}>Your cart is empty</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '18px' }}>Looks like you haven't added anything yet.</p>
                <button className="btn btn-primary" style={{ marginTop: '30px', padding: '16px 32px' }} onClick={() => navigate('/')}>
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '40px', marginTop: '40px' }} className="cart-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px', color: 'var(--secondary)' }}>Review Items</h2>
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>{item.name}</h4>
                                    <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>₹{item.price}</span> 
                                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> / item</span>
                                </div>
                                <div className="cart-controls" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-light)' }}>
                                    <button className="btn-icon-only" style={{ padding: '8px', border: 'none', boxShadow: 'none' }} onClick={() => decrementQuantity(item.id)}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: '800', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button className="btn-icon-only" style={{ padding: '8px', border: 'none', boxShadow: 'none' }} onClick={() => addToCart(item)}>
                                        <Plus size={16} color="var(--primary)" />
                                    </button>
                                </div>
                                <button className="btn-icon-only" style={{ background: 'transparent', border: 'none', color: 'var(--danger)', boxShadow: 'none' }} onClick={() => removeFromCart(item.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '10px 0 20px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={24} color="var(--primary)" /> Delivery Details
                    </h2>
                    <div className="glass-card" style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Door / Flat No</label>
                            <input className="input-field" placeholder="E.g. 101, A Block" value={deliveryAddressDetails.doorNo} onChange={e => updateDeliveryAddress({doorNo: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Street Name / Landmark</label>
                            <input className="input-field" placeholder="E.g. Gandhi Road, Near Post Office" value={deliveryAddressDetails.street} onChange={e => updateDeliveryAddress({street: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Area / Locality</label>
                            <input className="input-field" value={deliveryAddressDetails.area} onChange={e => updateDeliveryAddress({area: e.target.value})} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Pincode</label>
                            <input className="input-field" value={deliveryAddressDetails.pincode} onChange={e => updateDeliveryAddress({pincode: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="glass-card" style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                        <Receipt size={22} color="var(--primary)" /> Bill Summary
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-muted)', fontSize: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Item Total</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Handling Charge</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹0</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Delivery Fee <ShieldCheck size={14} color="var(--primary)" /></span>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{deliveryFee}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '2px dashed var(--border-light)', fontSize: '24px', fontWeight: '900', color: 'var(--secondary)' }}>
                        <span>To Pay</span>
                        <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                    </div>

                    <div style={{ marginTop: '5px' }}>
                        <label style={{ display: 'block', marginBottom: '15px', fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>Payment Method</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Online / Razorpay */}
                            <div 
                                onClick={() => setPaymentMethod('online')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', border: paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: paymentMethod === 'online' ? 'var(--primary-light)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: paymentMethod === 'online' ? '#fff' : '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
                                        <CreditCard size={20} color={paymentMethod === 'online' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '15px' }}>Pay Online (UPI / Card)</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Razorpay Secure Checkout</div>
                                    </div>
                                </div>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'online' ? '6px solid var(--primary)' : '2px solid var(--border-light)' }}></div>
                            </div>

                            {/* Wallet */}
                            <div 
                                onClick={() => setPaymentMethod('wallet')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', border: paymentMethod === 'wallet' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: paymentMethod === 'wallet' ? 'var(--primary-light)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: paymentMethod === 'wallet' ? '#fff' : '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
                                        <Wallet size={20} color={paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '15px' }}>Digital Wallet</div>
                                </div>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'wallet' ? '6px solid var(--primary)' : '2px solid var(--border-light)' }}></div>
                            </div>

                            {/* COD */}
                            <div 
                                onClick={() => setPaymentMethod('cash')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', border: paymentMethod === 'cash' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: paymentMethod === 'cash' ? 'var(--primary-light)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: paymentMethod === 'cash' ? '#fff' : '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
                                        <Banknote size={20} color={paymentMethod === 'cash' ? 'var(--primary)' : 'var(--text-muted)'} />
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '15px' }}>Cash on Delivery</div>
                                </div>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'cash' ? '6px solid var(--primary)' : '2px solid var(--border-light)' }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', fontSize: '18px', padding: '18px', borderRadius: '16px', boxShadow: '0 10px 25px var(--primary-glow)' }} 
                            onClick={handleCheckout} 
                            disabled={loading}
                        >
                            {loading ? 'Processing Securely...' : `Pay ₹${grandTotal} Securely`}
                        </button>
                    </div>
                    {!user && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>
                                You must be logged in to securely place an order. Please use the login icon at the top.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx="true">{`
                @media (max-width: 900px) {
                    .cart-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export default Cart;
