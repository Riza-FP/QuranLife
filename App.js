import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QuLifeNavigator from './qu-life/QuLifeNavigator';
import { SettingsProvider } from './qu-life/utils/SettingsContext';
import { LastPositionProvider } from './qu-life/utils/LastPositionContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useState } from 'react';

// Prevent auto hide - we will hide it swiftly to show OUR custom full-screen image
SplashScreen.preventAutoHideAsync();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff', // Force white background to stop black flicker
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide native splash immediately so we can show our full-screen implementation
        await SplashScreen.hideAsync();

        // Load resources here
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Fade out custom splash when ready
  useEffect(() => {
    if (appIsReady) {
      // Optional: Add animation here if desired, for now just switch
      setShowCustomSplash(false);
    }
  }, [appIsReady]);

  if (showCustomSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Image
          source={require('./qulife_landing-page.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <LastPositionProvider>
          <NavigationContainer theme={MyTheme}>
            <QuLifeNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </LastPositionProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
