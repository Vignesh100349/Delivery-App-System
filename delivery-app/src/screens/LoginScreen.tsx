import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

export const LoginScreen = () => {
    const { login } = useAuthStore();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const cleanPhone = phone.trim();
        const cleanPassword = password.trim();

        if (cleanPhone.length !== 10 || cleanPassword.length === 0) {
            Alert.alert("Invalid", "Enter a valid 10-digit Mobile Number and Password");
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.post('https://delivery-app-system.onrender.com/driver-login', { phone: cleanPhone, password: cleanPassword });
            login(res.data.id.toString(), res.data.name);
        } catch (err: any) {
            console.error(err);
            Alert.alert("Access Denied", err.response?.data?.error || "Network error. Make sure your central dispatch server is online.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
                <View style={styles.card}>
                    <View style={styles.logoCircle}><Text style={styles.logoText}>🏍️</Text></View>
                    <Text style={styles.title}>Loopie Rider</Text>
                    <Text style={styles.subtitle}>Enter your authorized Mobile Number and password to selectively login</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="10-Digit Mobile Number" 
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phone} 
                        onChangeText={setPhone} 
                    />
                    <TextInput 
                        style={[styles.input, { marginBottom: 30, letterSpacing: 4 }]} 
                        placeholder="••••••••" 
                        secureTextEntry
                        autoCapitalize="none"
                        value={password} 
                        onChangeText={setPassword} 
                    />
                    <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login / Enter</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    keyboard: { flex: 1, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: '#fff', padding: 30, borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, alignItems: 'center' },
    logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e6f4ea', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    logoText: { fontSize: 40 },
    title: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 5 },
    subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
    input: { width: '100%', height: 55, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 15, fontSize: 18, fontWeight: 'bold', letterSpacing: 1, backgroundColor: '#fafafa', marginBottom: 20, textAlign: 'center' },
    btn: { width: '100%', height: 55, backgroundColor: '#0c831f', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
