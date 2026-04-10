import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://delivery-app-system.onrender.com';

export const PaymentMethodsScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, cartTotal, clearCart, deliveryAddressDetails } = useCartStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('cash');
    const [walletBalance, setWalletBalance] = useState<number>(0);

    useEffect(() => {
        if(user?.id) {
            axios.get(`${API_URL}/users/${user.id}`)
                .then(r => setWalletBalance(Number(r.data.wallet_balance || 0)))
                .catch(e => console.log('Wallet fetch error:', e));
        }
    }, [user?.id]);

    const total = cartTotal();
    const deliveryFee = 0; // Forced to free
    const grandTotal = total + deliveryFee;

    const formattedAddress = Object.values(deliveryAddressDetails).filter(Boolean).join(', ');

    const handleConfirmPayment = async (overrideMethod?: string) => {
        const methodToUse = overrideMethod || selectedMethod;
        if (cart.length === 0) {
            Alert.alert("Error", "Your cart is empty!");
            navigation.navigate("HomeTab");
            return;
        }

        setLoading(true);

        try {
            // Create Order Payload
            const orderPayload = {
                user_id: user?.id || 1, 
                address: JSON.stringify(deliveryAddressDetails),
                payment_method: methodToUse,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Hit Order API
            const orderRes = await axios.post(`${API_URL}/order`, orderPayload);
            const { orderId } = orderRes.data;

            if (methodToUse === 'online') {
                // Navigate to the Payment Auth screen with details
                const razorpayRes = await axios.post(`${API_URL}/create-razorpay-order`, { amount: grandTotal, orderId: orderId });
                setLoading(false);
                navigation.navigate('PaymentAuth', {
                    orderId: orderId,
                    paymentSessionId: razorpayRes.data.id,
                    amount: grandTotal
                });
            } else if (methodToUse === 'wallet') {
                 Alert.alert(
                    'Order Confirmed!',
                    `Order #${orderId} Placed successfully using your Digital Wallet!`,
                    [{ text: "OK", onPress: () => finishCheckout(orderId) }]
                );
            } else {
                // Cash on Delivery
                Alert.alert(
                    'Order Confirmed!',
                    `Order #${orderId} Placed successfully with Cash on Delivery!`,
                    [{ text: "OK", onPress: () => finishCheckout(orderId) }]
                );
            }
        } catch (err: any) {
            Alert.alert('Error Placing Order', err?.response?.data?.error || err.message);
            setLoading(false);
        }
    };

    const finishCheckout = (orderId: any) => {
        clearCart();
        setLoading(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select Payment Method</Text>
                <Text style={styles.subtitle}>Pay ₹{grandTotal} securely</Text>
            </View>

            <View style={styles.methodsContainer}>

                {/* Digital Wallet Option */}
                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'wallet' && styles.selectedMethod, walletBalance < grandTotal && { opacity: 0.5 }]}
                    onPress={() => {
                        if (walletBalance >= grandTotal) {
                            setSelectedMethod('wallet');
                        } else {
                            Alert.alert('Insufficient Balance', 'Your wallet balance is lower than the order total. Please use another method.');
                        }
                    }}
                    disabled={loading || walletBalance < grandTotal}
                >
                    <View style={styles.methodHeader}>
                        <Text style={styles.methodTitle}>Digital Wallet (₹{walletBalance.toFixed(2)})</Text>
                        <View style={styles.radioContainer}>
                            {selectedMethod === 'wallet' && <View style={styles.radioSelected} />}
                        </View>
                    </View>
                    <Text style={styles.methodDesc}>Instantly deducts from your fully secured refund balance.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'online' && styles.selectedMethod]}
                    onPress={() => {
                        setSelectedMethod('online');
                        handleConfirmPayment('online');
                    }}
                    disabled={loading}
                >
                    <View style={styles.methodHeader}>
                        <Text style={styles.methodTitle}>Razorpay Payments</Text>
                        <View style={styles.radioContainer}>
                            {selectedMethod === 'online' && <View style={styles.radioSelected} />}
                        </View>
                    </View>
                    <Text style={styles.methodDesc}>Directly pay via UPI, Credit/Debit Cards, or NetBanking natively.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'cash' && styles.selectedMethod]}
                    onPress={() => setSelectedMethod('cash')}
                >
                    <View style={styles.methodHeader}>
                        <Text style={styles.methodTitle}>Cash on Delivery</Text>
                        <View style={styles.radioContainer}>
                            {selectedMethod === 'cash' && <View style={styles.radioSelected} />}
                        </View>
                    </View>
                    <Text style={styles.methodDesc}>Pay seamlessly when your order arrives at your doorstep</Text>
                </TouchableOpacity>

            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, loading && styles.payButtonDisabled, selectedMethod === 'wallet' && walletBalance < grandTotal && styles.payButtonDisabled]}
                    onPress={() => handleConfirmPayment()}
                    disabled={loading || (selectedMethod === 'wallet' && walletBalance < grandTotal)}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payButtonText}>
                            {selectedMethod === 'cash' ? 'Place Order via COD' : `Pay ₹${grandTotal} Securely`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#d12948',
        fontWeight: '600',
        marginTop: 5,
    },
    methodsContainer: {
        padding: 15,
        marginTop: 5,
    },
    methodCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedMethod: {
        borderColor: '#0c831f',
        backgroundColor: '#f6fdf7',
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    methodTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    methodDesc: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    radioContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#0c831f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0c831f',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    payButton: {
        backgroundColor: '#0c831f',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#6cbd82',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
