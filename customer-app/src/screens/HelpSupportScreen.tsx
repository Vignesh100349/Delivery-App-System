import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const HelpSupportScreen = () => {
    const navigation = useNavigation<any>();

    const openWhatsApp = () => {
        Linking.openURL('https://wa.me/916381449476');
    };
    
    const openEmail = () => {
        Linking.openURL('mailto:support@grocery.app');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.heroSection}>
                    <Ionicons name="chatbubbles-outline" size={60} color="#0c831f" />
                    <Text style={styles.heroText}>How can we help you?</Text>
                </View>

                <Text style={styles.sectionHeader}>QUICK LINKS</Text>
                
                <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Orders')}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="cube-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.actionLabel}>Help with an Order</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionRow}>
                    <View style={[styles.iconCircle, { backgroundColor: '#d12948' }]}>
                        <Ionicons name="card-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.actionLabel}>Payment & Refunds</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow}>
                    <View style={[styles.iconCircle, { backgroundColor: '#e69900' }]}>
                        <Ionicons name="star-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.actionLabel}>Leave App Feedback</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>CONTACT US directly</Text>

                <TouchableOpacity style={styles.contactCard} onPress={openWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>WhatsApp Us</Text>
                        <Text style={styles.contactSub}>Usually responds instantly</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactCard, { marginBottom: 30 }]} onPress={openEmail}>
                    <Ionicons name="mail-outline" size={32} color="#0c831f" />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Email Support</Text>
                        <Text style={styles.contactSub}>support@grocery.app</Text>
                    </View>
                </TouchableOpacity>

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
        paddingTop: 0},
    heroSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 10},
    heroText: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: '900',
        color: '#222',
        letterSpacing: 0.5},
    sectionHeader: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 15,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 1},
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'},
    iconCircle: {
        backgroundColor: '#0c831f',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16},
    actionLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500'},
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2},
    contactInfo: {
        marginLeft: 15},
    contactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2},
    contactSub: {
        fontSize: 13,
        color: '#666'}
});
