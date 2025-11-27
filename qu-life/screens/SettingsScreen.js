import React from 'react';
import { View, Text, StyleSheet, Switch, Button, TouchableOpacity } from 'react-native';
import { useSettings } from '../utils/SettingsContext';

export default function SettingsScreen() {
    const { fontSize, setFontSize, showTranslation, setShowTranslation, translationCode, setTranslationCode } = useSettings();

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
                        ]}>Default (ID)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            translationCode === 'tr_id_my' && styles.langButtonActive
                        ]}
                        onPress={() => setTranslationCode('tr_id_my')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            translationCode === 'tr_id_my' && styles.langButtonTextActive
                        ]}>Muyassar (ID)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            translationCode === 'tr_en_jl' && styles.langButtonActive
                        ]}
                        onPress={() => setTranslationCode('tr_en_jl')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            translationCode === 'tr_en_jl' && styles.langButtonTextActive
                        ]}>Jalalayn (EN)</Text>
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
});
