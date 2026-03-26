import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'https://delivery-app-system.onrender.com';

export const SubCategoryScreen = ({ route }: any) => {
    const { id, name } = route.params || { id: '1-1', name: 'Products' };
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        // Dynamically set header title based on passed category name
        navigation.setOptions({ title: name });
        fetchProducts();
    }, [name, id]);

    const fetchProducts = async () => {
        try {
            // Extract the main category ID (e.g. '1-2' -> '1') to query products tied to the DB Category.
            const mainCategoryId = String(id).split('-')[0];
            const res = await axios.get(`${API_URL}/products?category=${mainCategoryId}`);

            setProducts(res.data);
        } catch (err) {
            console.log('Error fetching category products', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0c831f" />
                </View>
            ) : products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No products found here yet.</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.productGrid}>
                        {products.map((item) => (
                            <View key={item.id} style={styles.gridItem}>
                                <ProductCard product={{ ...item, weight: '1 pc' }} />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            <FloatingCartButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 100, // Space for FloatingCartButton
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    gridItem: {
        width: '50%',
        paddingRight: 10,
        marginBottom: 10,
        alignItems: 'center',
    }
});
