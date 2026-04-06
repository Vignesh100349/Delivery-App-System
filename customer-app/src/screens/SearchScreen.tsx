import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ActivityIndicator, FlatList, Image, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';

const API_URL = 'https://delivery-app-system.onrender.com';

export const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [useAI, setUseAI] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        } catch (err) {
            console.error('Search fetch error:', err);
            Alert.alert('Network Error', 'The backend server failed to respond. Attempting to search an empty database!');
        } finally {
            setLoading(false);
        }
    };

    // AI-like Semantic Intent Map
    const aiSynonyms: Record<string, string[]> = {
        'sweet': ['chocolate', 'sugar', 'dessert', 'biscuit', 'tooth', 'candy', 'ice cream', 'cake'],
        'healthy': ['fruit', 'vegetable', 'veg', 'fresh', 'apple', 'banana', 'farm', 'green'],
        'morning': ['breakfast', 'milk', 'tea', 'coffee', 'bread', 'egg', 'cereal'],
        'snack': ['munchies', 'biscuit', 'chips', 'crisps', 'namkeen', 'salty', 'doritos', 'lays'],
        'drink': ['cold', 'juice', 'beverage', 'water', 'coke', 'pepsi', 'soda'],
        'spicy': ['chilli', 'masala', 'pepper', 'spices', 'hot', 'sauce'],
        'dairy': ['milk', 'cheese', 'paneer', 'butter', 'curd', 'yogurt']
    };

    const extractIntent = (searchStr: string) => {
        let expandedTerms: string[] = [];
        const lowerSearch = searchStr.toLowerCase();
        
        // Tokenize explicit words so "fresh milk" checks "fresh" and "milk" natively
        const tokens = lowerSearch.split(' ').filter(cmd => cmd.trim().length > 0);
        expandedTerms = [...tokens];
        
        // Check if any semantic synonym trigger words exist in any of the tokens
        Object.entries(aiSynonyms).forEach(([key, matches]) => {
            if (tokens.includes(key)) {
                expandedTerms = [...expandedTerms, ...matches];
            }
        });
        
        return expandedTerms;
    };

    const searchResults = products.filter((p: any) => {
        if (!query.trim()) return false;
        
        const lowerName = (p.name || '').toLowerCase();
        const lowerDesc = (p.description || '').toLowerCase();
        
        if (useAI) {
            // Smart Semantic AI filtering: we want at least one expanded term to match!
            const intentList = extractIntent(query);
            return intentList.some(term => 
                lowerName.includes(term.toLowerCase()) || 
                lowerDesc.includes(term.toLowerCase())
            );
        } else {
            // Strict exact match filtering for the entire sequential string
            return lowerName.includes(query.toLowerCase());
        }
    });

    const categories = [
        { id: '1', name: 'Vegetables', icon: '🥬' },
        { id: '2', name: 'Fruits', icon: '🍎' },
        { id: '3', name: 'Dairy & Breakfast', icon: '🥛' },
        { id: '5', name: 'Munchies', icon: '🍟' },
        { id: '6', name: 'Cold Drinks', icon: '🥤' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header & Search Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#888" style={{marginLeft: 10}} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={useAI ? "Ask AI (e.g. 'I want a healthy snack')" : "Search products explicitly..."}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#888" style={{marginRight: 10}} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* AI Toggle */}
            <View style={styles.aiToggleBar}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="sparkles" size={16} color={useAI ? "#0c831f" : "#888"} />
                    <Text style={[styles.aiToggleText, {color: useAI ? "#0c831f" : "#888"}]}>
                        Smart Semantic Search {useAI ? "ON" : "OFF"}
                    </Text>
                </View>
                <Switch
                    value={useAI}
                    onValueChange={setUseAI}
                    trackColor={{ false: '#d9d9d9', true: '#cde4d3' }}
                    thumbColor={useAI ? '#0c831f' : '#f4f3f4'}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
            </View>

            <View style={{flex: 1}}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0c831f" style={{marginTop: 50}} />
                ) : query.length === 0 ? (
                    <ScrollView contentContainerStyle={styles.emptySearchContainer} showsVerticalScrollIndicator={false}>
                        <Text style={styles.suggestTitle}>Trending Searches</Text>
                        <View style={styles.tagCloud}>
                            {['Milk', 'Morning Breakfast', 'Spicy Snacks', 'Sweet Craving', 'Fresh Veggies'].map((tag, idx) => (
                                <TouchableOpacity key={idx} style={styles.tag} onPress={() => setQuery(tag)}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.suggestTitle, {marginTop: 25}]}>Explore Categories</Text>
                        <View style={styles.exploreGrid}>
                            {categories.map((cat, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={styles.exploreBox}
                                    onPress={() => navigation.navigate('SubCategory', { categoryId: cat.id, categoryName: cat.name })}
                                >
                                    <Text style={styles.exploreEmoji}>{cat.icon}</Text>
                                    <Text style={styles.exploreText}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                ) : searchResults.length === 0 ? (
                    <View style={styles.noResultsContainer}>
                        <Text style={{fontSize: 50}}>🕵️</Text>
                        <Text style={styles.noResultsText}>No products found for "{query}"</Text>
                        {useAI && <Text style={styles.noResultsSub}>Try asking for something else entirely!</Text>}
                    </View>
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item: any) => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        renderItem={({ item }) => (
                            <View style={{ width: '48%', marginBottom: 15 }}>
                                <ProductCard product={item} customStyle={{ width: '100%', marginRight: 0 }} />
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff'},
    backBtn: {
        padding: 5,
        marginRight: 5},
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        height: 45},
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 15,
        color: '#111'},
    aiToggleBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'},
    aiToggleText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5},
    emptySearchContainer: {
        padding: 20},
    suggestTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 15},
    tagCloud: {
        flexDirection: 'row',
        flexWrap: 'wrap'},
    tag: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb'},
    tagText: {
        fontSize: 13,
        color: '#444',
        fontWeight: '500'},
    exploreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'},
    exploreBox: {
        width: '31%',
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10},
    exploreEmoji: {
        fontSize: 24,
        marginBottom: 8},
    exploreText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'},
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'},
    noResultsText: {
        marginTop: 15,
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold'},
    noResultsSub: {
        marginTop: 5,
        fontSize: 13,
        color: '#888'}
});
