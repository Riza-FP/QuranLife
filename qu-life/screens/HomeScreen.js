import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLastPosition } from '../utils/LastPositionContext';
import { getSurahByCode } from '../utils/DataLoader';

let hasShownResumePrompt = false;

export default function HomeScreen({ navigation }) {
    const { lastPosition, isLoaded } = useLastPosition();
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

    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={require('../../qulife_logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>QuLife</Text>
                    <Text style={styles.subtitle}>Petunjuk Hidup dari Al-Quran</Text>
                </View>

                <View style={styles.menuContainer}>
                    {/* Last Read Card */}
                    {isLoaded && lastPosition && (
                        <TouchableOpacity
                            style={[styles.card, styles.lastReadCard]}
                            onPress={handleContinueReading}
                        >
                            <Text style={styles.lastReadLabel}>Terakhir Dibaca</Text>
                            <Text style={styles.cardTitle}>{lastPosition.surahName}</Text>
                            <Text style={styles.cardSubtitle}>Ayat {lastPosition.verseIndex + 1}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('SurahList')}
                    >
                        <Text style={styles.cardTitle}>Daftar Surah</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('SpecialList')}
                    >
                        <Text style={styles.cardTitle}>Daftar Khusus</Text>
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
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Lanjutkan Membaca?</Text>
                            <Text style={styles.modalSubtitle}>
                                Anda terakhir membaca {lastPosition?.surahName} Ayat {lastPosition?.verseIndex + 1}
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowResumeModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Nanti</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={() => {
                                        setShowResumeModal(false);
                                        handleContinueReading();
                                    }}
                                >
                                    <Text style={styles.confirmButtonText}>Lanjut</Text>
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
        backgroundColor: 'rgba(255,255,255,0.5)', // Reduced opacity to show background better
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
        color: '#007AFF',
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
    },
    lastReadCard: {
        backgroundColor: '#e7f5ff', // Light blue tint
        borderColor: '#d0ebff',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    lastReadLabel: {
        fontSize: 12,
        color: '#228be6',
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
        backgroundColor: '#007AFF',
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
