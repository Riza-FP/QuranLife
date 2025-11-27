import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SurahListScreen from './screens/SurahListScreen';
import VerseViewScreen from './screens/VerseViewScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

export default function QuLifeNavigator() {
    return (
        <Stack.Navigator initialRouteName="SurahList">
            <Stack.Screen name="SurahList" component={SurahListScreen} options={{ title: 'QuLife' }} />
            <Stack.Screen name="VerseView" component={VerseViewScreen} options={{ title: 'Verse View' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
    );
}
