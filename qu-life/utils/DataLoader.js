import quranData from '../data/quran.json';

export const getSurahList = () => {
    return Object.values(quranData).map(surah => ({
        nomor: surah.nomor,
        kode: surah.kode,
        nama: surah.nama,
        jumlah_ayat: surah.jumlah_ayat
    })).sort((a, b) => parseInt(a.nomor) - parseInt(b.nomor));
};

export const getSurahByCode = (code) => {
    return quranData[code] || Object.values(quranData).find(s => s.nomor === String(code));
};

export const getRandomVerse = () => {
    const surahs = Object.values(quranData);
    if (surahs.length === 0) return null;
    
    // Pick random Surah
    const randomSurahIndex = Math.floor(Math.random() * surahs.length);
    const surah = surahs[randomSurahIndex];
    
    // Pick random Verse from this Surah
    const totalVerses = surah.verses ? surah.verses.length : parseInt(surah.jumlah_ayat);
    const randomVerseNumber = Math.floor(Math.random() * totalVerses) + 1;
    
    return {
        surahCode: surah.kode,
        verseNumber: randomVerseNumber
    };
};
