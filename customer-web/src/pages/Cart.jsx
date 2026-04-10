import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Minus, Plus, Trash2, Receipt, ShieldCheck, ArrowRight } from 'lucide-react';

function Cart() {
    const { cart, cartTotal, addToCart, decrementQuantity, removeFromCart, user } = useStore();
    const navigate = useNavigate();

    const total = cartTotal();
    const deliveryFee = 0; // Temporarily set to 0 as requested
    const grandTotal = total + parseInt(deliveryFee);

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
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px', color: 'var(--secondary)' }}>Shopping Cart</h2>
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
            </div>

            <div>
                <div className="glass-card" style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                        <Receipt size={22} color="var(--primary)" /> Cart Summary
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
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Estimated Delivery <ShieldCheck size={14} color="var(--primary)" /></span>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{deliveryFee}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '2px dashed var(--border-light)', fontSize: '24px', fontWeight: '900', color: 'var(--secondary)' }}>
                        <span>Subtotal</span>
                        <span style={{ color: 'var(--primary)' }}>₹{grandTotal}</span>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', fontSize: '18px', padding: '18px', borderRadius: '16px', boxShadow: '0 10px 25px var(--primary-glow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
                            onClick={() => {
                                if (!user) {
                                  alert("Please login first to proceed to checkout!");
                                  return;
                                }
                                navigate('/checkout')
                            }} 
                        >
                            Proceed to Checkout <ArrowRight size={20} />
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
