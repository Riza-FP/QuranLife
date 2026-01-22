import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OtherScreen({ navigation }) {

    // Dummy link for now
    const REPORT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe_dummy_link/viewform";

    const handleReportPress = async () => {
        try {
            const supported = await Linking.canOpenURL(REPORT_FORM_URL);

            if (supported) {
                await Linking.openURL(REPORT_FORM_URL);
            } else {
                Alert.alert("Error", "Tidak dapat membuka link laporan.");
            }
        } catch (error) {
            Alert.alert("Error", "Terjadi kesalahan saat membuka link.");
        }
    };

    const handleAboutPress = () => {
        navigation.navigate('About');
    };

    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#e2e6ea' }]}>
                            <Ionicons name="settings-outline" size={24} color="#6c757d" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.menuTitle}>Pengaturan</Text>
                            <Text style={styles.menuSubtitle}>Konfigurasi global aplikasi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleAboutPress}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.menuTitle}>Tentang</Text>
                            <Text style={styles.menuSubtitle}>Informasi aplikasi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleReportPress}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff3cd' }]}>
                            <Ionicons name="warning-outline" size={24} color="#ffc107" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.menuTitle}>Laporan</Text>
                            <Text style={styles.menuSubtitle}>Laporkan kesalahan atau usulan</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LogViewer')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#ffe8e8' }]}>
                            <Ionicons name="bug-outline" size={24} color="#dc3545" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.menuTitle}>Debug Logs</Text>
                            <Text style={styles.menuSubtitle}>Lihat log error sistem</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 20,
    },
    menuContainer: {
        marginTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e7f5ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#868e96',
    },
});
