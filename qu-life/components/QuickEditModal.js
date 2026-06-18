import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';

export default function QuickEditModal({ visible, onClose, onSave, onChangeRange, initialData }) {
    const { theme, appLanguage } = useSettings();
    const isDark = theme === 'dark';
    const { translate } = require('../utils/i18n');

    const [title, setTitle] = useState('');

    useEffect(() => {
        if (visible && initialData) {
            setTitle(initialData.title || '');
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (title.trim() === '') {
            return; // Don't save empty
        }
        onSave({ ...initialData, title: title.trim() });
    };

    if (!visible || !initialData) return null;

    const surahData = getSurahByCode(initialData.surahCode);
    const surahName = surahData ? surahData.nama : '';
    const ayatWord = translate('wizard.ayat', appLanguage) || 'Ayat';
    const contextText = `${surahName}, ${ayatWord} ${initialData.start}-${initialData.end}`;

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                    
                    <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>
                        {translate('wizard.editItem', appLanguage) || 'Edit Item'}
                    </Text>

                    {/* Context Display */}
                    <View style={[styles.contextBox, isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' }]}>
                        <View style={styles.contextTextGroup}>
                            <Ionicons name="book" size={16} color={isDark ? '#81c784' : '#2e7d32'} style={{ marginRight: 6 }} />
                            <Text style={[styles.contextText, isDark && { color: '#a5d6a7' }]}>{contextText}</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.changeRangeBtn}
                            onPress={() => {
                                onClose();
                                setTimeout(() => {
                                    onChangeRange(initialData);
                                }, 300); // Wait for modal to hide
                            }}
                        >
                            <Text style={[styles.changeRangeText, isDark && { color: '#81c784' }]}>
                                {translate('wizard.changeRange', appLanguage) || 'Ubah Rentang'}
                            </Text>
                            <Ionicons name="chevron-forward" size={14} color={isDark ? '#81c784' : '#2e7d32'} />
                        </TouchableOpacity>
                    </View>

                    {/* Title Input */}
                    <Text style={[styles.inputLabel, isDark && { color: '#e8f5e9' }]}>
                        {translate('playlist.addTitle', appLanguage) || 'Judul'}
                    </Text>
                    <TextInput
                        style={[styles.input, isDark && { backgroundColor: '#222f22', color: '#e8f5e9', borderColor: '#2d3b2d' }]}
                        placeholder={translate('wizard.titlePlaceholder', appLanguage) || "Contoh: Hafalan Subuh"}
                        placeholderTextColor={isDark ? '#a5d6a7' : '#999'}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* Action Buttons */}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.btn, styles.btnCancel, isDark && { backgroundColor: '#2d3b2d' }]} 
                            onPress={onClose}
                        >
                            <Text style={[styles.btnCancelText, isDark && { color: '#a5d6a7' }]}>
                                {translate('playlist.cancel', appLanguage) || 'Batal'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.btn, styles.btnSave, isDark && { backgroundColor: '#2e7d32' }, title.trim() === '' && { opacity: 0.5 }]} 
                            onPress={handleSave}
                            disabled={title.trim() === ''}
                        >
                            <Text style={styles.btnSaveText}>
                                {translate('playlist.save', appLanguage) || 'Simpan'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    contextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f1f8e9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c5e1a5',
        marginBottom: 20,
    },
    contextTextGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contextText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    changeRangeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    changeRangeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2e7d32',
        marginRight: 2,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
    btnCancel: {
        backgroundColor: '#f1f3f5',
    },
    btnSave: {
        backgroundColor: '#2e7d32',
    },
    btnCancelText: {
        color: '#495057',
        fontWeight: 'bold',
    },
    btnSaveText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
