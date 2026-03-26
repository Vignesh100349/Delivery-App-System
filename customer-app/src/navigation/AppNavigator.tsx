import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { DummyScreen } from '../screens/DummyScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SubCategoryScreen } from '../screens/SubCategoryScreen';
import { PaymentMethodsScreen } from '../screens/PaymentMethodsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { PaymentAuthScreen } from '../screens/PaymentAuthScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { AddressBookScreen } from '../screens/AddressBookScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { ManagePaymentMethodsScreen } from '../screens/ManagePaymentMethodsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#0c831f', // Blinkit green
                tabBarInactiveTintColor: '#888',
                tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any = 'help-circle-outline';

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Categories') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'CartTab') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{ title: 'Categories' }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{ title: 'Cart' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!isAuthenticated ? (
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen} 
                        options={{ headerShown: false }} 
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Main"
                            component={BottomTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Cart"
                            component={CartScreen}
                            options={{
                                title: 'Checkout',
                                headerStyle: { backgroundColor: '#fff' },
                                headerTintColor: '#000',
                                headerBackTitle: ''
                            }}
                        />
                        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Your Order History' }} />
                        <Stack.Screen name="PaymentAuth" component={PaymentAuthScreen} options={{ headerShown: false, presentation: 'modal' }} />
                        
                        <Stack.Screen name="AddressBook" component={AddressBookScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ManagePaymentMethods" component={ManagePaymentMethodsScreen} options={{ headerShown: false }} />
                        
                        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Checkout & Payment' }} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SubCategory" component={SubCategoryScreen} options={{ title: 'Products' }} />
                        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
