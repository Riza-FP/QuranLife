import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { getSurahList, getSurahByCode } from '../utils/DataLoader';

export default function SurahListScreen({ navigation }) {
    const [surahs, setSurahs] = useState([]);
    const hasAutoRestored = useRef(false);

    useEffect(() => {
        setSurahs(getSurahList());
    }, []);

    useEffect(() => {
        setSurahs(getSurahList());
    }, []);

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
                <Text style={styles.details}>{item.jumlah_ayat} Ayat</Text>
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
                    data={surahs}
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
