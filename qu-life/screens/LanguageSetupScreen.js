import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../utils/SettingsContext';

export default function LanguageSetupScreen({ navigation }) {
    const { setAppLanguage } = useSettings();

    const selectLanguage = (lang) => {
        setAppLanguage(lang);
        navigation.replace('Home');
    };

    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../qulife_logo_new.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Welcome to QuLife</Text>
                    <Text style={styles.subtitle}>Please select your language / Silakan pilih bahasa Anda</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={() => selectLanguage('id')}
                    >
                        <Text style={styles.languageButtonText}>Bahasa Indonesia</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.languageButton, styles.englishButton]}
                        onPress={() => selectLanguage('en')}
                    >
                        <Text style={[styles.languageButtonText, styles.englishButtonText]}>English</Text>
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
        backgroundColor: 'rgba(255,255,255,0.85)',
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
        color: '#007AFF',
        marginBottom: 12,
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
        backgroundColor: '#007AFF',
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
        borderColor: '#007AFF',
    },
    englishButtonText: {
        color: '#007AFF',
    },
});
