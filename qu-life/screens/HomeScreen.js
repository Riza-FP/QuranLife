import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLastPosition } from '../utils/LastPositionContext';
import { getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

let hasShownResumePrompt = false;

export default function HomeScreen({ navigation }) {
    const { lastPosition, isLoaded } = useLastPosition();
    const { appLanguage, theme } = useSettings();
    const [showResumeModal, setShowResumeModal] = useState(false);

    useEffect(() => {
        if (isLoaded && !hasShownResumePrompt) {
            // Only show if we truly have a saved position from BEFORE this session
            if (lastPosition) {
                setShowResumeModal(true);
            }
            // Mark as handled immediately so it doesn't trigger again when lastPosition updates during reading
            hasShownResumePrompt = true;
        }
    }, [isLoaded]); // Remove lastPosition from dependencies to prevent re-triggering

    const handleContinueReading = () => {
        if (lastPosition) {
            const surahData = getSurahByCode(lastPosition.surahId);
            if (surahData) {
                navigation.navigate('VerseView', {
                    surah: surahData,
                    initialVerseIndex: lastPosition.verseIndex
                });
            }
        }
    };

    const isDark = theme === 'dark';

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_home.jpg') : require('../../assets/bg_light_home.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                        <Image
                            source={require('../../assets/aktifi_icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, isDark && { color: '#81c784' }]}>{translate('home.title', appLanguage)}</Text>
                        <Text style={[styles.subtitle, isDark && { color: '#a5d6a7' }]}>{translate('home.subtitle', appLanguage)}</Text>
                    </View>

                    <View style={styles.menuContainer}>
                        {/* Last Read Card */}
                        {isLoaded && lastPosition && (
                            <TouchableOpacity
                            style={[
                                styles.card, 
                                styles.lastReadCard, 
                                isDark && { backgroundColor: '#182c18', borderColor: '#2d3b2d', shadowColor: '#0c120c' }
                            ]}
                            onPress={handleContinueReading}
                        >
                            <Text style={[styles.lastReadLabel, isDark && { color: '#81c784' }]}>{translate('home.lastRead', appLanguage)}</Text>
                            <Text style={[styles.cardTitle, isDark && { color: '#e8f5e9' }]}>{lastPosition.surahName}</Text>
                            <Text style={[styles.cardSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('home.verse', appLanguage)} {lastPosition.verseIndex + 1}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', shadowColor: '#0c120c' }]}
                        onPress={() => navigation.navigate('SurahList')}
                    >
                        <Text style={[styles.cardTitle, isDark && { color: '#e8f5e9' }]}>{translate('home.surahList', appLanguage)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', shadowColor: '#0c120c' }]}
                        onPress={() => navigation.navigate('SpecialList')}
                    >
                        <Text style={[styles.cardTitle, isDark && { color: '#e8f5e9' }]}>{translate('home.specialList', appLanguage)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', shadowColor: '#0c120c' }]}
                        onPress={() => navigation.navigate('Inspira')}
                    >
                        <Text style={[styles.cardTitle, isDark && { color: '#e8f5e9' }]}>{translate('home.inspira', appLanguage) || 'Cari Inspirasi'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', shadowColor: '#0c120c' }]}
                        onPress={() => navigation.navigate('Other')}
                    >
                        <Text style={[styles.cardTitle, isDark && { color: '#e8f5e9' }]}>{translate('home.others', appLanguage)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Resume Modal */}
                <Modal
                    transparent={true}
                    visible={showResumeModal}
                    animationType="fade"
                    onRequestClose={() => setShowResumeModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                            <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>{translate('home.resumeTitle', appLanguage)}</Text>
                            <Text style={[styles.modalSubtitle, isDark && { color: '#a5d6a7' }]}>
                                {translate('home.resumeSubtitle', appLanguage)} {lastPosition?.surahName} {translate('home.verse', appLanguage)} {lastPosition?.verseIndex + 1}
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton, isDark && { backgroundColor: '#222f22' }]}
                                    onPress={() => setShowResumeModal(false)}
                                >
                                    <Text style={[styles.cancelButtonText, isDark && { color: '#a5d6a7' }]}>{translate('home.later', appLanguage)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton, isDark && { backgroundColor: '#1b5e20' }]}
                                    onPress={() => {
                                        setShowResumeModal(false);
                                        handleContinueReading();
                                    }}
                                >
                                    <Text style={styles.confirmButtonText}>{translate('home.continue', appLanguage)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView >
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
    header: {
        padding: 30,
        alignItems: 'center',
        marginTop: 30,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 15,
        borderRadius: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    menuContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        borderColor: '#e9ecef',
        borderWidth: 1,
    },
    lastReadCard: {
        backgroundColor: '#e8f5e9', // Light green tint
        borderColor: '#c8e6c9',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    lastReadLabel: {
        fontSize: 12,
        color: '#2e7d32',
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#868e96',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f1f3f5',
    },
    confirmButton: {
        backgroundColor: '#2e7d32',
    },
    cancelButtonText: {
        color: '#495057',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
