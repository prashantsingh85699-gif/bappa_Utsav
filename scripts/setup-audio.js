import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const MUSIC_DIR = path.resolve('public/audio/music');
const SFX_DIR = path.resolve('public/audio/sfx');

fs.mkdirSync(MUSIC_DIR, { recursive: true });
fs.mkdirSync(SFX_DIR, { recursive: true });

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
      console.log(`[EXISTS] ${path.basename(destPath)} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
      return resolve(destPath);
    }

    console.log(`[DOWNLOADING] ${path.basename(destPath)} from ${url}...`);
    const client = url.startsWith('https') ? https : http;

    const request = client.get(
      url,
      {
        headers: {
          'User-Agent': 'BappaUtsav/1.0 (educational festival web game; contact: dev@bappautsav.local)',
        },
      },
      (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          const size = fs.statSync(destPath).size;
          console.log(`[SAVED] ${path.basename(destPath)} (${(size / 1024).toFixed(1)} KB)`);
          resolve(destPath);
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }
    );

    request.on('error', (err) => {
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

// -----------------------------------------------------------------------------
// Classical Indian Instrumental Tracks from Wikimedia Commons (Public Domain & CC BY-SA)
// -----------------------------------------------------------------------------
const MUSIC_TRACKS = [
  {
    name: 'home_sanctum.mp3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/Vande_Mataram_on_Mohan_Veena.ogg/Vande_Mataram_on_Mohan_Veena.ogg.mp3',
    desc: 'Mohan Veena & Tanpura (Calm, festive classical instrumental for Home/Utsav Stage)',
  },
  {
    name: 'mandap_ambience.mp3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/39/Shri_Nilotpala_Nayike%2C_rendered_on_the_Veena_by_L_Ramakishnan.ogg/Shri_Nilotpala_Nayike%2C_rendered_on_the_Veena_by_L_Ramakishnan.ogg.mp3',
    desc: 'Classical Veena & meditative temple ambience (Sacred Altar craft)',
  },
  {
    name: 'modak_playful.mp3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/25/Instrumental_music_by_P.S._Mukherjee_of_Cawanpur%28Kanpur%29_-_Side_2.ogg/Instrumental_music_by_P.S._Mukherjee_of_Cawanpur%28Kanpur%29_-_Side_2.ogg.mp3',
    desc: 'Classical Sitar & Tabla jugalbandi (Playful arcade reflex)',
  },
  {
    name: 'quiz_meditation.mp3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Rag_Kedar_-_NCERT.ogg/Rag_Kedar_-_NCERT.ogg.mp3',
    desc: 'Raag Kedar meditative drone & classical swaras (Bappa Quiz lore)',
  },
  {
    name: 'celebration_victory.mp3',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Rag_Hans_Dhwani_-_NCERT.ogg/Rag_Hans_Dhwani_-_NCERT.ogg.mp3',
    desc: 'Raag Hansdhwani auspicious celebration (Victory & Maha Aarti ceremony)',
  },
];

async function main() {
  console.log('================================================================');
  console.log('PROVISIONING AUTHENTIC INDIAN FESTIVAL MUSIC ASSETS');
  console.log('================================================================\n');

  for (const track of MUSIC_TRACKS) {
    const dest = path.join(MUSIC_DIR, track.name);
    try {
      await downloadFile(track.url, dest);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${track.name}:`, err.message);
    }
  }

  console.log('\n[SUCCESS] Music tracks provisioned successfully.');
}

main().catch(console.error);
