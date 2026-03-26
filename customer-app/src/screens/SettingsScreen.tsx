import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { logout } = useAuthStore();
    const [notifications, setNotifications] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);
    const [locationServices, setLocationServices] = useState(true);

    const handleClearCache = () => {
        Alert.alert('Cache Cleared', 'App cache has been successfully cleared.');
    };

    const confirmAccountDeactivation = () => {
        Alert.alert(
            'Deactivate Account',
            'Are you sure you want to completely delete your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Deactivate', 
                    style: 'destructive',
                    onPress: () => logout()
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionHeader}>PREFERENCES</Text>
                
                <View style={styles.settingRow}>
                    <Ionicons name="notifications-outline" size={22} color="#444" style={styles.icon} />
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#d9d9d9', true: '#cde4d3' }}
                        thumbColor={notifications ? '#0c831f' : '#f4f3f4'}
                    />
                </View>
                
                <View style={styles.settingRow}>
                    <Ionicons name="moon-outline" size={22} color="#444" style={styles.icon} />
                    <Text style={styles.settingLabel}>Dark Theme (Coming Soon)</Text>
                    <Switch
                        value={darkTheme}
                        onValueChange={() => Alert.alert('Notice', 'Dark mode is under development.')}
                        disabled={false}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Ionicons name="location-outline" size={22} color="#444" style={styles.icon} />
                    <Text style={styles.settingLabel}>GPS Tracking Permissions</Text>
                    <Switch
                        value={locationServices}
                        onValueChange={setLocationServices}
                        trackColor={{ false: '#d9d9d9', true: '#cde4d3' }}
                        thumbColor={locationServices ? '#0c831f' : '#f4f3f4'}
                    />
                </View>
                
                <Text style={styles.sectionHeader}>SUPPORT & ADVANCED</Text>
                
                <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
                    <Ionicons name="trash-bin-outline" size={22} color="#444" style={styles.icon} />
                    <Text style={styles.actionLabel}>Clear App Cache</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={confirmAccountDeactivation}>
                    <Ionicons name="warning-outline" size={22} color="#d12948" style={styles.icon} />
                    <Text style={[styles.actionLabel, { color: '#d12948' }]}>Deactivate Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
    },
    content: {
        marginTop: 15,
    },
    sectionHeader: {
        paddingHorizontal: 15,
        paddingBottom: 10,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888',
        marginTop: 10,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    icon: {
        marginRight: 15,
    },
    settingLabel: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    actionLabel: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    }
});
