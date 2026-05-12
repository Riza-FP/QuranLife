import React, { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity, ScrollView } from 'react-native';
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

    const RenderCounter = ({ label, value, setValue, min = 0, max = 20, suffix = 's' }) => (
        <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>{label}</Text>
            <View style={styles.counterControl}>
                <Button title="-" onPress={() => setValue(p => Math.max(min, p - 1))} />
                <Text style={styles.counterValue}>{value}{suffix}</Text>
                <Button title="+" onPress={() => setValue(p => Math.min(max, p + 1))} />
            </View>
        </View>
    );

    return (
        <ScrollView style={[styles.container, theme === 'dark' && { backgroundColor: '#121212' }]}>

            {/* SECTION: GENERAL / BAHASA APLIKASI */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>{translate('settings.appLanguage', appLanguage)}</Text>
                <View style={[styles.settingItem, { marginBottom: 10 }]}>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                appLanguage === 'id' && styles.langButtonActive,
                            ]}
                            onPress={() => setAppLanguage('id')}
                        >
                            <Text style={[styles.langButtonText, appLanguage === 'id' && styles.langButtonTextActive]}>
                                Indonesia
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                appLanguage === 'en' && styles.langButtonActive,
                            ]}
                            onPress={() => setAppLanguage('en')}
                        >
                            <Text style={[styles.langButtonText, appLanguage === 'en' && styles.langButtonTextActive]}>
                                English
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* SECTION: TAMPILAN */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>{translate('settings.visual', appLanguage)}</Text>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>{translate('settings.arabFontSize', appLanguage)}: {fontSize}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="A-" onPress={decreaseFont} />
                        <View style={{ width: 20 }} />
                        <Button title="A+" onPress={increaseFont} />
                    </View>
                </View>

                {/* Font Preview Moved Here */}
                <View style={[styles.previewContainer, theme === 'dark' && { backgroundColor: '#333', marginTop: 10 }]}>
                    <Text style={[styles.previewText, { fontSize }, theme === 'dark' && { color: '#fff' }]}>بِسْمِ اللَّهِ</Text>
                </View>
            </View>

            {/* SECTION: AUDIO & TERJEMAHAN */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>{translate('settings.audioTrans', appLanguage)}</Text>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>{translate('settings.transLanguage', appLanguage)}</Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[styles.langButton, translationCode === 'tr_id' && styles.langButtonActive]}
                            onPress={() => setTranslationCode('tr_id')}
                        >
                            <Text style={[styles.langButtonText, translationCode === 'tr_id' && styles.langButtonTextActive]}>Indonesia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langButton, translationCode === 'tr_en' && styles.langButtonActive]}
                            onPress={() => setTranslationCode('tr_en')}
                        >
                            <Text style={[styles.langButtonText, translationCode === 'tr_en' && styles.langButtonTextActive]}>English</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>{translate('settings.audioVoiceLanguage', appLanguage)}</Text>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                translationLanguage === 'id' && styles.langButtonActive,
                            ]}
                            onPress={() => {
                                setTranslationLanguage('id');
                                Speech.speak("Bahasa Indonesia dipilih", { language: 'id' });
                            }}
                        >
                            <Text style={[styles.langButtonText, translationLanguage === 'id' && styles.langButtonTextActive]}>
                                Indonesia
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langButton,
                                translationLanguage === 'en' && styles.langButtonActive,
                            ]}
                            onPress={() => {
                                setTranslationLanguage('en');
                                setVoiceIdentifier(null); // Reset voice when language changes
                                Speech.speak("English language selected", { language: 'en' });
                            }}
                        >
                            <Text style={[styles.langButtonText, translationLanguage === 'en' && styles.langButtonTextActive]}>
                                English
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Voice Selector UI */}
                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>{translate('settings.voiceSelector', appLanguage)}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                        <TouchableOpacity
                            style={[styles.voiceButton, !voiceIdentifier && styles.voiceButtonActive]}
                            onPress={() => setVoiceIdentifier(null)}
                        >
                            <Text style={[styles.voiceButtonText, !voiceIdentifier && styles.voiceButtonTextActive]}>
                                {translate('settings.systemDefault', appLanguage)}
                            </Text>
                        </TouchableOpacity>
                        
                        {availableVoices.length === 0 ? (
                            <Text style={[styles.hintText, { paddingHorizontal: 10 }]}>Hanya default yang tersedia di HP ini.</Text>
                        ) : (
                            availableVoices.map((voice, index) => (
                                <View key={voice.identifier} style={styles.voiceCard}>
                                    <TouchableOpacity
                                        style={[styles.voiceButton, voiceIdentifier === voice.identifier && styles.voiceButtonActive, { marginRight: 0, borderBottomRightRadius: 0, borderTopRightRadius: 0 }]}
                                        onPress={() => setVoiceIdentifier(voice.identifier)}
                                    >
                                        <Text style={[styles.voiceButtonText, voiceIdentifier === voice.identifier && styles.voiceButtonTextActive]}>
                                            Voice {index + 1}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.testVoiceButton}
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
                    <Text style={styles.hintText}>
                        * Nama suara bawaan HP tidak bisa menampilkan Gender. Tekan "Test" untuk mendengar.
                    </Text>
                </View>

            </View>

            {/* SECTION: AUTO-PLAY ADVANCED */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>{translate('settings.autoplayAdvanced', appLanguage)}</Text>

                <Text style={[styles.subLabel, theme === 'dark' && { color: '#aaa' }]}>{translate('settings.autoplayOrder', appLanguage)}</Text>
                <View style={styles.settingItem}>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[styles.langButton, autoPlayOrder === 'translation_first' && styles.langButtonActive]}
                            onPress={() => setAutoPlayOrder('translation_first')}
                        >
                            <Text style={[styles.langButtonText, autoPlayOrder === 'translation_first' && styles.langButtonTextActive]}>{translate('settings.transFirst', appLanguage)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langButton, autoPlayOrder === 'arabic_first' && styles.langButtonActive]}
                            onPress={() => setAutoPlayOrder('arabic_first')}
                        >
                            <Text style={[styles.langButtonText, autoPlayOrder === 'arabic_first' && styles.langButtonTextActive]}>{translate('settings.arabFirst', appLanguage)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.settingItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={[styles.label, { marginBottom: 0 }, theme === 'dark' && { color: '#ddd' }]}>{translate('settings.playTransText', appLanguage)}</Text>
                    <Switch
                        value={autoPlayEnabledTranslation}
                        onValueChange={setAutoPlayEnabledTranslation}
                    />
                </View>
                {missingLanguage && (
                    <Text style={{ color: '#ffcc00', fontSize: 12, marginLeft: 15, marginBottom: 10 }}>
                        ⚠ Bahasa {translationLanguage === 'id' ? 'Indonesia' : 'Inggris'} tidak terdeteksi di pengaturan HP (mungkin perlu install).
                    </Text>
                )}

                <Text style={[styles.subLabel, { marginTop: 10 }, theme === 'dark' && { color: '#aaa' }]}>{translate('settings.delayConfig', appLanguage)}</Text>

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
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
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
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
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
        color: '#868e96',
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
        color: '#007AFF',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
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
