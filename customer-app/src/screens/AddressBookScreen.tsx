import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/useCartStore';

export const AddressBookScreen = () => {
    const navigation = useNavigation<any>();
    const { deliveryAddressDetails } = useCartStore();

    // Reconstruct the currently typed string for visual purposes
    const addressStrings = [
        deliveryAddressDetails.doorNo,
        deliveryAddressDetails.street,
        deliveryAddressDetails.area,
        deliveryAddressDetails.taluk,
        deliveryAddressDetails.district,
        deliveryAddressDetails.pincode
    ];
    
    const isAddressValid = addressStrings.every(val => typeof val === 'string' && val.trim().length > 0);
    const fullAddressString = addressStrings.filter(Boolean).join(', ');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Address Book</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.addNewBtn} onPress={() => navigation.navigate('Main', { screen: 'CartTab' })}>
                    <Ionicons name="add" size={20} color="#0c831f" />
                    <Text style={styles.addNewText}>Add New Address (Go to Cart)</Text>
                </TouchableOpacity>

                {isAddressValid ? (
                    <View style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                            <View style={styles.tagContainer}>
                                <Ionicons name="home" size={14} color="#0c831f" />
                                <Text style={styles.tagText}>Default</Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.addressText}>{fullAddressString}</Text>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="map-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No addresses saved yet</Text>
                    </View>
                )}
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
        padding: 15,
    },
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f3eb',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#0c831f',
        borderStyle: 'dashed',
    },
    addNewText: {
        marginLeft: 10,
        color: '#0c831f',
        fontWeight: 'bold',
        fontSize: 15,
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#888',
    }
});
