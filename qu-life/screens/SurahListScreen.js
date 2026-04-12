import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, TextInput } from 'react-native';
import { getSurahList } from '../utils/DataLoader';
import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';
import { Ionicons } from '@expo/vector-icons';

export default function SurahListScreen({ navigation }) {
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { appLanguage } = useSettings();

    useEffect(() => {
        const fullList = getSurahList();
        setSurahs(fullList);
        setFilteredSurahs(fullList);
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const lowerText = text.toLowerCase();
            const filtered = surahs.filter(surah => 
                surah.nama.toLowerCase().includes(lowerText) || 
                String(surah.nomor).includes(lowerText)
            );
            setFilteredSurahs(filtered);
        } else {
            setFilteredSurahs(surahs);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('VerseView', { surah: item })}
        >
            <View style={styles.numberContainer}>
                <Text style={styles.number}>{item.nomor}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.nama}</Text>
                <Text style={styles.details}>{item.jumlah_ayat} {translate('surahList.verseCount', appLanguage)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../qulife_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#868e96" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={translate('surahList.searchPlaceholder', appLanguage)}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#868e96"
                    />
                </View>
                <FlatList
                    data={filteredSurahs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.kode}
                    contentContainerStyle={styles.listContent}
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
        backgroundColor: 'rgba(255,255,255,0.5)', // Adjusted transparency
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#212529',
    },
    listContent: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    numberContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
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
        fontWeight: '600',
        color: '#212529',
    },
    details: {
        fontSize: 14,
        color: '#868e96',
        marginTop: 4,
    },
});
