import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

export default function OtherScreen({ navigation }) {
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const REPORT_FORM_URL = appLanguage === 'en' 
        ? "https://forms.gle/z9gNfKpGai5vkPCaA" 
        : "https://forms.gle/fd3n5n3UN85wF7oS7";

    const handleReportPress = async () => {
        try {
            const supported = await Linking.canOpenURL(REPORT_FORM_URL);

            if (supported) {
                await Linking.openURL(REPORT_FORM_URL);
            } else {
                Alert.alert("Error", translate('other.errorNoLink', appLanguage));
            }
        } catch (error) {
            Alert.alert("Error", translate('other.errorOpenLink', appLanguage));
        }
    };

    const handleAboutPress = () => {
        navigation.navigate('About');
    };

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.menuContainer}>
                    {/* Settings Option */}
                    <TouchableOpacity 
                        style={[
                            styles.menuItem, 
                            isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }
                        ]} 
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <View style={[styles.iconContainer, isDark ? { backgroundColor: '#1c261c' } : { backgroundColor: '#e2e6ea' }]}>
                            <Ionicons name="settings-outline" size={24} color={isDark ? '#a5d6a7' : '#6c757d'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.menuTitle, isDark && { color: '#e8f5e9' }]}>{translate('other.settings', appLanguage)}</Text>
                            <Text style={[styles.menuSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('other.settingsSubtitle', appLanguage)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#759e75' : '#ccc'} />
                    </TouchableOpacity>

                    {/* About Option */}
                    <TouchableOpacity 
                        style={[
                            styles.menuItem, 
                            isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }
                        ]} 
                        onPress={handleAboutPress}
                    >
                        <View style={[styles.iconContainer, isDark ? { backgroundColor: '#182c18' } : { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="information-circle-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.menuTitle, isDark && { color: '#e8f5e9' }]}>{translate('other.about', appLanguage)}</Text>
                            <Text style={[styles.menuSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('other.aboutSubtitle', appLanguage)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#759e75' : '#ccc'} />
                    </TouchableOpacity>

                    {/* Report Option */}
                    <TouchableOpacity 
                        style={[
                            styles.menuItem, 
                            isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }
                        ]} 
                        onPress={handleReportPress}
                    >
                        <View style={[styles.iconContainer, isDark ? { backgroundColor: '#2a2415' } : { backgroundColor: '#fff3cd' }]}>
                            <Ionicons name="warning-outline" size={24} color={isDark ? '#e9c46a' : '#ffc107'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.menuTitle, isDark && { color: '#e8f5e9' }]}>{translate('other.report', appLanguage)}</Text>
                            <Text style={[styles.menuSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('other.reportSubtitle', appLanguage)}</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color={isDark ? '#759e75' : '#ccc'} />
                    </TouchableOpacity>

                    {/* Debug Logs Option */}
                    <TouchableOpacity 
                        style={[
                            styles.menuItem, 
                            isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }
                        ]} 
                        onPress={() => navigation.navigate('LogViewer')}
                    >
                        <View style={[styles.iconContainer, isDark ? { backgroundColor: '#2d1618' } : { backgroundColor: '#ffe8e8' }]}>
                            <Ionicons name="bug-outline" size={24} color={isDark ? '#e57373' : '#dc3545'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.menuTitle, isDark && { color: '#e8f5e9' }]}>{translate('other.debug', appLanguage) || 'Debug Logs'}</Text>
                            <Text style={[styles.menuSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('other.debugSubtitle', appLanguage) || 'Lihat log error sistem'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? '#759e75' : '#ccc'} />
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
        backgroundColor: 'transparent',
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
