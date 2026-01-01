import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { getSurahByCode } from '../utils/DataLoader';

const SPECIAL_ITEMS = [
    { id: '1', title: 'Al-Kahfi', subtitle: 'Ayat 1-10', surahCode: '18', start: 1, end: 10, number: 18 },
    { id: '2', title: 'Ali \'Imran', subtitle: 'Ayat 190-200', surahCode: '3', start: 190, end: 200, number: 3 },
    { id: '3', title: 'Al-Baqarah', subtitle: 'Ayat 285-286', surahCode: '2', start: 285, end: 286, number: 2 },
];

export default function SpecialListScreen({ navigation }) {

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

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <View style={styles.numberContainer}>
                <Text style={styles.number}>{item.number}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.translation}>{item.subtitle}</Text>
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
        backgroundColor: 'rgba(255,255,255,0.5)',
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
        color: '#212529',
        marginBottom: 4,
    },
    translation: {
        fontSize: 14,
        color: '#868e96',
    },
});
