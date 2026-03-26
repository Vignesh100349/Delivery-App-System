$screens = @{
    "Auth" = @("LoginScreen", "OTPScreen", "ProfileSetupScreen")
    "Location" = @("LocationPermissionScreen", "SelectLocationScreen", "ManageAddressScreen", "AddEditAddressScreen")
    "Home" = @("HomeScreen", "SearchScreen", "ProductListScreen", "ProductDetailScreen")
    "Cart" = @("CartScreen", "CouponScreen", "CheckoutScreen", "PaymentScreen")
    "Order" = @("OrderSuccessScreen", "LiveTrackingScreen", "OrderHistoryScreen", "OrderDetailScreen")
    "Reviews" = @("RateOrderScreen")
    "Wallet" = @("WalletScreen", "OffersScreen")
    "Profile" = @("ProfileScreen", "EditProfileScreen", "SupportScreen", "SettingsScreen")
    "Utility" = @("NotificationScreen", "NoServiceScreen", "NetworkErrorScreen")
}

foreach ($category in $screens.Keys) {
    if (!(Test-Path "src/screens/$category")) {
        New-Item -ItemType Directory -Force -Path "src/screens/$category" | Out-Null
    }
    foreach ($screen in $screens[$category]) {
        $content = @"
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const $screen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>$screen</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default $screen;
"@
        Set-Content -Path "src/screens/$category/$screen.tsx" -Value $content
    }
}
