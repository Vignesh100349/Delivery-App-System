import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useCartStore, Product, CartItem } from '../store/useCartStore';

interface ProductCardProps {
    product: Product;
    customStyle?: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, customStyle }) => {
    const { cart, addToCart, removeFromCart } = useCartStore();
    const cartItem = cart.find((item: CartItem) => item.id === product.id);
    const quantity = cartItem?.quantity || 0;
    const isSoldOut = product.stock !== undefined && Number(product.stock) <= 0;

    return (
        <View style={[styles.card, customStyle]}>
            <Image 
                source={{ uri: product.image }} 
                style={[styles.image, isSoldOut && { opacity: 0.4 }]} 
                resizeMode="contain" 
            />
            {isSoldOut && <View style={styles.soldOutBadge}><Text style={styles.soldOutBadgeText}>SOLD OUT</Text></View>}
            <View style={{ padding: 8 }}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.weight}>{product.description || product.weight}</Text>
                <View style={styles.bottomRow}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        {!!product.original_price && (
                            <Text style={styles.originalPrice}>₹{product.original_price}</Text>
                        )}
                    </View>

                    {isSoldOut ? (
                        <Text style={styles.soldOutText}>Out of Stock</Text>
                    ) : quantity === 0 ? (
                        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
                            <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(product.id)}>
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(product)}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 140,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    image: {
        height: 120,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    name: {
        fontSize: 13,
        fontWeight: '700',
        color: '#222',
        height: 36, // Force double line height
        letterSpacing: -0.2,
    },
    weight: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        marginBottom: 8,
        fontWeight: '500',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    priceContainer: {
        flexDirection: 'column',
    },
    price: {
        fontSize: 15,
        fontWeight: '900',
        color: '#000',
    },
    originalPrice: {
        fontSize: 11,
        color: '#888',
        textDecorationLine: 'line-through',
        marginTop: 1,
    },
    addButton: {
        borderColor: '#0c831f',
        borderWidth: 1,
        backgroundColor: '#f2fcf4',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#0c831f',
        fontWeight: '800',
        fontSize: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0c831f',
        borderRadius: 8,
        overflow: 'hidden',
    },
    qtyBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#0c831f',
    },
    qtyBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    quantityText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        paddingHorizontal: 6,
    },
    soldOutBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#d12948',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    soldOutBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    soldOutText: {
        color: '#d12948',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    }
});
