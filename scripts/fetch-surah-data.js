const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const QURAN_JSON_PATH = path.join(__dirname, '../qu-life/data/quran.json');

if (args.length === 0) {
    console.log("Usage:");
    console.log("  Single Surah: node scripts/fetch-surah-data.js <surah_number>");
    console.log("  Range:        node scripts/fetch-surah-data.js <start_surah> <end_surah>");
    process.exit(1);
}

const startSurah = parseInt(args[0]);
const endSurah = args[1] ? parseInt(args[1]) : startSurah;

if (isNaN(startSurah) || (args[1] && isNaN(endSurah))) {
    console.error("Error: Please provide valid Surah numbers.");
    process.exit(1);
}

async function fetchSurah(number) {
    console.log(`Fetching Surah ${number}...`);
    try {
        // Parallel fetch for efficiency
        const [equranRes, quranCloudRes] = await Promise.all([
            fetch(`https://equran.id/api/v2/surat/${number}`),
            fetch(`https://api.alquran.cloud/v1/surah/${number}/en.sahih`)
        ]);

        const equranJson = await equranRes.json();
        const quranCloudJson = await quranCloudRes.json();

        if (equranJson.code !== 200) throw new Error(`Equran API Error: ${equranJson.message}`);
        if (quranCloudJson.code !== 200) throw new Error(`QuranCloud API Error: ${quranCloudJson.status}`);

        const data = equranJson.data;
        const enVerses = quranCloudJson.data.ayahs;

        // Format to match qu-life quran.json structure
        const surahKey = data.namaLatin.toLowerCase().replace(/[^a-z]/g, '');

        return {
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
                        tr_id: ayat.teksIndonesia,
                        tr_en: enVerses[index] ? enVerses[index].text : ""
                    },
                    translation: ayat.teksIndonesia,
                    audio: {
                        ar: `konten/${surahKey}/aud_ar/${surahKey}_${ayat.nomorAyat}.mp3`
                    }
                }))
            }
        };

    } catch (error) {
        console.error(`Error fetching Surah ${number}:`, error.message);
        return null;
    }
}

async function run() {
    let existingData = {};
    if (fs.existsSync(QURAN_JSON_PATH)) {
        try {
            existingData = JSON.parse(fs.readFileSync(QURAN_JSON_PATH, 'utf8'));
        } catch (e) {
            console.warn("Warning: Could not parse existing quran.json, starting fresh.");
        }
    }

    let updates = {};
    console.log(`Starting fetch for Surah ${startSurah} to ${endSurah}...`);

    for (let i = startSurah; i <= endSurah; i++) {
        const surahData = await fetchSurah(i);
        if (surahData) {
            Object.assign(updates, surahData);
            // Small delay if fetching multiple to be polite to API
            if (startSurah !== endSurah) await new Promise(r => setTimeout(r, 300));
        }
    }

    // Merge updates into existing data
    const finalData = { ...existingData, ...updates };

    // Sort keys by Surah number for valid order in JSON
    const sortedData = {};
    Object.keys(finalData)
        .sort((a, b) => parseInt(finalData[a].nomor) - parseInt(finalData[b].nomor))
        .forEach(key => {
            sortedData[key] = finalData[key];
        });

    fs.writeFileSync(QURAN_JSON_PATH, JSON.stringify(sortedData, null, 2));

    console.log("---------------------------------------------------");
    console.log(`SUCCESS! Data saved to data/quran.json`);
    console.log("---------------------------------------------------");
}

run();
