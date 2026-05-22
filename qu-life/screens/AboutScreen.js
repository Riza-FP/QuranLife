import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

export default function AboutScreen() {
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';
    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/aktifi_icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.appName, { color: isDark ? '#81c784' : '#2e7d32' }]}>Aktifi - Quran</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                    </View>

                    <View style={[styles.infoContainer, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                        <Text style={[styles.description, isDark && { color: '#a5d6a7' }]}>
                            {translate('about.description', appLanguage)}
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.copyright, { color: isDark ? '#759e75' : '#495057' }]}>© 2026 Roni Mhd Learning Center</Text>
                    </View>
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
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
        borderRadius: 20, // Matches app icon style usually
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 8,
    },
    version: {
        fontSize: 16,
        color: '#868e96',
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 40,
    },
    description: {
        fontSize: 16,
        color: '#495057',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    copyright: {
        fontSize: 14,
        color: '#adb5bd',
        textAlign: 'center',
    },
});
