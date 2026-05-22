import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, ImageBackground } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QuLifeNavigator from './qu-life/QuLifeNavigator';
import { SettingsProvider } from './qu-life/utils/SettingsContext';
import { LastPositionProvider } from './qu-life/utils/LastPositionContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    async function prepare() {
      try {
        // Load the saved theme from storage so the custom splash screen matches perfectly
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme) {
          setTheme(savedTheme);
        }

        // Hide native splash immediately so we can show our full-screen implementation
        await SplashScreen.hideAsync();

        // Load resources here (simulate a nice load time for splash brand experience)
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
      setShowCustomSplash(false);
    }
  }, [appIsReady]);

  const isDark = theme === 'dark';

  if (showCustomSplash) {
    return (
      <ImageBackground
        source={isDark ? require('./assets/bg_dark_normal.jpg') : require('./assets/bg_light_normal.jpg')}
        style={styles.splashBackground}
        resizeMode="cover"
      >
        <Image
          source={isDark ? require('./assets/bg_dark_landing.jpg') : require('./assets/bg_light_landing.jpg')}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ImageBackground>
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
  splashBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
