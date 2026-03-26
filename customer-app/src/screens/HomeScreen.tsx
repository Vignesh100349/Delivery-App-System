import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { ProductCard } from '../components/ProductCard';
import { FloatingCartButton } from '../components/FloatingCartButton';

const API_URL = 'https://delivery-app-system.onrender.com';

import { useNavigation } from '@react-navigation/native';

const CATEGORIES = [
    { id: '1', name: 'Vegetables &\nFruits', emoji: '🥦' },
    { id: '2', name: 'Dairy &\nBreakfast', emoji: '🥛' },
    { id: '3', name: 'Munchies', emoji: '🥨' },
    { id: '4', name: 'Cold Drinks &\nJuices', emoji: '🥤' },
    { id: '5', name: 'Instant &\nFrozen Food', emoji: '🍜' },
    { id: '6', name: 'Tea, Coffee &\nHealth Drinks', emoji: '☕' },
    { id: '7', name: 'Bakery &\nBiscuits', emoji: '🍪' },
    { id: '8', name: 'Sweet\nTooth', emoji: '🍫' },
];

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState('Fetching location...');

    useEffect(() => {
        fetchProducts();
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setAddress('Location permission denied ▼');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (geocode && geocode.length > 0) {
                const currentAddress = geocode[0];
                const shortAddress = `${currentAddress.district || currentAddress.city || currentAddress.subregion || ''}, ${currentAddress.region || ''}`;
                // Clean up string formatting if missing parts
                const cleanAddress = shortAddress.replace(/^, | ,|, $/g, '').trim();
                setAddress(cleanAddress.length > 0 ? `${cleanAddress} ▼` : 'Unknown location ▼');
            } else {
                setAddress('Location not found ▼');
            }
        } catch (error) {
            console.log('Location error:', error);
            setAddress('Location permission denied ▼');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        } catch (err) {
            console.log('Error fetching products', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER -> Exact Blinkit Style */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.deliveryTitle}>10 minutes</Text>
                    <Text style={styles.location}>{address}</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.profileEmoji}>👤</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Search Bar Faux */}
                <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
                    <Text style={styles.searchPlaceholder}>🔍 Search "Milk" or "Bread"</Text>
                </TouchableOpacity>

                {/* Categories Grid */}
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate('Categories', { categoryId: cat.id })}
                        >
                            <View style={styles.categoryEmojiContainer}>
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            </View>
                            <Text style={styles.categoryName} numberOfLines={2}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Super Sales */}
                <Text style={styles.sectionTitle}>Super Sales</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0c831fff" />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {products.slice(0, 4).map((item) => (
                            <ProductCard key={`super-${item.id}`} product={{ ...item, weight: '1 pc' }} />
                        ))}
                    </ScrollView>
                )}

                {/* Fresh Picks For You */}
                <Text style={styles.sectionTitle}>Fresh Picks For You</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0c831f" />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {products.slice(4).map((item) => (
                            <ProductCard key={`fresh-${item.id}`} product={{ ...item, weight: '1 pc' }} />
                        ))}
                    </ScrollView>
                )}
            </ScrollView>

            {/* Floating Cart */}
            <FloatingCartButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    header: {
        backgroundColor: '#ffffffff',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        alignItems: 'center',
        borderBottomWidth: 0,
        borderBottomColor: '#ffffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    deliveryTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    location: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
        fontWeight: '500',
        textAlign: 'center',
    },
    profileBtn: {
        position: 'absolute',
        right: 15,
        top: 20,
        height: 45,
        width: 45,
        backgroundColor: '#ffffffff',
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileEmoji: {
        fontSize: 30,
    },
    searchBar: {
        backgroundColor: '#ffffffff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#0c831fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 3,
    },
    searchPlaceholder: {
        color: '#0c831fff',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
    bannerContainer: {
        marginBottom: 30,
    },
    banner: {
        padding: 24,
        borderRadius: 16,
        shadowColor: '#d86a57ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    bannerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#d12948',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    bannerSub: {
        fontSize: 15,
        color: '#555',
        marginTop: 6,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 16,
        letterSpacing: -0.2,
        color: '#0c831fff',
        textAlign: 'center',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 25,
        marginHorizontal: -5,
    },
    categoryItem: {
        width: '25%', // 4 items per row exactly
        alignItems: 'center',
        marginBottom: 18,
        paddingHorizontal: 5,
    },
    categoryEmojiContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#ffffffff',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#ffffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#ffffffff',
    },
    categoryEmoji: {
        fontSize: 50,
    },
    categoryName: {
        fontSize: 12,
        color: '#44affbff',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 16,
    },
    horizontalScroll: {
        marginBottom: 20,
    }
});
