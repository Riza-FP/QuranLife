import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable, ImageBackground, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRandomVerse, getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

const lightWheel = require('../../assets/bg_light_inspira.jpg');
const darkWheel = require('../../assets/bg_dark_inspira.jpg');

export default function InspiraScreen({ navigation }) {
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const [loadingVerse, setLoadingVerse] = useState(false);
    const [pressAgain, setPressAgain] = useState(false);

    // Animations
    const spinAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Logic tracking
    const isProcessingRef = useRef(false);
    const navigationPendingRef = useRef(false);
    const timeoutRef = useRef(null);
    const spinLoopRef = useRef(null);

    const FAST_ANIM_DURATION = 3000;
    const WAIT_DURATION = 5000; // 5 seconds is reasonable for native feel

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const startSpinLoop = () => {
        if (spinLoopRef.current) return;
        spinAnim.setValue(0);
        spinLoopRef.current = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: FAST_ANIM_DURATION,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        );
        spinLoopRef.current.start();
    };

    const stopSpinLoop = useCallback(() => {
        if (spinLoopRef.current) {
            spinLoopRef.current.stop();
            spinLoopRef.current = null;
        }
        spinAnim.setValue(0);
        setPressAgain(false);
    }, [spinAnim]);

    const navigateToRandomVerse = useCallback(() => {
        if (navigationPendingRef.current) return;
        navigationPendingRef.current = true;
 
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        stopSpinLoop();

        const randomData = getRandomVerse();
        if (randomData) {
            const surahData = getSurahByCode(randomData.surahCode);
            if (surahData) {
                // Navigate to VerseViewScreen pointing at the random verse
                navigation.navigate('VerseView', {
                    surah: surahData,
                    initialVerseIndex: randomData.verseNumber - 1, // 0-indexed
                });

                // Reset state in case user goes back
                setTimeout(() => {
                    navigationPendingRef.current = false;
                    isProcessingRef.current = false;
                }, 1000);
            }
        } else {
            console.error("Could not fetch random verse.");
            navigationPendingRef.current = false;
            isProcessingRef.current = false;
        }
    }, [navigation, stopSpinLoop]);

    const handlePress = () => {
        if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            startSpinLoop();
            setPressAgain(true);

            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                navigateToRandomVerse();
            }, WAIT_DURATION);

            return;
        }

        if (isProcessingRef.current && !navigationPendingRef.current) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            stopSpinLoop();
            navigateToRandomVerse();
            return;
        }
    };

    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "1080deg"],
    });

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>

                <Text style={[styles.title, { color: isDark ? '#81c784' : '#2e7d32' }]}>
                    {translate('home.inspiraTitle', appLanguage) || 'Roda Inspirasi'}
                </Text>
                
                <Text style={[styles.subtitle, isDark && { color: '#a5d6a7' }]}>
                    {translate('home.inspiraSubtitle', appLanguage) || 'Temukan satu Ayat secara acak untuk direnungkan hari ini'}
                </Text>

                <View style={styles.wheelContainer}>
                    <Pressable
                        onPress={handlePress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        <Animated.View
                            style={[
                                styles.wheelWrapper,
                                {
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            {/* Animated circular masked image */}
                            <Animated.Image
                                source={isDark ? darkWheel : lightWheel}
                                style={[
                                    styles.wheelImage,
                                    {
                                        transform: [{ rotate: spinInterpolate }],
                                    },
                                ]}
                                resizeMode="cover"
                            />
                            {/* Dynamic glassmorphic gold/emerald button overlay */}
                            <View 
                                style={[
                                    styles.centerTextContainer,
                                    {
                                        backgroundColor: isDark ? 'rgba(12, 33, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                                        borderColor: isDark ? 'rgba(255, 215, 0, 0.7)' : 'rgba(46, 125, 50, 0.5)',
                                    }
                                ]}
                            >
                                <Ionicons name="sparkles" size={24} color={isDark ? '#ffd700' : '#2E7D32'} />
                                <Text style={[styles.centerText, { color: isDark ? '#ffd700' : '#2E7D32' }]}>
                                    {appLanguage === 'en' ? 'TAP' : 'TEKAN'}
                                </Text>
                            </View>
                        </Animated.View>
                    </Pressable>

                    {pressAgain && (
                        <Text style={[styles.pressAgainText, isDark && { color: '#ff8c42' }]}>
                            {appLanguage === 'en' ? 'Tap again to stop manually' : 'Tekan lagi untuk berhenti manual'}
                        </Text>
                    )}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#212529',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#495057',
        textAlign: 'center',
        marginBottom: 50,
        paddingHorizontal: 20,
    },
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelWrapper: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 6,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: 'transparent',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    wheelImage: {
        width: '100%',
        height: '100%',
    },
    centerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 3,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    centerText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 3,
        letterSpacing: 2,
    },
    pressAgainText: {
        marginTop: 20,
        color: "#dc3545",
        fontWeight: "bold",
        fontSize: 14,
        fontStyle: "italic",
    }
});
