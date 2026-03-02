import React, { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../utils/SettingsContext';
import Logger from '../utils/Logger';

export default function SettingsScreen() {
    const {
        fontSize, setFontSize,
        showTranslation, setShowTranslation,
        translationCode, setTranslationCode,
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
        delaySequenceLoop, setDelaySequenceLoop
    } = useSettings();

    const [missingLanguage, setMissingLanguage] = useState(false);
    const [idAvailable, setIdAvailable] = useState(true);
    const [enAvailable, setEnAvailable] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();

                // Detailed Check
                const hasId = voices.some(v => v.language.startsWith('id'));
                const hasEn = voices.some(v => v.language.startsWith('en'));

                // Condition: Only flag as "missing" if we actually found SOME voices (API is working)
                // If voices.length === 0, the API is likely failing on this device, so we give benefit of doubt.
                const apiWorking = voices.length > 0;

                const idMissing = apiWorking && !hasId;
                const enMissing = apiWorking && !hasEn;

                // Update missingLanguage based on CURRENT selection
                const targetMissing = translationLanguage === 'en' ? enMissing : idMissing;
                setMissingLanguage(targetMissing);

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

            {/* SECTION: TAMPILAN */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>Tampilan (Visual)</Text>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>Ukuran Font Arab: {fontSize}</Text>
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
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>Audio & Terjemahan</Text>

                <View style={styles.settingItem}>
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>Bahasa Terjemahan</Text>
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
                    <Text style={[styles.label, theme === 'dark' && { color: '#ddd' }]}>Bahasa Suara Terjemahan</Text>
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
                                Speech.speak("English language selected", { language: 'en' });
                            }}
                        >
                            <Text style={[styles.langButtonText, translationLanguage === 'en' && styles.langButtonTextActive]}>
                                English
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* SECTION: AUTO-PLAY ADVANCED */}
            <View style={styles.section}>
                <Text style={[styles.sectionHeader, theme === 'dark' && { color: '#fff' }]}>Pengaturan Auto-Play</Text>

                <Text style={[styles.subLabel, theme === 'dark' && { color: '#aaa' }]}>Urutan & Mode Playback</Text>
                <View style={styles.settingItem}>
                    <View style={styles.languageContainer}>
                        <TouchableOpacity
                            style={[styles.langButton, autoPlayOrder === 'translation_first' && styles.langButtonActive]}
                            onPress={() => setAutoPlayOrder('translation_first')}
                        >
                            <Text style={[styles.langButtonText, autoPlayOrder === 'translation_first' && styles.langButtonTextActive]}>Terjemahan Dulu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langButton, autoPlayOrder === 'arabic_first' && styles.langButtonActive]}
                            onPress={() => setAutoPlayOrder('arabic_first')}
                        >
                            <Text style={[styles.langButtonText, autoPlayOrder === 'arabic_first' && styles.langButtonTextActive]}>Ayat (Arab) Dulu</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.settingItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={[styles.label, { marginBottom: 0 }, theme === 'dark' && { color: '#ddd' }]}>Bacakan Terjemahan?</Text>
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

                <Text style={[styles.subLabel, { marginTop: 10 }, theme === 'dark' && { color: '#aaa' }]}>Konfigurasi Jeda (Detik)</Text>

                <RenderCounter label="Jeda Sebelum Ayat" value={delayPreArabic} setValue={setDelayPreArabic} />
                <RenderCounter label="Jeda Setelah Ayat" value={delayPostArabic} setValue={setDelayPostArabic} />

                {autoPlayEnabledTranslation && (
                    <>
                        <RenderCounter label="Jeda Sebelum Terjemahan" value={delayPreTranslation} setValue={setDelayPreTranslation} />
                        <RenderCounter label="Jeda Setelah Terjemahan" value={delayPostTranslation} setValue={setDelayPostTranslation} />
                    </>
                )}

                <RenderCounter label="Jeda Antar Pengulangan" value={delaySequenceLoop} setValue={setDelaySequenceLoop} />
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
        fontSize: 12,
        color: '#495057',
    },
    voiceButtonTextActive: {
        color: '#fff',
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
