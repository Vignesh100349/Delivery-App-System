import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = 'http://192.168.1.3:5000';

export const EditProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, updateUser } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(''); // Email isn't cached in frontend currently
    const [loading, setLoading] = useState(false);

    // Initial derivation
    const initials = name ? name.substring(0, 2).toUpperCase() : '??';

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`${API_URL}/users/${user?.id || 1}`, {
                name,
                email
            });

            // Update Zustand Store Memory with the updated Name 
            updateUser({ name: res.data.name });

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            console.error(err);
            Alert.alert('Uh oh!', err.response?.data?.error || 'Failed to update user parameters.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>

                <View style={styles.content}>
                    
                    <View style={styles.avatarContainer}>
                        <View style={styles.profileCircle}>
                            <Text style={styles.profileInitials}>{initials}</Text>
                        </View>
                        <TouchableOpacity style={styles.changePictureBtn}>
                            <Text style={styles.changePictureText}>Change Picture</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="e.g. user@gmail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number (Authentication Key)</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={user?.phone || ''}
                            editable={false}
                            placeholder="9876543210"
                        />
                        <Text style={styles.helperText}>
                            Phone numbers cannot be changed directly as they serve as your login identity. Please contact support to migrate an account.
                        </Text>
                    </View>

                </View>

                {/* Sticky Bottom Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.saveBtn} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
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
        padding: 20,
        flex: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0c831f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileInitials: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#fff',
    },
    changePictureBtn: {
        padding: 5,
    },
    changePictureText: {
        color: '#0c831f',
        fontWeight: 'bold',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#222',
        backgroundColor: '#fafafa',
    },
    disabledInput: {
        backgroundColor: '#eee',
        color: '#888',
    },
    helperText: {
        marginTop: 6,
        fontSize: 12,
        color: '#888',
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    saveBtn: {
        backgroundColor: '#0c831f',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0c831f',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
