import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../utils/SettingsContext';

export default function LanguageSetupScreen({ navigation }) {
    const { setAppLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const selectLanguage = (lang) => {
        setAppLanguage(lang);
        navigation.replace('Home');
    };

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/aktifi_icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: isDark ? '#81c784' : '#2e7d32' }]}>Welcome to Aktifi - Quran</Text>
                    <Text style={[styles.subtitle, isDark && { color: '#a5d6a7' }]}>Please select your language / Silakan pilih bahasa Anda</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.languageButton, { backgroundColor: isDark ? '#1b5e20' : '#2e7d32' }]}
                        onPress={() => selectLanguage('id')}
                    >
                        <Text style={styles.languageButtonText}>Bahasa Indonesia</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.languageButton,
                            styles.englishButton,
                            {
                                backgroundColor: isDark ? '#1c261c' : '#fff',
                                borderColor: isDark ? '#81c784' : '#2e7d32'
                            }
                        ]}
                        onPress={() => selectLanguage('en')}
                    >
                        <Text style={[
                            styles.languageButtonText,
                            styles.englishButtonText,
                            { color: isDark ? '#81c784' : '#2e7d32' }
                        ]}>English</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 24,
        borderRadius: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 16, // Requires React Native 0.71+
    },
    languageButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 16, // Fallback if gap isn't supported
    },
    languageButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    englishButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2e7d32',
    },
    englishButtonText: {
        color: '#2e7d32',
    },
});
