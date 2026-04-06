import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentStore } from '../store/usePaymentStore';
import { useAuthStore } from '../store/useAuthStore';

export const ManagePaymentMethodsScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const { savedMethods, removeMethod, addMethod, fetchPayments } = usePaymentStore();

    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNum, setCardNum] = useState('');

    const [isAddingUpi, setIsAddingUpi] = useState(false);
    const [upiName, setUpiName] = useState('');
    const [upiId, setUpiId] = useState('');

    useEffect(() => {
        if(user?.id) fetchPayments(user.id);
    }, [user?.id]);

    const handleRemove = (id: string) => {
        Alert.alert("Remove Method", "Are you sure you want to remove this saved method?", [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: () => removeMethod(id) }
        ]);
    };

    const handleSaveCard = () => {
        if(!cardName || cardNum.length < 4) return Alert.alert('Invalid', 'Enter valid card details');
        const uid = user?.id || 1;
        addMethod(uid, {
            type: 'card',
            title: cardName,
            mask: `**** **** **** ${cardNum.slice(-4)}`,
            color: '#284C8F'
        });
        setIsAddingCard(false); setCardName(''); setCardNum('');
    };

    const handleSaveUpi = () => {
        if(!upiName || !upiId.includes('@')) return Alert.alert('Invalid', 'Enter a valid UPI ID (e.g. user@ybl)');
        const uid = user?.id || 1;
        addMethod(uid, {
            type: 'upi',
            title: upiName,
            mask: upiId,
            color: '#6739B7'
        });
        setIsAddingUpi(false); setUpiName(''); setUpiId('');
    };

    const cards = savedMethods.filter(m => m.type === 'card');
    const upis = savedMethods.filter(m => m.type === 'upi');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                {cards.length > 0 && <Text style={styles.sectionHeader}>SAVED CARDS</Text>}
                
                {cards.map(card => (
                    <View key={card.id} style={styles.cardContainer}>
                        <View style={styles.cardInfo}>
                            <View style={[styles.iconCircle, { backgroundColor: card.color }]}>
                                <Ionicons name="card" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.cardName}>{card.title}</Text>
                                <Text style={styles.cardMask}>{card.mask}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleRemove(card.id)}>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {isAddingCard ? (
                    <View style={styles.addForm}>
                        <TextInput style={styles.input} placeholder="Card Name (e.g. HDFC Credit)" value={cardName} onChangeText={setCardName} />
                        <TextInput style={styles.input} placeholder="Card Number" keyboardType="number-pad" value={cardNum} onChangeText={setCardNum} maxLength={16} />
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingCard(false)}><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCard}><Text style={styles.saveBtnText}>Save Card</Text></TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addNewBtn} onPress={() => setIsAddingCard(true)}>
                        <Ionicons name="add" size={20} color="#0c831f" />
                        <Text style={styles.addNewText}>Add New Card</Text>
                    </TouchableOpacity>
                )}

                {upis.length > 0 && <Text style={[styles.sectionHeader, { marginTop: 25 }]}>LINKED UPI ACCOUNTS</Text>}

                {upis.map(upi => (
                    <View key={upi.id} style={styles.cardContainer}>
                        <View style={styles.cardInfo}>
                            <View style={[styles.iconCircle, { backgroundColor: upi.color }]}>
                                <Ionicons name="phone-portrait" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.cardName}>{upi.title}</Text>
                                <Text style={styles.cardMask}>{upi.mask}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleRemove(upi.id)}>
                            <Text style={styles.removeText}>Unlink</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {isAddingUpi ? (
                    <View style={[styles.addForm, { marginTop: upis.length === 0 ? 25 : 0 }]}>
                        <TextInput style={styles.input} placeholder="App Name (e.g. PhonePe Native)" value={upiName} onChangeText={setUpiName} />
                        <TextInput style={styles.input} placeholder="UPI ID (e.g. yourname@ybl)" value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingUpi(false)}><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUpi}><Text style={styles.saveBtnText}>Link App</Text></TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.addNewBtn, { marginTop: upis.length === 0 ? 25 : 5 }]} onPress={() => setIsAddingUpi(true)}>
                        <Ionicons name="add" size={20} color="#0c831f" />
                        <Text style={styles.addNewText}>Link UPI Account</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4'},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 1},
    backBtn: {
        marginRight: 15},
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111'},
    content: {
        paddingTop: 15,
        paddingHorizontal: 15},
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 1,
        marginBottom: 10},
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1},
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center'},
    iconCircle: {
        backgroundColor: '#284C8F',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15},
    cardName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3},
    cardMask: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500'},
    removeText: {
        color: '#d12948',
        fontSize: 13,
        fontWeight: 'bold'},
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e6f3eb',
        padding: 16,
        borderRadius: 12,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#0c831f',
        borderStyle: 'dashed'},
    addNewText: {
        marginLeft: 8,
        color: '#0c831f',
        fontWeight: 'bold',
        fontSize: 15},
    addForm: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#eee'},
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45,
        marginBottom: 10,
        backgroundColor: '#fafafa'},
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5},
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10},
    saveBtn: {
        backgroundColor: '#0c831f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8},
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold'}
});
