import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LastPositionContext = createContext();

const STORAGE_KEY = 'LAST_POSITION';

export const LastPositionProvider = ({ children }) => {
    const [lastPosition, setLastPosition] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadLastPosition();
    }, []);

    const loadLastPosition = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue != null) {
                setLastPosition(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.error("Failed to load last position", e);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveLastPosition = async (surahId, verseIndex, surahName) => {
        try {
            const position = { surahId, verseIndex, surahName, timestamp: Date.now() };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(position));
            setLastPosition(position);
        } catch (e) {
            console.error("Failed to save last position", e);
        }
    };

    return (
        <LastPositionContext.Provider value={{ lastPosition, saveLastPosition, isLoaded }}>
            {children}
        </LastPositionContext.Provider>
    );
};

export const useLastPosition = () => useContext(LastPositionContext);
