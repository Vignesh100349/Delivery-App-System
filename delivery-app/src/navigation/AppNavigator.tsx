import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { driverId } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!driverId ? (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                ) : (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: false, presentation: 'modal' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
