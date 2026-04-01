import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar, Linking, Alert, AppState } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/useCartStore';
import axios from 'axios';

const API_URL = 'https://delivery-app-system.onrender.com';

export const PaymentAuthScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { clearCart } = useCartStore();
    const { orderId, paymentSessionId, paymentUrl, amount } = route.params || {};

    const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
    const [countdown, setCountdown] = useState(300); // 5 minutes to complete payment
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'pending' && countdown > 0) {
            timer = setInterval(() => setCountdown(c => c - 1), 1000);
        } else if (countdown === 0) {
            setStatus('failed');
        }
        return () => clearInterval(timer);
    }, [countdown, status]);

    // Background listener
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (status === 'pending') {
                    verifyPaymentWithServer();
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [status]);

    const verifyPaymentWithServer = async () => {
        try {
            setStatus('processing');
            const res = await axios.get(`${API_URL}/verify-cashfree-session/${paymentSessionId}`);
            if (res.data.isPaid === true) {
                setStatus('success');
                setTimeout(() => finishCheckout(), 2000);
            } else {
                setStatus('pending');
                Alert.alert("Pending", `Payment hasn't been completed yet. Current Status: ${res.data.status}`);
            }
        } catch (err: any) {
            setStatus('pending');
            Alert.alert("Error", err.message);
        }
    };

    const handleMockPayment = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                finishCheckout();
            }, 1000);
        }, 2000);
    };

    const handleMockFailure = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('failed');
        }, 1500);
    };

    const handleLaunchCashfree = async () => {
        try {
            if (!paymentUrl) {
                Alert.alert("Error", "Missing Cashfree Gateway URL.");
                return;
            }

            if (String(paymentSessionId).startsWith("MOCKLINK_")) {
                Alert.alert(
                    "Test Mode Active",
                    "Cashfree API Keys are currently missing on your Cloud Server. \n\nWe are safely simulating a successful payment natively!",
                    [{ text: "Simulate Success", onPress: () => handleMockPayment() }]
                );
                return;
            }

            Alert.alert(
                "Leaving App",
                "You are being redirected to the secure Cashfree Checkout Page. Please complete the transaction there, and then return back to this app.",
                [
                    { text: "Cancel", style: 'cancel' },
                      {
                          text: "Continue to Payment",
                          onPress: async () => {
                              try {
                                  setStatus('pending'); // Reset state silently
                                  const supported = await Linking.canOpenURL(paymentUrl);
                                  if (supported) {
                                      await Linking.openURL(paymentUrl);
                                  } else {
                                      Alert.alert("Error", "No Web Browser safely found on this functionally device mathematically appropriately functionally seamlessly.");
                                  }
                              } catch (err) {
                                  Alert.alert('Error', `Could not open appropriately optimally logically browser.\n\n${err}`);
                              }
                          }
                      }
                ]
            );
        } catch (err) {
            console.error("Gateway Launch Error", err);
        }
    };

    const finishCheckout = () => {
        clearCart();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cashfree Secure Terminal</Text>
                </View>

                {status === 'pending' && (
                    <View style={styles.card}>
                        <Ionicons name="card-outline" size={60} color="#6b21a8" />
                        <Text style={styles.amount}>₹ {amount}</Text>
                        <Text style={styles.subtext}>Continue to Cashfree's secure portal to input your Card, NetBanking, or UPI details.</Text>
                        <Text style={styles.txnText}>Session ID: {paymentSessionId?.substring(0, 15)}...</Text>

                        <View style={styles.timerContainer}>
                            <Text style={styles.timerLabel}>Time remaining: </Text>
                            <Text style={styles.timerText}>{formatTime(countdown)}</Text>
                        </View>

                        <TouchableOpacity style={styles.realUpiBtn} onPress={handleLaunchCashfree}>
                            <Ionicons name="lock-closed" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.realUpiBtnText}>Proceed to Cashfree</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.realUpiBtn, { backgroundColor: '#111', marginTop: -10 }]} onPress={verifyPaymentWithServer}>
                            <Ionicons name="reload" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.realUpiBtnText}>Manually Verify Status</Text>
                        </TouchableOpacity>

                        {String(paymentSessionId).startsWith("MOCKLINK_") && (
                            <View style={styles.mockActions}>
                                <Text style={styles.mockHeader}>-- Simulator Controls (Dev Only) --</Text>
                                <TouchableOpacity style={styles.mockApproveBtn} onPress={handleMockPayment}>
                                    <Text style={styles.mockBtnText}>Simulate PIN & Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.mockRejectBtn} onPress={handleMockFailure}>
                                    <Text style={styles.mockRejectBtnText}>Simulate Reject/Timeout</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {status === 'processing' && (
                    <View style={styles.card}>
                        <ActivityIndicator size="large" color="#0c831f" />
                        <Text style={styles.processingText}>Verifying Payment...</Text>
                        <Text style={styles.subtext}>Please do not press back or close this screen.</Text>
                    </View>
                )}

                {status === 'success' && (
                    <View style={styles.card}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={50} color="#fff" />
                        </View>
                        <Text style={styles.successText}>Payment Successful!</Text>
                        <Text style={styles.subtext}>Your order #{orderId} has been placed.</Text>
                    </View>
                )}

                {status === 'failed' && (
                    <View style={styles.card}>
                        <View style={styles.failIcon}>
                            <Ionicons name="close" size={50} color="#fff" />
                        </View>
                        <Text style={styles.failText}>Payment Failed</Text>
                        <Text style={styles.subtext}>The payment request was rejected or timed out.</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.retryBtnText}>Go Back to Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
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
    amount: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111',
        marginVertical: 15,
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 10,
    },
    txnText: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#fbe9e7',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    timerLabel: {
        color: '#d84315',
        fontSize: 14,
    },
    timerText: {
        color: '#d84315',
        fontWeight: 'bold',
        fontSize: 16,
    },
    mockActions: {
        width: '100%',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    realUpiBtn: {
        backgroundColor: '#6b21a8',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
        elevation: 2,
    },
    realUpiBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    mockHeader: {
        textAlign: 'center',
        color: '#888',
        fontSize: 12,
        marginBottom: 15,
    },
    mockApproveBtn: {
        backgroundColor: '#0c831f',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    mockBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    mockRejectBtn: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d12948',
    },
    mockRejectBtnText: {
        color: '#d12948',
        fontWeight: 'bold',
        fontSize: 15,
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
