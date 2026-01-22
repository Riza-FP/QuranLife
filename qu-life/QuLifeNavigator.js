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

const Stack = createStackNavigator();

export default function QuLifeNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#007AFF',
                headerTitleStyle: { fontWeight: 'bold' },
                cardStyle: { backgroundColor: '#fff' }, // Fix black flash on navigation
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SurahList"
                component={SurahListScreen}
                options={{ title: 'Daftar Surah' }}
            />
            <Stack.Screen
                name="SpecialList"
                component={SpecialListScreen}
                options={{ title: 'Daftar Khusus' }}
            />
            <Stack.Screen
                name="VerseView"
                component={VerseViewScreen}
                options={{ title: 'Ayat' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Pengaturan' }}
            />
            <Stack.Screen
                name="Other"
                component={OtherScreen}
                options={{ title: 'Lain-lain' }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: 'Tentang Aplikasi' }}
            />
            <Stack.Screen
                name="LogViewer"
                component={LogViewerScreen}
                options={{ title: 'Debug Logs' }}
            />
        </Stack.Navigator>
    );
}
