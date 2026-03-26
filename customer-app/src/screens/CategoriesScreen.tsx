import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const MAIN_CATEGORIES = [
    { id: '1', name: 'Vegetables & Fruits' },
    { id: '2', name: 'Dairy & Breakfast' },
    { id: '3', name: 'Munchies' },
    { id: '4', name: 'Cold Drinks & Juices' },
    { id: '5', name: 'Instant & Frozen Food' },
    { id: '6', name: 'Tea, Coffee & Health Drinks' },
    { id: '7', name: 'Bakery & Biscuits' },
    { id: '8', name: 'Sweet Tooth' },
    { id: '9', name: 'Atta, Rice & Dal' },
    { id: '10', name: 'Dry Fruits, Masala & Oil' },
];

const SUB_CATEGORIES: any = {
    '1': [
        { id: '1-1', name: 'Fresh Vegetables', emoji: '🥦' },
        { id: '1-2', name: 'Fresh Fruits', emoji: '🍎' },
        { id: '1-3', name: 'Exotic Fruits', emoji: '🥝' },
        { id: '1-4', name: 'Leafy, Herbs & Seasonings', emoji: '🌿' },
    ],
    '2': [
        { id: '2-1', name: 'Milk', emoji: '🥛' },
        { id: '2-2', name: 'Bread & Pav', emoji: '🍞' },
        { id: '2-3', name: 'Eggs', emoji: '🥚' },
        { id: '2-4', name: 'Paneer & Tofu', emoji: '🧀' },
        { id: '2-5', name: 'Butter & Cheese', emoji: '🧈' },
        { id: '2-6', name: 'Breakfast Cereals', emoji: '🥣' },
    ],
    '3': [
        { id: '3-1', name: 'Chips & Crisps', emoji: '🥔' },
        { id: '3-2', name: 'Nachos & Tortilla', emoji: '🌮' },
        { id: '3-3', name: 'Bhujia & Mixtures', emoji: '🥣' },
        { id: '3-4', name: 'Popcorn & Roasted', emoji: '🍿' },
    ],
    '4': [
        { id: '4-1', name: 'Soft Drinks', emoji: '🥤' },
        { id: '4-2', name: 'Fruit Juices', emoji: '🧃' },
        { id: '4-3', name: 'Energy Drinks', emoji: '⚡' },
        { id: '4-4', name: 'Water & Soda', emoji: '💧' },
    ],
    '5': [
        { id: '5-1', name: 'Noodles & Pasta', emoji: '🍜' },
        { id: '5-2', name: 'Frozen Snacks', emoji: '🍟' },
        { id: '5-3', name: 'Ice Creams', emoji: '🍦' },
        { id: '5-4', name: 'Ready To Eat', emoji: '🍛' },
    ],
    '6': [
        { id: '6-1', name: 'Tea', emoji: '☕' },
        { id: '6-2', name: 'Coffee', emoji: '🍵' },
        { id: '6-3', name: 'Health Drinks', emoji: '💪' },
        { id: '6-4', name: 'Protein Powder', emoji: '🍼' },
    ],
    '7': [
        { id: '7-1', name: 'Cookies', emoji: '🍪' },
        { id: '7-2', name: 'Rusk & Khari', emoji: '🥖' },
        { id: '7-3', name: 'Cakes & Muffins', emoji: '🧁' },
        { id: '7-4', name: 'Premium Biscuits', emoji: '🥠' },
    ],
    '8': [
        { id: '8-1', name: 'Chocolates', emoji: '🍫' },
        { id: '8-2', name: 'Indian Sweets', emoji: '🍧' },
        { id: '8-3', name: 'Candies & Gum', emoji: '🍬' },
        { id: '8-4', name: 'Mint & Fresheners', emoji: '🍬' },
    ],
    '9': [
        { id: '9-1', name: 'Atta & Flour', emoji: '🌾' },
        { id: '9-2', name: 'Rice & Poha', emoji: '🍚' },
        { id: '9-3', name: 'Dals & Pulses', emoji: '🍲' },
    ],
    '10': [
        { id: '10-1', name: 'Dry Fruits', emoji: '🥜' },
        { id: '10-2', name: 'Edible Oils', emoji: '🛢️' },
        { id: '10-3', name: 'Ghee', emoji: '🍯' },
        { id: '10-4', name: 'Spices & Masalas', emoji: '🌶️' },
    ]
};

export const CategoriesScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [selectedCategory, setSelectedCategory] = useState(MAIN_CATEGORIES[0].id);

    useEffect(() => {
        if (route.params?.categoryId) {
            setSelectedCategory(route.params.categoryId);
        }
    }, [route.params?.categoryId]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Categories</Text>
            </View>
            <View style={styles.container}>
                {/* Left Sidebar */}
                <View style={styles.sidebar}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {MAIN_CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.sidebarItem,
                                    selectedCategory === category.id && styles.sidebarItemSelected
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <View style={[
                                    styles.selectionIndicator,
                                    selectedCategory === category.id && styles.selectionIndicatorActive
                                ]} />
                                <Text style={[
                                    styles.sidebarText,
                                    selectedCategory === category.id && styles.sidebarTextSelected
                                ]}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Right Content Area */}
                <View style={styles.contentArea}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.subCategoryGrid}>
                        {(SUB_CATEGORIES[selectedCategory] || []).length > 0 ? (
                            SUB_CATEGORIES[selectedCategory].map((subCat: any) => (
                                <TouchableOpacity
                                    key={subCat.id}
                                    style={styles.subCategoryCard}
                                    onPress={() => navigation.navigate('SubCategory', { id: subCat.id, name: subCat.name })}
                                >
                                    <View style={styles.subCategoryEmojiContainer}>
                                        <Text style={styles.subCategoryEmoji}>{subCat.emoji}</Text>
                                    </View>
                                    <Text style={styles.subCategoryName} numberOfLines={2}>
                                        {subCat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyContent}>
                                <Text style={styles.emptyText}>Items coming soon carefully packed for you! 🛍️</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 100,
        backgroundColor: '#f8f8f8',
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    sidebarItem: {
        paddingVertical: 18,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sidebarItemSelected: {
        backgroundColor: '#fff',
    },
    selectionIndicator: {
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: 10,
        width: 4,
        backgroundColor: 'transparent',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    selectionIndicatorActive: {
        backgroundColor: '#0c831f', // Blinkit green
    },
    sidebarText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        textAlign: 'center',
    },
    sidebarTextSelected: {
        color: '#0c831f',
        fontWeight: 'bold',
    },
    contentArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    subCategoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
    },
    subCategoryCard: {
        width: '48%',
        backgroundColor: '#fefefe',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 1, // subtle shadow for android
        shadowColor: '#000', // subtle shadow for ios
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    subCategoryEmojiContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#f1f8f3',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    subCategoryEmoji: {
        fontSize: 30,
    },
    subCategoryName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    emptyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    }
});
