import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SpecialListScreen from './screens/SpecialListScreen';
import SurahListScreen from './screens/SurahListScreen';
import VerseViewScreen from './screens/VerseViewScreen';
import SettingsScreen from './screens/SettingsScreen';
import OtherScreen from './screens/OtherScreen';
import AboutScreen from './screens/AboutScreen';
import LogViewerScreen from './screens/LogViewerScreen';
import InspiraScreen from './screens/InspiraScreen';
import LanguageSetupScreen from './screens/LanguageSetupScreen';
import { useSettings } from './utils/SettingsContext';
import { translate } from './utils/i18n';

const Stack = createStackNavigator();

export default function QuLifeNavigator() {
    const { appLanguage, settingsLoaded } = useSettings();

    // Prevent rendering the navigation tree until we know if it's the first launch
    if (!settingsLoaded) return null;

    return (
        <Stack.Navigator
            initialRouteName={appLanguage === null ? "LanguageSetup" : "Home"}
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#007AFF',
                headerTitleStyle: { fontWeight: 'bold' },
                cardStyle: { backgroundColor: '#fff' }, // Fix black flash on navigation
            }}
        >
            <Stack.Screen
                name="LanguageSetup"
                component={LanguageSetupScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SurahList"
                component={SurahListScreen}
                options={{ title: translate('home.surahList', appLanguage) || 'Daftar Surah' }}
            />
            <Stack.Screen
                name="SpecialList"
                component={SpecialListScreen}
                options={{ title: translate('home.specialList', appLanguage) || 'Daftar Khusus' }}
            />
            <Stack.Screen
                name="VerseView"
                component={VerseViewScreen}
                options={{ title: translate('home.verse', appLanguage) || 'Ayat' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: translate('other.settings', appLanguage) || 'Pengaturan' }}
            />
            <Stack.Screen
                name="Other"
                component={OtherScreen}
                options={{ title: translate('home.others', appLanguage) || 'Lain-lain' }}
            />
            <Stack.Screen
                name="Inspira"
                component={InspiraScreen}
                options={{ title: translate('home.inspira', appLanguage) || 'Cari Inspirasi', headerShown: false }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: translate('other.about', appLanguage) || 'Tentang Aplikasi' }}
            />
            <Stack.Screen
                name="LogViewer"
                component={LogViewerScreen}
                options={{ title: translate('other.debug', appLanguage) || 'Debug Logs' }}
            />
        </Stack.Navigator>
    );
}
