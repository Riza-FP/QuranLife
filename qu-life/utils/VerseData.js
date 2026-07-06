import quranData from '../data/quran.json';

// Precompute cumulative verse counts before each Surah (1-indexed Surah numbers 1 to 114)
const cumulativeVersesBeforeSurah = [0, 0];
const sortedSurahs = Object.values(quranData).sort((a, b) => parseInt(a.nomor) - parseInt(b.nomor));
let runningTotal = 0;
for (let i = 0; i < sortedSurahs.length; i++) {
    runningTotal += parseInt(sortedSurahs[i].jumlah_ayat || (sortedSurahs[i].verses ? sortedSurahs[i].verses.length : 0));
    cumulativeVersesBeforeSurah[parseInt(sortedSurahs[i].nomor) + 1] = runningTotal;
}

export const getGlobalAyahNumber = (surahNomor, verseNumber) => {
    const before = cumulativeVersesBeforeSurah[parseInt(surahNomor)] || 0;
    return before + parseInt(verseNumber);
};

export const getVersesForSurah = (surahCode) => {
    const surah = quranData[surahCode];
    if (!surah || !surah.verses) return [];

    return surah.verses;
};
