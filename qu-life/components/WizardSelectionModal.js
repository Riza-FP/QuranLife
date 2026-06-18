import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSurahList, getSurahByCode } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';

export default function WizardSelectionModal({ visible, onClose, onSave, initialData }) {
    const { theme, appLanguage } = useSettings();
    const isDark = theme === 'dark';
    const { translate } = require('../utils/i18n');

    const [step, setStep] = useState(1);
    
    // Form Data
    const [surahCode, setSurahCode] = useState(null);
    const [startVerse, setStartVerse] = useState(null);
    const [endVerse, setEndVerse] = useState(null);
    const [title, setTitle] = useState('');

    // Step 1: Surah Search
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setSurahCode(initialData.surahCode);
                setStartVerse(initialData.start);
                setEndVerse(initialData.end);
                setTitle(initialData.title || '');
                setStep(1); // Start at step 1 but pre-filled
            } else {
                setSurahCode(null);
                setStartVerse(null);
                setEndVerse(null);
                setTitle('');
                setStep(1);
            }
            setSearchQuery('');
        }
    }, [visible, initialData]);

    const handleNextStep = () => setStep(s => Math.min(3, s + 1));
    const handlePrevStep = () => setStep(s => Math.max(1, s - 1));

    // Step 1 Rendering
    const renderStep1 = () => {
        const surahs = getSurahList();
        const filtered = surahs.filter(s => 
            s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.nomor.toString() === searchQuery
        );

        return (
            <View style={styles.stepContainer}>
                <View style={[styles.searchContainer, isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' }]}>
                    <Ionicons name="search" size={20} color={isDark ? '#81c784' : '#666'} />
                    <TextInput
                        style={[styles.searchInput, isDark && { color: '#e8f5e9' }]}
                        placeholder={translate('surahList.searchPlaceholder', appLanguage) || "Cari surah..."}
                        placeholderTextColor={isDark ? '#a5d6a7' : '#999'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.kode}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.surahItem, 
                                isDark && { borderBottomColor: '#2d3b2d' },
                                surahCode === item.kode && (isDark ? { backgroundColor: '#1b5e20' } : { backgroundColor: '#e8f5e9' })
                            ]}
                            onPress={() => {
                                setSurahCode(item.kode);
                                // If they changed the surah, reset verses
                                if (surahCode !== item.kode) {
                                    setStartVerse(null);
                                    setEndVerse(null);
                                    setTitle('');
                                }
                                handleNextStep();
                            }}
                        >
                            <Text style={[styles.surahNumber, isDark && { color: '#a5d6a7' }]}>{item.nomor}.</Text>
                            <Text style={[styles.surahName, isDark && { color: '#e8f5e9' }]}>{item.nama}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: isDark ? '#a5d6a7' : '#666' }}>{translate('playlist.surahNotFound', appLanguage)}</Text>}
                />
            </View>
        );
    };

    // Step 2 Rendering
    const renderStep2 = () => {
        if (!surahCode) return null;
        const surahData = getSurahByCode(surahCode);
        if (!surahData) return null;

        const totalVerses = surahData.jumlah_ayat;
        const versesArray = Array.from({ length: totalVerses }, (_, i) => i + 1);

        const promptText = !startVerse 
            ? (translate('wizard.selectStart', appLanguage) || 'Pilih Ayat Mulai')
            : (translate('wizard.selectEnd', appLanguage) || 'Pilih Ayat Akhir');

        return (
            <View style={styles.stepContainer}>
                <View style={styles.promptHeader}>
                    <Text style={[styles.promptText, isDark && { color: '#81c784' }]}>{promptText}</Text>
                    {startVerse && (
                        <Text style={[styles.rangeHint, isDark && { color: '#a5d6a7' }]}>
                            {translate('playlist.start', appLanguage)}: {startVerse} {endVerse ? ` | ${translate('playlist.end', appLanguage)}: ${endVerse}` : ''}
                        </Text>
                    )}
                </View>
                <FlatList
                    data={versesArray}
                    numColumns={5}
                    keyExtractor={(item) => item.toString()}
                    contentContainerStyle={{ padding: 10, paddingBottom: 60 }}
                    renderItem={({ item: vNumber }) => {
                        let isSelected = false;
                        let isRange = false;
                        
                        if (startVerse === vNumber || endVerse === vNumber) {
                            isSelected = true;
                        } else if (startVerse && endVerse && vNumber > startVerse && vNumber < endVerse) {
                            isRange = true;
                        }

                        return (
                            <TouchableOpacity
                                style={[
                                    styles.gridItem,
                                    isDark ? { backgroundColor: '#222f22', borderColor: '#2d3b2d' } : { backgroundColor: '#f9f9f9', borderColor: '#ddd' },
                                    isSelected && (isDark ? { backgroundColor: '#1b5e20', borderColor: '#81c784' } : { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' }),
                                    isRange && (isDark ? { backgroundColor: '#143114' } : { backgroundColor: '#f1f8f1' })
                                ]}
                                onPress={() => {
                                    if (!startVerse) {
                                        setStartVerse(vNumber);
                                    } else if (!endVerse) {
                                        if (vNumber < startVerse) {
                                            // Pressed a number before start, reset start to this
                                            setStartVerse(vNumber);
                                        } else {
                                            setEndVerse(vNumber);
                                            // Slight delay so user sees selection before jump
                                            setTimeout(handleNextStep, 200);
                                        }
                                    } else {
                                        // Both set, start over
                                        setStartVerse(vNumber);
                                        setEndVerse(null);
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.gridText,
                                    isDark && { color: '#a5d6a7' },
                                    isSelected && (isDark ? { color: '#fff', fontWeight: 'bold' } : { color: '#2e7d32', fontWeight: 'bold' })
                                ]}>{vNumber}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        );
    };

    // Step 3 Rendering
    const renderStep3 = () => {
        const surahData = surahCode ? getSurahByCode(surahCode) : null;
        
        return (
            <ScrollView contentContainerStyle={styles.stepContainer} keyboardShouldPersistTaps="handled">
                <View style={[styles.summaryCard, isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' }]}>
                    <Text style={[styles.summaryLabel, isDark && { color: '#a5d6a7' }]}>{translate('playlist.surahNo', appLanguage)}:</Text>
                    <Text style={[styles.summaryValue, isDark && { color: '#e8f5e9' }]}>{surahData?.nama || '-'}</Text>
                    
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.summaryLabel, isDark && { color: '#a5d6a7' }]}>{translate('playlist.start', appLanguage)}:</Text>
                            <Text style={[styles.summaryValue, isDark && { color: '#e8f5e9' }]}>{startVerse || '-'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.summaryLabel, isDark && { color: '#a5d6a7' }]}>{translate('playlist.end', appLanguage)}:</Text>
                            <Text style={[styles.summaryValue, isDark && { color: '#e8f5e9' }]}>{endVerse || '-'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.inputLabel, isDark && { color: '#e8f5e9' }]}>{translate('playlist.addTitle', appLanguage)}</Text>
                <TextInput
                    style={[styles.input, isDark && { backgroundColor: '#222f22', color: '#e8f5e9', borderColor: '#2d3b2d' }]}
                    placeholder={translate('wizard.titlePlaceholder', appLanguage) || "Contoh: Hafalan Subuh"}
                    placeholderTextColor={isDark ? '#a5d6a7' : '#999'}
                    value={title}
                    onChangeText={setTitle}
                />

                <TouchableOpacity 
                    style={[styles.saveButton, isDark && { backgroundColor: '#1b5e20' }, (!title || !startVerse || !endVerse) && { opacity: 0.5 }]}
                    disabled={!title || !startVerse || !endVerse}
                    onPress={() => {
                        onSave({ title, surahCode, start: startVerse, end: endVerse });
                    }}
                >
                    <Text style={styles.saveButtonText}>{translate('playlist.save', appLanguage)}</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                style={styles.modalOverlay} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={[styles.modalContent, isDark && { backgroundColor: '#162016' }]}>
                    {/* Header */}
                    <View style={[styles.header, isDark && { borderBottomColor: '#2d3b2d' }]}>
                        <TouchableOpacity onPress={() => step > 1 ? handlePrevStep() : onClose()} style={styles.headerBtn}>
                            <Ionicons name={step > 1 ? "arrow-back" : "close"} size={28} color={isDark ? '#81c784' : '#2e7d32'} />
                        </TouchableOpacity>
                        
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={[styles.headerTitle, isDark && { color: '#e8f5e9' }]}>
                                {step === 1 ? (translate('wizard.step1', appLanguage) || "Langkah 1: Pilih Surah") : 
                                 step === 2 ? (translate('wizard.step2', appLanguage) || "Langkah 2: Pilih Rentang") : 
                                 (translate('wizard.step3', appLanguage) || "Langkah 3: Konfirmasi")}
                            </Text>
                            <View style={styles.dotsContainer}>
                                <View style={[styles.dot, step >= 1 ? (isDark ? { backgroundColor: '#81c784' } : { backgroundColor: '#2e7d32' }) : { backgroundColor: '#ccc' }]} />
                                <View style={[styles.dot, step >= 2 ? (isDark ? { backgroundColor: '#81c784' } : { backgroundColor: '#2e7d32' }) : { backgroundColor: '#ccc' }]} />
                                <View style={[styles.dot, step >= 3 ? (isDark ? { backgroundColor: '#81c784' } : { backgroundColor: '#2e7d32' }) : { backgroundColor: '#ccc' }]} />
                            </View>
                        </View>
                        
                        <View style={styles.headerBtn} />
                    </View>

                    {/* Content */}
                    <View style={styles.contentArea}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%' },
    header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 15, paddingVertical: 15 },
    headerBtn: { width: 40, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    dotsContainer: { flexDirection: 'row', marginTop: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
    contentArea: { flex: 1 },
    stepContainer: { flex: 1 },
    
    // Step 1 styles
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', margin: 15, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd' },
    searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 16, color: '#333' },
    surahItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    surahNumber: { width: 40, fontSize: 16, color: '#666' },
    surahName: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    
    // Step 2 styles
    promptHeader: { alignItems: 'center', padding: 15 },
    promptText: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
    rangeHint: { fontSize: 14, color: '#666', marginTop: 5 },
    gridItem: { flex: 1, aspectRatio: 1, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1 },
    gridText: { fontSize: 16, color: '#333' },
    
    // Step 3 styles
    summaryCard: { margin: 20, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    row: { flexDirection: 'row', marginTop: 15 },
    summaryLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase' },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
    inputLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 20, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, marginHorizontal: 20, marginTop: 10, backgroundColor: '#fff', color: '#333' },
    saveButton: { backgroundColor: '#2e7d32', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
