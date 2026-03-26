import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://delivery-app-system.onrender.com';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuthStore();

    const name = user?.name || 'Guest User';
    const phone = user?.phone || 'Unknown Phone';
    const initials = name.substring(0, 2).toUpperCase();
    
    const [walletBalance, setWalletBalance] = useState('0.00');
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused && user?.id) {
            axios.get(`${API_URL}/users/${user.id}`).then(r => {
                setWalletBalance(Number(r.data.wallet_balance || 0).toFixed(2));
            }).catch(console.error);
        }
    }, [isFocused, user]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes, Log Out', onPress: () => logout(), style: 'destructive' }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Info */}
                <View style={styles.header}>
                    <View style={styles.profileCircle}>
                        <Text style={styles.profileInitials}>{initials}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={styles.userPhone}>{phone}</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Digital Wallet Restitutions */}
                <View style={[styles.section, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: '#166534', marginBottom: 5 }]}>Your Digital Wallet</Text>
                    <Text style={{ fontSize: 13, color: '#15803d', marginBottom: 15 }}>Refunds for missing deliveries are instantly sent here securely.</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 32, fontWeight: '900', color: '#0c831f' }}>₹{walletBalance}</Text>
                        <TouchableOpacity style={{ backgroundColor: '#0c831f', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Use Balance</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Information</Text>

                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Orders')}>
                        <View style={styles.listIconContainer}><Text style={styles.listIcon}>📦</Text></View>
                        <Text style={styles.listText}>Your Orders</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('AddressBook')}>
                        <View style={styles.listIconContainer}><Text style={styles.listIcon}>📍</Text></View>
                        <Text style={styles.listText}>Address Book</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Information</Text>

                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('ManagePaymentMethods')}>
                        <View style={styles.listIconContainer}><Text style={styles.listIcon}>💳</Text></View>
                        <Text style={styles.listText}>Payment Methods</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('HelpSupport')}>
                        <View style={styles.listIconContainer}><Text style={styles.listIcon}>🤝</Text></View>
                        <Text style={styles.listText}>Help & Support</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Settings')}>
                        <View style={styles.listIconContainer}><Text style={styles.listIcon}>⚙️</Text></View>
                        <Text style={styles.listText}>Settings</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        padding: 15,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#f8f8f8',
        padding: 20,
        borderRadius: 15,
    },
    profileCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0c831f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileInitials: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
        textAlign: 'center',
    },
    userPhone: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    editBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    editBtnText: {
        color: '#0c831f',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginLeft: 0,
        textAlign: 'center',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f4f4f4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    listIcon: {
        fontSize: 18,
    },
    listText: {
        flex: 1,
        fontSize: 16,
        color: '#111',
    },
    chevron: {
        fontSize: 24,
        color: '#ccc',
    },
    logoutBtn: {
        marginTop: 10,
        paddingVertical: 15,
        backgroundColor: '#ffe5e5',
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#d12948',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
