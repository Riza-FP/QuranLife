import React, { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useSettings } from '../utils/SettingsContext';
import Logger from '../utils/Logger';
import { translate } from '../utils/i18n';

export default function SettingsScreen() {
    const {
        fontSize, setFontSize,
        showTranslation, setShowTranslation,
        translationCode, setTranslationCode,
        voiceIdentifier, setVoiceIdentifier,
        defaultDelay, setDefaultDelay,
        defaultRepeat, setDefaultRepeat,
        // New Advanced Settings
        theme, setTheme,
        autoPlayOrder, setAutoPlayOrder,
        autoPlayEnabledTranslation, setAutoPlayEnabledTranslation,
        translationLanguage, setTranslationLanguage,
        delayPreArabic, setDelayPreArabic,
        delayPostArabic, setDelayPostArabic,
        delayPreTranslation, setDelayPreTranslation,
        delayPostTranslation, setDelayPostTranslation,
        delaySequenceLoop, setDelaySequenceLoop,
        appLanguage, setAppLanguage
    } = useSettings();

    const [missingLanguage, setMissingLanguage] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();

                const isId = (langCode) => {
                    const l = langCode.toLowerCase();
                    return l.startsWith('id') || l.startsWith('in');
                };
                const isEn = (langCode) => langCode.toLowerCase().startsWith('en');

                // Detailed Check
                const hasId = voices.some(v => isId(v.language));
                const hasEn = voices.some(v => isEn(v.language));

                // Condition: Only flag as "missing" if we actually found SOME voices (API is working)
                // If voices.length === 0, the API is likely failing on this device, so we give benefit of doubt.
                const apiWorking = voices.length > 0;

                const idMissing = apiWorking && !hasId;
                const enMissing = apiWorking && !hasEn;

                const targetMissing = translationLanguage === 'en' ? enMissing : idMissing;
                setMissingLanguage(targetMissing);

                // Filter voices for currently selected language
                const matchingVoices = voices.filter(v => 
                    translationLanguage === 'en' ? isEn(v.language) : isId(v.language)
                );
                setAvailableVoices(matchingVoices);

            } catch (e) {
                console.error("Failed to check voices", e);
                Logger.logError("TTS Check Failed", e);
            }
        })();
    }, [translationLanguage]); // Re-check if selection changes

    const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 60));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 16));

    const isDark = theme === 'dark';

    const RenderCounter = ({ label, value, setValue, min = 0, max = 20, suffix = 's' }) => (
        <View style={styles.counterRow}>
            <Text style={[styles.counterLabel, isDark ? { color: '#a5d6a7' } : { color: '#333' }]}>{label}</Text>
            <View style={[styles.counterControl, isDark ? { backgroundColor: '#1c261c' } : { backgroundColor: '#f8f9fa' }]}>
                <Button title="-" color={isDark ? '#81c784' : '#2e7d32'} onPress={() => setValue(p => Math.max(min, p - 1))} />
                <Text style={[styles.counterValue, isDark ? { color: '#e8f5e9' } : { color: '#000' }]}>{value}{suffix}</Text>
                <Button title="+" color={isDark ? '#81c784' : '#2e7d32'} onPress={() => setValue(p => Math.min(max, p + 1))} />
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_settings.jpg') : require('../../assets/bg_light_settings.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <ScrollView style={[
                styles.container, 
                isDark ? { backgroundColor: 'transparent' } : { backgroundColor: 'rgba(255, 255, 255, 0.82)' }
            ]}>

            {/* SECTION: GENERAL / BAHASA APLIKASI */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#81c784', borderBottomColor: '#2d3b2d' }]}>{translate('settings.appLanguage', appLanguage)}</Text>
                <View style={[styles.settingItem, { marginBottom: 10 }]}>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                appLanguage === 'id' && styles.langButtonActive,
                                (appLanguage === 'id' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setAppLanguage('id')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                appLanguage === 'id' && styles.langButtonTextActive,
                                (appLanguage === 'id' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                Indonesia
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                appLanguage === 'en' && styles.langButtonActive,
                                (appLanguage === 'en' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setAppLanguage('en')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                appLanguage === 'en' && styles.langButtonTextActive,
                                (appLanguage === 'en' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                English
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* SECTION: TAMPILAN */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#81c784', borderBottomColor: '#2d3b2d' }]}>{translate('settings.visual', appLanguage)}</Text>

                <View style={[styles.settingItem, { marginBottom: 15 }]}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#e8f5e9' }]}>{translate('settings.arabFontSize', appLanguage)}: {fontSize}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="A-" color={isDark ? '#81c784' : '#2e7d32'} onPress={decreaseFont} />
                        <View style={{ width: 20 }} />
                        <Button title="A+" color={isDark ? '#81c784' : '#2e7d32'} onPress={increaseFont} />
                    </View>
                </View>

                {/* Font Preview Directly under Font Size Setting */}
                <View style={[styles.previewContainer, { marginTop: 0, marginBottom: 25 }, theme === 'dark' && { backgroundColor: '#1c261c', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                    <Text style={[styles.previewText, { fontSize }, theme === 'dark' && { color: '#e8f5e9' }]}>بِسْمِ اللَّهِ</Text>
                </View>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#e8f5e9' }]}>
                        {appLanguage === 'en' ? 'App Theme' : 'Tema Aplikasi'}
                    </Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                theme === 'light' && styles.langButtonActive,
                                (theme === 'light' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setTheme('light')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                theme === 'light' && styles.langButtonTextActive,
                                (theme === 'light' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                {appLanguage === 'en' ? 'Light' : 'Terang'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                theme === 'dark' && styles.langButtonActive,
                                (theme === 'dark' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setTheme('dark')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                theme === 'dark' && styles.langButtonTextActive,
                                (theme === 'dark' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                {appLanguage === 'en' ? 'Dark' : 'Gelap'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
                      {/* SECTION: AUDIO & TERJEMAHAN */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#81c784', borderBottomColor: '#2d3b2d' }]}>{translate('settings.audioTrans', appLanguage)}</Text>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#e8f5e9' }]}>{translate('settings.transLanguage', appLanguage)}</Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                translationCode === 'tr_id' && styles.langButtonActive,
                                (translationCode === 'tr_id' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setTranslationCode('tr_id')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                translationCode === 'tr_id' && styles.langButtonTextActive,
                                (translationCode === 'tr_id' && isDark) && { color: '#e8f5e9' }
                            ]}>Indonesia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                translationCode === 'tr_en' && styles.langButtonActive,
                                (translationCode === 'tr_en' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setTranslationCode('tr_en')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                translationCode === 'tr_en' && styles.langButtonTextActive,
                                (translationCode === 'tr_en' && isDark) && { color: '#e8f5e9' }
                            ]}>English</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#e8f5e9' }]}>{translate('settings.audioVoiceLanguage', appLanguage)}</Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                translationLanguage === 'id' && styles.langButtonActive,
                                (translationLanguage === 'id' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => {
                                setTranslationLanguage('id');
                                Speech.speak("Bahasa Indonesia dipilih", { language: 'id' });
                            }}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                translationLanguage === 'id' && styles.langButtonTextActive,
                                (translationLanguage === 'id' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                Indonesia
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                translationLanguage === 'en' && styles.langButtonActive,
                                (translationLanguage === 'en' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => {
                                setTranslationLanguage('en');
                                setVoiceIdentifier(null); // Reset voice when language changes
                                Speech.speak("English language selected", { language: 'en' });
                            }}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                translationLanguage === 'en' && styles.langButtonTextActive,
                                (translationLanguage === 'en' && isDark) && { color: '#e8f5e9' }
                            ]}>
                                English
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Voice Selector UI */}
                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#e8f5e9' }]}>{translate('settings.voiceSelector', appLanguage)}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                        <TouchableOpacity
                            style={[
                                styles.voiceButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                !voiceIdentifier && styles.voiceButtonActive,
                                (!voiceIdentifier && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setVoiceIdentifier(null)}
                        >
                            <Text style={[
                                styles.voiceButtonText,
                                isDark && { color: '#759e75' },
                                !voiceIdentifier && styles.voiceButtonTextActive,
                                (!voiceIdentifier && isDark) && { color: '#e8f5e9' }
                            ]}>
                                {translate('settings.systemDefault', appLanguage)}
                            </Text>
                        </TouchableOpacity>
                        
                        {availableVoices.length === 0 ? (
                            <Text style={[styles.hintText, { paddingHorizontal: 10 }, isDark && { color: '#759e75' }]}>Hanya default yang tersedia di HP ini.</Text>
                        ) : (
                            availableVoices.map((voice, index) => (
                                <View key={voice.identifier} style={styles.voiceCard}>
                                    <TouchableOpacity
                                        style={[
                                            styles.voiceButton,
                                            isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                            voiceIdentifier === voice.identifier && styles.voiceButtonActive,
                                            (voiceIdentifier === voice.identifier && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' },
                                            { marginRight: 0, borderBottomRightRadius: 0, borderTopRightRadius: 0 }
                                        ]}
                                        onPress={() => setVoiceIdentifier(voice.identifier)}
                                    >
                                        <Text style={[
                                            styles.voiceButtonText,
                                            isDark && { color: '#759e75' },
                                            voiceIdentifier === voice.identifier && styles.voiceButtonTextActive,
                                            (voiceIdentifier === voice.identifier && isDark) && { color: '#e8f5e9' }
                                        ]}>
                                            Voice {index + 1}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.testVoiceButton, isDark && { backgroundColor: '#1b5e20' }]}
                                        onPress={() => {
                                            Speech.speak("Test", { language: translationLanguage, voice: voice.identifier });
                                        }}
                                    >
                                        <Text style={styles.testVoiceButtonText}>{translate('settings.testVoice', appLanguage)}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>
                    <Text style={[styles.hintText, isDark && { color: '#759e75' }]}>
                        * Nama suara bawaan HP tidak bisa menampilkan Gender. Tekan "Test" untuk mendengar.
                    </Text>
                </View>

            </View>

            {/* SECTION: AUTO-PLAY ADVANCED */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#81c784', borderBottomColor: '#2d3b2d' }]}>{translate('settings.autoplayAdvanced', appLanguage)}</Text>

                <Text style={[styles.subLabel, theme === 'dark' ? { color: '#a5d6a7' } : { color: '#2e7d32' }]}>{translate('settings.autoplayOrder', appLanguage)}</Text>
                <View style={styles.settingItem}>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                autoPlayOrder === 'translation_first' && styles.langButtonActive,
                                (autoPlayOrder === 'translation_first' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setAutoPlayOrder('translation_first')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                autoPlayOrder === 'translation_first' && styles.langButtonTextActive,
                                (autoPlayOrder === 'translation_first' && isDark) && { color: '#e8f5e9' }
                            ]}>{translate('settings.transFirst', appLanguage)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                isDark && { backgroundColor: '#1c261c', borderColor: '#2d3b2d' },
                                autoPlayOrder === 'arabic_first' && styles.langButtonActive,
                                (autoPlayOrder === 'arabic_first' && isDark) && { backgroundColor: '#1b5e20', borderColor: '#81c784' }
                            ]}
                            onPress={() => setAutoPlayOrder('arabic_first')}
                        >
                            <Text style={[
                                styles.langButtonText,
                                isDark && { color: '#759e75' },
                                autoPlayOrder === 'arabic_first' && styles.langButtonTextActive,
                                (autoPlayOrder === 'arabic_first' && isDark) && { color: '#e8f5e9' }
                            ]}>{translate('settings.arabFirst', appLanguage)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.settingItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={[styles.label, { marginBottom: 0 }, theme === 'dark' && { color: '#e8f5e9' }]}>{translate('settings.playTransText', appLanguage)}</Text>
                    <Switch
                        value={autoPlayEnabledTranslation}
                        onValueChange={setAutoPlayEnabledTranslation}
                        trackColor={{ false: isDark ? '#222f22' : '#767577', true: isDark ? '#1b5e20' : '#a5d6a7' }}
                        thumbColor={autoPlayEnabledTranslation ? (isDark ? '#81c784' : '#2e7d32') : '#f4f3f4'}
                    />
                </View>
                {missingLanguage && (
                    <Text style={{ color: isDark ? '#ffb300' : '#c62828', fontSize: 12, marginLeft: 15, marginBottom: 10 }}>
                        ⚠ Bahasa {translationLanguage === 'id' ? 'Indonesia' : 'Inggris'} tidak terdeteksi di pengaturan HP (mungkin perlu install).
                    </Text>
                )}

                <Text style={[styles.subLabel, { marginTop: 10 }, theme === 'dark' ? { color: '#a5d6a7' } : { color: '#2e7d32' }]}>{translate('settings.delayConfig', appLanguage)}</Text>

                <RenderCounter label={translate('settings.preArab', appLanguage)} value={delayPreArabic} setValue={setDelayPreArabic} />
                <RenderCounter label={translate('settings.postArab', appLanguage)} value={delayPostArabic} setValue={setDelayPostArabic} />

                {autoPlayEnabledTranslation && (
                    <>
                        <RenderCounter label={translate('settings.preTrans', appLanguage)} value={delayPreTranslation} setValue={setDelayPreTranslation} />
                        <RenderCounter label={translate('settings.postTrans', appLanguage)} value={delayPostTranslation} setValue={setDelayPostTranslation} />
                    </>
                )}

                <RenderCounter label={translate('settings.loopDelay', appLanguage)} value={delaySequenceLoop} setValue={setDelaySequenceLoop} />
            </View>


            <View style={{ height: 50 }} />
        </ScrollView>
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
        padding: 20,
        backgroundColor: '#fff',
    },
    settingItem: {
        marginBottom: 30,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    langButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f3f5',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    langButtonActive: {
        backgroundColor: '#2e7d32',
        borderColor: '#2e7d32',
    },
    langButtonText: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '600',
    },
    langButtonTextActive: {
        color: '#fff',
    },
    previewContainer: {
        marginTop: 40,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        alignItems: 'center',
    },
    previewText: {
        color: '#000',
    },
    voiceButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    voiceButtonActive: {
        backgroundColor: '#2e7d32',
        borderColor: '#2e7d32',
    },
    voiceButtonText: {
        fontSize: 14,
        color: '#495057',
    },
    voiceButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    voiceCard: {
        flexDirection: 'row',
        marginRight: 10,
        marginBottom: 8,
    },
    testVoiceButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
    },
    testVoiceButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    hintText: {
        marginTop: 5,
        fontSize: 12,
        color: '#495057',
        fontStyle: 'italic',
    },
    // New Styles for Advanced Settings
    section: {
        marginBottom: 30,
        backgroundColor: 'transparent',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2e7d32',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginTop: 10,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        paddingVertical: 5,
    },
    counterLabel: {
        fontSize: 16,
        color: '#495057',
    },
    counterControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
    },
    counterValue: {
        marginHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 30,
        textAlign: 'center',
    },
});
