import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/useCartStore';

export const FloatingCartButton = () => {
    const navigation = useNavigation<any>();
    const { cartCount, cartTotal } = useCartStore();
    const count = cartCount();
    const total = cartTotal();

    if (count === 0) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cart')}>
                <View style={styles.leftInfo}>
                    <Text style={styles.itemsText}>{count} Items | ₹{total}</Text>
                    <Text style={styles.subText}>Extra charge may apply</Text>
                </View>
                <Text style={styles.viewCartText}>View Cart {'>'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 10,
        backgroundColor: 'transparent',
    },
    button: {
        backgroundColor: '#0c831f', // Blinkit green
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    leftInfo: {
        flexDirection: 'column',
    },
    itemsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    subText: {
        color: '#eee',
        fontSize: 10,
        marginTop: 2,
    },
    viewCartText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
