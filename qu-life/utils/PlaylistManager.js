import AsyncStorage from '@react-native-async-storage/async-storage';

export const PLAYLISTS_STORAGE_KEY = '@qulife_playlists';

export const DEFAULT_DATA = {
    penanda: [
        { id: 'b1', title: 'Al-Kahfi', start: 1, end: 10, surahCode: '18', number: 18 },
        { id: 'b2', title: 'Ali \'Imran', start: 190, end: 200, surahCode: '3', number: 3 },
        { id: 'b3', title: 'Al-Baqarah', start: 285, end: 286, surahCode: '2', number: 2 },
        { id: 'b4', title: 'Ayat Kursi', start: 255, end: 255, surahCode: '2', number: 2, customSubtitleKey: 'Al-Baqarah Ayat 255' },
    ],
    playlists: [
        {
            id: 'builtin_ruqyah',
            title: 'Ayat-Ayat Ruqyah',
            isBuiltIn: true,
            items: [
                { id: 'r1', title: 'Al-Fatihah', start: 1, end: 7, surahCode: '1', number: 1 },
                { id: 'r2', title: 'Al-Baqarah', start: 1, end: 5, surahCode: '2', number: 2 },
                { id: 'r3', title: 'Ayat Kursi', start: 255, end: 257, surahCode: '2', number: 2, customSubtitleKey: 'Al-Baqarah Ayat 255-257' },
                { id: 'r4', title: 'Al-Baqarah', start: 284, end: 286, surahCode: '2', number: 2 },
                { id: 'r5', title: 'Al-A\'raf', start: 117, end: 122, surahCode: '7', number: 7 },
                { id: 'r6', title: 'Yunus', start: 81, end: 82, surahCode: '10', number: 10 },
                { id: 'r7', title: 'Taha', start: 69, end: 69, surahCode: '20', number: 20 },
                { id: 'r8', title: 'Al-Mu\'minun', start: 115, end: 118, surahCode: '23', number: 23 },
                { id: 'r9', title: 'As-Saffat', start: 1, end: 10, surahCode: '37', number: 37 },
                { id: 'r10', title: 'Al-Ahqaf', start: 29, end: 32, surahCode: '46', number: 46 },
                { id: 'r11', title: 'Ar-Rahman', start: 33, end: 36, surahCode: '55', number: 55 },
                { id: 'r12', title: 'Al-Hashr', start: 21, end: 24, surahCode: '59', number: 59 },
                { id: 'r13', title: 'Al-Jinn', start: 1, end: 9, surahCode: '72', number: 72 },
                { id: 'r14', title: 'Al-Ikhlas', start: 1, end: 4, surahCode: '112', number: 112 },
                { id: 'r15', title: 'Al-Falaq', start: 1, end: 5, surahCode: '113', number: 113 },
                { id: 'r16', title: 'An-Nas', start: 1, end: 6, surahCode: '114', number: 114 },
            ]
        }
    ]
};

export const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

export const loadData = async () => {
    try {
        const stored = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (stored) {
            let parsed = JSON.parse(stored);
            let needsSave = false;

            // Migration from Array (Playlists only) to Object { penanda, playlists }
            if (Array.isArray(parsed)) {
                let migrated = { penanda: [], playlists: [] };
                const oldSpecial = parsed.find(p => p.id === 'builtin_special');
                if (oldSpecial) {
                    migrated.penanda = oldSpecial.items || [];
                } else {
                    migrated.penanda = [...DEFAULT_DATA.penanda];
                }
                migrated.playlists = parsed.filter(p => p.id !== 'builtin_special');
                parsed = migrated;
                needsSave = true;
            }

            // Ensure ruqyah exists
            const hasRuqyah = parsed.playlists.some(p => p.id === 'builtin_ruqyah');
            if (!hasRuqyah) {
                const ruqyah = DEFAULT_DATA.playlists.find(p => p.id === 'builtin_ruqyah');
                parsed.playlists.push(ruqyah);
                needsSave = true;
            }
            
            if (needsSave) {
                await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(parsed));
            }
            
            return parsed;
        }
    } catch (e) {
        console.error("Failed to load playlist data", e);
    }
    // First time ever:
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
};

export const saveData = async (data) => {
    try {
        await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save playlist data", e);
    }
};

export const updatePenandaDelayConfig = async (penandaId, delayConfig) => {
    const data = await loadData();
    const updated = data.penanda.map(p => p.id === penandaId ? { ...p, delayConfig } : p);
    await saveData({ ...data, penanda: updated });
};

export const updatePlaylistDelayConfig = async (playlistId, delayConfig) => {
    const data = await loadData();
    const updated = data.playlists.map(p => p.id === playlistId ? { ...p, delayConfig } : p);
    await saveData({ ...data, playlists: updated });
};
