import quranData from '../data/quran.json';

export const getVersesForSurah = (surahCode) => {
    const surah = quranData[surahCode];
    if (!surah || !surah.verses) return [];

    return surah.verses;
};
