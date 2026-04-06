import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/useCartStore';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://delivery-app-system.onrender.com';

export const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, cartTotal, cartCount, clearCart, addToCart, removeFromCart, deliveryAddressDetails, setDeliveryAddressDetails } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [mapRegion, setMapRegion] = useState<any>(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => {
        if (cartCount() > 0 && !mapRegion) {
            locateCustomer();
        }
    }, []);

    const locateCustomer = async () => {
        try {
            setFetchingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to auto-fill your exact address.');
                setFetchingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            setMapRegion(newRegion);

            await performReverseGeocode(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            console.log('Location error:', error);
            Alert.alert("GPS Error", "We couldn't automatically locate you right now. Please enter your address manually below.");
        } finally {
            setFetchingLocation(false);
        }
    };

    const performReverseGeocode = async (lat: number, lng: number) => {
        try {
            setFetchingLocation(true);
            let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geocode && geocode.length > 0) {
                const loc = geocode[0];
                setDeliveryAddressDetails({
                    ...deliveryAddressDetails,
                    street: loc.street || loc.name || '',
                    area: loc.subregion || loc.city || '',
                    taluk: loc.city || '',
                    district: loc.region || '',
                    pincode: loc.postalCode || '',
                    latitude: lat,
                    longitude: lng
                });
            }
        } catch (error) {
            console.log("Geocode Error", error);
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleMapPress = (e: any) => {
        const coords = e.nativeEvent.coordinate;
        setMapRegion({
            ...mapRegion,
            latitude: coords.latitude,
            longitude: coords.longitude,
        });
        performReverseGeocode(coords.latitude, coords.longitude);
    };

    const updateAddress = (field: keyof typeof deliveryAddressDetails, value: string) => {
        setDeliveryAddressDetails({ ...deliveryAddressDetails, [field]: value });
    };

    const getAddressStrings = () => [
        deliveryAddressDetails.doorNo,
        deliveryAddressDetails.street,
        deliveryAddressDetails.area,
        deliveryAddressDetails.taluk,
        deliveryAddressDetails.district,
        deliveryAddressDetails.pincode
    ];

    const isAddressValid = getAddressStrings().every(val => typeof val === 'string' && val.trim().length > 0);
    const fullAddressString = getAddressStrings().filter(Boolean).join(', ');

    const total = cartTotal();
    
    // Calculate Haversine distance from Viswanatham Rotary School
    const calculateDistance = () => {
        if (!deliveryAddressDetails.latitude || !deliveryAddressDetails.longitude) return 0;
        const STORE_LAT = 9.4358; 
        const STORE_LON = 77.8083;
        const userLat = deliveryAddressDetails.latitude;
        const userLon = deliveryAddressDetails.longitude;
        
        const R = 6371; // Earth radius km
        const dLat = (userLat - STORE_LAT) * Math.PI / 180;
        const dLon = (userLon - STORE_LON) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(STORE_LAT * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    const distance = calculateDistance();
    // Delivery fee logic: ₹15 base charge up to 2km, ₹5 per additional km
    const deliveryFee = distance > 0 ? (distance <= 2 ? 15 : 15 + Math.ceil(distance - 2) * 5) : 0;
    
    const grandTotal = total + deliveryFee;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (!isAddressValid) {
            Alert.alert("Incomplete Address", "Please fill in all address fields to proceed.");
            return;
        }
        navigation.navigate('PaymentMethods');
    };

    if (cartCount() === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer} edges={['bottom', 'left', 'right']}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.startShoppingBtn} onPress={() => navigation.navigate('HomeTab')}>
                    <Text style={styles.startShoppingBtnText}>Browse Products</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={{ padding: 15 }}>

                {/* Cart Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery in 10 minutes</Text>
                    {cart.map((item) => (
                        <View key={item.id} style={styles.cartItemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>
                            {/* Quantity Changer */}
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                                    <Text style={styles.qtyText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                                    <Text style={styles.qtyText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Address Section */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <View style={styles.addressHeaderRow}>
                        <Text style={styles.sectionTitle}>Delivery Location</Text>
                        <TouchableOpacity style={styles.locateMeBtn} onPress={locateCustomer}>
                            <Ionicons name="locate" size={16} color="#0c831f" />
                            <Text style={styles.locateMeText}>Locate Me</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mapWrapper}>
                        {mapRegion ? (
                            <MapView
                                style={styles.map}
                                region={mapRegion}
                                onPress={handleMapPress}
                            >
                                <Marker coordinate={mapRegion} />
                            </MapView>
                        ) : (
                            <View style={styles.mapPlaceholder}>
                                {fetchingLocation ? (
                                    <ActivityIndicator size="small" color="#0c831f" />
                                ) : (
                                    <Text style={styles.mapPlaceholderText}>Tap "Locate Me" to pinpoint address</Text>
                                )}
                            </View>
                        )}
                        {fetchingLocation && (
                            <View style={styles.mapLoadingOverlay}>
                                <ActivityIndicator size="large" color="#0c831f" />
                            </View>
                        )}
                    </View>

                    <View style={styles.addressGridRow}>
                        <TextInput
                            style={[styles.addressInput, styles.addressHalf]}
                            value={deliveryAddressDetails.doorNo}
                            onChangeText={(val) => updateAddress('doorNo', val)}
                            placeholder="Door No / Flat"
                        />
                        <TextInput
                            style={[styles.addressInput, styles.addressHalf]}
                            value={deliveryAddressDetails.street}
                            onChangeText={(val) => updateAddress('street', val)}
                            placeholder="Street Name"
                        />
                    </View>

                    <TextInput
                        style={styles.addressInput}
                        value={deliveryAddressDetails.area}
                        onChangeText={(val) => updateAddress('area', val)}
                        placeholder="Area / Locality"
                    />

                    <View style={styles.addressGridRow}>
                        <TextInput
                            style={[styles.addressInput, styles.addressHalf]}
                            value={deliveryAddressDetails.taluk}
                            onChangeText={(val) => updateAddress('taluk', val)}
                            placeholder="Taluk"
                        />
                        <TextInput
                            style={[styles.addressInput, styles.addressHalf]}
                            value={deliveryAddressDetails.district}
                            onChangeText={(val) => updateAddress('district', val)}
                            placeholder="District"
                        />
                    </View>

                    <TextInput
                        style={styles.addressInput}
                        value={deliveryAddressDetails.pincode}
                        onChangeText={(val) => updateAddress('pincode', val)}
                        placeholder="Pincode"
                        keyboardType="numeric"
                        maxLength={6}
                    />
                </View>

                {/* Billing Section */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>Bill Details</Text>
                    <View style={styles.billRow}>
                        <Text style={styles.billText}>Item Total</Text>
                        <Text style={styles.billValue}>₹{total}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billText}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: '#0c831f', fontWeight: 'bold' }]}>
                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                        </Text>
                    </View>
                    <View style={[styles.billRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalText}>To Pay</Text>
                        <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Place Order Sticky Bottom */}
            <View style={styles.bottomFooter}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.fullAmount}>₹{grandTotal}</Text>
                    <Text style={styles.addressMini} numberOfLines={1}>
                        {isAddressValid ? fullAddressString : 'Complete Address Required'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.payBtn} onPress={handleCheckout} disabled={loading}>
                    <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Place Order'}</Text>
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    startShoppingBtn: {
        backgroundColor: '#0c831f',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 8,
    },
    startShoppingBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111',
        marginBottom: 15,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    cartItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f4',
    },
    itemInfo: {
        flex: 1,
        paddingRight: 10,
    },
    itemName: {
        fontSize: 15,
        color: '#222',
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0c831f', // Blinkit green
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
        shadowColor: '#0c831f',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    qtyBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    qtyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    qtyNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 8,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    billText: {
        color: '#555',
        fontSize: 14,
    },
    billValue: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14,
    },
    grandTotalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 15,
        marginTop: 5,
    },
    grandTotalText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    bottomFooter: {
        backgroundColor: '#fff',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: '#f0f0f0',
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    fullAmount: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
        textAlign: 'center',
    },
    addressMini: {
        fontSize: 13,
        fontWeight: '500',
        color: '#0c831f',
        marginTop: 2,
        textAlign: 'center',
    },
    payBtn: {
        backgroundColor: '#0c831f',
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#0c831f',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    payBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#fafafa',
        marginBottom: 10,
    },
    addressGridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addressHalf: {
        width: '48%',
    },
    addressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    locateMeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f3eb',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#0c831f',
    },
    locateMeText: {
        color: '#0c831f',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    mapWrapper: {
        height: 180,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        color: '#888',
        fontSize: 13,
    },
    mapLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
