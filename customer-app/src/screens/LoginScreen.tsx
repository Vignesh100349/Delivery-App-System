import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'https://delivery-app-system.onrender.com';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login } = useAuthStore();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');

    const handleAuth = async () => {
        if (!phone || !password) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        if (isRegistering && !name) {
            Alert.alert("Error", "Please provide a name to register.");
            return;
        }

        setLoading(true);
        try {
            const endpoint = isRegistering ? '/register' : '/login';
            const payload = isRegistering ? { name, phone, password } : { phone, password };

            const res = await axios.post(`${API_URL}${endpoint}`, payload);
            
            // On success, save user credentials in Zustand store
            login({ id: res.data.user_id, name: res.data.name || name, phone: phone });
            
            // React Navigation will automatically unmount this screen and mount <Main/> 
            // since the AppNavigator is conditionally rendering based on useAuthStore !!
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || "Unable to connect to server.";
            Alert.alert("Authentication Failed", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.headerContainer}>
                        <Image source={require('../../assets/loopie_logo.png')} style={styles.logoImage} resizeMode="contain" />
                        <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Welcome Back'}</Text>
                        <Text style={styles.subtitle}>
                            {isRegistering ? 'Sign up to get fresh groceries delivered in 10 minutes.' : 'Login to order your favorite groceries.'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {isRegistering && (
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#999"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (e.g. 9876543210)"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#999"
                        />

                        <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.authBtnText}>{isRegistering ? 'Sign Up' : 'Login'}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.toggleBtn} 
                            onPress={() => setIsRegistering(!isRegistering)}
                        >
                            <Text style={styles.toggleBtnText}>
                                {isRegistering ? 'Already have an account? Login here' : "Don't have an account? Sign up"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505'},
    keyboardView: {
        flex: 1},
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25},
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40},
    logoImage: {
        width: 140,
        height: 140,
        marginBottom: 10},
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 5},
    subtitle: {
        fontSize: 15,
        color: '#aaa',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20},
    form: {
        width: '100%'},
    input: {
        height: 55,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#111',
        color: '#fff'},
    authBtn: {
        backgroundColor: '#0c831f', // Blinkit green
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#0c831f',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }},
    authBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5},
    toggleBtn: {
        marginTop: 20,
        padding: 10,
        alignItems: 'center'},
    toggleBtnText: {
        color: '#28bb41',
        fontSize: 15,
        fontWeight: '600'}
});
