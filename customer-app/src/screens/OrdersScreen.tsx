import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://delivery-app-system.onrender.com';

export const OrdersScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const ordersRef = useRef<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const poller = setInterval(() => { fetchOrders(true); }, 10000);
        return () => clearInterval(poller);
    }, [user?.id]);

    const fetchOrders = async (isBackground = false) => {
        try {
            const fetchedUserId = user?.id || 1;
            const res = await axios.get(`${API_URL}/customer/orders/${fetchedUserId}`);
            const myOrders = res.data;

            if (Array.isArray(myOrders)) {
                
                // Track Status Changes Natively for Pseudo Push Notifications
                if (isBackground && ordersRef.current.length > 0) {
                    myOrders.forEach(newO => {
                        const oldO = ordersRef.current.find(o => o.id === newO.id);
                        if (oldO && oldO.status !== newO.status) {
                             Alert.alert('🔔 Delivery Alert', `Your Order #${newO.id} status is now: ${newO.status?.toUpperCase()}`);
                        }
                    });
                }
                
                ordersRef.current = myOrders;
                setOrders(myOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            if(!isBackground) setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#0c831f" />
            </SafeAreaView>
        );
    }

    if (orders.length === 0) {
        return (
            <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
                <Ionicons name="receipt-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No Orders Found</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Main")} style={styles.browseBtn}>
                    <Text style={styles.browseBtnText}>Start Shopping</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {orders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderId}>Order #{order.id}</Text>
                            <Text style={styles.orderStatus}>{order.status?.toUpperCase() || 'CONFIRMED'}</Text>
                        </View>
                        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</Text>

                        <View style={styles.itemsList}>
                            {order.items?.map((item: any) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={styles.itemBullet} />
                                    <Text style={styles.itemName} numberOfLines={1}>
                                        {item.quantity}  x  {item.name}
                                    </Text>
                                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.footerRow}>
                            <Text style={styles.address}>
                                Deliver To: {(() => {
                                    try { 
                                        const parsed = JSON.parse(order.address);
                                        return [parsed.street, parsed.area, parsed.taluk, parsed.district, parsed.pincode].filter(Boolean).join(', ') || order.address;
                                    } catch { 
                                        return order.address || 'Address Unavailable'; 
                                    }
                                })()}
                            </Text>
                        </View>
                        
                        {(order.payment_status || 'unpaid').toLowerCase() === 'paid' && order.status?.toLowerCase() !== 'delivered' && order.status?.toLowerCase() !== 'cancelled' && (
                            <View style={[styles.footerRow, { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, marginTop: 10 }]}>
                                <Text style={{ color: '#166534', fontWeight: 'bold' }}>🔐 Secret Delivery PIN: <Text style={{ fontSize: 18, letterSpacing: 2 }}>{order.delivery_otp || '1234'}</Text></Text>
                            </View>
                        )}

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
                        </View>
                        
                        {order.rider_phone && order.status?.toLowerCase() !== 'delivered' && order.status?.toLowerCase() !== 'cancelled' && (
                            <TouchableOpacity style={styles.callRiderBtn} onPress={() => Linking.openURL(`tel:${order.rider_phone}`)}>
                                <Ionicons name="call" size={16} color="#fff" />
                                <Text style={styles.callRiderTxt}>Call Delivery Partner ({order.rider_name || 'Rider'})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    scroll: {
        padding: 15,
        paddingBottom: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 15,
    },
    browseBtn: {
        marginTop: 20,
        backgroundColor: '#0c831f',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    orderStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0c831f',
        backgroundColor: '#e6f4ea',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    orderDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    itemsList: {
        marginTop: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        paddingVertical: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemBullet: {
        width: 6,
        height: 6,
        backgroundColor: '#ccc',
        borderRadius: 3,
        marginRight: 8,
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#444',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    footerRow: {
        marginTop: 12,
    },
    address: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    callRiderBtn: {
        marginTop: 15,
        backgroundColor: '#0c831f',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    callRiderTxt: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
