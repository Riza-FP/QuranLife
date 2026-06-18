import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, FlatList, TouchableOpacity, ImageBackground, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';
import { loadData, saveData, generateId } from '../utils/PlaylistManager';
import { getSurahByCode, getSurahList } from '../utils/DataLoader';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import WizardSelectionModal from '../components/WizardSelectionModal';
import QuickEditModal from '../components/QuickEditModal';

export default function SpecialListScreen({ navigation }) {
    const { appLanguage, theme } = useSettings();
    const isDark = theme === 'dark';

    const [appData, setAppData] = useState({ penanda: [], playlists: [] });
    const [activeTab, setActiveTab] = useState('penanda'); // 'penanda' | 'playlists'
    
    // Search & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'az' | 'za'

    // Type selection Modal
    const [addTypeModalVisible, setAddTypeModalVisible] = useState(false);

    // Playlist Modal State
    const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
    const [editingPlaylistId, setEditingPlaylistId] = useState(null);
    const [formPlaylistTitle, setFormPlaylistTitle] = useState('');

    // Penanda Wizard State
    const [wizardVisible, setWizardVisible] = useState(false);
    const [wizardInitialData, setWizardInitialData] = useState(null);

    // Quick Edit State
    const [quickEditVisible, setQuickEditVisible] = useState(false);
    const [quickEditData, setQuickEditData] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        const data = await loadData();
        setAppData(data);
    };

    // ---------- PENANDA ACTIONS ----------
    const handlePressPenanda = (item) => {
        const surahData = getSurahByCode(item.surahCode);
        if (surahData) {
            navigation.navigate('VerseView', {
                surah: surahData,
                initialVerseIndex: 0,
                startVerse: item.start,
                endVerse: item.end,
                contextType: 'penanda',
                contextId: item.id,
                delayConfig: item.delayConfig
            });
        } else {
            Alert.alert(translate('playlist.error', appLanguage), translate('playlist.surahNotFound', appLanguage));
        }
    };

    const openAddPenanda = () => {
        setAddTypeModalVisible(false);
        setWizardInitialData(null);
        setWizardVisible(true);
    };

    const openEditPenanda = (item) => {
        setQuickEditData({
            id: item.id,
            title: item.title,
            surahCode: item.surahCode,
            start: parseInt(item.start),
            end: parseInt(item.end)
        });
        setQuickEditVisible(true);
    };

    const handleDeletePenanda = (itemId) => {
        Alert.alert(
            translate('playlist.deleteBookmark', appLanguage),
            translate('playlist.deleteBookmarkDesc', appLanguage),
            [
                { text: translate('playlist.cancel', appLanguage), style: "cancel" },
                {
                    text: translate('playlist.delete', appLanguage),
                    style: "destructive",
                    onPress: async () => {
                        const updated = appData.penanda.filter(i => i.id !== itemId);
                        const newData = { ...appData, penanda: updated };
                        setAppData(newData);
                        await saveData(newData);
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

        let updated;
        if (wizardInitialData) {
            // Preserve delayConfig if editing
            const existingItem = appData.penanda.find(p => p.id === wizardInitialData.id);
            if (existingItem?.delayConfig) newItem.delayConfig = existingItem.delayConfig;
            
            updated = appData.penanda.map(i => i.id === wizardInitialData.id ? newItem : i);
        } else {
            updated = [...appData.penanda, newItem];
        }

        const newData = { ...appData, penanda: updated };
        setAppData(newData);
        await saveData(newData);
        setWizardVisible(false);
    };

    const handleQuickEditSave = async (updatedData) => {
        const updated = appData.penanda.map(i => i.id === updatedData.id ? { ...i, title: updatedData.title } : i);
        const newData = { ...appData, penanda: updated };
        setAppData(newData);
        await saveData(newData);
        setQuickEditVisible(false);
    };

    const handleQuickEditChangeRange = (data) => {
        setQuickEditVisible(false);
        setWizardInitialData(data);
        setWizardVisible(true);
    };


    // ---------- PLAYLIST ACTIONS ----------
    const handlePressPlaylist = (playlist) => {
        navigation.navigate('PlaylistDetail', {
            playlistId: playlist.id,
            playlistTitle: playlist.title
        });
    };

    const openAddPlaylist = () => {
        setAddTypeModalVisible(false);
        setEditingPlaylistId(null);
        setFormPlaylistTitle('');
        setPlaylistModalVisible(true);
    };

    const openEditPlaylist = (playlist) => {
        if (playlist.isBuiltIn) {
            Alert.alert(translate('playlist.restricted', appLanguage), translate('playlist.restrictedDesc', appLanguage));
            return;
        }
        setEditingPlaylistId(playlist.id);
        setFormPlaylistTitle(playlist.title);
        setPlaylistModalVisible(true);
    };

    const handleDeletePlaylist = (playlistId) => {
        Alert.alert(
            translate('playlist.deletePlaylist', appLanguage),
            translate('playlist.deletePlaylistDesc', appLanguage),
            [
                { text: translate('playlist.cancel', appLanguage), style: "cancel" },
                {
                    text: translate('playlist.delete', appLanguage),
                    style: "destructive",
                    onPress: async () => {
                        const updated = appData.playlists.filter(p => p.id !== playlistId);
                        const newData = { ...appData, playlists: updated };
                        setAppData(newData);
                        await saveData(newData);
                    }
                }
            ]
        );
    };

    const handleSavePlaylist = async () => {
        if (!formPlaylistTitle.trim()) {
            Alert.alert(translate('playlist.error', appLanguage), translate('playlist.errorName', appLanguage));
            return;
        }

        const newPlaylist = {
            id: editingPlaylistId || generateId(),
            title: formPlaylistTitle.trim(),
            isBuiltIn: false,
            items: []
        };

        let updated;
        if (editingPlaylistId) {
            updated = appData.playlists.map(p => p.id === editingPlaylistId ? { ...p, title: newPlaylist.title } : p);
        } else {
            updated = [...appData.playlists, newPlaylist];
        }

        const newData = { ...appData, playlists: updated };
        setAppData(newData);
        await saveData(newData);
        setPlaylistModalVisible(false);
    };


    const renderItem = ({ item }) => {
        if (activeTab === 'penanda') {
            const surahData = item.surahCode ? getSurahByCode(item.surahCode) : null;
            const surahName = surahData ? surahData.nama + ", " : "";

            const subtitle = item.customSubtitleKey 
                ? item.customSubtitleKey 
                : `${surahName}${translate('home.verse', appLanguage)} ${item.start}-${item.end}`;
                
            return (
                <View style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1, shadowColor: '#0c120c' }]}>
                    <TouchableOpacity style={styles.cardContent} onPress={() => handlePressPenanda(item)}>
                        <View style={[styles.iconContainer, isDark && { backgroundColor: '#222f22' }]}>
                            <Ionicons name="bookmark" size={20} color={isDark ? '#a5d6a7' : '#495057'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.name, isDark ? { color: '#ffffff' } : { color: '#2e7d32' }]}>{item.title}</Text>
                            <Text style={[styles.translation, isDark && { color: '#a5d6a7' }]}>{subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditPenanda(item)}>
                            <Ionicons name="pencil" size={20} color={isDark ? '#81c784' : '#2e7d32'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePenanda(item.id)}>
                            <Ionicons name="trash" size={20} color="#e53935" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            // Playlist Item
            return (
                <View style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1, shadowColor: '#0c120c' }]}>
                    <TouchableOpacity style={styles.cardContent} onPress={() => handlePressPlaylist(item)}>
                        <View style={[styles.iconContainer, isDark && { backgroundColor: '#222f22' }]}>
                            <Ionicons name={item.isBuiltIn ? "star" : "folder-open"} size={20} color={isDark ? '#a5d6a7' : '#495057'} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.name, isDark ? { color: '#ffffff' } : { color: '#2e7d32' }]}>{item.title}</Text>
                            <Text style={[styles.translation, isDark && { color: '#a5d6a7' }]}>
                                {item.items ? item.items.length : 0} {translate('playlist.items', appLanguage) || 'Items'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {!item.isBuiltIn && (
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => openEditPlaylist(item)}>
                                <Ionicons name="pencil" size={20} color={isDark ? '#81c784' : '#2e7d32'} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePlaylist(item.id)}>
                                <Ionicons name="trash" size={20} color="#e53935" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            );
        }
    };

    const getFilteredData = () => {
        let currentList = activeTab === 'penanda' ? appData.penanda : appData.playlists;
        
        // Filter by Search Query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            currentList = currentList.filter(item => {
                const titleMatch = item.title?.toLowerCase().includes(query);
                if (titleMatch) return true;
                
                // If Penanda, check surah name
                if (item.surahCode) {
                    const surahData = getSurahByCode(item.surahCode);
                    if (surahData && surahData.nama.toLowerCase().includes(query)) {
                        return true;
                    }
                }
                return false;
            });
        }

        // Sort Data
        const sortedList = [...currentList];
        
        if (sortOrder === 'oldest') {
            return sortedList; // Default array order
        } else if (sortOrder === 'newest') {
            return sortedList.reverse();
        }

        return sortedList;
    };

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={[styles.tabContainer, isDark && { backgroundColor: 'rgba(22, 32, 22, 0.8)' }]}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'penanda' && styles.activeTab, activeTab === 'penanda' && isDark && { backgroundColor: '#2e7d32' }]} 
                        onPress={() => setActiveTab('penanda')}
                    >
                        <Text style={[styles.tabText, activeTab === 'penanda' && styles.activeTabText, isDark && { color: activeTab === 'penanda' ? '#fff' : '#a5d6a7' }]}>
                            {translate('playlist.bookmarks', appLanguage)}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'playlists' && styles.activeTab, activeTab === 'playlists' && isDark && { backgroundColor: '#2e7d32' }]} 
                        onPress={() => setActiveTab('playlists')}
                    >
                        <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText, isDark && { color: activeTab === 'playlists' ? '#fff' : '#a5d6a7' }]}>
                            {translate('playlist.playlists', appLanguage)}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search & Sort Bar */}
                <View style={styles.searchSortContainer}>
                    <View style={[styles.searchBox, isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' }]}>
                        <Ionicons name="search" size={20} color={isDark ? '#81c784' : '#666'} />
                        <TextInput
                            style={[styles.searchInput, isDark && { color: '#e8f5e9' }]}
                            placeholder={translate('list.search', appLanguage) || "Cari..."}
                            placeholderTextColor={isDark ? '#a5d6a7' : '#999'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={isDark ? '#a5d6a7' : '#999'} />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.sortButton, isDark && { backgroundColor: '#222f22', borderColor: '#2d3b2d' }]}
                        onPress={() => {
                            const orders = ['newest', 'oldest'];
                            const nextIndex = (orders.indexOf(sortOrder) + 1) % orders.length;
                            setSortOrder(orders[nextIndex]);
                        }}
                    >
                        <Ionicons 
                            name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} 
                            size={20} 
                            color={isDark ? '#81c784' : '#2e7d32'} 
                        />
                        <Text style={[styles.sortText, isDark ? { color: '#e8f5e9' } : { color: '#2e7d32' }]}>
                            {sortOrder === 'newest' ? (translate('list.sortNewest', appLanguage) || 'Terbaru') :
                             (translate('list.sortOldest', appLanguage) || 'Terlama')}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={getFilteredData()}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />

                <TouchableOpacity 
                    style={[styles.fab, isDark && { backgroundColor: '#81c784' }]} 
                    onPress={() => setAddTypeModalVisible(true)}
                >
                    <Ionicons name="add" size={30} color={isDark ? '#162016' : '#ffffff'} />
                </TouchableOpacity>

                {/* Add Type Selection Modal */}
                <Modal visible={addTypeModalVisible} transparent={true} animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddTypeModalVisible(false)}>
                        <View style={[styles.menuContent, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                            <TouchableOpacity style={styles.menuItem} onPress={openAddPenanda}>
                                <Ionicons name="bookmark" size={24} color={isDark ? '#81c784' : '#2e7d32'} style={styles.menuIcon} />
                                <Text style={[styles.menuText, isDark && { color: '#e8f5e9' }]}>{translate('playlist.addBookmark', appLanguage)}</Text>
                            </TouchableOpacity>
                            <View style={[styles.divider, isDark && { backgroundColor: '#2d3b2d' }]} />
                            <TouchableOpacity style={styles.menuItem} onPress={openAddPlaylist}>
                                <Ionicons name="folder-open" size={24} color={isDark ? '#81c784' : '#2e7d32'} style={styles.menuIcon} />
                                <Text style={[styles.menuText, isDark && { color: '#e8f5e9' }]}>{translate('playlist.createPlaylist', appLanguage)}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Playlist Modal */}
                <Modal visible={playlistModalVisible} transparent={true} animationType="slide">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                        <View style={[styles.modalContent, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1 }]}>
                            <Text style={[styles.modalTitle, isDark && { color: '#e8f5e9' }]}>
                                {editingPlaylistId ? translate('playlist.editPlaylist', appLanguage) : translate('playlist.createPlaylist', appLanguage)}
                            </Text>
                            
                            <TextInput
                                style={[styles.input, isDark && { backgroundColor: '#222f22', color: '#e8f5e9', borderColor: '#2d3b2d' }]}
                                placeholder={translate('playlist.createPlaylist', appLanguage)}
                                placeholderTextColor={isDark ? '#759e75' : '#868e96'}
                                value={formPlaylistTitle}
                                onChangeText={setFormPlaylistTitle}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.btn, styles.btnCancel, isDark && { backgroundColor: '#2d3b2d' }]} onPress={() => setPlaylistModalVisible(false)}>
                                    <Text style={[styles.btnCancelText, isDark && { color: '#a5d6a7' }]}>{translate('playlist.cancel', appLanguage)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnSave, isDark && { backgroundColor: '#2e7d32' }]} onPress={handleSavePlaylist}>
                                    <Text style={styles.btnSaveText}>{translate('playlist.save', appLanguage)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Wizard Selection Modal for Penanda */}
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
        backgroundColor: 'transparent',
    },
    list: {
        padding: 16,
        paddingBottom: 100, // For FAB
    },
    sectionHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
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
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f3f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
    actionsContainer: {
        flexDirection: 'row',
        paddingRight: 10,
    },
    actionBtn: {
        padding: 10,
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
    menuContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 10,
        shadowRadius: 5,
        elevation: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 10,
        padding: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#4caf50',
    },
    tabText: {
        fontSize: 16,
        color: '#495057',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#fff',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    menuIcon: {
        marginRight: 15,
    },
    menuText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 10,
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
    searchSortContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 10,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#eee',
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#eee',
        height: 44,
        gap: 6,
    },
    sortText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
});
