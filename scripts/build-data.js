const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const KONTEN_DIR = path.join(ROOT_DIR, 'qu-life', 'konten');
const OUTPUT_DIR = path.join(ROOT_DIR, 'qu-life', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'quran.json');
const SURAH_LIST_FILE = path.join(ROOT_DIR, 'qu-life', 'surah_list.csv');
const TRANSLATION_LIST_FILE = path.join(ROOT_DIR, 'qu-life', 'terjemahan_list.csv');

// Helper to parse CSV simple
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].trim().split(',');

    return lines.slice(1).map(line => {
        const values = line.trim().split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return entry;
    });
}

// Helper to read text file content
function readTextFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8').trim();
        }
    } catch (e) {
        console.warn(`Warning: Could not read file ${filePath}`);
    }
    return '';
}

function buildData() {
    console.log('Starting data build...');

    // 1. Read Surah List
    if (!fs.existsSync(SURAH_LIST_FILE)) {
        console.error('Error: surah_list.csv not found!');
        process.exit(1);
    }

    const surahListRaw = fs.readFileSync(SURAH_LIST_FILE, 'utf8');
    const surahList = parseCSV(surahListRaw);

    console.log(`Found ${surahList.length} surahs.`);

    // 2. Read Translation List
    let translations = [];
    if (fs.existsSync(TRANSLATION_LIST_FILE)) {
        const trListRaw = fs.readFileSync(TRANSLATION_LIST_FILE, 'utf8');
        translations = parseCSV(trListRaw);
        console.log(`Found ${translations.length} translations: ${translations.map(t => t.kode).join(', ')}`);
    } else {
        console.warn('Warning: terjemahan_list.csv not found. Defaulting to tr_id.');
        translations = [{ kode: 'tr_id', nama: 'Kemenag', bahasa: 'Indonesia' }];
    }

    const fullData = {};

    // 3. Process each Surah
    surahList.forEach(surah => {
        const code = surah.kode;
        const verseCount = parseInt(surah.jumlah_ayat, 10);

        console.log(`Processing ${surah.nama} (${code})...`);

        fullData[code] = {
            ...surah,
            verses: []
        };

        const surahDir = path.join(KONTEN_DIR, code);

        // Iterate through verses
        for (let i = 1; i <= verseCount; i++) {
            const verseData = {
                number: i,
                arabic: '',
                translations: {}
            };

            // Read Arabic
            const arabicPath = path.join(surahDir, 'arabic', `${code}_${i}.txt`);
            verseData.arabic = readTextFile(arabicPath);

            // Read Translations
            translations.forEach(tr => {
                const trPath = path.join(surahDir, tr.kode, `${code}_${i}.txt`);
                const trText = readTextFile(trPath);
                if (trText) {
                    verseData.translations[tr.kode] = trText;
                }
            });

            // Fallback for backward compatibility (optional, but good for safety)
            verseData.translation = verseData.translations['tr_id'] || '';

            // Read Audio (Arabic)
            const audioPath = path.join(surahDir, 'aud_ar', `${code}_${i}.mp3`);
            if (fs.existsSync(audioPath)) {
                verseData.audio = {
                    ar: `konten/${code}/aud_ar/${code}_${i}.mp3`
                };
            }

            fullData[code].verses.push(verseData);
        }
    });

    // 4. Write Output
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fullData, null, 2));
    console.log(`Data written to ${OUTPUT_FILE}`);
}

buildData();
