import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VersePager from '../components/VersePager';
import PlaybackControlPanel from '../components/PlaybackControlPanel';
import { getVersesForSurah } from '../utils/VerseData';
import { useSettings } from '../utils/SettingsContext';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function VerseViewScreen({ route, navigation }) {
    const { surah } = route.params;
    const [verses, setVerses] = useState([]);
    const { fontSize, showTranslation, setShowTranslation, translationCode } = useSettings();

    // Playback State
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
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
        // Reset translation to OFF when opening a new Surah
        setShowTranslation(false);

        if (surah) {
            const loadedVerses = getVersesForSurah(surah.kode);
            setVerses(loadedVerses);
        }
        return () => { isMounted.current = false; };
    }, [surah]);

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

    if (verses.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No verses found for this Surah.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <VersePager
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={(e) => {
                    const newIndex = e.nativeEvent.position;
                    setCurrentVerseIndex(newIndex);

                    // Requirement 1 & 2: 
                    // If Auto Play is OFF => Reset translation to OFF (manual browsing default).
                    // If Auto Play is ON => Keep previous state (persist user choice).
                    if (!autoPlayRef.current) {
                        setShowTranslation(false);
                    }

                    // If user manually swipes, we should probably reset repeat counter
                    repeatCounter.current = 0;
                    // If playing, maybe stop? Or continue?
                    // Standard behavior: Stop if manual swipe.
                    if (isPlaying && !autoPlay) {
                        // sound?.stopAsync(); // Optional
                    }
                }}
            >
                {verses.map((verse) => (
                    <View key={String(verse.number)} style={styles.page}>
                        <View style={styles.contentContainer}>
                            <View style={styles.verseHeader}>
                                <Text style={styles.verseNumber}>Ayat {verse.number}</Text>
                            </View>

                            <View style={styles.arabicContainer}>
                                <Text style={[styles.arabicText, { fontSize }]}>{verse.arabic}</Text>
                            </View>

                            {showTranslation && (
                                <View style={styles.translationContainer}>
                                    <Text style={styles.translationText}>
                                        {verse.translations?.[translationCode] || verse.translation}
                                    </Text>
                                </View>
                            )}
                        </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        justifyContent: 'center',
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
});
