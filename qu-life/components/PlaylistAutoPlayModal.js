import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';
import { updatePlaylistDelayConfig, updatePenandaDelayConfig } from '../utils/PlaylistManager';

const ConfigCounter = ({ label, value, setValue, isDark }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ fontSize: 14, color: isDark ? '#e8f5e9' : '#333' }}>{label}:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#222f22' : '#f1f3f5', borderRadius: 15, paddingHorizontal: 8, paddingVertical: 4 }}>
            <TouchableOpacity onPress={() => setValue(p => Math.max(0, p - 1))}>
                <Ionicons name="remove-circle-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
            </TouchableOpacity>
            <Text style={{ fontSize: 14, minWidth: 24, textAlign: 'center', color: isDark ? '#e8f5e9' : '#333' }}>{value}s</Text>
            <TouchableOpacity onPress={() => setValue(p => Math.min(20, p + 1))}>
                <Ionicons name="add-circle-outline" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
            </TouchableOpacity>
        </View>
    </View>
);

export default function PlaylistAutoPlayModal({ visible, onClose, playlist, onStart }) {
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const [repeat, setRepeat] = useState(1);
    const [verseRepeat, setVerseRepeat] = useState(1);
    const [playTranslation, setPlayTranslation] = useState(false);
    const [order, setOrder] = useState('arabic_first');
    const [delayPreArabic, setDelayPreArabic] = useState(0);
    const [delayPostArabic, setDelayPostArabic] = useState(0);
    const [delayPreTranslation, setDelayPreTranslation] = useState(0);
    const [delayPostTranslation, setDelayPostTranslation] = useState(0);
    const [delaySequenceLoop, setDelaySequenceLoop] = useState(0);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        if (visible && playlist) {
            const savedConfig = playlist.delayConfig || {};
            setRepeat(savedConfig.sequenceRepeat || 1);
            setVerseRepeat(savedConfig.repeatMode || 1);
            setPlayTranslation(savedConfig.enabledTranslation || false);
            setOrder(savedConfig.autoPlayOrder || 'arabic_first');
            setDelayPreArabic(savedConfig.delayPreArabic || 0);
            setDelayPostArabic(savedConfig.delayPostArabic || 0);
            setDelayPreTranslation(savedConfig.delayPreTranslation || 0);
            setDelayPostTranslation(savedConfig.delayPostTranslation || 0);
            setDelaySequenceLoop(savedConfig.delaySequenceLoop || 0);
            setShowDetail(false);
        }
    }, [visible, playlist]);

    const handleStart = () => {
        const settingsToSave = {
            sequenceRepeat: repeat,
            repeatMode: verseRepeat,
            enabledTranslation: playTranslation,
            autoPlayOrder: order,
            delayPreArabic: delayPreArabic,
            delayPostArabic: delayPostArabic,
            delayPreTranslation: delayPreTranslation,
            delayPostTranslation: delayPostTranslation,
            delaySequenceLoop: delaySequenceLoop
        };

        if (playlist?.isPenanda) {
            updatePenandaDelayConfig(playlist.id, settingsToSave).catch(() => {});
        } else if (playlist?.id) {
            updatePlaylistDelayConfig(playlist.id, settingsToSave).catch(() => {});
        }

        if (onStart) {
            onStart(settingsToSave);
        }
    };

    if (!visible || !playlist) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }, { maxHeight: '85%' }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>
                            {translate('playlist.autoPlayTitle', appLanguage) || 'Konfigurasi Auto Play'}
                        </Text>

                        <View style={{ marginBottom: 15, alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? '#81c784' : '#2e7d32' }}>
                                {playlist.title}
                            </Text>
                            {playlist.items && (
                                <Text style={{ fontSize: 14, color: isDark ? '#a5d6a7' : '#666', marginTop: 4 }}>
                                    {playlist.items.length} {translate('playlist.items', appLanguage) || 'Items'}
                                </Text>
                            )}
                        </View>

                        {/* Sequence Repeat */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: isDark ? '#2d3b2d' : '#eee', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, color: isDark ? '#e8f5e9' : '#333' }}>
                                {translate('verseView.repeatSequence', appLanguage) || 'Pengulangan Sekuens'}:
                            </Text>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#222f22' : '#f1f3f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
                                onPress={() => {
                                    let next = 1;
                                    if (repeat === 1) next = 2;
                                    else if (repeat === 2) next = 3;
                                    else if (repeat === 3) next = 'loop';
                                    else next = 1;
                                    setRepeat(next);
                                }}
                            >
                                <Ionicons name={repeat === 'loop' ? "infinite" : "repeat"} size={20} color={isDark ? '#81c784' : '#2e7d32'} />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? '#e8f5e9' : '#333', marginHorizontal: 8 }}>
                                    {repeat === 'loop' ? 'Loop' : `${repeat}x`}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Detail Button */}
                        <TouchableOpacity
                            style={{ backgroundColor: isDark ? '#222f22' : '#f1f3f5', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginVertical: 10 }}
                            onPress={() => setShowDetail(!showDetail)}
                        >
                            <Text style={{ color: isDark ? '#a5d6a7' : '#2e7d32', fontWeight: 'bold' }}>
                                {showDetail ? (translate('verseView.hideOptions', appLanguage) || 'Sembunyikan Opsi') : (translate('verseView.showOptions', appLanguage) || 'Tampilkan Opsi')}
                            </Text>
                        </TouchableOpacity>

                        {/* Detail Config Section */}
                        {showDetail && (
                            <View style={{ backgroundColor: isDark ? '#1c261c' : '#f8f9fa', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: isDark ? '#2d3b2d' : '#e9ecef', marginBottom: 15 }}>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#2d3b2d' : '#dee2e6', paddingBottom: 8, marginBottom: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDark ? '#759e75' : '#495057' }}>
                                        {translate('verseView.sessionConfig', appLanguage) || 'Pengaturan Sesi Ini'}
                                    </Text>
                                </View>

                                {/* Playback Order */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 14, color: isDark ? '#e8f5e9' : '#333' }}>
                                        {translate('verseView.order', appLanguage) || 'Urutan'}
                                    </Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: order === 'translation_first' ? (isDark ? '#1b5e20' : '#2e7d32') : (isDark ? '#222f22' : '#f1f3f5') }}
                                            onPress={() => setOrder('translation_first')}
                                        >
                                            <Text style={{ fontSize: 14, color: order === 'translation_first' ? '#fff' : (isDark ? '#a5d6a7' : '#333') }}>
                                                {translate('settings.transFirst', appLanguage) || 'Terj. Dulu'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: order === 'arabic_first' ? (isDark ? '#1b5e20' : '#2e7d32') : (isDark ? '#222f22' : '#f1f3f5'), marginLeft: 5 }}
                                            onPress={() => setOrder('arabic_first')}
                                        >
                                            <Text style={{ fontSize: 14, color: order === 'arabic_first' ? '#fff' : (isDark ? '#a5d6a7' : '#333') }}>
                                                {translate('settings.arabFirst', appLanguage) || 'Ayat Dulu'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Play Translation Switch */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 14, color: isDark ? '#e8f5e9' : '#333' }}>
                                        {translate('settings.playTransText', appLanguage) || 'Putar Terjemahan'}
                                    </Text>
                                    <Switch
                                        value={playTranslation}
                                        trackColor={{ false: isDark ? '#222f22' : '#767577', true: isDark ? '#1b5e20' : '#a5d6a7' }}
                                        thumbColor={playTranslation ? (isDark ? '#81c784' : '#2e7d32') : '#f4f3f4'}
                                        onValueChange={setPlayTranslation}
                                    />
                                </View>

                                <View style={{ height: 1, backgroundColor: isDark ? '#2d3b2d' : '#dee2e6', marginVertical: 10 }} />

                                {/* Verse Repeat */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 14, color: isDark ? '#e8f5e9' : '#333' }}>
                                        {translate('verseView.repeatVerse', appLanguage) || 'Ulangi per Ayat'}
                                    </Text>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1b5e20' : '#2e7d32', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 15 }}
                                        onPress={() => {
                                            const modes = [1, 2, 3, 'loop'];
                                            const idx = modes.indexOf(verseRepeat);
                                            setVerseRepeat(modes[(idx + 1) % modes.length]);
                                        }}
                                    >
                                        <Ionicons name={verseRepeat === 'loop' ? "infinite" : "repeat"} size={16} color="white" />
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, marginLeft: 6 }}>
                                            {verseRepeat === 'loop' ? 'Loop' : `${verseRepeat}x`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 1, backgroundColor: isDark ? '#2d3b2d' : '#dee2e6', marginVertical: 10 }} />

                                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: isDark ? '#759e75' : '#aaa', letterSpacing: 1 }}>
                                    {translate('verseView.delayConfig', appLanguage) || 'JEDA (DETIK)'}
                                </Text>

                                <ConfigCounter
                                    label={translate('settings.preArab', appLanguage) || 'Sebelum Ayat'}
                                    value={delayPreArabic}
                                    setValue={setDelayPreArabic}
                                    isDark={isDark}
                                />
                                <ConfigCounter
                                    label={translate('settings.postArab', appLanguage) || 'Setelah Ayat'}
                                    value={delayPostArabic}
                                    setValue={setDelayPostArabic}
                                    isDark={isDark}
                                />

                                {playTranslation && (
                                    <>
                                        <ConfigCounter
                                            label={translate('settings.preTrans', appLanguage) || 'Sebelum Terj.'}
                                            value={delayPreTranslation}
                                            setValue={setDelayPreTranslation}
                                            isDark={isDark}
                                        />
                                        <ConfigCounter
                                            label={translate('settings.postTrans', appLanguage) || 'Setelah Terj.'}
                                            value={delayPostTranslation}
                                            setValue={setDelayPostTranslation}
                                            isDark={isDark}
                                        />
                                    </>
                                )}

                                <ConfigCounter
                                    label={translate('settings.loopDelay', appLanguage) || 'Antar Pengulangan'}
                                    value={delaySequenceLoop}
                                    setValue={setDelaySequenceLoop}
                                    isDark={isDark}
                                />
                            </View>
                        )}

                        <View style={[styles.modalButtons, { marginTop: 5, paddingBottom: 10 }]}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel, isDark && { backgroundColor: '#2d3b2d' }]} onPress={onClose}>
                                <Text style={[styles.btnCancelText, isDark && { color: '#a5d6a7' }]}>{translate('playlist.cancel', appLanguage) || 'Batal'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave, isDark && { backgroundColor: '#2e7d32' }]} onPress={handleStart}>
                                <Text style={styles.btnSaveText}>{translate('playlist.start', appLanguage) || 'Mulai'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#2e7d32',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 5,
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
        fontSize: 16,
    },
    btnSaveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
