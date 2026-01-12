import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, FlatList, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VersePager from '../components/VersePager';
import PlaybackControlPanel from '../components/PlaybackControlPanel';
import { getVersesForSurah } from '../utils/VerseData';
import { useSettings } from '../utils/SettingsContext';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

import { useKeepAwake } from 'expo-keep-awake';
import { useLastPosition } from '../utils/LastPositionContext';

export default function VerseViewScreen({ route, navigation }) {
    useKeepAwake(); // Prevent screen sleep while on this screen
    const { surah, initialVerseIndex, startVerse, endVerse } = route.params;
    const { saveLastPosition } = useLastPosition();
    const [verses, setVerses] = useState([]);
    const [showJumpModal, setShowJumpModal] = useState(false);
    const { fontSize, showTranslation, setShowTranslation, translationCode } = useSettings();

    // Playback State
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex || 0);
    const [loadingAudio, setLoadingAudio] = useState(false);

    // Advanced Settings
    const [autoPlay, setAutoPlay] = useState(false);
    const [repeatMode, setRepeatMode] = useState(1); // 1, 2, 3, 'loop'
    const [delaySeconds, setDelaySeconds] = useState(0); // 0, 3, 5, 10

    // Internal Counters/Refs
    const repeatCounter = useRef(0);
    const pagerRef = useRef(null);
    const isMounted = useRef(true);
    const delayTimeout = useRef(null);

    // Refs for state accessed in callbacks
    const currentVerseIndexRef = useRef(0);
    const loadedVerseIndexRef = useRef(-1);
    const autoPlayRef = useRef(autoPlay);
    const repeatModeRef = useRef(repeatMode);
    const delaySecondsRef = useRef(delaySeconds);

    // Update refs when state changes
    useEffect(() => {
        currentVerseIndexRef.current = currentVerseIndex;
    }, [currentVerseIndex]);

    useEffect(() => {
        autoPlayRef.current = autoPlay;
    }, [autoPlay]);

    useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);

    useEffect(() => {
        delaySecondsRef.current = delaySeconds;
    }, [delaySeconds]);

    useEffect(() => {
        // Reset translation to OFF when opening a new Surah, UNLESS it's a special list logic (optional).
        // Current requirement: Persistent state. So we might NOT want to force reset here if we want global persistence.
        // But per Cycle 3 logic: "Translation Logic: Remove auto-reset. State dictates visibility."
        // So we can actually REMOVE this reset or keep it only for fresh entry. 
        // For now, let's keep it off on fresh entry to avoid surprise.
        // setShowTranslation(false); 

        if (surah) {
            let loadedVerses = getVersesForSurah(surah.kode);

            // Filter if start/end parameters exist
            if (startVerse && endVerse) {
                loadedVerses = loadedVerses.filter(v => v.number >= startVerse && v.number <= endVerse);
            }

            setVerses(loadedVerses);
        }
        return () => { isMounted.current = false; };
    }, [surah, startVerse, endVerse]);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (sound) sound.unloadAsync();
            if (delayTimeout.current) clearTimeout(delayTimeout.current);
        };
    }, [sound]);

    // Configure Audio Mode
    useEffect(() => {
        async function configureAudio() {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {
                console.error("Error configuring audio:", e);
            }
        }
        configureAudio();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: surah?.nama || 'Verse View',
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 15 }}>
                    <Ionicons name="settings-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, surah]);

    // Handle Playback Completion Logic
    const handlePlaybackFinish = async () => {
        setIsPlaying(false);
        repeatCounter.current += 1;

        const mode = repeatModeRef.current;
        const index = currentVerseIndexRef.current;
        const auto = autoPlayRef.current;
        const delay = delaySecondsRef.current;

        // Check Repeat
        if (mode === 'loop' || repeatCounter.current < mode) {
            playVerse(index);
        } else {
            // Finished repeats for this verse
            if (auto) {
                // Check if last verse
                if (index >= verses.length - 1) {
                    // End of Surah
                } else {
                    // Move to next
                    if (delay > 0) {
                        delayTimeout.current = setTimeout(() => {
                            if (isMounted.current) {
                                goToVerse(index + 1);
                            }
                        }, delay * 1000);
                    } else {
                        goToVerse(index + 1);
                    }
                }
            }
        }
    };

    const goToVerse = (index) => {
        if (index >= 0 && index < verses.length) {
            setCurrentVerseIndex(index);
            pagerRef.current?.setPage(index);

            if (autoPlayRef.current) {
                playVerse(index);
            }
        }
    };

    async function playVerse(index) {
        // Stop any currently playing sound
        if (sound) {
            try {
                await sound.unloadAsync();
            } catch (e) {
                // Ignore unload errors
            }
            setSound(null);
            loadedVerseIndexRef.current = -1;
        }

        // Reset repeat counter if it's a new verse
        if (index !== currentVerseIndexRef.current) {
            repeatCounter.current = 0;
        }

        // Ensure state is synced
        setCurrentVerseIndex(index);

        try {
            setLoadingAudio(true);
            setIsPlaying(true);

            const verse = verses[index];

            // Use HTTPS
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.nomor}:${verse.number}/ar.alafasy`);
            const data = await response.json();

            if (data.code === 200 && isMounted.current) {
                const audioUrl = data.data.audio;

                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: false } // Load first, then play
                );

                setSound(newSound);
                loadedVerseIndexRef.current = index;
                setLoadingAudio(false);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        handlePlaybackFinish();
                    }
                });

                await newSound.playAsync();
            } else {
                setLoadingAudio(false);
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Error playing sound:", error);
            setLoadingAudio(false);
            setIsPlaying(false);
        }
    }

    const handleTextToSpeech = (text) => {
        const thingToSay = text || 'Tidak ada terjemahan';
        Speech.stop();
        Speech.speak(thingToSay, { language: 'id' });
    };

    const togglePlayPause = async () => {
        const current = currentVerseIndex;
        const loaded = loadedVerseIndexRef.current;

        if (isPlaying) {
            sound?.pauseAsync();
            setIsPlaying(false);
        } else {
            // If we have a sound loaded AND it matches the current verse, resume it.
            if (sound && loaded === current) {
                try {
                    const status = await sound.getStatusAsync();
                    // Check if finished (either didJustFinish flag or position at end)
                    if (status.isLoaded && (status.didJustFinish || status.positionMillis >= status.durationMillis)) {
                        await sound.replayAsync();
                    } else {
                        await sound.playAsync();
                    }
                    setIsPlaying(true);
                } catch (e) {
                    console.error("Error resuming audio:", e);
                }
            } else {
                // Otherwise (no sound, or user scrolled to different verse), play the current verse.
                repeatCounter.current = 0;
                playVerse(current);
            }
        }
    };

    // Settings Toggles
    const toggleAutoPlay = () => {
        setAutoPlay(!autoPlay);
    };

    const cycleRepeat = () => {
        const modes = [1, 2, 3, 'loop'];
        const idx = modes.indexOf(repeatMode);
        setRepeatMode(modes[(idx + 1) % modes.length]);
    };

    const cycleDelay = () => {
        const delays = [0, 3, 5, 10];
        const idx = delays.indexOf(delaySeconds);
        setDelaySeconds(delays[(idx + 1) % delays.length]);
    };

    const [tempTranslationVisible, setTempTranslationVisible] = useState(false);

    // ... existing refs ...

    if (verses.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No verses found for this Surah.</Text>
            </View>
        );
    }

    // Determine effective visibility
    const isTranslationVisible = showTranslation || tempTranslationVisible;

    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <VersePager
                    ref={pagerRef}
                    style={styles.pagerView}
                    initialPage={initialVerseIndex || 0}
                    onPageSelected={(e) => {
                        const newIndex = e.nativeEvent.position;
                        setCurrentVerseIndex(newIndex);
                        const currentVerse = verses[newIndex];

                        // Reset temporary translation on page turn
                        setTempTranslationVisible(false);

                        // Save Last Position
                        saveLastPosition(surah.kode, currentVerse.number - 1, surah.nama);

                        // If user manually swipes, we should probably reset repeat counter
                        repeatCounter.current = 0;
                        if (isPlaying && !autoPlay) {
                            // sound?.stopAsync(); // Optional
                        }
                    }}
                >
                    {verses.map((verse) => (
                        <View key={String(verse.number)} style={styles.page}>
                            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                <View style={styles.contentContainer}>
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity style={styles.verseHeader} onPress={() => setShowJumpModal(true)}>
                                        <Text style={styles.verseNumber}>Ayat {verse.number} ▼</Text>
                                    </TouchableOpacity>

                                    <View style={styles.arabicContainer}>
                                        <Text style={[styles.arabicText, { fontSize }]}>{verse.arabic}</Text>
                                    </View>

                                    {isTranslationVisible ? (
                                        <View style={[styles.translationContainer, { flex: 1 }]}>
                                            <Text style={styles.translationText}>
                                                {verse.translations?.[translationCode] || verse.translation}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.ttsButton}
                                                onPress={() => handleTextToSpeech(verse.translations?.[translationCode] || verse.translation)}
                                            >
                                                <Ionicons name="volume-high-outline" size={24} color="#007AFF" />
                                                <Text style={styles.ttsText}>Dengar Terjemahan</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.translatePlaceholder}
                                            onPress={() => setTempTranslationVisible(true)}
                                        >
                                            <Text style={styles.tapToTranslate}>Tap untuk terjemahan</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    ))}
                </VersePager>

                <PlaybackControlPanel
                    isPlaying={isPlaying}
                    onPlayPause={togglePlayPause}
                    autoPlay={autoPlay}
                    onToggleAutoPlay={toggleAutoPlay}
                    repeatMode={repeatMode}
                    onCycleRepeat={cycleRepeat}
                    delaySeconds={delaySeconds}
                    onCycleDelay={cycleDelay}
                    showTranslation={showTranslation}
                    onToggleTranslation={() => setShowTranslation(!showTranslation)}
                    loading={loadingAudio}
                />

                {/* Verse Jump Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showJumpModal}
                    onRequestClose={() => setShowJumpModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowJumpModal(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Lompat ke Ayat</Text>
                            <FlatList
                                data={verses}
                                keyExtractor={(item) => String(item.number)}
                                numColumns={4}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.gridItem,
                                            currentVerseIndex === index && styles.gridItemActive
                                        ]}
                                        onPress={() => {
                                            goToVerse(index);
                                            setShowJumpModal(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.gridText,
                                            currentVerseIndex === index && styles.gridTextActive
                                        ]}>
                                            {item.number}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
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
        backgroundColor: 'rgba(255,255,255,0.5)', // Transparent for bg
    },
    // ... existing styles ...
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    gridItem: {
        flex: 1,
        margin: 5,
        height: 50,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    gridItemActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    gridText: {
        fontSize: 16,
        color: '#495057',
    },
    gridTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    contentContainer: {
        flex: 1,
        // justifyContent: 'center', // Removed to allow flax spacers to center content
        alignItems: 'center',
    },
    verseHeader: {
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f1f3f5',
        borderRadius: 20,
    },
    verseNumber: {
        fontSize: 16,
        color: '#495057',
        fontWeight: 'bold',
    },
    arabicContainer: {
        marginBottom: 30,
        width: '100%',
    },
    arabicText: {
        textAlign: 'center',
        color: '#000',
        lineHeight: 80,
    },
    translationContainer: {
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    translationText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#495057',
        lineHeight: 28,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    translatePlaceholder: {
        width: '100%',
        flex: 1, // Consume all remaining space below Arabic text
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        alignItems: 'center',
        paddingTop: 20, // Keep text somewhat near the Arabic
    },
    tapToTranslate: {
        textAlign: 'center',
        color: '#adb5bd',
        fontSize: 14,
        fontStyle: 'italic',
    },
    ttsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        padding: 8,
        backgroundColor: '#e7f5ff',
        borderRadius: 20,
        alignSelf: 'center',
    },
    ttsText: {
        marginLeft: 8,
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
