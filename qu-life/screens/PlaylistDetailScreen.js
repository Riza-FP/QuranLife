import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSurahByCode, getSurahList } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';
import { loadData, saveData, generateId } from '../utils/PlaylistManager';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import WizardSelectionModal from '../components/WizardSelectionModal';
import QuickEditModal from '../components/QuickEditModal';
import PlaylistAutoPlayModal from '../components/PlaylistAutoPlayModal';

export default function PlaylistDetailScreen({ route, navigation }) {
    const { playlistId, playlistTitle } = route.params;
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const [appData, setAppData] = useState(null);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [items, setItems] = useState([]);
    const [isBuiltIn, setIsBuiltIn] = useState(false);

    // Wizard State
    const [wizardVisible, setWizardVisible] = useState(false);
    const [wizardInitialData, setWizardInitialData] = useState(null);

    // Quick Edit State
    const [quickEditVisible, setQuickEditVisible] = useState(false);
    const [quickEditData, setQuickEditData] = useState(null);

    // Auto Play Modal State
    const [autoPlayModalVisible, setAutoPlayModalVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: playlistTitle || 'Detail Playlist',
            headerRight: () => (
                <TouchableOpacity 
                    onPress={() => {
                        if (!items || items.length === 0) {
                            Alert.alert(
                                translate('playlist.error', appLanguage) || 'Error',
                                translate('playlist.emptyPlaylist', appLanguage) || 'Playlist ini masih kosong. Tambahkan item terlebih dahulu!'
                            );
                            return;
                        }
                        setAutoPlayModalVisible(true);
                    }} 
                    style={{ marginRight: 15 }}
                    disabled={!items || items.length === 0}
                >
                    <Ionicons name="play-circle" size={28} color={(!items || items.length === 0) ? '#aaa' : (isDark ? '#81c784' : '#2e7d32')} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, playlistTitle, items, isDark, appLanguage]);

    const handleStartAutoPlay = (config) => {
        setAutoPlayModalVisible(false);
        if (!items || items.length === 0) return;
        const firstItem = items[0];
        const surahData = getSurahByCode(firstItem.surahCode);
        if (!surahData) {
            Alert.alert(translate('playlist.error', appLanguage), translate('playlist.surahNotFound', appLanguage));
            return;
        }
        navigation.navigate('VerseView', {
            surah: surahData,
            initialVerseIndex: 0,
            startVerse: firstItem.start,
            endVerse: firstItem.end,
            contextType: currentPlaylist?.isPenanda ? 'penanda' : 'playlist',
            contextId: currentPlaylist?.id,
            delayConfig: config,
            playlistQueue: items,
            currentQueueIndex: 0,
            autoStartPlaying: true,
            playlistSequenceRepeat: config.sequenceRepeat,
            playlistVerseRepeat: config.repeatMode,
            playlistPlayTranslation: config.enabledTranslation,
            playlistOrder: config.autoPlayOrder,
            playlistDelayPreArabic: config.delayPreArabic,
            playlistDelayPostArabic: config.delayPostArabic,
            playlistDelayPreTranslation: config.delayPreTranslation,
            playlistDelayPostTranslation: config.delayPostTranslation,
            playlistDelaySequenceLoop: config.delaySequenceLoop
        });
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        const data = await loadData();
        setAppData(data);
        const target = data.playlists.find(p => p.id === playlistId);
        if (target) {
            setCurrentPlaylist(target);
            setItems(target.items || []);
            setIsBuiltIn(target.isBuiltIn || false);
        }
    };

    const handlePressItem = (item, index) => {
        const surahData = getSurahByCode(item.surahCode);
        if (surahData) {
            navigation.navigate('VerseView', {
                surah: surahData,
                initialVerseIndex: 0,
                startVerse: item.start,
                endVerse: item.end,
                contextType: 'playlist',
                contextId: currentPlaylist?.id,
                delayConfig: currentPlaylist?.delayConfig,
                playlistQueue: items,
                currentQueueIndex: index,
                autoStartPlaying: false
            });
        } else {
            Alert.alert(translate('playlist.error', appLanguage), translate('playlist.surahNotFound', appLanguage));
        }
    };

    const openAddModal = () => {
        setWizardInitialData(null);
        setWizardVisible(true);
    };

    const openEditModal = (item) => {
        setQuickEditData({
            id: item.id,
            title: item.title,
            surahCode: item.surahCode,
            start: parseInt(item.start),
            end: parseInt(item.end)
        });
        setQuickEditVisible(true);
    };

    const handleDeleteItem = (itemId) => {
        Alert.alert(
            translate('playlist.deleteItem', appLanguage),
            translate('playlist.deleteItemDesc', appLanguage),
            [
                { text: translate('playlist.cancel', appLanguage), style: "cancel" },
                {
                    text: translate('playlist.delete', appLanguage),
                    style: "destructive",
                    onPress: async () => {
                        const updatedItems = items.filter(i => i.id !== itemId);
                        setItems(updatedItems);
                        await updatePlaylistInStorage(updatedItems);
                    }
                }
            ]
        );
    };

    const handleWizardSave = async (data) => {
        const { title, surahCode, start, end } = data;
        const surahData = getSurahByCode(surahCode);
        const newItem = {
            id: wizardInitialData ? wizardInitialData.id : generateId(),
            title: title.trim(),
            surahCode: surahCode,
            start: start,
            end: end,
            number: surahData ? parseInt(surahData.nomor) : null
        };

        let updatedItems;
        if (wizardInitialData) {
            updatedItems = items.map(i => i.id === wizardInitialData.id ? newItem : i);
        } else {
            updatedItems = [...items, newItem];
        }

        setItems(updatedItems);
        await updatePlaylistInStorage(updatedItems);
        setWizardVisible(false);
    };

    const handleQuickEditSave = async (updatedData) => {
        const updatedItems = items.map(i => i.id === updatedData.id ? { ...i, title: updatedData.title } : i);
        setItems(updatedItems);
        await updatePlaylistInStorage(updatedItems);
        setQuickEditVisible(false);
    };

    const handleQuickEditChangeRange = (data) => {
        setQuickEditVisible(false);
        setWizardInitialData(data);
        setWizardVisible(true);
    };

    const updatePlaylistInStorage = async (newItems) => {
        const updatedPlaylists = appData.playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, items: newItems };
            }
            return p;
        });
        const newData = { ...appData, playlists: updatedPlaylists };
        setAppData(newData);
        await saveData(newData);
    };

    const renderItem = ({ item, getIndex, drag, isActive }) => {
        const index = getIndex !== undefined ? getIndex() : 0;
        const surahData = item.surahCode ? getSurahByCode(item.surahCode) : null;
        const surahName = surahData ? surahData.nama + ", " : "";

        const subtitle = item.customSubtitleKey 
            ? item.customSubtitleKey 
            : `${surahName}${translate('home.verse', appLanguage)} ${item.start}-${item.end}`;
            
        return (
            <ScaleDecorator>
                <View style={[
                    styles.card, 
                    isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1, shadowColor: '#0c120c' },
                    isActive && { backgroundColor: isDark ? '#223322' : '#e8f5e9', elevation: 8, shadowOpacity: 0.2, borderColor: '#2e7d32', borderWidth: 1.5 }
                ]}>
                    <TouchableOpacity 
                        style={styles.cardContent} 
                        onPress={() => handlePressItem(item, index)}
                        disabled={isActive}
                    >
                        <View style={[styles.numberContainer, isDark && { backgroundColor: '#222f22' }]}>
                            <Text style={[styles.number, isDark && { color: '#a5d6a7' }]}>{item.number}</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.name, isDark ? { color: '#ffffff' } : { color: '#2e7d32' }]}>{item.title}</Text>
                            <Text style={[styles.translation, isDark && { color: '#a5d6a7' }]}>{subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { paddingHorizontal: 6 }]} 
                            onPressIn={drag} 
                            disabled={isActive}
                        >
                            <Ionicons name="reorder-two" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)} disabled={isActive}>
                            <Ionicons name="pencil" size={18} color={isDark ? '#81c784' : '#2e7d32'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteItem(item.id)} disabled={isActive}>
                            <Ionicons name="trash" size={18} color="#e53935" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScaleDecorator>
        );
    };

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
                <DraggableFlatList
                    data={items}
                    onDragEnd={({ data }) => {
                        const reindexed = data.map((it, idx) => ({ ...it, number: idx + 1 }));
                        setItems(reindexed);
                        updatePlaylistInStorage(reindexed);
                    }}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, isDark && { color: '#a5d6a7' }]}>{translate('playlist.noItems', appLanguage)}</Text>
                    }
                />
                
                <TouchableOpacity 
                    style={[styles.fab, isDark && { backgroundColor: '#81c784' }]} 
                    onPress={openAddModal}
                >
                    <Ionicons name="add" size={30} color={isDark ? '#162016' : '#ffffff'} />
                </TouchableOpacity>

                {/* Wizard Selection Modal */}
                <WizardSelectionModal
                    visible={wizardVisible}
                    onClose={() => setWizardVisible(false)}
                    initialData={wizardInitialData}
                    onSave={handleWizardSave}
                />

                {/* Quick Edit Modal */}
                <QuickEditModal
                    visible={quickEditVisible}
                    onClose={() => setQuickEditVisible(false)}
                    initialData={quickEditData}
                    onSave={handleQuickEditSave}
                    onChangeRange={handleQuickEditChangeRange}
                />

                {/* Playlist Auto Play Modal */}
                <PlaylistAutoPlayModal
                    visible={autoPlayModalVisible}
                    onClose={() => setAutoPlayModalVisible(false)}
                    playlist={currentPlaylist ? { ...currentPlaylist, items } : null}
                    onStart={handleStartAutoPlay}
                />
            </SafeAreaView>
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
        backgroundColor: 'transparent',
    },
    list: {
        padding: 16,
        paddingBottom: 100, // padding for FAB
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingRight: 8,
        alignItems: 'center',
    },
    actionBtn: {
        padding: 6,
    },
    numberContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f3f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    number: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#495057',
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    translation: {
        fontSize: 14,
        color: '#868e96',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#2e7d32',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    halfInput: {
        flex: 1,
        marginRight: 10,
        marginBottom: 0,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1.2,
    },
    smallInput: {
        flex: 1,
        marginBottom: 0,
        textAlign: 'center',
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    dash: {
        marginHorizontal: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
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
