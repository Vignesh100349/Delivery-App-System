import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Plus, Minus, ShoppingCart, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'https://delivery-app-system.onrender.com';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cart, addToCart, decrementQuantity } = useStore();

    useEffect(() => {
        axios.get(`${API_URL}/products`)
            .then(res => setProducts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getQuantity = (id) => cart.find(i => i.id === id)?.quantity || 0;

    if (loading) {
        return (
            <div className="loader-wrapper">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Premium Hero Section */}
            <div className="hero">
                <div className="hero-content">
                    <h1>Fast <span>Grocery Delivery</span> in 10 Minutes</h1>
                    <p>Get fresh produce, daily essentials, and more delivered straight to your door from Viswanatham with uncompromising quality and speed.</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="btn btn-primary" onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}>
                            Shop Now <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Badges */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
                <div className="glass-card" style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>10-Min Delivery</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lightning fast</p>
                    </div>
                </div>
                <div className="glass-card" style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>100% Quality</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Freshness guaranteed</p>
                    </div>
                </div>
                <div className="glass-card" style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Best Prices</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Super savings</p>
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '50px', fontSize: '28px', fontWeight: '800' }}>Trending Near You</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>The freshest picks of the day.</p>

            <div className="products-grid">
                {products.map(product => {
                    const qty = getQuantity(product.id);
                    return (
                        <div key={product.id} className="glass-card product-card">
                            <div style={{ position: 'relative' }}>
                                <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="product-img" />
                                {product.original_price && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--danger)', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px' }}>
                                        Sale
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="product-title">{product.name}</h3>
                            <div className="product-price">
                                ₹{product.price}
                                {product.original_price && <span className="product-original">₹{product.original_price}</span>}
                            </div>
                            
                            {qty === 0 ? (
                                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => addToCart(product)}>
                                    <ShoppingCart size={18} /> Add to Bag
                                </button>
                            ) : (
                                <div className="cart-controls" style={{ justifyContent: 'space-between', width: '100%', background: 'var(--primary)', color: '#fff' }}>
                                    <button onClick={() => decrementQuantity(product.id)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                                        <Minus size={18} />
                                    </button>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{qty}</span>
                                    <button onClick={() => addToCart(product)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Promo Banner */}
            <div className="hero" style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ flex: '1' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '15px', color: '#fff' }}>First Order Free Delivery</h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '20px' }}>Apply code WELCOME at checkout.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
