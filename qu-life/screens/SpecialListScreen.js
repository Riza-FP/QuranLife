import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { getSurahByCode } from '../utils/DataLoader';

import { useSettings } from '../utils/SettingsContext';
import { translate } from '../utils/i18n';

const SPECIAL_ITEMS = [
    { id: '1', title: 'Al-Kahfi', start: 1, end: 10, surahCode: '18', number: 18 },
    { id: '2', title: 'Ali \'Imran', start: 190, end: 200, surahCode: '3', number: 3 },
    { id: '3', title: 'Al-Baqarah', start: 285, end: 286, surahCode: '2', number: 2 },
    { id: '4', title: 'Ayat Kursi', start: 255, end: 255, surahCode: '2', number: 2, customSubtitleKey: 'Al-Baqarah Ayat 255' },
];

export default function SpecialListScreen({ navigation }) {
    const { appLanguage, theme } = useSettings();

    const handlePress = (item) => {
        const surahData = getSurahByCode(item.surahCode);
        if (surahData) {
            navigation.navigate('VerseView', {
                surah: surahData,
                initialVerseIndex: 0, // In filtered view, index 0 is startVerse
                startVerse: item.start,
                endVerse: item.end
            });
        } else {
            alert('Surah data not found!');
        }
    };

    const isDark = theme === 'dark';

    const renderItem = ({ item }) => {
        const subtitle = item.customSubtitleKey 
            ? `Al-Baqarah ${translate('home.verse', appLanguage)} 255` 
            : `${translate('home.verse', appLanguage)} ${item.start}-${item.end}`;
            
        return (
            <TouchableOpacity 
                style={[styles.card, isDark && { backgroundColor: '#162016', borderColor: '#2d3b2d', borderWidth: 1, shadowColor: '#0c120c' }]} 
                onPress={() => handlePress(item)}
            >
                <View style={[styles.numberContainer, isDark && { backgroundColor: '#222f22' }]}>
                    <Text style={[styles.number, isDark && { color: '#a5d6a7' }]}>{item.number}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.name, isDark ? { color: '#ffffff' } : { color: '#2e7d32' }]}>{item.title}</Text>
                    <Text style={[styles.translation, isDark && { color: '#a5d6a7' }]}>{subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={isDark ? require('../../assets/bg_dark_normal.jpg') : require('../../assets/bg_light_normal.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <FlatList
                    data={SPECIAL_ITEMS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
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
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
});
