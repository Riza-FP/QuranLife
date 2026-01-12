import React, { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity } from 'react-native';
import { useSettings } from '../utils/SettingsContext';

export default function SettingsScreen() {
    const { fontSize, setFontSize, showTranslation, setShowTranslation, translationCode, setTranslationCode, voiceIdentifier, setVoiceIdentifier } = useSettings();
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        async function loadVoices() {
            try {
                const availableVoices = await Speech.getAvailableVoicesAsync();
                // Filter for Indonesian voices or general high quality ones if needed
                // For now, let's show all available Indonesian voices
                const idVoices = availableVoices.filter(v => v.language.includes('id') || v.language.includes('ID'));
                setVoices(idVoices);
            } catch (e) {
                console.log("Error loading voices", e);
            }
        }
        loadVoices();
    }, []);

    const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 60));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 16));

    return (
        <View style={styles.container}>


            <View style={styles.settingItem}>
                <Text style={styles.label}>Translation Language</Text>
                <View style={styles.languageContainer}>
                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            translationCode === 'tr_id' && styles.langButtonActive
                        ]}
                        onPress={() => setTranslationCode('tr_id')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            translationCode === 'tr_id' && styles.langButtonTextActive
                        ]}>INDONESIAN</Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            translationCode === 'tr_en' && styles.langButtonActive
                        ]}
                        onPress={() => setTranslationCode('tr_en')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            translationCode === 'tr_en' && styles.langButtonTextActive
                        ]}>ENGLISH</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.settingItem}>
                <Text style={styles.label}>Arabic Font Size: {fontSize}</Text>
                <View style={styles.buttonContainer}>
                    <Button title="-" onPress={decreaseFont} />
                    <View style={{ width: 20 }} />
                    <Button title="+" onPress={increaseFont} />
                </View>
            </View>

            <View style={styles.settingItem}>
                <Text style={styles.label}>Suara Terjemahan (Indonesian)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <TouchableOpacity
                        style={[
                            styles.voiceButton,
                            !voiceIdentifier && styles.voiceButtonActive
                        ]}
                        onPress={() => {
                            setVoiceIdentifier(null);
                            Speech.speak("Ini suara bawaan sistem", { language: 'id' });
                        }}
                    >
                        <Text style={[
                            styles.voiceButtonText,
                            !voiceIdentifier && styles.voiceButtonTextActive
                        ]}>Default</Text>
                    </TouchableOpacity>

                    {voices.map((voice) => (
                        <TouchableOpacity
                            key={voice.identifier}
                            style={[
                                styles.voiceButton,
                                voiceIdentifier === voice.identifier && styles.voiceButtonActive
                            ]}
                            onPress={() => {
                                setVoiceIdentifier(voice.identifier);
                                Speech.speak("Ini contoh suara yang dipilih", {
                                    voice: voice.identifier,
                                    language: 'id'
                                });
                            }}
                        >
                            <Text style={[
                                styles.voiceButtonText,
                                voiceIdentifier === voice.identifier && styles.voiceButtonTextActive
                            ]}>
                                {voice.name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {voices.length === 0 && (
                        <Text style={styles.hintText}>
                            Tidak ada suara tambahan ditemukan. Coba install data suara di Pengaturan HP Anda.
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.previewContainer}>
                <Text style={[styles.previewText, { fontSize }]}>بِسْمِ اللَّهِ</Text>
            </View>
        </View>
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
});
