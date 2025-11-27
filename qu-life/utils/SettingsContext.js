import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(32);
    const [showTranslation, setShowTranslation] = useState(false);
    const [translationCode, setTranslationCode] = useState('tr_id');

    return (
        <SettingsContext.Provider value={{ fontSize, setFontSize, showTranslation, setShowTranslation, translationCode, setTranslationCode }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
