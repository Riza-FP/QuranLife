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
    return quranData[code];
};
