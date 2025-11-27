const fs = require('fs');
const path = require('path');
const https = require('https');

const KONTEN_DIR = path.join(__dirname, '../qu-life/konten');
const SURAH_LIST = [
    { number: 78, code: 'naba' },
    { number: 79, code: 'naziat' }
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

async function downloadSurahAudio(surah) {
    console.log(`Downloading audio for ${surah.code}...`);
    const surahDir = path.join(KONTEN_DIR, surah.code);
    const audioDir = path.join(surahDir, 'aud_ar');

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }

    try {
        // Fetch metadata to get audio URLs
        const apiUrl = `https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`;

        const data = await new Promise((resolve, reject) => {
            https.get(apiUrl, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve(JSON.parse(body)));
                res.on('error', reject);
            });
        });

        if (data.code !== 200) {
            throw new Error(`API Error: ${data.status}`);
        }

        const ayahs = data.data.ayahs;

        for (let i = 0; i < ayahs.length; i++) {
            const ayah = ayahs[i];
            const verseNum = i + 1; // 1-based index
            const fileName = `${surah.code}_${verseNum}.mp3`;
            const filePath = path.join(audioDir, fileName);

            if (fs.existsSync(filePath)) {
                console.log(`  Skipping ${fileName} (already exists)`);
                continue;
            }

            console.log(`  Downloading ${fileName}...`);
            await downloadFile(ayah.audio, filePath);
        }
        console.log(`Completed ${surah.code}`);

    } catch (error) {
        console.error(`Error processing ${surah.code}:`, error.message);
    }
}

async function main() {
    for (const surah of SURAH_LIST) {
        await downloadSurahAudio(surah);
    }
}

main();
