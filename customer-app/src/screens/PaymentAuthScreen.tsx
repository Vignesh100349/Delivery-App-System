import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

const API_URL = 'https://delivery-app-system.onrender.com';

export const PaymentAuthScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { clearCart } = useCartStore();
    const { user } = useAuthStore();
    const { orderId, paymentSessionId, amount } = route.params || {};

    const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

    const handlePaymentComplete = async (payment_id: string, signature: string) => {
        try {
            setStatus('processing');
            const res = await axios.post(`${API_URL}/verify-razorpay-payment`, {
                razorpay_order_id: paymentSessionId,
                razorpay_payment_id: payment_id,
                razorpay_signature: signature,
                orderId: orderId
            });
            if (res.data.success) {
                setStatus('success');
                setTimeout(() => finishCheckout(), 2000);
            } else {
                setStatus('failed');
                Alert.alert("Failed", "Payment signature verification failed.");
            }
        } catch (err: any) {
            setStatus('failed');
            Alert.alert("Error", err.message);
        }
    };

    const finishCheckout = () => {
        clearCart();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
            <style>
                body {background-color: #f4f4f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; color: #333;}
                .loader {border: 4px solid #f3f3f3; border-top: 4px solid #0c831f; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;}
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div style="text-align:center;">
                <div class="loader" style="margin: 0 auto 15px auto;"></div>
                <p>Loading Secure Gateway...</p>
            </div>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            <script>
                var options = {
                    "key": "rzp_live_SbsaLniHNb908C",
                    "amount": "${amount * 100}",
                    "currency": "INR",
                    "name": "Delivery App",
                    "description": "Order Payment",
                    "order_id": "${paymentSessionId}",
                    "handler": function (response){
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            status: 'success',
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        }));
                    },
                    "prefill": {
                        "name": "${user?.name || ''}",
                        "contact": "${user?.phone || '9999999999'}"
                    },
                    "theme": {
                        "color": "#0c831f"
                    },
                    "modal": {
                        "ondismiss": function(){
                            window.ReactNativeWebView.postMessage(JSON.stringify({status: 'dismissed'}));
                        }
                    }
                };
                
                setTimeout(function() {
                    var rzp1 = new Razorpay(options);
                    rzp1.on('payment.failed', function (response){
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            status: 'failed',
                            error: response.error.description
                        }));
                    });
                    rzp1.open();
                }, 800);
            </script>
        </body>
        </html>
    `;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Razorpay Secure Terminal</Text>
            </View>

            {status === 'pending' && (
                <View style={styles.container}>
                    <WebView
                        source={{ html: htmlContent }}
                        originWhitelist={['*']}
                        onMessage={(event) => {
                            try {
                                const data = JSON.parse(event.nativeEvent.data);
                                if (data.status === 'success') {
                                    handlePaymentComplete(data.payment_id, data.signature);
                                } else if (data.status === 'failed') {
                                    Alert.alert("Payment Failed", data.error || "Transaction cancelled");
                                    setStatus('failed');
                                } else if (data.status === 'dismissed') {
                                    setStatus('failed');
                                }
                            } catch(e) {
                                console.log('JSON parse err', e);
                            }
                        }}
                        style={{ flex: 1, backgroundColor: 'transparent', height: '100%', width: '100%' }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                </View>
            )}

            {status === 'processing' && (
                <View style={styles.centeredContainer}>
                    <View style={styles.card}>
                        <ActivityIndicator size="large" color="#0c831f" />
                        <Text style={styles.processingText}>Verifying Payment...</Text>
                        <Text style={styles.subtext}>Please do not press back or close this screen.</Text>
                    </View>
                </View>
            )}

            {status === 'success' && (
                <View style={styles.centeredContainer}>
                    <View style={styles.card}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={50} color="#fff" />
                        </View>
                        <Text style={styles.successText}>Payment Successful!</Text>
                        <Text style={styles.subtext}>Your order #{orderId} has been placed.</Text>
                    </View>
                </View>
            )}

            {status === 'failed' && (
                <View style={styles.centeredContainer}>
                    <View style={styles.card}>
                        <View style={styles.failIcon}>
                            <Ionicons name="close" size={50} color="#fff" />
                        </View>
                        <Text style={styles.failText}>Payment Failed</Text>
                        <Text style={styles.subtext}>The payment request was rejected or cancelled.</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.retryBtnText}>Go Back to Retry</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        marginTop: 50, // Space for header
    },
    centeredContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 10,
    },
    processingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0c831f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0c831f',
        marginBottom: 10,
    },
    failIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#d12948',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    failText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#d12948',
        marginBottom: 10,
    },
    retryBtn: {
        marginTop: 20,
        backgroundColor: '#111',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
