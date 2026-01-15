import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../qulife_logo_new.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>QuLife</Text>
                        <Text style={styles.version}>v1.0.0</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.description}>
                            Aplikasi Al-Quran digital yang dirancang untuk memudahkan membaca dan memahami Al-Quran dengan fitur audio dan terjemahan yang lengkap.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.copyright}>© 2026 Roni Mhd Learning Center</Text>
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
        backgroundColor: 'rgba(255,255,255,0.8)', // Slightly more opaque for readability
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
        color: '#007AFF',
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
