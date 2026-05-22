import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Clipboard } from 'react-native';
import Logger from '../utils/Logger';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../utils/SettingsContext';

export default function LogViewerScreen() {
    const [logs, setLogs] = useState([]);
    const { theme } = useSettings();
    const isDark = theme === 'dark';

    const loadLogs = async () => {
        const data = await Logger.getLogs();
        setLogs(data);
    };

    const clearLogs = async () => {
        await Logger.clearLogs();
        setLogs([]);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const renderItem = ({ item }) => (
        <View style={[
            styles.logItem,
            item.level === 'ERROR' ? styles.errorItem : [styles.infoItem, isDark && { borderLeftColor: '#81c784' }],
            isDark && { backgroundColor: '#162016', elevation: 0 }
        ]}>
            <View style={styles.logHeader}>
                <Text style={[styles.timestamp, isDark && { color: '#759e75' }]}>{new Date(item.timestamp).toLocaleString()}</Text>
                <Text style={[styles.level, isDark && { color: '#e8f5e9' }]}>{item.level}</Text>
            </View>
            <Text style={[styles.message, isDark && { color: '#e8f5e9' }]}>{item.message}</Text>
            {item.details ? (
                <Text style={[styles.details, isDark && { backgroundColor: '#1c261c', color: '#a5d6a7' }]}>
                    {item.details}
                </Text>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#0f140f' }]}>
            <View style={[styles.header, isDark && { backgroundColor: '#162016', borderBottomColor: '#2d3b2d' }]}>
                <Text style={[styles.title, isDark && { color: '#81c784' }]}>Debug Logs</Text>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={loadLogs} style={styles.iconButton}>
                        <Ionicons name="refresh" size={24} color={isDark ? '#81c784' : '#2e7d32'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearLogs} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={[styles.emptyText, isDark && { color: '#759e75' }]}>No logs found.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    actions: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    listContent: {
        padding: 10,
    },
    logItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
    },
    errorItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30',
    },
    infoItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#2e7d32',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
    },
    level: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    message: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    details: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    }
});
