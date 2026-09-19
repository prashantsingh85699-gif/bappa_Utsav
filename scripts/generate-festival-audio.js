import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavHeader(numSamples, numChannels = 1, sampleRate = SAMPLE_RATE) {
  const buffer = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = numSamples * blockAlign;

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16)
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function writeWavFile(filepath, samples) {
  const numSamples = samples.length;
  const header = createWavHeader(numSamples, 1, SAMPLE_RATE);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    data.writeInt16LE(Math.floor(intSample), i * 2);
  }

  const finalBuffer = Buffer.concat([header, data]);
  fs.writeFileSync(filepath, finalBuffer);
  console.log(`[GENERATED] ${path.basename(filepath)} (${(finalBuffer.length / 1024).toFixed(1)} KB)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SOUND EFFECTS GENERATORS (Acoustic & Modal Physical Modeling)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authentic Resonant Brass Temple Bell (Ghanta)
 * Harmonic partials of cast brass bell with natural beating & long acoustic decay
 */
function generateTempleBell() {
  const duration = 4.0;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  // Traditional Indian bell partials (fundamental ~520 Hz with prime harmonics)
  const partials = [
    { freq: 520, amp: 0.8, decay: 3.5 },
    { freq: 524, amp: 0.7, decay: 3.2 }, // Beating pair
    { freq: 1040, amp: 0.5, decay: 2.5 },
    { freq: 1560, amp: 0.35, decay: 2.0 },
    { freq: 2080, amp: 0.25, decay: 1.5 },
    { freq: 3120, amp: 0.15, decay: 1.0 },
    { freq: 4160, amp: 0.08, decay: 0.6 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Initial clapper strike transient (filtered noise burst)
    if (t < 0.015) {
      const strikeEnv = 1 - t / 0.015;
      s += (Math.random() * 2 - 1) * strikeEnv * 0.4;
    }

    // Resonant modes
    for (const p of partials) {
      const env = Math.exp(-t / (p.decay * 0.5));
      s += Math.sin(2 * Math.PI * p.freq * t) * p.amp * env;
    }

    samples[i] = s * 0.45;
  }
  return samples;
}

/**
 * Puja Hand Bell (Ghanti)
 * Bright, shimmering high-frequency brass bell with quick melodious ring
 */
function generatePujaGhanti() {
  const duration = 1.8;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  const partials = [
    { freq: 1480, amp: 0.9, decay: 1.5 },
    { freq: 1486, amp: 0.75, decay: 1.4 },
    { freq: 2960, amp: 0.4, decay: 1.0 },
    { freq: 4440, amp: 0.25, decay: 0.7 },
    { freq: 5920, amp: 0.15, decay: 0.4 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    if (t < 0.008) {
      s += (Math.random() * 2 - 1) * (1 - t / 0.008) * 0.3;
    }

    for (const p of partials) {
      const env = Math.exp(-t / (p.decay * 0.35));
      s += Math.sin(2 * Math.PI * p.freq * t) * p.amp * env;
    }

    samples[i] = s * 0.4;
  }
  return samples;
}

/**
 * Sacred Conch Shell (Shankha)
 * Rich resonant lip-reed acoustic horn blast with breathing vibrato
 */
function generateShankha() {
  const duration = 2.5;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  const baseFreq = 233.08; // Bb3 sacred pitch

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Breath attack and swell envelope
    let env = 0;
    if (t < 0.3) {
      env = (t / 0.3) * (t / 0.3); // Smooth attack
    } else if (t < 1.8) {
      env = 1.0;
    } else {
      env = Math.max(0, 1 - (t - 1.8) / 0.7); // Release
    }

    // Slight air vibrato & breath pressure fluctuation
    const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 4.8 * t);
    const f = baseFreq * vibrato;

    // Rich horn harmonics (odd + even)
    let s = 0;
    s += Math.sin(2 * Math.PI * f * t) * 0.7;
    s += Math.sin(2 * Math.PI * f * 2 * t) * 0.5;
    s += Math.sin(2 * Math.PI * f * 3 * t) * 0.35;
    s += Math.sin(2 * Math.PI * f * 4 * t) * 0.2;
    s += Math.sin(2 * Math.PI * f * 5 * t) * 0.12;
    s += Math.sin(2 * Math.PI * f * 6 * t) * 0.08;

    // Soft breath air noise
    const breathNoise = (Math.random() * 2 - 1) * 0.04;
    s += breathNoise;

    samples[i] = s * env * 0.45;
  }
  return samples;
}

/**
 * Acoustic Dhol Strike (Dhum)
 * Deep resonant bass membrane with punchy pitch envelope drop
 */
function generateDholHit() {
  const duration = 0.8;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Pitch drop from 180Hz down to 65Hz
    const pitch = 65 + 115 * Math.exp(-t * 35);
    const env = Math.exp(-t * 6.5);

    // Drum membrane + sub body
    let s = Math.sin(2 * Math.PI * pitch * t);
    // Sub octave warmth
    s += 0.5 * Math.sin(2 * Math.PI * (pitch * 0.5) * t);

    // Initial stick impact slap
    if (t < 0.012) {
      s += (Math.random() * 2 - 1) * (1 - t / 0.012) * 0.8;
    }

    samples[i] = s * env * 0.7;
  }
  return samples;
}

/**
 * Tasha Flam / Rim Strike
 * Crisp high-frequency festive rimshot crack
 */
function generateTashaFlam() {
  const duration = 0.4;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 22);

    // Metallic membrane pitch
    const pitch = 380 + 200 * Math.exp(-t * 50);
    let s = Math.sin(2 * Math.PI * pitch * t);
    s += 0.6 * Math.sin(2 * Math.PI * pitch * 2.3 * t);

    // Sharp stick crack
    if (t < 0.01) {
      s += (Math.random() * 2 - 1) * (1 - t / 0.01) * 1.5;
    }

    samples[i] = s * env * 0.6;
  }
  return samples;
}

/**
 * Correct Answer Swara
 * Sweet ascending auspicious harp/flute double-chime (Sa -> Pa)
 */
function generateCorrectChime() {
  const duration = 0.9;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  const notes = [
    { time: 0.0, freq: 523.25, dur: 0.5 }, // C5
    { time: 0.12, freq: 783.99, dur: 0.7 }, // G5 (Pa)
    { time: 0.24, freq: 1046.5, dur: 0.6 }, // C6 (Taar Sa)
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const note of notes) {
      if (t >= note.time) {
        const localT = t - note.time;
        const env = Math.exp(-localT * 5.0);
        s += Math.sin(2 * Math.PI * note.freq * localT) * env * 0.5;
        s += Math.sin(2 * Math.PI * note.freq * 2 * localT) * env * 0.2;
      }
    }

    samples[i] = s * 0.5;
  }
  return samples;
}

/**
 * Wrong Answer / Soft Thud
 * Low wooden gentle tap (not harsh)
 */
function generateWrongThud() {
  const duration = 0.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 14);
    const pitch = 130 * Math.exp(-t * 15);
    const s = Math.sin(2 * Math.PI * pitch * t) * env;
    samples[i] = s * 0.5;
  }
  return samples;
}

/**
 * Modak Catch Sparkle
 * Melodious glass pickup ding with sparkle
 */
function generateModakCatch() {
  const duration = 0.6;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 8.0);
    // Double bell ping (F6 + A6)
    let s = Math.sin(2 * Math.PI * 1396.91 * t) * 0.6;
    s += Math.sin(2 * Math.PI * 1760.0 * t) * 0.4;
    samples[i] = s * env * 0.45;
  }
  return samples;
}

/**
 * Combo Streak Ascension
 * Harmonic rising chime
 */
function generateComboRise() {
  const duration = 0.7;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4.5);
    // Sweeping harmonic
    const freq = 600 + 800 * (t / duration);
    let s = Math.sin(2 * Math.PI * freq * t) * 0.6;
    s += Math.sin(2 * Math.PI * freq * 2 * t) * 0.25;
    samples[i] = s * env * 0.4;
  }
  return samples;
}

/**
 * Triumphant Celebration Fanfare
 * Grand multi-toned temple brass & chime celebration
 */
function generateVictoryFanfare() {
  const duration = 2.2;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  const notes = [
    { t: 0.0, f: 392.0 },  // G4
    { t: 0.18, f: 523.25 }, // C5
    { t: 0.36, f: 659.25 }, // E5
    { t: 0.54, f: 783.99 }, // G5 (sustained)
    { t: 0.72, f: 1046.5 }, // C6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const n of notes) {
      if (t >= n.t) {
        const lt = t - n.t;
        const env = Math.exp(-lt * 2.8);
        s += Math.sin(2 * Math.PI * n.f * lt) * env * 0.4;
        s += Math.sin(2 * Math.PI * n.f * 2 * lt) * env * 0.2;
        s += Math.sin(2 * Math.PI * n.f * 3 * lt) * env * 0.1;
      }
    }

    samples[i] = s * 0.45;
  }
  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ENERGETIC NASHIK DHOL-TASHA FESTIVAL RHYTHM TRACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates an 8-bar seamless looping Dhol-Tasha festive rhythm track (128 BPM)
 * Complete with acoustic Dhol bass strikes, snapping Tasha flams, and Ghungroo pulse!
 */
function generateDholTashaRhythmTrack() {
  const bpm = 126;
  const beatSec = 60 / bpm;
  const numBars = 4; // 16 beats loop
  const totalSec = numBars * 4 * beatSec;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Synthesizing Dhol-Tasha loop: ${numBars} bars @ ${bpm} BPM (${totalSec.toFixed(2)}s)...`);

  // Rhythmic pattern definitions (16th notes grid)
  // D = Bass Dhol, T = Tasha Flam, k = Tasha Tap, g = Ghungroo Bell
  const sixteenthSec = beatSec / 4;
  const totalSixteenths = numBars * 16;

  for (let step = 0; step < totalSixteenths; step++) {
    const stepTime = step * sixteenthSec;
    const stepInBar = step % 16;

    // Authentic Nashik Dhol pattern:
    // Beat 1: Heavy Dhol (0), Beat 2: syncopated Dhol (6, 8), Beat 3: Heavy Dhol (10), Beat 4: Rolls
    const isDhol = (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10 || stepInBar === 14);
    // Tasha Flams & Rolls
    const isTasha = (stepInBar === 2 || stepInBar === 4 || stepInBar === 7 || stepInBar === 11 || stepInBar === 12 || stepInBar === 13 || stepInBar === 15);
    // Ghungroo pulse on every 8th note
    const isGhungroo = (step % 2 === 0);

    const startIndex = Math.floor(stepTime * SAMPLE_RATE);

    // Layer Dhol
    if (isDhol) {
      const dholLen = Math.floor(0.45 * SAMPLE_RATE);
      for (let j = 0; j < dholLen && (startIndex + j) < numSamples; j++) {
        const lt = j / SAMPLE_RATE;
        const pitch = 68 + 110 * Math.exp(-lt * 40);
        const env = Math.exp(-lt * 7.5);
        let s = Math.sin(2 * Math.PI * pitch * lt) * 0.55;
        s += Math.sin(2 * Math.PI * pitch * 0.5 * lt) * 0.35;
        if (lt < 0.01) s += (Math.random() * 2 - 1) * 0.4;
        samples[startIndex + j] += s * env * 0.65;
      }
    }

    // Layer Tasha
    if (isTasha) {
      const tashaLen = Math.floor(0.22 * SAMPLE_RATE);
      for (let j = 0; j < tashaLen && (startIndex + j) < numSamples; j++) {
        const lt = j / SAMPLE_RATE;
        const pitch = 420 + 260 * Math.exp(-lt * 55);
        const env = Math.exp(-lt * 25);
        let s = Math.sin(2 * Math.PI * pitch * lt) * 0.4;
        if (lt < 0.008) s += (Math.random() * 2 - 1) * 0.9;
        samples[startIndex + j] += s * env * 0.4;
      }
    }

    // Layer Ghungroo
    if (isGhungroo) {
      const ghungLen = Math.floor(0.12 * SAMPLE_RATE);
      for (let j = 0; j < ghungLen && (startIndex + j) < numSamples; j++) {
        const lt = j / SAMPLE_RATE;
        const env = Math.exp(-lt * 35);
        const s = (Math.sin(2 * Math.PI * 3400 * lt) + Math.sin(2 * Math.PI * 4800 * lt)) * 0.15;
        samples[startIndex + j] += s * env * 0.2;
      }
    }
  }

  // Soft master limiter to prevent digital clipping
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.85;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE GENERATION
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const sfxDir = path.resolve('public/audio/sfx');
  const musicDir = path.resolve('public/audio/music');

  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });

  console.log('\n--- Generating Studio-Quality Sound Effects ---');
  writeWavFile(path.join(sfxDir, 'temple_bell.wav'), generateTempleBell());
  writeWavFile(path.join(sfxDir, 'ghanti.wav'), generatePujaGhanti());
  writeWavFile(path.join(sfxDir, 'shankha.wav'), generateShankha());
  writeWavFile(path.join(sfxDir, 'dhol_hit.wav'), generateDholHit());
  writeWavFile(path.join(sfxDir, 'tasha_flam.wav'), generateTashaFlam());
  writeWavFile(path.join(sfxDir, 'correct.wav'), generateCorrectChime());
  writeWavFile(path.join(sfxDir, 'wrong.wav'), generateWrongThud());
  writeWavFile(path.join(sfxDir, 'modak_catch.wav'), generateModakCatch());
  writeWavFile(path.join(sfxDir, 'combo.wav'), generateComboRise());
  writeWavFile(path.join(sfxDir, 'fanfare.wav'), generateVictoryFanfare());

  console.log('\n--- Generating Dhol-Tasha Rhythm Music Track ---');
  writeWavFile(path.join(musicDir, 'dhol_tasha_rhythm.wav'), generateDholTashaRhythmTrack());

  console.log('\n[ALL ASSETS GENERATED SUCCESSFULLY]');
}

main();
