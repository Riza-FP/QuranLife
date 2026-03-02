import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlaybackControlPanel({
    isPlaying,
    onPlayPause,
    autoPlay,
    onToggleAutoPlay,
    showTranslation,
    onToggleTranslation,
    loading,
    translationIcon,
    onOpenSettings // KEPT for prop compatibility, but not used in UI here
}) {

    return (
        <View style={styles.container}>
            {/* New Layout: Auto (Left) | Audio (Center/Big) | Terjemahan (Right) */}
            <View style={styles.controlsRow}>

                {/* 1. Auto (Left) */}
                <TouchableOpacity style={styles.sideButton} onPress={onToggleAutoPlay}>
                    <Ionicons
                        name={autoPlay ? "play-skip-forward-circle" : "play-skip-forward-circle-outline"}
                        size={28}
                        color={autoPlay ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.controlText, autoPlay && styles.activeText]}>Auto Play</Text>
                </TouchableOpacity>

                {/* 2. Audio (Center - Big Play Button) */}
                <TouchableOpacity style={styles.mainPlayButton} onPress={onPlayPause} disabled={loading}>
                    {loading ? (
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>...</Text>
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={40}
                            color="#fff"
                            style={{ marginLeft: isPlaying ? 0 : 4 }} // visual adjustment
                        />
                    )}
                </TouchableOpacity>

                {/* 3. Terjemahan (Right) */}
                <TouchableOpacity style={styles.sideButton} onPress={onToggleTranslation}>
                    <Ionicons
                        name={translationIcon || (showTranslation ? "language" : "language-outline")}
                        size={28}
                        color={showTranslation ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.controlText, showTranslation && styles.activeText]}>Terjemahan</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 15,
        paddingHorizontal: 30,
        paddingBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sideButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80, // Fixed width for alignment
    },
    mainPlayButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginBottom: 10, // Push it up slightly
        marginTop: -30, // Make it float above
    },
    controlText: {
        fontSize: 11, // Slightly smaller text
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    activeText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
