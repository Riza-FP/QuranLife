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
    loading
}) {
    const getRepeatIcon = () => {
        if (repeatMode === 'loop') return 'infinite';
        return 'repeat';
    };

    return (
        <View style={styles.container}>
            {/* Top Row: Settings */}
            <View style={styles.settingsRow}>
                <TouchableOpacity style={styles.settingButton} onPress={onToggleAutoPlay}>
                    <Ionicons
                        name={autoPlay ? "play-skip-forward-circle" : "play-skip-forward-circle-outline"}
                        size={24}
                        color={autoPlay ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.settingText, autoPlay && styles.activeText]}>Auto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingButton} onPress={onCycleRepeat}>
                    <View style={styles.iconBadgeContainer}>
                        <Ionicons name={getRepeatIcon()} size={24} color={repeatMode !== 1 ? "#007AFF" : "#666"} />
                        {repeatMode !== 'loop' && repeatMode !== 1 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{repeatMode}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.settingText, repeatMode !== 1 && styles.activeText]}>
                        {repeatMode === 'loop' ? 'Loop' : 'Repeat'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingButton} onPress={onToggleTranslation}>
                    <Ionicons
                        name={showTranslation ? "language" : "language-outline"}
                        size={24}
                        color={showTranslation ? "#007AFF" : "#666"}
                    />
                    <Text style={[styles.settingText, showTranslation && styles.activeText]}>Trans</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingButton} onPress={onCycleDelay}>
                    <Ionicons name="timer-outline" size={24} color={delaySeconds > 0 ? "#007AFF" : "#666"} />
                    <Text style={[styles.settingText, delaySeconds > 0 && styles.activeText]}>
                        {delaySeconds}s Delay
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Row: Main Controls */}
            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={onPlayPause} style={styles.playButton} disabled={loading}>
                    {loading ? (
                        <Text style={styles.loadingText}>...</Text>
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause-circle" : "play-circle"}
                            size={80}
                            color={autoPlay ? "#5856D6" : "#007AFF"} // Purple for Auto, Blue for Manual
                        />
                    )}
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
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    settingButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    activeText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        // No extra styling needed for the icon itself
    },
    iconBadgeContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -8,
        backgroundColor: '#007AFF',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    }
});
