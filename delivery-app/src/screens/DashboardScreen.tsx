import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, Platform, Alert } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const API_URL = 'https://delivery-app-system.onrender.com';

export const DashboardScreen = () => {
    const { driverId, driverName, logout } = useAuthStore();
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    const toggleStatus = async () => {
        try {
            const newState = !isOnline;
            setIsOnline(newState);
            await axios.put(`${API_URL}/driver/${driverId}/online`, { is_online: newState });
            if (newState) fetchActiveOrders();
        } catch (err) {
            Alert.alert("Network Error", "Unable to sync status with central dispatch.");
            setIsOnline(!isOnline); // Revert
        }
    };

    const fetchActiveOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/driver/orders/${driverId}`);
            const active = res.data.filter((o: any) => (o.status || '').toLowerCase() !== 'delivered');
            setOrders(active);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchActiveOrders();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchActiveOrders();
        }, [])
    );

    const renderOrderItem = ({ item }: { item: any }) => {
        const addrStr = typeof item.address === 'string' ? item.address : '{}';
        const addr = (() => { try { return JSON.parse(addrStr || '{}'); } catch { return { area: addrStr }; } })();
        const shortAddr = (addr.area || addr.street || "Map Location") + ", " + (addr.pincode || "N/A");
        
        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.orderIdText}>Order #{item.id}</Text>
                    <View style={[styles.statusBadge, item.status === 'Processing' ? styles.procBadge : styles.outBadge]}>
                        <Text style={styles.statusTxt}>{item.status}</Text>
                    </View>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText} numberOfLines={2}>{shortAddr}</Text>
                </View>
                
                <View style={[styles.infoRow, { marginTop: 8 }]}>
                    <Text style={styles.infoIcon}>💰</Text>
                    <Text style={styles.infoText}>₹{item.total_amount} <Text style={{color: '#888'}}>({item.payment_status?.toUpperCase()})</Text></Text>
                </View>

                <View style={styles.dispatchRow}>
                    <Text style={styles.acceptBtnTxt}>Tap to View Routing & Details</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Welcome back,</Text>
                    <Text style={styles.driverName}>{driverName}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutTxt}>Disconnect</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[styles.statusToggle, isOnline ? styles.onlineBg : styles.offlineBg]} 
                onPress={toggleStatus}
            >
                <Text style={[styles.toggleText, isOnline ? styles.onlineTxt : styles.offlineTxt]}>
                    {isOnline ? '● YOU ARE ONLINE' : '○ YOU ARE OFFLINE - GO ONLINE'}
                </Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Active Delivery Queue</Text>
                
                {!isOnline ? (
                    <View style={styles.empty}>
                        <Text style={{fontSize: 40, marginBottom: 15}}>😴</Text>
                        <Text style={styles.emptyTxt}>You are currently OFFLINE.</Text>
                        <Text style={styles.emptySub}>Enable your status above to receive Dispatches.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={(o) => o.id.toString()}
                        renderItem={renderOrderItem}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={{fontSize: 40, marginBottom: 15}}>🛵💨</Text>
                                <Text style={styles.emptyTxt}>No active dispatches available right now.</Text>
                                <Text style={styles.emptySub}>Refresh to scan for incoming orders.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
    welcome: { fontSize: 13, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
    driverName: { fontSize: 20, fontWeight: '900', color: '#111', marginTop: 2 },
    logoutBtn: { backgroundColor: '#ffe5e5', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    logoutTxt: { color: '#d12948', fontWeight: 'bold', fontSize: 13 },
    statusToggle: { margin: 15, padding: 18, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width: 0, height: 3} },
    onlineBg: { backgroundColor: '#e6f4ea', borderLeftWidth: 5, borderLeftColor: '#0c831f' },
    offlineBg: { backgroundColor: '#ffe5e5', borderLeftWidth: 5, borderLeftColor: '#d12948' },
    toggleText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    onlineTxt: { color: '#0c831f' },
    offlineTxt: { color: '#d12948' },
    content: { flex: 1, padding: 15, paddingTop: 0 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width: 0, height: 2}, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10, marginBottom: 10 },
    orderIdText: { fontSize: 16, fontWeight: '900', color: '#111' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    procBadge: { backgroundColor: '#fff3cd' },
    outBadge: { backgroundColor: '#d1ecf1' },
    statusTxt: { fontSize: 11, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoIcon: { fontSize: 16, marginRight: 10 },
    infoText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#444' },
    dispatchRow: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', alignItems: 'center' },
    acceptBtnTxt: { color: '#0c831f', fontWeight: 'bold', fontSize: 14 },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyTxt: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    emptySub: { fontSize: 13, color: '#888' }
});
