import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlaybackControlPanel({
    isPlaying,
    onPlayPause,
    autoPlay,
    onToggleAutoPlay,
    repeatMode,
    onCycleRepeat,
    delaySeconds,
    onCycleDelay,
    showTranslation,
    onToggleTranslation,
    loading,
    translationIcon, // Added prop
    onOpenSettings // New prop
}) {

    const getRepeatIcon = () => {
        if (repeatMode === 'loop') return 'infinite';
        return 'repeat';
    };

    return (
        <View style={styles.container}>
            {/* Main Control Row: Auto | Audio | Terjemahan | Setting */}
            <View style={styles.controlsRow}>
                {/* 1. Auto */}
                <TouchableOpacity style={styles.controlButton} onPress={onToggleAutoPlay}>
                    <Ionicons
                        name={autoPlay ? "play-skip-forward-circle" : "play-skip-forward-circle-outline"}
                        size={28}
                        color={autoPlay ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.controlText, autoPlay && styles.activeText]}>Auto</Text>
                </TouchableOpacity>

                {/* 2. Audio (Play/Pause) */}
                <TouchableOpacity style={styles.controlButton} onPress={onPlayPause} disabled={loading}>
                    {loading ? (
                        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>...</Text>
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause-circle" : "play-circle"}
                            size={28}
                            color={isPlaying ? "#007AFF" : "#666"}
                        />
                    )}
                    <Text style={[styles.controlText, isPlaying && styles.activeText]}>Audio</Text>
                </TouchableOpacity>

                {/* 3. Terjemahan */}
                <TouchableOpacity style={styles.controlButton} onPress={onToggleTranslation}>
                    <Ionicons
                        name={translationIcon || (showTranslation ? "language" : "language-outline")}
                        size={28}
                        color={showTranslation ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.controlText, showTranslation && styles.activeText]}>Terjemahan</Text>
                </TouchableOpacity>

                {/* 4. Setting (Opens Surah Settings Modal) */}
                <TouchableOpacity style={styles.controlButton} onPress={onOpenSettings}>
                    <Ionicons
                        name="options-outline"
                        size={28}
                        color="#666"
                    />
                    <Text style={styles.controlText}>Setting</Text>
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
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingBottom: 30, // Adjusted to be somewhat higher but not too high
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
    },
    controlText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    activeText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    settingsDetailRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7f5ff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    detailText: {
        color: '#007AFF',
        marginLeft: 5,
        fontWeight: '600',
        fontSize: 13,
    },
});
