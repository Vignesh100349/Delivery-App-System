import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const API_URL = 'https://delivery-app-system.onrender.com';

export const OrderDetailsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const [otp, setOtp] = useState('');
    const [cfSessionId, setCfSessionId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            // Our backend /orders returns all orders, we can find it
            const res = await axios.get(`${API_URL}/orders`);
            const found = res.data.find((o: any) => o.id === orderId);
            setOrder(found);
        } catch (err) {
            console.error('Fetch order detail error', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (index: number) => {
        if (checkedItems.includes(index)) {
            setCheckedItems(checkedItems.filter(i => i !== index));
        } else {
            setCheckedItems([...checkedItems, index]);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (newStatus === 'Delivered') {
            const itemsList = order.items ? order.items : [];
            if (checkedItems.length !== itemsList.length) {
                return Alert.alert('Verify Cargo', 'Please check off every item in the product list before marking as delivered.');
            }

            const paymentStatusStr = (order.payment_status || 'unpaid').toLowerCase();
            const isCOD = paymentStatusStr === 'unpaid' || paymentStatusStr === 'cod';

            if (!isCOD) {
                if (!otp || otp !== (order.delivery_otp?.toString() || '1234')) {
                    return Alert.alert('Invalid OTP', 'The OTP provided does not match the customer\'s secret key.');
                }
            } else {
                return Alert.alert(
                    'Collect Payment', 
                    `Deliverable is COD. Collect exactly ₹${order.total_amount} via Cash or Cashfree QR.`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Collected', onPress: () => processDeliveryUpdate(newStatus) }
                    ]
                );
            }
        }
        processDeliveryUpdate(newStatus);
    };

    const processDeliveryUpdate = async (newStatus: string) => {
        try {
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
            if (newStatus === 'Delivered') {
                Alert.alert("Success", "Order successfully delivered!");
                navigation.goBack();
            } else {
                fetchOrderDetails(); // refresh native status wrapper
            }
        } catch (err) {
            console.error('Status update failed', err);
            Alert.alert("Error", "Network failed to communicate with central dispatch.");
        }
    };

    const handleCashfreeCollection = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/create-cashfree-session`, {
                amount: order.total_amount,
                orderId: order.id,
                phone: "9999999999"
            });
            if (res.data.payment_url && res.data.payment_session_id) {
                setCfSessionId(res.data.payment_session_id);
                Linking.openURL(res.data.payment_url);
            } else {
                Alert.alert("Error", "Failed to generate terminal link.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Cashfree Gateway Offline.");
        } finally {
            setLoading(false);
        }
    };

    const verifyCashfreePayment = async () => {
        if (!cfSessionId) return;
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/verify-cashfree-session/${cfSessionId}`);
            if (res.data.isPaid) {
                Alert.alert("Success", "Online Payment Verified!");
                setCfSessionId(null);
                
                // Ensure cargo is checked before auto-delivering
                const itemsList = order.items ? order.items : [];
                if (checkedItems.length !== itemsList.length) {
                    fetchOrderDetails();
                    return Alert.alert('Verify Cargo', 'Payment received, but please Check Off all cargo items before marking delivered!');
                }
                
                processDeliveryUpdate('Delivered');
            } else {
                Alert.alert("Pending", `Payment status: ${res.data.status}`);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Verification crashed.");
        } finally {
            setLoading(false);
        }
    };

    const handleMissingItem = (itemId: number, itemName: string) => {
        Alert.alert(
            "Report Missing Cargo?",
            `Are you completely sure ${itemName} is missing from the delivery bag? This will permanently remove it from the customer's invoice and adjust the payment amount automatically.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm Missing", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        const res = await axios.put(`${API_URL}/orders/${order.id}/missing-item/${itemId}`);
                        if (res.data.success) {
                            Alert.alert("Refund Complete", `The item was removed. The new checkout total is ₹${res.data.newTotal}.`);
                            fetchOrderDetails(); // Natively reload the manifest omitting the item!
                        }
                    } catch(err) {
                        console.error(err);
                        Alert.alert("Error", "Could not remove missing item dynamically.");
                    } finally {
                        setLoading(false);
                    }
                }}
            ]
        );
    };

    const openMaps = () => {
        if (!order?.address) return;
        let addr = { latitude: 0, longitude: 0, doorNo: '', street: '', area: '', pincode: '' };
        if (typeof order.address === 'string') {
           try { addr = JSON.parse(order.address); } catch { addr.area = order.address; }
        } else {
           addr = order.address;
        }

        if (addr.latitude && addr.longitude) {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`);
        } else {
            const query = encodeURIComponent(`${addr.doorNo || ''} ${addr.street || ''} ${addr.area || ''} ${addr.pincode || ''}`.trim());
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0c831f" /></View>;
    if (!order) return <View style={styles.center}><Text>Order dropped from dispatch array.</Text></View>;

    let addr: any = { doorNo: '', street: '', area: order.address || 'Map Location', pincode: '', taluk: '', district: '' };
    if (typeof order.address === 'string') {
        try { addr = JSON.parse(order.address || '{}'); } catch {}
    } else if (order.address) {
        addr = order.address;
    }

    const paymentStatusStr = (order.payment_status || 'unpaid').toLowerCase();
    const isCOD = paymentStatusStr === 'unpaid' || paymentStatusStr === 'cod';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backTxt}>← Back to Dispatch</Text>
                </TouchableOpacity>
                <View style={styles.badge}><Text style={styles.badgeTxt}>{order.status}</Text></View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>Dispatch #{order.id}</Text>
                    <Text style={styles.subtext}>Revenue: ₹{order.total_amount} | Payment: {isCOD ? 'COD / UNPAID' : 'PREPAID (PAID)'}</Text>

                    <View style={styles.mapBlock}>
                        <Text style={styles.sectionTitle}>Delivery Location</Text>
                        <Text style={styles.addressLine}>Door: {addr.doorNo}</Text>
                        <Text style={styles.addressLine}>Street: {addr.street}</Text>
                        <Text style={styles.addressLine}>Area: {addr.area}, {addr.taluk}</Text>
                        <Text style={styles.addressLine}>PIN: {addr.pincode}</Text>
                        
                        <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
                            <Text style={styles.mapBtnTxt}>📍 Open in Maps Launcher</Text>
                        </TouchableOpacity>

                        {order.customer_phone && (
                            <TouchableOpacity style={styles.callCustomerBtn} onPress={() => Linking.openURL(`tel:${order.customer_phone}`)}>
                                <Text style={styles.callCustomerTxt}>📞 Call Customer ({order.customer_name || 'User'})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={[styles.card, { marginTop: 0 }]}>
                    <Text style={styles.sectionTitle}>Cargo Manifest (Checklist)</Text>
                    {(order.items || []).map((itm: any, idx: number) => {
                        const isChecked = checkedItems.includes(idx);
                        return (
                            <View key={idx} style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity 
                                    style={[styles.checklistItem, isChecked && styles.checkedItem, {flex: 1, borderBottomWidth: 0}]}
                                    onPress={() => toggleItem(idx)}
                                >
                                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={[styles.itemLabel, isChecked && styles.itemLabelChecked]}>
                                        {itm.quantity}x {itm.name}
                                    </Text>
                                </TouchableOpacity>
                                
                                {order.status?.toLowerCase() !== 'delivered' && (
                                    <TouchableOpacity 
                                        style={{ backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 }}
                                        onPress={() => handleMissingItem(itm.id, itm.name)}
                                    >
                                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 11 }}>X MISSING</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>

                {order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'processing' ? (
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ffb700'}]} onPress={() => updateStatus('Out for Delivery')}>
                        <Text style={[styles.actionBtnTxt, {color: '#523a00'}]}>🚨 Accept & START Delivery</Text>
                    </TouchableOpacity>
                ) : null}

                {order.status?.toLowerCase() === 'out for delivery' && (
                    <View>
                        {!isCOD && (
                            <View style={styles.otpCard}>
                                <Text style={styles.otpLabel}>Customer OTP Required (Prepaid)</Text>
                                <TextInput 
                                    style={styles.otpInput} 
                                    placeholder="Enter 4-Digit OTP" 
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                            </View>
                        )}
                        {isCOD && !cfSessionId && (
                            <View style={[styles.otpCard, { borderColor: '#8b5cf6', backgroundColor: '#faf5ff' }]}>
                                <Text style={[styles.otpLabel, { color: '#6b21a8' }]}>Collect ₹{order.total_amount} (Cash / UPI)</Text>
                                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#6b21a8', height: 50, marginBottom: 0}]} onPress={handleCashfreeCollection}>
                                    <Text style={[styles.actionBtnTxt, {fontSize: 15}]}>💳 Generate Cashfree Payment Link</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {cfSessionId && (
                            <View style={[styles.otpCard, { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' }]}>
                                <Text style={[styles.otpLabel, { color: '#0284c7' }]}>Scan Active. Waiting for Payment...</Text>
                                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#0ea5e9', height: 50, marginBottom: 0}]} onPress={verifyCashfreePayment}>
                                    <Text style={[styles.actionBtnTxt, {fontSize: 15}]}>🔄 Verify Online Payment Status</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#0c831f'}]} onPress={() => updateStatus('Delivered')}>
                            <Text style={styles.actionBtnTxt}>✅ Swipe to Mark DELIVERED</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', alignItems: 'center', elevation: 2 },
    backTxt: { fontSize: 16, color: '#0c831f', fontWeight: 'bold' },
    badge: { backgroundColor: '#fff3cd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeTxt: { fontSize: 11, fontWeight: 'bold', color: '#333' },
    scroll: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width: 0, height: 2}, elevation: 3, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#111' },
    subtext: { fontSize: 14, color: '#666', marginTop: 5, fontWeight: '500' },
    mapBlock: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    addressLine: { fontSize: 15, color: '#555', marginBottom: 5 },
    mapBtn: { marginTop: 15, backgroundColor: '#e6f4ea', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    mapBtnTxt: { color: '#0c831f', fontWeight: 'bold', fontSize: 15 },
    callCustomerBtn: { marginTop: 10, backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    callCustomerTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    actionBtn: { width: '100%', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, marginBottom: 20 },
    actionBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    checkedItem: { opacity: 0.6 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    checkboxActive: { backgroundColor: '#0c831f', borderColor: '#0c831f' },
    checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: -2 },
    itemLabel: { fontSize: 16, color: '#333', flex: 1, fontWeight: '500' },
    itemLabelChecked: { textDecorationLine: 'line-through', color: '#888' },
    otpCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    otpLabel: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 15 },
    otpInput: { width: '100%', backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, fontSize: 18, textAlign: 'center', fontWeight: 'bold', letterSpacing: 2, borderWidth: 1, borderColor: '#cbd5e1' }
});
