import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(32);
    const [showTranslation, setShowTranslation] = useState(false);
    const [translationCode, setTranslationCode] = useState('tr_id');
    const [voiceIdentifier, setVoiceIdentifier] = useState(null);
    const [defaultDelay, setDefaultDelay] = useState(0);
    const [defaultRepeat, setDefaultRepeat] = useState(1);

    // Advanced Global Auto-Play Settings
    const [theme, setTheme] = useState('light'); // 'light' | 'dark'
    const [appLanguage, setAppLanguage] = useState(null); // start as null to detect first launch
    const [autoPlayOrder, setAutoPlayOrder] = useState('translation_first'); // 'translation_first' | 'arabic_first'
    const [autoPlayEnabledTranslation, setAutoPlayEnabledTranslation] = useState(true);
    const [translationLanguage, setTranslationLanguage] = useState('id'); // 'id' | 'en'

    const [delayPreArabic, setDelayPreArabic] = useState(0);
    const [delayPostArabic, setDelayPostArabic] = useState(0);
    const [delayPreTranslation, setDelayPreTranslation] = useState(0);
    const [delayPostTranslation, setDelayPostTranslation] = useState(0);
    const [delaySequenceLoop, setDelaySequenceLoop] = useState(0);

    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Fixed Defaults (Non-editable for now, but part of global logic)
    const defaultStartVerse = 'current';
    const defaultEndVerse = 'last';

    // Load persisted settings on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                const savedAppLang = await AsyncStorage.getItem('@app_language');
                if (savedAppLang) {
                    setAppLanguage(savedAppLang);
                }
                
                const savedVoice = await AsyncStorage.getItem('@voice_id');
                if (savedVoice) {
                    setVoiceIdentifier(savedVoice);
                }

                const savedTheme = await AsyncStorage.getItem('@theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            } catch (e) {
                console.error("Failed to load settings from storage", e);
            } finally {
                setSettingsLoaded(true);
            }
        }
        loadSettings();
    }, []);

    // Save appLanguage when it changes
    useEffect(() => {
        if (settingsLoaded && appLanguage) {
            AsyncStorage.setItem('@app_language', appLanguage).catch(e => 
                console.error("Failed to save language", e)
            );
        }
    }, [appLanguage, settingsLoaded]);

    // Save theme when it changes
    useEffect(() => {
        if (settingsLoaded && theme) {
            AsyncStorage.setItem('@theme', theme).catch(e => 
                console.error("Failed to save theme", e)
            );
        }
    }, [theme, settingsLoaded]);

    // Save voiceIdentifier when it changes
    useEffect(() => {
        if (settingsLoaded) {
            if (voiceIdentifier) {
                AsyncStorage.setItem('@voice_id', voiceIdentifier).catch(e => console.error(e));
            } else {
                AsyncStorage.removeItem('@voice_id').catch(e => console.error(e));
            }
        }
    }, [voiceIdentifier, settingsLoaded]);

    return (
        <SettingsContext.Provider value={{
            fontSize, setFontSize,
            showTranslation, setShowTranslation,
            translationCode, setTranslationCode,
            voiceIdentifier, setVoiceIdentifier,
            defaultDelay, setDefaultDelay,
            defaultRepeat, setDefaultRepeat,
            theme, setTheme,
            appLanguage, setAppLanguage,
            autoPlayOrder, setAutoPlayOrder,
            autoPlayEnabledTranslation, setAutoPlayEnabledTranslation,
            translationLanguage, setTranslationLanguage,
            delayPreArabic, setDelayPreArabic,
            delayPostArabic, setDelayPostArabic,
            delayPreTranslation, setDelayPreTranslation,
            delayPostTranslation, setDelayPostTranslation,
            delaySequenceLoop, setDelaySequenceLoop,
            defaultStartVerse, defaultEndVerse,
            settingsLoaded // exported so the navigator knows when to render
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
