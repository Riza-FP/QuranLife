import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getSurahList } from '../utils/DataLoader';

export default function SurahListScreen({ navigation }) {
    const [surahs, setSurahs] = useState([]);

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
        <View style={styles.container}>
            <FlatList
                data={surahs}
                renderItem={renderItem}
                keyExtractor={(item) => item.kode}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
