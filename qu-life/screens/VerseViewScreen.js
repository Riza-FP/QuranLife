import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, FlatList, ScrollView, ImageBackground, Switch, ToastAndroid, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VersePager from '../components/VersePager';
import PlaybackControlPanel from '../components/PlaybackControlPanel';
import { getVersesForSurah } from '../utils/VerseData';
import { getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

import { useKeepAwake } from 'expo-keep-awake';
import { useLastPosition } from '../utils/LastPositionContext';
import Logger from '../utils/Logger'; // Import Logger

import AsyncStorage from '@react-native-async-storage/async-storage'; // Add Import
import { updatePenandaDelayConfig, updatePlaylistDelayConfig } from '../utils/PlaylistManager';

export default function VerseViewScreen({ route, navigation }) {
    useKeepAwake(); // Prevent screen sleep while on this screen
    const { surah, initialVerseIndex, startVerse, endVerse, contextType, contextId, delayConfig } = route.params;
    const { saveLastPosition } = useLastPosition();
    const [verses, setVerses] = useState([]);
    const [showJumpModal, setShowJumpModal] = useState(false);
    const {
        fontSize, showTranslation, setShowTranslation, translationCode, translationLanguage, voiceIdentifier,
        defaultDelay, defaultRepeat,
        theme,
        // Rename Globals to avoid conflict with Local State
        autoPlayOrder: globalAutoPlayOrder,
        autoPlayEnabledTranslation: globalEnabledTranslation,
        delayPreArabic: globalDelayPreArabic,
        delayPostArabic: globalDelayPostArabic,
        delayPreTranslation: globalDelayPreTranslation,
        delayPostTranslation: globalDelayPostTranslation,
        delaySequenceLoop: globalDelaySequenceLoop,
        appLanguage
    } = useSettings();
    const { translate } = require('../utils/i18n');

    // Playback State
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex || 0);
    const [loadingAudio, setLoadingAudio] = useState(false);

    const passedDelay = delayConfig || {};

    // Advanced Local Settings (Initialized with Globals, but can be overridden)
    const [autoPlay, setAutoPlay] = useState(false);
    const [repeatMode, setRepeatMode] = useState(passedDelay.repeatMode ?? (defaultRepeat || 1));
    const [delaySeconds, setDelaySeconds] = useState(passedDelay.delaySeconds ?? (defaultDelay || 0)); // "Delay Per Ayat" alias

    // State for Session Override (Auto Play Modal)
    const [autoConfig, setAutoConfig] = useState({
        startVerse: 1,
        endVerse: 1,
        sequenceRepeat: 1,
        verseRepeat: 1,
        // Session Overrides (Init with persistent defaults)
        playTranslation: passedDelay.enabledTranslation ?? globalEnabledTranslation,
        delayPreArabic: passedDelay.delayPreArabic ?? globalDelayPreArabic,
        delayPostArabic: passedDelay.delayPostArabic ?? globalDelayPostArabic,
        delayPreTranslation: passedDelay.delayPreTranslation ?? globalDelayPreTranslation,
        delayPostTranslation: passedDelay.delayPostTranslation ?? globalDelayPostTranslation,
        delaySequenceLoop: passedDelay.delaySequenceLoop ?? globalDelaySequenceLoop
    });

    const [showAutoModal, setShowAutoModal] = useState(false);
    const [showAutoDetail, setShowAutoDetail] = useState(false);
    const [showSurahSettings, setShowSurahSettings] = useState(false);

    // Initialize/Reset Session Config when Modal Opens


    // ... (Playback Engine Logic Updated to Accept Config)


    const [localAutoPlayOrder, setLocalAutoPlayOrder] = useState(passedDelay.autoPlayOrder ?? globalAutoPlayOrder);
    const [localEnabledTranslation, setLocalEnabledTranslation] = useState(passedDelay.enabledTranslation ?? globalEnabledTranslation);
    const [localDelayPreArabic, setLocalDelayPreArabic] = useState(passedDelay.delayPreArabic ?? globalDelayPreArabic);
    const [localDelayPostArabic, setLocalDelayPostArabic] = useState(passedDelay.delayPostArabic ?? globalDelayPostArabic);
    const [localDelayPreTranslation, setLocalDelayPreTranslation] = useState(passedDelay.delayPreTranslation ?? globalDelayPreTranslation);
    const [localDelayPostTranslation, setLocalDelayPostTranslation] = useState(passedDelay.delayPostTranslation ?? globalDelayPostTranslation);
    const [localDelaySequenceLoop, setLocalDelaySequenceLoop] = useState(passedDelay.delaySequenceLoop ?? globalDelaySequenceLoop);

    const [showBottomSettings, setShowBottomSettings] = useState(false);

    // Load Saved Surah Settings on Mount/Change
    useEffect(() => {
        async function loadSurahSettings() {
            if (contextType) return; // Skip if playing Playlist/Penanda to respect specific config
            try {
                const key = `surah_settings_${surah.kode}`;
                const saved = await AsyncStorage.getItem(key);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setLocalAutoPlayOrder(parsed.autoPlayOrder ?? globalAutoPlayOrder);
                    setLocalEnabledTranslation(parsed.enabledTranslation ?? globalEnabledTranslation);
                    setLocalDelayPreArabic(parsed.delayPreArabic ?? globalDelayPreArabic);
                    setLocalDelayPostArabic(parsed.delayPostArabic ?? globalDelayPostArabic);
                    setLocalDelayPreTranslation(parsed.delayPreTranslation ?? globalDelayPreTranslation);
                    setLocalDelayPostTranslation(parsed.delayPostTranslation ?? globalDelayPostTranslation);
                    setLocalDelaySequenceLoop(parsed.delaySequenceLoop ?? globalDelaySequenceLoop);

                    // Also generic basics
                    if (parsed.delaySeconds !== undefined) setDelaySeconds(parsed.delaySeconds);
                    if (parsed.repeatMode !== undefined) setRepeatMode(parsed.repeatMode);
                } else {
                    // Reset to Global Defaults if no custom save exists
                    setLocalAutoPlayOrder(globalAutoPlayOrder);
                    setLocalEnabledTranslation(globalEnabledTranslation);
                    setLocalDelayPreArabic(globalDelayPreArabic);
                    setLocalDelayPostArabic(globalDelayPostArabic);
                    setLocalDelayPreTranslation(globalDelayPreTranslation);
                    setLocalDelayPostTranslation(globalDelayPostTranslation);
                    setLocalDelaySequenceLoop(globalDelaySequenceLoop);
                    setDelaySeconds(defaultDelay);
                    setRepeatMode(defaultRepeat);
                }
            } catch (e) {
                console.log("Error loading surah settings", e);
            }
        }
        if (surah?.kode) loadSurahSettings();
    }, [surah?.kode, globalAutoPlayOrder]); // Re-run if global defaults change? Maybe better not to overwrite user overrides. But if no override, yes. This logic is simple enough.

    // Internal Counters/Refs
    const repeatCounter = useRef(0);
    const pagerRef = useRef(null);
    const isMounted = useRef(true);
    const delayTimeout = useRef(null);
    const versesRef = useRef([]);
    const showTranslationRef = useRef(showTranslation);

    useEffect(() => {
        showTranslationRef.current = showTranslation;
    }, [showTranslation]);

    // Refs for state accessed in callbacks
    const currentVerseIndexRef = useRef(0);
    const loadedVerseIndexRef = useRef(-1);
    const autoPlayRef = useRef(autoPlay);
    const repeatModeRef = useRef(repeatMode);
    const delaySecondsRef = useRef(delaySeconds);

    const autoPlayOrderRef = useRef(localAutoPlayOrder);
    const autoPlayEnabledTranslationRef = useRef(localEnabledTranslation);
    const delayPreArabicRef = useRef(localDelayPreArabic);
    const delayPostArabicRef = useRef(localDelayPostArabic);
    const delayPreTranslationRef = useRef(localDelayPreTranslation);
    const delayPostTranslationRef = useRef(localDelayPostTranslation);
    const delaySequenceLoopRef = useRef(localDelaySequenceLoop);

    // Audio Ref to prevent stale state issues during async chains
    const soundRef = useRef(null);

    // Update refs when state changes
    useEffect(() => {
        currentVerseIndexRef.current = currentVerseIndex;
    }, [currentVerseIndex]);

    useEffect(() => {
        if (autoPlayRef.current) return; // Do not overwrite active session config during auto-play!
        autoPlayOrderRef.current = localAutoPlayOrder;
        autoPlayEnabledTranslationRef.current = localEnabledTranslation;
        delayPreArabicRef.current = localDelayPreArabic;
        delayPostArabicRef.current = localDelayPostArabic;
        delayPreTranslationRef.current = localDelayPreTranslation;
        delayPostTranslationRef.current = localDelayPostTranslation;
        delaySequenceLoopRef.current = localDelaySequenceLoop;
    }, [localAutoPlayOrder, localEnabledTranslation, localDelayPreArabic, localDelayPostArabic, localDelayPreTranslation, localDelayPostTranslation, localDelaySequenceLoop]);

    useEffect(() => {
        autoPlayRef.current = autoPlay;
    }, [autoPlay]);

    useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);

    useEffect(() => {
        delaySecondsRef.current = delaySeconds;
    }, [delaySeconds]);

    // Track Translation Visibility for Auto-Play (kept for future use or state sync)
    // Note: User paused auto-play feature, but maintaining state consistency logic is fine.
    const [tempTranslationVisible, setTempTranslationVisible] = useState(false);

    // Determine effective visibility (moved up for Ref access)
    const isTranslationVisible = showTranslation || tempTranslationVisible;

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

            versesRef.current = loadedVerses;
            setVerses(loadedVerses);

            if (route.params.autoStartPlaying && loadedVerses.length > 0) {
                const config = {
                    startVerse: loadedVerses[0].number,
                    endVerse: loadedVerses[loadedVerses.length - 1].number,
                    sequenceRepeat: route.params.playlistSequenceRepeat || 1,
                    verseRepeat: route.params.playlistVerseRepeat || repeatMode || 1,
                    playTranslation: route.params.playlistPlayTranslation !== undefined ? route.params.playlistPlayTranslation : localEnabledTranslation,
                    delayPreArabic: localDelayPreArabic,
                    delayPostArabic: localDelayPostArabic,
                    delayPreTranslation: localDelayPreTranslation,
                    delayPostTranslation: localDelayPostTranslation,
                    delaySequenceLoop: localDelaySequenceLoop,
                    order: route.params.playlistOrder || localAutoPlayOrder
                };
                
                autoEndVerseRef.current = config.endVerse;
                autoStartVerseRef.current = config.startVerse;
                autoSequenceRef.current = config.sequenceRepeat;
                delayPostArabicRef.current = config.delayPostArabic;
                delaySequenceLoopRef.current = config.delaySequenceLoop;
                autoPlayEnabledTranslationRef.current = config.playTranslation;
                autoPlayOrderRef.current = config.order;

                setAutoPlay(true);
                autoPlayRef.current = true;

                setTimeout(() => {
                    if (autoPlayRef.current) {
                        playBasmalah(() => {
                            if (autoPlayRef.current) {
                                playVerseSequence(0, config);
                            }
                        });
                    }
                }, 600);
            }
        }
    }, [surah, startVerse, endVerse]);

    // Cleanup sound on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (soundRef.current) soundRef.current.unloadAsync();
            if (delayTimeout.current) clearTimeout(delayTimeout.current);
        };
    }, []); // Run only on unmount (Ref access is safe)

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
                Logger.logError("Audio Configuration Failed", e);
            }
        }
        configureAudio();
    }, []);



    useLayoutEffect(() => {
        navigation.setOptions({
            title: surah?.nama || 'Verse View',
            headerRight: () => (
                <TouchableOpacity onPress={() => setShowSurahSettings(true)} style={{ marginRight: 15 }}>
                    <Ionicons name="settings-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, surah]);

    // Surah Settings State (Top Right)


    // State for Basmalah Pre-roll
    const [isPreRolling, setIsPreRolling] = useState(false);
    // State for Local Translation Audio (Tri-state: hidden -> visible -> playing -> hidden)
    // We track which verse number is currently "active" for translation interaction. Null if none.
    const [activeTranslationVerse, setActiveTranslationVerse] = useState(null);
    const [isTranslationPlaying, setIsTranslationPlaying] = useState(false);
    const [translationStage, setTranslationStage] = useState('off'); // 'off' | 'text' | 'audio'

    async function playTaawudz(onFinish) {
        try {
            console.log("Starting Taawudz...");
            setLoadingAudio(true);
            setIsPreRolling(true);
            if (soundRef.current) await soundRef.current.unloadAsync();

            const testUrl = 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3';
            // const realUrl = 'https://archive.org/download/Taawudz/Mishary%20Rashid%20Al%20Afasy%20-%20Ta%27awwudz.mp3';

            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: testUrl },
                { shouldPlay: true }
            );
            console.log("Taawudz Audio Loaded. Duration:", status.durationMillis);
            soundRef.current = newSound;
            setSound(newSound); // Keep state for UI

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPreRolling(false);
                    if (onFinish) onFinish();
                }
            });
        } catch (error) {
            console.error("Taawudz error", error);
            setIsPreRolling(false);
            if (onFinish) onFinish(); // Fallback to start
        }
    }

    async function playBasmalah(onFinish) {
        try {
            console.log("Starting Basmalah...");
            setLoadingAudio(true);
            setIsPreRolling(true);
            if (soundRef.current) await soundRef.current.unloadAsync();

            const { sound: newSound } = await Audio.Sound.createAsync(
                require('../../audio/taawudz_basmalah.mp3'),
                { shouldPlay: true }
            );
            soundRef.current = newSound;
            setSound(newSound);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPreRolling(false);
                    if (onFinish) onFinish();
                }
            });
        } catch (error) {
            console.error("Basmalah error", error);
            Logger.logError("Basmalah Playback Failed", error);
            setIsPreRolling(false);
            if (onFinish) onFinish(); // Fallback to start
        }
    }

    // Helper for delay
    const waitDelay = (seconds) => new Promise(r => {
        if (seconds <= 0) return r();
        delayTimeout.current = setTimeout(r, seconds * 1000);
    });

    // Main Sequence Runner (Entry Point for Auto-Play)
    const playVerseSequence = async (index, sessionConfig = null) => {
        try {
            if (!autoPlayRef.current) return;

            // Resolve Config
            const config = sessionConfig || {
                startVerse: autoStartVerseRef.current,
                endVerse: autoEndVerseRef.current,
                playTranslation: autoPlayEnabledTranslationRef.current,
                delayPreArabic: delayPreArabicRef.current,
                delayPostArabic: delayPostArabicRef.current,
                delayPreTranslation: delayPreTranslationRef.current,
                delayPostTranslation: delayPostTranslationRef.current,
                delaySequenceLoop: delaySequenceLoopRef.current,
                order: autoPlayOrderRef.current,
                sequenceRepeat: autoSequenceRef.current, // Ensure sequenceRepeat is in config
                verseRepeat: repeatModeRef.current // Ensure verseRepeat is in config
            };

            // Update Index & Pager
            if (index !== currentVerseIndexRef.current) {
                // New Verse Starting - Reset Repeat Counter
                repeatCounter.current = 0;
                setCurrentVerseIndex(index);
                pagerRef.current?.setPage(index);
            }

            const isTransFirst = config.order === 'translation_first';
            const enableTrans = config.playTranslation;
            const currentRepeat = repeatCounter.current;

            // 1. Translation First Logic (Only play on first iteration of verse)
            if (isTransFirst && enableTrans && currentRepeat === 0) {
                // 1. Pre Text
                await waitDelay(config.delayPreTranslation);
                if (!autoPlayRef.current) return;

                // 2. Speak
                await speakWait(index);
                if (!autoPlayRef.current) return;

                // 3. Post Text
                await waitDelay(config.delayPostTranslation);
                if (!autoPlayRef.current) return;
            }

            // 4. Pre Arabic (Always play for every repetition)
            await waitDelay(config.delayPreArabic);
            if (!autoPlayRef.current) return;

            // 5. Play Arabic
            activeSessionConfigRef.current = config;
            await playVerse(index);
        } catch (e) {
            Logger.logError(`playVerseSequence Failed at index ${index}`, e);
            console.error("Sequence Error", e);
            setIsPlaying(false);
            setAutoPlay(false);
        }
    };

    const activeSessionConfigRef = useRef(null);

    // Handle Playback Completion
    const handlePlaybackFinish = async () => {
        setIsPlaying(false);
        const index = currentVerseIndexRef.current;
        const auto = autoPlayRef.current;

        // Retrieve the session config active for this playback
        const config = activeSessionConfigRef.current || {
            playTranslation: autoPlayEnabledTranslationRef.current,
            delayPostArabic: delayPostArabicRef.current,
            delayPreTranslation: delayPreTranslationRef.current,
            delayPostTranslation: delayPostTranslationRef.current,
            delaySequenceLoop: delaySequenceLoopRef.current,
            order: autoPlayOrderRef.current,
            endVerse: autoEndVerseRef.current,
            sequenceRepeat: autoSequenceRef.current,
            verseRepeat: repeatModeRef.current
        };

        if (!auto) return;

        // 6. Post Arabic
        await waitDelay(config.delayPostArabic);
        if (!autoPlayRef.current) return;

        // Increment Repeat Counter
        repeatCounter.current += 1;
        const currentMode = config.verseRepeat;
        const isLoop = currentMode === 'loop';
        const targetRepeats = isLoop ? Infinity : currentMode;
        const isLastRepetition = repeatCounter.current >= targetRepeats;

        // 7. Arabic First Logic (Only play translation on LAST repetition)
        const isArabicFirst = config.order !== 'translation_first';
        const enableTrans = config.playTranslation;

        // Check if we should play translation NOW (Arabic First, and finished all Arabic repeats)
        // BUT wait, if it's LOOP mode, when is "Last"? Loop never ends until manual stop.
        // Rule: In Loop mode, maybe play translation every time? Or only once?
        // User request: "Translation surely only once". So in Loop, maybe once at start or end?
        // Let's assume standard N repeats for now based on user request "3x".
        // In Loop mode, likely play Arabic forever. Translation might never play if "End", or play once if "Start".

        // If Arabic First AND Finished Repeats (not loop) -> Play Translation
        if (isArabicFirst && enableTrans && isLastRepetition && !isLoop) {
            await waitDelay(config.delayPreTranslation);
            if (!autoPlayRef.current) return;

            await speakWait(index);
            if (!autoPlayRef.current) return;

            await waitDelay(config.delayPostTranslation);
            if (!autoPlayRef.current) return;
        }

        // 8. Decide Next Step
        if (!isLastRepetition) {
            // Repeat Verse (Arabic Only cycle)
            playVerseSequence(index, config);
        } else {
            // Next Verse
            const currentVerses = versesRef.current.length > 0 ? versesRef.current : verses;
            const currentVerseObj = currentVerses[index];
            if (!currentVerseObj) return;
            const currentNumber = currentVerseObj.number;
            const endNumber = config.endVerse || currentVerses[currentVerses.length - 1].number;

            if (currentNumber >= endNumber || index >= currentVerses.length - 1) {
                // End of Range -> Sequence Repeat Logic
                let seqRepeat = config.sequenceRepeat;
                if (seqRepeat === undefined) seqRepeat = autoSequenceRef.current;

                // Check if we are in a Playlist Queue
                const queue = route.params.playlistQueue;
                const qIdx = route.params.currentQueueIndex !== undefined ? route.params.currentQueueIndex : -1;

                if (queue && queue.length > 0 && qIdx !== -1) {
                    if (qIdx + 1 < queue.length) {
                        // Advance to next item in playlist!
                        const nextItem = queue[qIdx + 1];
                        const nextSurahData = getSurahByCode(nextItem.surahCode);
                        if (nextSurahData) {
                            await waitDelay(config.delaySequenceLoop || 0);
                            if (!autoPlayRef.current) return;
                            
                            navigation.replace('VerseView', {
                                surah: nextSurahData,
                                initialVerseIndex: 0,
                                startVerse: nextItem.start,
                                endVerse: nextItem.end,
                                contextType: 'playlist',
                                contextId: route.params.contextId,
                                delayConfig: route.params.delayConfig,
                                playlistQueue: queue,
                                currentQueueIndex: qIdx + 1,
                                autoStartPlaying: true,
                                playlistSequenceRepeat: route.params.playlistSequenceRepeat || seqRepeat,
                                playlistVerseRepeat: route.params.playlistVerseRepeat || config.verseRepeat,
                                playlistPlayTranslation: route.params.playlistPlayTranslation !== undefined ? route.params.playlistPlayTranslation : config.playTranslation,
                                playlistOrder: route.params.playlistOrder || config.order,
                                playlistDelayPreArabic: route.params.playlistDelayPreArabic !== undefined ? route.params.playlistDelayPreArabic : config.delayPreArabic,
                                playlistDelayPostArabic: route.params.playlistDelayPostArabic !== undefined ? route.params.playlistDelayPostArabic : config.delayPostArabic,
                                playlistDelayPreTranslation: route.params.playlistDelayPreTranslation !== undefined ? route.params.playlistDelayPreTranslation : config.delayPreTranslation,
                                playlistDelayPostTranslation: route.params.playlistDelayPostTranslation !== undefined ? route.params.playlistDelayPostTranslation : config.delayPostTranslation,
                                playlistDelaySequenceLoop: route.params.playlistDelaySequenceLoop !== undefined ? route.params.playlistDelaySequenceLoop : config.delaySequenceLoop
                            });
                            return;
                        }
                    } else {
                        // We reached the END of the entire playlist queue!
                        const plRepeat = route.params.playlistSequenceRepeat || seqRepeat;
                        if (plRepeat > 1 || plRepeat === 'loop') {
                            if (plRepeat !== 'loop' && route.params.playlistSequenceRepeat) {
                                route.params.playlistSequenceRepeat -= 1;
                            }
                            const firstItem = queue[0];
                            const firstSurahData = getSurahByCode(firstItem.surahCode);
                            if (firstSurahData) {
                                await waitDelay(config.delaySequenceLoop || 0);
                                if (!autoPlayRef.current) return;
                                
                                navigation.replace('VerseView', {
                                    surah: firstSurahData,
                                    initialVerseIndex: 0,
                                    startVerse: firstItem.start,
                                    endVerse: firstItem.end,
                                    contextType: 'playlist',
                                    contextId: route.params.contextId,
                                    delayConfig: route.params.delayConfig,
                                    playlistQueue: queue,
                                    currentQueueIndex: 0,
                                    autoStartPlaying: true,
                                    playlistSequenceRepeat: plRepeat === 'loop' ? 'loop' : (typeof plRepeat === 'number' ? plRepeat - 1 : 1),
                                    playlistVerseRepeat: route.params.playlistVerseRepeat || config.verseRepeat,
                                    playlistPlayTranslation: route.params.playlistPlayTranslation !== undefined ? route.params.playlistPlayTranslation : config.playTranslation,
                                    playlistOrder: route.params.playlistOrder || config.order,
                                    playlistDelayPreArabic: route.params.playlistDelayPreArabic !== undefined ? route.params.playlistDelayPreArabic : config.delayPreArabic,
                                    playlistDelayPostArabic: route.params.playlistDelayPostArabic !== undefined ? route.params.playlistDelayPostArabic : config.delayPostArabic,
                                    playlistDelayPreTranslation: route.params.playlistDelayPreTranslation !== undefined ? route.params.playlistDelayPreTranslation : config.delayPreTranslation,
                                    playlistDelayPostTranslation: route.params.playlistDelayPostTranslation !== undefined ? route.params.playlistDelayPostTranslation : config.delayPostTranslation,
                                    playlistDelaySequenceLoop: route.params.playlistDelaySequenceLoop !== undefined ? route.params.playlistDelaySequenceLoop : config.delaySequenceLoop
                                });
                                return;
                            }
                        }
                    }
                }

                if (seqRepeat > 1 || seqRepeat === 'loop') {
                    if (seqRepeat !== 'loop') {
                        autoSequenceRef.current -= 1; // Decrement global ref
                    }
                    const startNumber = autoStartVerseRef.current || currentVerses[0].number;
                    const startIndex = currentVerses.findIndex(v => v.number === startNumber);

                    if (startIndex !== -1) {
                        await waitDelay(config.delaySequenceLoop);
                        if (autoPlayRef.current) {
                            // Reset for new sequence
                            repeatCounter.current = 0;
                            playVerseSequence(startIndex, config);
                        }
                        return;
                    }
                }
                setAutoPlay(false);
            } else {
                playVerseSequence(index + 1, config);
            }
        }
    };


    // Track if we've already warned about TTS failure to avoid spamming
    const hasShownTTSWarning = useRef(false);

    const speakWait = (index) => {
        return new Promise((resolve) => {
            const currentVerses = versesRef.current.length > 0 ? versesRef.current : verses;
            const verse = currentVerses[index];
            if (!verse) {
                resolve(true);
                return;
            }
            const text = verse.translations?.[translationCode] || verse.translation || 'Tidak ada terjemahan';

            const options = {
                language: translationLanguage, // Use selected language (id/en)
                voice: voiceIdentifier || undefined,
                onDone: () => resolve(true),
                onStopped: () => resolve(true),
                onError: (e) => {
                    Logger.logError(`TTS Playback Error for Verse ${index}`, e);
                    resolve(true);
                }
            };

            try {
                Speech.speak(text, options);
            } catch (e) {
                Logger.logError(`TTS Synchronous Error for Verse ${index}`, e);

                // Show user-friendly warning ONCE
                if (!hasShownTTSWarning.current) {
                    console.warn("TTS Failed, skipping translation audio.");
                    hasShownTTSWarning.current = true;

                    const langName = translationLanguage === 'en' ? "English" : "Bahasa Indonesia";
                    const msg = `Suara ${langName} tidak tersedia. Melewati audio terjemahan.`;
                    if (Platform.OS === 'android') {
                        ToastAndroid.show(msg, ToastAndroid.LONG);
                    } else {
                        // Debounce alert or just log for iOS to avoid interruption
                        // Alert.alert("Suara Tidak Tersedia", msg);
                    }
                }
                resolve(true); // Immediate resolve to continue sequence
            }
        });
    };

    const goToVerse = (index) => {
        const currentVerses = versesRef.current.length > 0 ? versesRef.current : verses;
        if (index >= 0 && index < currentVerses.length) {
            setCurrentVerseIndex(index);
            pagerRef.current?.setPage(index);

            if (autoPlayRef.current) {
                playVerse(index);
            }
        }
    };

    async function playVerse(index) {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync().catch(() => {});
            }
        } catch (e) {}
        setSound(null);
        loadedVerseIndexRef.current = -1;

        if (index !== currentVerseIndexRef.current) {
            repeatCounter.current = 0;
        }
        setCurrentVerseIndex(index);

        try {
            setLoadingAudio(true);
            setIsPlaying(true);
            const currentVerses = versesRef.current.length > 0 ? versesRef.current : verses;
            const verse = currentVerses[index];
            if (!verse) return;
            const surahStr = String(surah.nomor).padStart(3, '0');
            const verseStr = String(verse.number).padStart(3, '0');
            const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${verseStr}.mp3`;
            console.log("Loading Audio Stream directly from EveryAyah:", audioUrl);
            Logger.logInfo(`Loading Audio: ${audioUrl}`);

            if (audioUrl) {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: true }
                );

                soundRef.current = newSound;
                setSound(newSound);
                loadedVerseIndexRef.current = index;
                setLoadingAudio(false);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        handlePlaybackFinish();
                    }
                });
            } else {
                console.error("Audio Meta Fetch Failed:", data);
                Logger.logError("Audio Fetch API Error", data);
                setLoadingAudio(false);
                setIsPlaying(false);
                Alert.alert(
                    translate('verseView.audioLoadFailedTitle', appLanguage) || "Gagal Memuat Audio", 
                    translate('verseView.audioLoadFailedDesc', appLanguage) || "Terjadi kesalahan saat memuat data audio dari server."
                );
            }
        } catch (error) {
            console.error("Error playing sound catch:", error);
            Logger.logError("Audio Network/Playback Error", error);
            setLoadingAudio(false);
            setIsPlaying(false);

            if (error.message.includes('Network request failed')) {
                ToastAndroid.show(translate('verseView.audioConnError', appLanguage) || "Koneksi Error: Gagal menghubungi server audio.", ToastAndroid.LONG);
            }
        }
    }





    // Refs for Auto-Play Config (accessed in callback)
    const autoEndVerseRef = useRef(null);
    const autoStartVerseRef = useRef(null);
    const autoSequenceRef = useRef(1);

    // Initialize config when modal opens
    const openAutoModal = () => {
        setAutoConfig({
            startVerse: route.params?.startVerse || verses[currentVerseIndex]?.number || 1,
            endVerse: route.params?.endVerse || verses[verses.length - 1]?.number || verses.length,
            // Load persistent settings into session default
            playTranslation: localEnabledTranslation,
            sequenceRepeat: 1,
            verseRepeat: repeatMode,
            // Load Persistent Delays
            delayPostArabic: localDelayPostArabic,
            delaySequenceLoop: localDelaySequenceLoop,
            // Fallback defaults for others if needed (though state has them)
            delayPreArabic: localDelayPreArabic,
            delayPreTranslation: localDelayPreTranslation,

            delayPostTranslation: localDelayPostTranslation,
            order: localAutoPlayOrder // Fix: Pass order to config so playVerseSequence knows it
        });
        setShowAutoDetail(false);
        setShowAutoModal(true);
    };

    const startAutoPlaySequence = () => {
        try {
            setShowAutoModal(false);

            // Update global/local translation state based on config
            setShowTranslation(autoConfig.playTranslation);

            // Update Refs with Session Config
            autoEndVerseRef.current = autoConfig.endVerse;
            autoStartVerseRef.current = autoConfig.startVerse;
            autoSequenceRef.current = autoConfig.sequenceRepeat;

            // Also update the Global Refs that the engine often falls back to?
            // Actually, engine uses `activeSessionConfigRef` mostly, but initial refs help
            delayPostArabicRef.current = autoConfig.delayPostArabic;
            delaySequenceLoopRef.current = autoConfig.delaySequenceLoop;
            autoPlayEnabledTranslationRef.current = autoConfig.playTranslation;

            // Apply Verse Repeat temporarily for this session (updates state)
            setRepeatMode(autoConfig.verseRepeat);

            // Persist session config to playlist/penanda if applicable
            if (contextType === 'penanda') {
                updatePenandaDelayConfig(contextId, {
                    autoPlayOrder: autoConfig.order,
                    enabledTranslation: autoConfig.playTranslation,
                    delayPreArabic: autoConfig.delayPreArabic,
                    delayPostArabic: autoConfig.delayPostArabic,
                    delayPreTranslation: autoConfig.delayPreTranslation,
                    delayPostTranslation: autoConfig.delayPostTranslation,
                    delaySequenceLoop: autoConfig.delaySequenceLoop,
                    repeatMode: autoConfig.verseRepeat
                }).catch(() => {});
            } else if (contextType === 'playlist') {
                updatePlaylistDelayConfig(contextId, {
                    autoPlayOrder: autoConfig.order,
                    enabledTranslation: autoConfig.playTranslation,
                    delayPreArabic: autoConfig.delayPreArabic,
                    delayPostArabic: autoConfig.delayPostArabic,
                    delayPreTranslation: autoConfig.delayPreTranslation,
                    delayPostTranslation: autoConfig.delayPostTranslation,
                    delaySequenceLoop: autoConfig.delaySequenceLoop,
                    repeatMode: autoConfig.verseRepeat
                }).catch(() => {});
            }

            // Set Auto Play ON
            setAutoPlay(true);
            // Important: Update ref immediately for synchronous checks
            autoPlayRef.current = true;

            // Find Start Index
            const currentVerses = versesRef.current.length > 0 ? versesRef.current : verses;
            const startIndex = currentVerses.findIndex(v => v.number === autoConfig.startVerse);

            if (startIndex !== -1) {
                // Trigger Basmalah then Play
                playBasmalah(() => {
                    // Now: Use sequence runner to respect delays/order
                    playVerseSequence(startIndex, autoConfig);
                });
            }
        } catch (e) {
            Logger.logError("Start AutoPlay Failed", e);
        }
    };

    const togglePlayPause = async () => {
        const current = currentVerseIndex;
        const loaded = loadedVerseIndexRef.current;

        if (isPlaying) {
            soundRef.current?.pauseAsync();
            setIsPlaying(false);
        } else {
            // If we have a sound loaded AND it matches the current verse, resume it.
            // Check Ref instead of State for object identity
            if (soundRef.current && loaded === current) {
                try {
                    const status = await soundRef.current.getStatusAsync();
                    // Check if finished (either didJustFinish flag or position at end)
                    if (status.isLoaded && (status.didJustFinish || status.positionMillis >= status.durationMillis)) {
                        await soundRef.current.replayAsync();
                    } else {
                        await soundRef.current.playAsync();
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


    // Settings Toggles
    const toggleAutoPlay = () => {
        if (autoPlay) {
            // If dragging slider/turning off
            setAutoPlay(false);
            Speech.stop();
        } else {
            // Open Config Modal
            openAutoModal();
        }
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



    // ... existing refs ...

    if (verses.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No verses found for this Surah.</Text>
            </View>
        );
    }

    // Determine effective visibility handled via State/Ref above

    // Logic for Bottom Button (Tri-State)
    // 0: Off -> 1: Text -> 2: Audio -> 0: Off
    const handleGlobalTranslationToggle = () => {
        if (!showTranslation) {
            // State 0 (Off) -> 1 (Show Text)
            setShowTranslation(true);
            setTranslationStage('text'); // Sync stage
            if (isTranslationPlaying) {
                Speech.stop();
                setIsTranslationPlaying(false);
            }
        } else {
            // Check Stage or infer from state
            if (translationStage === 'text' && !isTranslationPlaying) {
                // State 1 -> 2 (Play Audio)
                const currentVerse = verses[currentVerseIndex];
                if (currentVerse) {
                    setActiveTranslationVerse(currentVerse.number);
                    setTranslationStage('audio');
                    setIsTranslationPlaying(true);
                    const text = currentVerse.translations?.[translationCode] || currentVerse.translation || 'Tidak ada terjemahan';
                    const options = { 
                        language: translationLanguage, 
                        voice: voiceIdentifier || undefined,
                        onDone: () => setIsTranslationPlaying(false) 
                    };
                    Speech.speak(text, options);
                } else {
                    // Fallback if no verse?
                    setTranslationStage('text');
                }
            } else {
                // State 2 (Audio/Finished) -> 0 (Off)
                Speech.stop();
                setIsTranslationPlaying(false);
                setActiveTranslationVerse(null);
                setShowTranslation(false);
                setTranslationStage('off');
            }
        }
    };

    const getTranslationIcon = () => {
        if (!showTranslation) return "document-text-outline"; // Next: Show Text

        // If Shown:
        if (translationStage === 'text') return "volume-high-outline"; // Next: Play
        if (translationStage === 'audio') return "close-circle-outline"; // Next: Close

        // Fallback
        return "volume-high-outline";
    };

    const isDark = theme === 'dark';
    const bgSource = isDark ? require('../../assets/bg_dark_verse.jpg') : require('../../assets/bg_light_verse.jpg');
    const bgStyle = styles.backgroundImage;
    const textStyle = isDark ? { color: '#E0E0E0' } : { color: '#000' };

    return (
        <ImageBackground
            source={bgSource}
            style={bgStyle}
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
                        setTempTranslationVisible(false);
                        saveLastPosition(surah.kode, currentVerse.number - 1, surah.nama);

                        // If Audio Translation is ON (State 2), maybe we should stop it on page turn?
                        if (isTranslationPlaying && !autoPlay) {
                            Speech.stop();
                            setIsTranslationPlaying(false);
                            // Keep text visible (State 1) or reset?
                            // Usually reset to state 1 is safer.
                        }

                        repeatCounter.current = 0;
                    }}
                >
                    {verses.map((verse) => (
                        <View key={String(verse.number)} style={styles.page}>
                            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                <View style={[styles.contentContainer, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1, shadowColor: '#0c120c' }]}>
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity style={styles.verseHeader} onPress={() => setShowJumpModal(true)}>
                                        <Text style={[styles.verseNumber, isDark && { backgroundColor: '#222f22', color: '#a5d6a7' }]}>{translate('home.verse', appLanguage) || 'Ayat'} {verse.number} ▼</Text>
                                    </TouchableOpacity>

                                    <View style={styles.arabicContainer}>
                                        <Text style={[styles.arabicText, { fontSize }, isDark && { color: '#e8f5e9' }]}>{verse.arabic}</Text>
                                    </View>

                                    {/* Interaction Logic: Local Tri-State OR Global Show */}
                                    {(showTranslation || activeTranslationVerse === verse.number) ? (
                                        <TouchableOpacity
                                            style={[styles.translationContainer, { flex: 1, alignItems: 'center' }]}
                                            onPress={() => {
                                                // Strict 3-Step Cycle:
                                                // 1. Placeholder -> Tap -> Text (Active, Stage='text'). [Handled below]
                                                // 2. Text (Stage='text') -> Tap -> Audio (Active, Stage='audio').
                                                // 3. Text (Stage='audio') -> Tap -> Close (Inactive, Stage='off').

                                                // Note: We need to handle case where we tap a DIFFERENT verse.
                                                if (activeTranslationVerse !== verse.number) {
                                                    // Switch to this verse, start at Text stage
                                                    setActiveTranslationVerse(verse.number);
                                                    setTranslationStage('text');
                                                    setIsTranslationPlaying(false);
                                                    return;
                                                }

                                                if (translationStage === 'text') {
                                                    // Step 2: Play
                                                    setTranslationStage('audio');
                                                    setIsTranslationPlaying(true);
                                                    const text = verse.translations?.[translationCode] || verse.translation || 'Tidak ada terjemahan';
                                                    const options = { 
                                                        language: translationLanguage, 
                                                        voice: voiceIdentifier || undefined,
                                                        onDone: () => setIsTranslationPlaying(false) 
                                                    };
                                                    Speech.speak(text, options);
                                                } else {
                                                    // Step 3: Close (Stage 'audio' -> 'off')
                                                    // Whether playing or finished, next tap is Close.
                                                    Speech.stop();
                                                    setIsTranslationPlaying(false);
                                                    setActiveTranslationVerse(null);
                                                    setTranslationStage('off');
                                                    if (showTranslation) setShowTranslation(false);
                                                }
                                            }}
                                        >
                                            <Text style={[
                                                styles.translationText,
                                                (activeTranslationVerse === verse.number && isTranslationPlaying) && { color: isDark ? '#81c784' : '#2e7d32', fontWeight: '500' },
                                                isDark && !(activeTranslationVerse === verse.number && isTranslationPlaying) && { color: '#a5d6a7' }
                                            ]}>
                                                {verse.translations?.[translationCode] || verse.translation}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.translatePlaceholder}
                                            onPress={() => {
                                                // Step 1: Show
                                                setActiveTranslationVerse(verse.number);
                                                setTranslationStage('text');
                                                setIsTranslationPlaying(false);
                                            }}
                                        >
                                            <Text style={[styles.tapToTranslate, isDark && { color: '#759e75' }]}>{translate('verseView.tapToTranslate', appLanguage) || 'Tap untuk terjemahan'}</Text>
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
                    onToggleTranslation={handleGlobalTranslationToggle}
                    translationIcon={getTranslationIcon()}
                    loading={loadingAudio}
                    onOpenSettings={() => setShowSurahSettings(true)}
                />

                {/* Surah Settings Modal (Top Right) */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showSurahSettings}
                    onRequestClose={() => setShowSurahSettings(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, isDark && { backgroundColor: '#162016' }, { maxHeight: '80%' }]}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>{translate('verseView.surahSettings', appLanguage) || 'Pengaturan Surah'} {surah?.nama}</Text>
                                <Text style={[styles.modalSubtitle, isDark && { color: '#a5d6a7' }]}>{translate('verseView.surahSettingsDesc', appLanguage) || 'Pengaturan ini hanya berlaku untuk surah ini.'}</Text>

                                {/* Order & Translation Toggle */}
                                <View style={styles.configRow}>
                                    <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('verseView.mode', appLanguage) || 'Mode:'}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={[styles.miniButton, isDark && { backgroundColor: '#222f22' }, localAutoPlayOrder === 'translation_first' && [styles.miniButtonActive, isDark && { backgroundColor: '#1b5e20' }]]}
                                            onPress={() => setLocalAutoPlayOrder('translation_first')}
                                        >
                                            <Text style={[styles.miniButtonText, isDark && { color: '#a5d6a7' }, localAutoPlayOrder === 'translation_first' && { color: '#fff' }]}>{translate('settings.transFirst', appLanguage) || 'Terj. Dulu'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.miniButton, isDark && { backgroundColor: '#222f22' }, localAutoPlayOrder === 'arabic_first' && [styles.miniButtonActive, isDark && { backgroundColor: '#1b5e20' }], { marginLeft: 5 }]}
                                            onPress={() => setLocalAutoPlayOrder('arabic_first')}
                                        >
                                            <Text style={[styles.miniButtonText, isDark && { color: '#a5d6a7' }, localAutoPlayOrder === 'arabic_first' && { color: '#fff' }]}>{translate('settings.arabFirst', appLanguage) || 'Ayat Dulu'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.configRow}>
                                    <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('settings.playTransText', appLanguage) || 'Bacakan Terjemahan?'}</Text>
                                    <Switch
                                        value={localEnabledTranslation}
                                        trackColor={{ false: isDark ? '#222f22' : '#767577', true: isDark ? '#1b5e20' : '#a5d6a7' }}
                                        thumbColor={localEnabledTranslation ? (isDark ? '#81c784' : '#2e7d32') : '#f4f3f4'}
                                        onValueChange={setLocalEnabledTranslation}
                                    />
                                </View>

                                {/* Delays */}
                                <Text style={[styles.modalSubtitle, { marginTop: 15, marginBottom: 5 }, isDark && { color: '#a5d6a7' }]}>{translate('verseView.delayConfig', appLanguage) || 'Jeda (Detik)'}</Text>

                                <ConfigCounter label={translate('settings.preArab', appLanguage) || 'Sebelum Ayat'} value={localDelayPreArabic} setValue={setLocalDelayPreArabic} isDark={isDark} />
                                <ConfigCounter label={translate('settings.postArab', appLanguage) || 'Setelah Ayat'} value={localDelayPostArabic} setValue={setLocalDelayPostArabic} isDark={isDark} />

                                {localEnabledTranslation && (
                                    <>
                                        <ConfigCounter label={translate('settings.preTrans', appLanguage) || 'Sebelum Terj.'} value={localDelayPreTranslation} setValue={setLocalDelayPreTranslation} isDark={isDark} />
                                        <ConfigCounter label={translate('settings.postTrans', appLanguage) || 'Setelah Terj.'} value={localDelayPostTranslation} setValue={setLocalDelayPostTranslation} isDark={isDark} />
                                    </>
                                )}

                                <ConfigCounter label={translate('settings.loopDelay', appLanguage) || 'Antar Pengulangan'} value={localDelaySequenceLoop} setValue={setLocalDelaySequenceLoop} isDark={isDark} />


                                {/* OLD Repeat Setting (Generic) */}
                                <View style={[styles.configRow, { marginTop: 15 }]}>
                                    <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('verseView.repeatGeneric', appLanguage) || 'Pengulangan:'}</Text>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', padding: 5, backgroundColor: isDark ? '#222f22' : '#f0f0f0', borderRadius: 8 }}
                                        onPress={cycleRepeat}
                                    >
                                        <Ionicons name={repeatMode === 'loop' ? "infinite" : "repeat"} size={20} color={isDark ? '#81c784' : '#2e7d32'} />
                                        <Text style={[styles.counterText, isDark && { color: '#e8f5e9' }, { marginHorizontal: 8, minWidth: 20 }]}>
                                            {repeatMode === 'loop' ? 'Loop' : `${repeatMode}x`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 20 }} />

                                <TouchableOpacity
                                    style={[styles.startButton, isDark ? { backgroundColor: '#1b5e20' } : { backgroundColor: '#2e7d32' }]}
                                    onPress={async () => {
                                        try {
                                            const settingsToSave = {
                                                autoPlayOrder: localAutoPlayOrder,
                                                enabledTranslation: localEnabledTranslation,
                                                delayPreArabic: localDelayPreArabic,
                                                delayPostArabic: localDelayPostArabic,
                                                delayPreTranslation: localDelayPreTranslation,
                                                delayPostTranslation: localDelayPostTranslation,
                                                delaySequenceLoop: localDelaySequenceLoop,
                                                repeatMode: repeatMode
                                            };
                                            if (contextType === 'penanda') {
                                                await updatePenandaDelayConfig(contextId, settingsToSave);
                                            } else if (contextType === 'playlist') {
                                                await updatePlaylistDelayConfig(contextId, settingsToSave);
                                            } else {
                                                const key = `surah_settings_${surah.kode}`;
                                                await AsyncStorage.setItem(key, JSON.stringify(settingsToSave));
                                            }
                                            setShowSurahSettings(false);
                                        } catch (e) {
                                            console.error("Failed to save surah settings", e);
                                        }
                                    }}
                                >
                                    <Text style={styles.startButtonText}>
                                        {contextType 
                                            ? (translate('verseView.saveSettings', appLanguage) || 'Simpan Pengaturan') 
                                            : (translate('verseView.saveSettings', appLanguage) || 'Simpan Pengaturan Surah')}
                                    </Text>
                                </TouchableOpacity>

                                {/* Reset Button */}
                                <TouchableOpacity
                                    style={[styles.startButton, { marginTop: 10, backgroundColor: isDark ? '#2c3540' : '#8e8e93' }]}
                                    onPress={async () => {
                                        Alert.alert(
                                            translate('verseView.resetSettings', appLanguage) || "Reset Pengaturan",
                                            translate('verseView.resetDesc', appLanguage) || "Kembalikan pengaturan surah ini ke standar global?",
                                            [
                                                { text: translate('verseView.cancel', appLanguage) || "Batal", style: "cancel" },
                                                {
                                                    text: "Reset", onPress: async () => {
                                                        try {
                                                            const key = `surah_settings_${surah.kode}`;
                                                            await AsyncStorage.removeItem(key);
                                                            // Restore Globals
                                                            setLocalAutoPlayOrder(globalAutoPlayOrder);
                                                            setLocalEnabledTranslation(globalEnabledTranslation);
                                                            setLocalDelayPreArabic(globalDelayPreArabic);
                                                            setLocalDelayPostArabic(globalDelayPostArabic);
                                                            setLocalDelayPreTranslation(globalDelayPreTranslation);
                                                            setLocalDelayPostTranslation(globalDelayPostTranslation);
                                                            setLocalDelaySequenceLoop(globalDelaySequenceLoop);
                                                            setDelaySeconds(defaultDelay);
                                                            setRepeatMode(defaultRepeat);

                                                            ToastAndroid.show(translate('verseView.settingsReset', appLanguage) || "Pengaturan di-reset ke Global", ToastAndroid.SHORT);
                                                            setShowSurahSettings(false);
                                                        } catch (e) {
                                                            console.error("Reset failed", e);
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.startButtonText}>{translate('verseView.resetGlobal', appLanguage) || 'Reset ke Global'}</Text>
                                </TouchableOpacity>

                                {/* Batal Button */}
                                <TouchableOpacity style={[styles.startButton, { marginTop: 10, backgroundColor: isDark ? '#8b2525' : '#ff4444', marginBottom: 20 }]} onPress={() => setShowSurahSettings(false)}>
                                    <Text style={styles.startButtonText}>{translate('verseView.cancel', appLanguage) || 'Batal'}</Text>
                                </TouchableOpacity>
                                <View style={{ height: 20 }} />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Auto Play Config Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showAutoModal}
                    onRequestClose={() => setShowAutoModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, isDark && { backgroundColor: '#162016' }, { maxHeight: '85%' }]}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>{translate('verseView.autoConfigTitle', appLanguage) || 'Konfigurasi Auto Play'}</Text>

                                {!contextType && (
                                    <View style={styles.configRow}>
                                        <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('verseView.startVerse', appLanguage)}:</Text>
                                        <View style={[styles.counterControl, isDark && { backgroundColor: '#222f22' }]}>
                                            <TouchableOpacity onPress={() => setAutoConfig(p => ({ ...p, startVerse: Math.max(1, p.startVerse - 1) }))}>
                                                <Ionicons name="remove-circle-outline" size={28} color={isDark ? '#81c784' : '#2e7d32'} />
                                            </TouchableOpacity>
                                            <Text style={[styles.counterText, isDark && { color: '#e8f5e9' }]}>{autoConfig.startVerse}</Text>
                                            <TouchableOpacity onPress={() => setAutoConfig(p => ({ ...p, startVerse: Math.min(autoConfig.endVerse, p.startVerse + 1) }))}>
                                                <Ionicons name="add-circle-outline" size={28} color={isDark ? '#81c784' : '#2e7d32'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                {!contextType && (
                                    <View style={styles.configRow}>
                                        <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('verseView.endVerse', appLanguage)}:</Text>
                                        <View style={[styles.counterControl, isDark && { backgroundColor: '#222f22' }]}>
                                            <TouchableOpacity onPress={() => setAutoConfig(p => ({ ...p, endVerse: Math.max(autoConfig.startVerse, p.endVerse - 1) }))}>
                                                <Ionicons name="remove-circle-outline" size={28} color={isDark ? '#81c784' : '#2e7d32'} />
                                            </TouchableOpacity>
                                            <Text style={[styles.counterText, isDark && { color: '#e8f5e9' }]}>{autoConfig.endVerse}</Text>
                                            <TouchableOpacity onPress={() => setAutoConfig(p => ({ ...p, endVerse: Math.min(verses[verses.length - 1].number, p.endVerse + 1) }))}>
                                                <Ionicons name="add-circle-outline" size={28} color={isDark ? '#81c784' : '#2e7d32'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                {/* Sequence Repeat */}
                                <View style={styles.configRow}>
                                    <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }]}>{translate('verseView.repeatSequence', appLanguage)}:</Text>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center' }}
                                        onPress={() => {
                                            const r = autoConfig.sequenceRepeat;
                                            let next = 1;
                                            if (r === 1) next = 2;
                                            else if (r === 2) next = 3;
                                            else if (r === 3) next = 'loop';
                                            else next = 1;
                                            setAutoConfig(p => ({ ...p, sequenceRepeat: next }));
                                        }}
                                    >
                                        <Ionicons name={autoConfig.sequenceRepeat === 'loop' ? "infinite" : "repeat"} size={20} color={isDark ? '#81c784' : '#2e7d32'} />
                                        <Text style={[styles.counterText, isDark && { color: '#e8f5e9' }, { marginHorizontal: 8 }]}>
                                            {autoConfig.sequenceRepeat === 'loop' ? 'Loop' : `${autoConfig.sequenceRepeat}x`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Detail Button */}
                                <TouchableOpacity style={[styles.detailButton, isDark && { backgroundColor: '#222f22' }]} onPress={() => setShowAutoDetail(!showAutoDetail)}>
                                    <Text style={[styles.detailButtonText, isDark && { color: '#a5d6a7' }]}>{showAutoDetail ? translate('verseView.hideOptions', appLanguage) : translate('verseView.showOptions', appLanguage)}</Text>
                                </TouchableOpacity>

                                {/* Detail Config Section */}
                                {showAutoDetail && (
                                    <View style={[styles.detailContainer, isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' }]}>
                                        <View style={[styles.detailHeader, isDark && { borderBottomColor: '#2d3b2d' }]}>
                                            <Text style={[styles.detailTitle, isDark && { color: '#759e75' }]}>{translate('verseView.sessionConfig', appLanguage) || 'Pengaturan Sesi Ini'}</Text>
                                        </View>

                                        {/* Playback Order */}
                                        <View style={styles.configRow}>
                                            <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }, { fontSize: 14 }]}>{translate('verseView.order', appLanguage) || 'Urutan'}</Text>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity
                                                    style={[styles.miniButton, isDark && { backgroundColor: '#222f22' }, autoConfig.order === 'translation_first' && [styles.miniButtonActive, isDark && { backgroundColor: '#1b5e20' }]]}
                                                    onPress={() => setAutoConfig(p => ({ ...p, order: 'translation_first' }))}
                                                >
                                                    <Text style={[styles.miniButtonText, isDark && { color: '#a5d6a7' }, autoConfig.order === 'translation_first' && { color: '#fff' }]}>{translate('settings.transFirst', appLanguage) || 'Terj. Dulu'}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.miniButton, isDark && { backgroundColor: '#222f22' }, autoConfig.order === 'arabic_first' && [styles.miniButtonActive, isDark && { backgroundColor: '#1b5e20' }], { marginLeft: 5 }]}
                                                    onPress={() => setAutoConfig(p => ({ ...p, order: 'arabic_first' }))}
                                                >
                                                    <Text style={[styles.miniButtonText, isDark && { color: '#a5d6a7' }, autoConfig.order === 'arabic_first' && { color: '#fff' }]}>{translate('settings.arabFirst', appLanguage) || 'Ayat Dulu'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Play Translation Toggle */}
                                        <View style={styles.configRow}>
                                            <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }, { fontSize: 14 }]}>{translate('settings.playTransText', appLanguage) || 'Putar Terjemahan'}</Text>
                                            <Switch
                                                value={autoConfig.playTranslation}
                                                trackColor={{ false: isDark ? '#222f22' : '#767577', true: isDark ? '#1b5e20' : '#a5d6a7' }}
                                                thumbColor={autoConfig.playTranslation ? (isDark ? '#81c784' : '#2e7d32') : '#f4f3f4'}
                                                onValueChange={(val) => setAutoConfig(p => ({ ...p, playTranslation: val }))}
                                            />
                                        </View>

                                        <View style={[styles.divider, isDark && { backgroundColor: '#2d3b2d' }]} />

                                        {/* Verse Repeat */}
                                        <View style={styles.configRow}>
                                            <Text style={[styles.configLabel, isDark && { color: '#e8f5e9' }, { fontSize: 14 }]}>{translate('verseView.repeatVerse', appLanguage) || 'Ulangi per Ayat'}</Text>
                                            <TouchableOpacity
                                                style={[styles.pillButton, isDark ? { backgroundColor: '#1b5e20' } : { backgroundColor: '#2e7d32' }]}
                                                onPress={() => {
                                                    const r = autoConfig.verseRepeat;
                                                    let next = 1;
                                                    if (r === 1) next = 2;
                                                    else if (r === 2) next = 3;
                                                    else if (r === 3) next = 'loop';
                                                    else next = 1;
                                                    setAutoConfig(p => ({ ...p, verseRepeat: next }));
                                                }}
                                            >
                                                <Ionicons name={autoConfig.verseRepeat === 'loop' ? "infinite" : "repeat"} size={16} color="white" />
                                                <Text style={styles.pillButtonText}>
                                                    {autoConfig.verseRepeat === 'loop' ? 'Loop' : `${autoConfig.verseRepeat}x`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={[styles.divider, isDark && { backgroundColor: '#2d3b2d' }]} />

                                        <Text style={[styles.configLabel, { fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: isDark ? '#759e75' : '#aaa', letterSpacing: 1 }]}>{translate('verseView.delayConfig', appLanguage) || 'JEDA (DETIK)'}</Text>

                                        <ConfigCounter
                                            label={translate('settings.preArab', appLanguage) || 'Sebelum Ayat'}
                                            value={autoConfig.delayPreArabic}
                                            setValue={(nextFn) => setAutoConfig(p => ({ ...p, delayPreArabic: nextFn(autoConfig.delayPreArabic) }))}
                                            isDark={isDark}
                                        />
                                        <ConfigCounter
                                            label={translate('settings.postArab', appLanguage) || 'Setelah Ayat'}
                                            value={autoConfig.delayPostArabic}
                                            setValue={(nextFn) => setAutoConfig(p => ({ ...p, delayPostArabic: nextFn(autoConfig.delayPostArabic) }))}
                                            isDark={isDark}
                                        />

                                        {autoConfig.playTranslation && (
                                            <>
                                                <ConfigCounter
                                                    label={translate('settings.preTrans', appLanguage) || 'Sebelum Terj.'}
                                                    value={autoConfig.delayPreTranslation}
                                                    setValue={(nextFn) => setAutoConfig(p => ({ ...p, delayPreTranslation: nextFn(autoConfig.delayPreTranslation) }))}
                                                    isDark={isDark}
                                                />
                                                <ConfigCounter
                                                    label={translate('settings.postTrans', appLanguage) || 'Setelah Terj.'}
                                                    value={autoConfig.delayPostTranslation}
                                                    setValue={(nextFn) => setAutoConfig(p => ({ ...p, delayPostTranslation: nextFn(autoConfig.delayPostTranslation) }))}
                                                    isDark={isDark}
                                                />
                                            </>
                                        )}

                                        <ConfigCounter
                                            label={translate('settings.loopDelay', appLanguage) || 'Antar Pengulangan'}
                                            value={autoConfig.delaySequenceLoop}
                                            setValue={(nextFn) => setAutoConfig(p => ({ ...p, delaySequenceLoop: nextFn(autoConfig.delaySequenceLoop) }))}
                                            isDark={isDark}
                                        />
                                    </View>
                                )}

                                {/* Start Button */}
                                <TouchableOpacity style={[styles.startButton, isDark ? { backgroundColor: '#1b5e20' } : { backgroundColor: '#2e7d32' }, { marginTop: 10 }]} onPress={startAutoPlaySequence}>
                                    <Text style={styles.startButtonText}>{translate('verseView.startAutoPlay', appLanguage) || 'Mulai Auto Play'}</Text>
                                </TouchableOpacity>

                                {/* Batal Button */}
                                <TouchableOpacity style={[styles.startButton, { marginTop: 10, backgroundColor: isDark ? '#8b2525' : '#ff4444' }]} onPress={() => setShowAutoModal(false)}>
                                    <Text style={styles.startButtonText}>{translate('verseView.cancel', appLanguage) || 'Batal'}</Text>
                                </TouchableOpacity>

                                <View style={{ height: 20 }} />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

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
                        <View style={[styles.modalContent, isDark && { backgroundColor: '#162016' }]}>
                            <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>Lompat ke Ayat</Text>
                            <FlatList
                                data={verses}
                                keyExtractor={(item) => String(item.number)}
                                numColumns={4}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.gridItem,
                                            isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' },
                                            currentVerseIndex === index && styles.gridItemActive,
                                            (currentVerseIndex === index && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                                        ]}
                                        onPress={() => {
                                            goToVerse(index);
                                            setShowJumpModal(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.gridText,
                                            isDark && { color: '#a5d6a7' },
                                            currentVerseIndex === index && styles.gridTextActive,
                                            (currentVerseIndex === index && isDark) && { color: '#e8f5e9' }
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
        </ImageBackground >
    );
}

// Helper Component for Modal
const ConfigCounter = ({ label, value, setValue, isDark }) => (
    <View style={styles.configRow}>
        <Text style={[styles.configLabel, { fontSize: 14 }, isDark && { color: '#e8f5e9' }]}>{label}:</Text>
        <View style={[styles.counterControl, isDark && { backgroundColor: '#222f22' }]}>
            <TouchableOpacity onPress={() => setValue(p => Math.max(0, p - 1))}>
                <Ionicons name="remove-circle-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
            </TouchableOpacity>
            <Text style={[styles.counterText, { fontSize: 14, minWidth: 20 }, isDark && { color: '#e8f5e9' }]}>{value}s</Text>
            <TouchableOpacity onPress={() => setValue(p => Math.min(20, p + 1))}>
                <Ionicons name="add-circle-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingBottom: 20, // Added per user request
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minHeight: 300,
        justifyContent: 'center',
    },
    verseHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    verseNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        backgroundColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    arabicContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    arabicText: {
        fontSize: 32,
        fontFamily: 'Amiri-Regular', // Ensure font is loaded or use default
        textAlign: 'center',
        // lineHeight: 60,
    },
    translationContainer: {
        marginTop: 10,
        padding: 10,
        // backgroundColor: '#f8f9fa', // Removed per user request
        width: '100%', // Ensure full width for centering
    },
    translationText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
    },
    translatePlaceholder: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        borderStyle: 'dashed',
    },
    tapToTranslate: {
        color: '#aaa',
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    configLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    counterControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        borderRadius: 10,
        padding: 5,
    },
    counterText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    startButton: {
        backgroundColor: '#2e7d32',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    miniButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#eee',
    },
    miniButtonActive: {
        backgroundColor: '#2e7d32',
    },
    miniButtonText: {
        fontSize: 12,
        color: '#333'
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
        backgroundColor: '#2e7d32',
        borderColor: '#2e7d32',
    },
    gridText: {
        fontSize: 16,
        color: '#495057',
    },
    gridTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },

    // Detail Styles
    detailButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#f1f3f5',
        marginBottom: 10,
    },
    detailButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    detailContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    detailHeader: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    detailTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    pillButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2e7d32',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    pillButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 6,
    },
});
