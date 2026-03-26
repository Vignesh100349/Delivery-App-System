import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ImageSplashScreen } from './src/screens/ImageSplashScreen';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  return (
    <SafeAreaProvider>
      {/* Set status bar style to dark-content which fits white backgrounds */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {!isSplashFinished ? (
        <ImageSplashScreen onFinish={() => setIsSplashFinished(true)} />
      ) : (
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}
