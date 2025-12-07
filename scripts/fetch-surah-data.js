const fs = require('fs');

const SURAH_NUMBER = process.argv[2];

if (!SURAH_NUMBER) {
    console.log("Usage: node scripts/fetch-surah-data.js <surah_number>");
    process.exit(1);
}

async function fetchSurah(number) {
    console.log(`Fetching Surah ${number} from equran.id (ID) and alquran.cloud (EN)...`);
    try {
        // Parallel fetch for efficiency
        const [equranRes, quranCloudRes] = await Promise.all([
            fetch(`https://equran.id/api/v2/surat/${number}`),
            fetch(`https://api.alquran.cloud/v1/surah/${number}/en.jalalayn`)
        ]);

        const equranJson = await equranRes.json();
        const quranCloudJson = await quranCloudRes.json();

        if (equranJson.code !== 200) throw new Error(`Equran API Error: ${equranJson.message}`);
        if (quranCloudJson.code !== 200) throw new Error(`QuranCloud API Error: ${quranCloudJson.status}`);

        const data = equranJson.data;
        const enVerses = quranCloudJson.data.ayahs;

        // Format to match qu-life quran.json structure
        const surahKey = data.namaLatin.toLowerCase().replace(/[^a-z]/g, '');

        const formattedData = {
            [surahKey]: {
                nomor: String(data.nomor),
                kode: surahKey,
                nama: data.namaLatin,
                // arabic_name: data.nama, 
                jumlah_ayat: String(data.jumlahAyat),
                verses: data.ayat.map((ayat, index) => ({
                    number: ayat.nomorAyat,
                    arabic: ayat.teksArab,
                    translations: {
                        tr_id: ayat.teksIndonesia, // Kemenag translation
                        tr_id_my: "", // Muyassar source not found in public APIs yet
                        tr_en_jl: enVerses[index] ? enVerses[index].text : "" // Jalalayn English
                    },
                    translation: ayat.teksIndonesia,
                    audio: {
                        ar: `konten/${surahKey}/aud_ar/${surahKey}_${ayat.nomorAyat}.mp3`
                    }
                }))
            }
        };

        console.log("---------------------------------------------------");
        console.log(`SUCCESS! Fetched Kemenag (ID) and Jalalayn (EN) for ${data.namaLatin}.`);
        console.log("---------------------------------------------------");

        const outputFile = `surah_${number}_data.json`;
        fs.writeFileSync(outputFile, JSON.stringify(formattedData, null, 2));
        console.log(`(Saved to ${outputFile})`);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchSurah(SURAH_NUMBER);
