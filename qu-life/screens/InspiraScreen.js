import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable, ImageBackground, Dimensions } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getRandomVerse, getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

// Helper for wheel slices
const makeSlice = (cx, cy, r, startAngle, endAngle, color) => {
    const x1 = cx + r * Math.cos((Math.PI * startAngle) / 180);
    const y1 = cy + r * Math.sin((Math.PI * startAngle) / 180);
    const x2 = cx + r * Math.cos((Math.PI * endAngle) / 180);
    const y2 = cy + r * Math.sin((Math.PI * endAngle) / 180);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return (
        <Path
            key={startAngle}
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`}
            fill={color}
        />
    );
};

export default function InspiraScreen({ navigation }) {
    const { appLanguage } = useSettings();

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
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>

                <Text style={styles.title}>
                    {translate('home.inspiraTitle', appLanguage) || 'Roda Inspirasi'}
                </Text>
                
                <Text style={styles.subtitle}>
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
                                styles.wheelPlaceholder,
                                {
                                    transform: [{ rotate: spinInterpolate }, { scale: scaleAnim }],
                                },
                            ]}
                        >
                            <Svg height="300" width="300" viewBox="0 0 300 300">
                                <G>
                                    {makeSlice(150, 150, 150, 0, 30, "#FF6B6B")}
                                    {makeSlice(150, 150, 150, 30, 60, "#FFD93D")}
                                    {makeSlice(150, 150, 150, 60, 90, "#6BCB77")}
                                    {makeSlice(150, 150, 150, 90, 120, "#4D96FF")}
                                    {makeSlice(150, 150, 150, 120, 150, "#9D4EDD")}
                                    {makeSlice(150, 150, 150, 150, 180, "#FF8C42")}
                                    {makeSlice(150, 150, 150, 180, 210, "#FF6B6B")}
                                    {makeSlice(150, 150, 150, 210, 240, "#FFD93D")}
                                    {makeSlice(150, 150, 150, 240, 270, "#6BCB77")}
                                    {makeSlice(150, 150, 150, 270, 300, "#4D96FF")}
                                    {makeSlice(150, 150, 150, 300, 330, "#9D4EDD")}
                                    {makeSlice(150, 150, 150, 330, 360, "#FF8C42")}
                                </G>
                            </Svg>
                            <View style={styles.centerTextContainer}>
                                <Ionicons name="sparkles" size={32} color="#fff" />
                                <Text style={styles.centerText}>
                                    {appLanguage === 'en' ? 'TAP' : 'TEKAN'}
                                </Text>
                            </View>
                        </Animated.View>
                    </Pressable>

                    {pressAgain && (
                        <Text style={styles.pressAgainText}>
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
        backgroundColor: 'rgba(255,255,255,0.4)',
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
    wheelPlaceholder: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: '#f8f9fa',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5.46,
    },
    centerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    centerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 5,
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
