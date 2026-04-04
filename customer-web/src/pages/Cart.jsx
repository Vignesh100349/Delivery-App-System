import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import { Minus, Plus, Trash2, MapPin } from 'lucide-react';

const API_URL = 'https://delivery-app-system.onrender.com';

function Cart() {
    const { cart, cartTotal, addToCart, decrementQuantity, removeFromCart, user, deliveryAddressDetails, updateDeliveryAddress, clearCart } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const total = cartTotal();
    const deliveryFee = total > 0 ? 15 : 0; // Simple flat fee for web mapless
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
            alert(`Order #${res.data.orderId} Placed successfully!`);
            clearCart();
            navigate('/orders');
        } catch (err) {
            alert(`Checkout Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2 style={{ color: 'var(--text-muted)' }}>Your cart is empty</h2>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '30px', marginTop: '30px' }}>
            <div>
                <h2 style={{ marginBottom: '20px' }}>Shopping Cart</h2>
                <div className="glass-card" style={{ padding: '0' }}>
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                            <div style={{ flex: 1 }}>
                                <h4>{item.name}</h4>
                                <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                            </div>
                            <div className="cart-controls">
                                <button className="btn-icon-only" style={{ padding: '5px' }} onClick={() => decrementQuantity(item.id)}>
                                    <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                <button className="btn-icon-only" style={{ padding: '5px' }} onClick={() => addToCart(item)}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            <button className="btn-icon-only" style={{ color: 'var(--danger)', marginLeft: '10px' }} onClick={() => removeFromCart(item.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <h2 style={{ margin: '30px 0 20px' }}>Delivery Address</h2>
                <div className="glass-card" style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                    <input className="input-field" placeholder="Door No" value={deliveryAddressDetails.doorNo} onChange={e => updateDeliveryAddress({doorNo: e.target.value})} />
                    <input className="input-field" placeholder="Street Name" value={deliveryAddressDetails.street} onChange={e => updateDeliveryAddress({street: e.target.value})} />
                    <input className="input-field" placeholder="Area / Locality" style={{ gridColumn: '1 / -1' }} value={deliveryAddressDetails.area} onChange={e => updateDeliveryAddress({area: e.target.value})} />
                    <input className="input-field" placeholder="Taluk" value={deliveryAddressDetails.taluk} onChange={e => updateDeliveryAddress({taluk: e.target.value})} />
                    <input className="input-field" placeholder="District" value={deliveryAddressDetails.district} onChange={e => updateDeliveryAddress({district: e.target.value})} />
                    <input className="input-field" placeholder="Pincode" value={deliveryAddressDetails.pincode} onChange={e => updateDeliveryAddress({pincode: e.target.value})} />
                </div>
            </div>

            <div>
                <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Bill Details</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                        <span>Item Total</span>
                        <span>₹{total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)' }}>
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', paddingTop: '15px', borderTop: '1px dashed var(--border-light)', fontSize: '20px', fontWeight: 'bold' }}>
                        <span>To Pay</span>
                        <span>₹{grandTotal}</span>
                    </div>

                    <h4 style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>Payment Method</h4>
                    <select 
                        className="input-field" 
                        style={{ marginBottom: '20px' }}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="cash">Cash on Delivery</option>
                        <option value="wallet">Digital Wallet</option>
                        <option value="online">Online Payment (UPI/Card)</option>
                    </select>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', fontSize: '18px' }} 
                        onClick={handleCheckout} 
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                    {!user && <p style={{ color: 'var(--danger)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>Please login via the top right corner to checkout.</p>}
                </div>
            </div>
        </div>
    );
}

export default Cart;
