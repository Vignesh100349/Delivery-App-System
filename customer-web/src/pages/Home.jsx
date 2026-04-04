import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

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
            <div className="hero">
                <div className="hero-content">
                    <h1>Fast Grocery<br/>Delivery in 10 Minutes</h1>
                    <p>Get fresh produce, daily essentials, and more delivered straight to your door from Viswanatham.</p>
                </div>
            </div>

            <div className="products-grid">
                {products.map(product => {
                    const qty = getQuantity(product.id);
                    return (
                        <div key={product.id} className="glass-card product-card">
                            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="product-img" />
                            <h3 className="product-title">{product.name}</h3>
                            <div className="product-price">
                                ₹{product.price}
                                {product.original_price && <span className="product-original">₹{product.original_price}</span>}
                            </div>
                            
                            {qty === 0 ? (
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => addToCart(product)}>
                                    <ShoppingCart size={18} /> Add
                                </button>
                            ) : (
                                <div className="cart-controls" style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <button className="btn-icon-only" onClick={() => decrementQuantity(product.id)}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: 'bold' }}>{qty}</span>
                                    <button className="btn-icon-only" onClick={() => addToCart(product)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Home;
