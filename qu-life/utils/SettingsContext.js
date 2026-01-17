import React, { createContext, useState, useContext } from 'react';

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
    const [autoPlayOrder, setAutoPlayOrder] = useState('translation_first'); // 'translation_first' | 'arabic_first'
    const [autoPlayEnabledTranslation, setAutoPlayEnabledTranslation] = useState(true);
    const [translationLanguage, setTranslationLanguage] = useState('id'); // 'id' | 'en'

    const [delayPreArabic, setDelayPreArabic] = useState(0);
    const [delayPostArabic, setDelayPostArabic] = useState(0);
    const [delayPreTranslation, setDelayPreTranslation] = useState(0);
    const [delayPostTranslation, setDelayPostTranslation] = useState(0);
    const [delaySequenceLoop, setDelaySequenceLoop] = useState(0);

    // Fixed Defaults (Non-editable for now, but part of global logic)
    const defaultStartVerse = 'current';
    const defaultEndVerse = 'last';

    return (
        <SettingsContext.Provider value={{
            fontSize, setFontSize,
            showTranslation, setShowTranslation,
            translationCode, setTranslationCode,
            voiceIdentifier, setVoiceIdentifier,
            defaultDelay, setDefaultDelay,
            defaultRepeat, setDefaultRepeat,
            theme, setTheme,
            autoPlayOrder, setAutoPlayOrder,
            autoPlayEnabledTranslation, setAutoPlayEnabledTranslation,
            translationLanguage, setTranslationLanguage,
            delayPreArabic, setDelayPreArabic,
            delayPostArabic, setDelayPostArabic,
            delayPreTranslation, setDelayPreTranslation,
            delayPostTranslation, setDelayPostTranslation,
            delaySequenceLoop, setDelaySequenceLoop,
            defaultStartVerse, defaultEndVerse
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
