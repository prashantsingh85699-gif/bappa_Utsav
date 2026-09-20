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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function writeWavFile(filepath, samples) {
  const numSamples = samples.length;
  const header = createWavHeader(numSamples, 1, SAMPLE_RATE);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    data.writeInt16LE(Math.floor(intSample), i * 2);
  }

  const finalBuffer = Buffer.concat([header, data]);
  fs.writeFileSync(filepath, finalBuffer);
  console.log(`[GENERATED] ${path.basename(filepath)} (${(finalBuffer.length / 1024).toFixed(1)} KB)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIC INDIAN DEVOTIONAL ACOUSTIC INSTRUMENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Traditional Indian Bhajan Harmonium Reed Model */
function renderHarmoniumNote(samples, startSample, freq, duration, amp = 0.35) {
  const len = Math.min(samples.length - startSample, Math.floor(duration * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    // Bellows envelope: gentle attack, rich sustained reed, gentle release
    let env = 1.0;
    if (t < 0.06) env = t / 0.06;
    else if (t > duration - 0.08) env = Math.max(0, (duration - t) / 0.08);

    // Warm dual reed (tuned slightly apart for rich natural chorus beating)
    const f1 = freq;
    const f2 = freq * 1.0025; // chorus detune

    let s = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) * 0.4;
    s += (Math.sin(2 * Math.PI * f1 * 2 * t) + Math.sin(2 * Math.PI * f2 * 2 * t)) * 0.25;
    s += (Math.sin(2 * Math.PI * f1 * 3 * t) + Math.sin(2 * Math.PI * f2 * 3 * t)) * 0.15;
    s += (Math.sin(2 * Math.PI * f1 * 4 * t)) * 0.08;
    s += (Math.sin(2 * Math.PI * f1 * 5 * t)) * 0.04;

    samples[startSample + i] += s * env * amp;
  }
}

/** Sitar with resonant jawari shimmer */
function renderSitar(samples, startSample, freq, duration, amp = 0.42) {
  const len = Math.min(samples.length - startSample, Math.floor(duration * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 3.2);
    let s = Math.sin(2 * Math.PI * freq * t) * 0.55;
    s += Math.sin(2 * Math.PI * freq * 2 * t) * 0.30;
    s += Math.sin(2 * Math.PI * freq * 3 * t) * 0.18;
    s += Math.sin(2 * Math.PI * freq * 4 * t) * 0.12;
    // Jawari bridge buzzing overtones
    s *= (1 + 0.18 * Math.sin(2 * Math.PI * freq * 0.5 * t));
    if (t < 0.008) s += (Math.random() * 2 - 1) * (1 - t / 0.008) * 0.3;
    samples[startSample + i] += s * env * amp;
  }
}

/** Sweet Bamboo Flute (Bansuri) with tender vibrato */
function renderBansuri(samples, startSample, freq, duration, amp = 0.38) {
  const len = Math.min(samples.length - startSample, Math.floor(duration * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.07) env = t / 0.07;
    else if (t > duration - 0.1) env = Math.max(0, (duration - t) / 0.1);

    const vibrato = 1 + 0.01 * Math.sin(2 * Math.PI * 5.0 * t);
    const curF = freq * vibrato;

    let s = Math.sin(2 * Math.PI * curF * t) * 0.7;
    s += Math.sin(2 * Math.PI * curF * 2 * t) * 0.22;
    s += Math.sin(2 * Math.PI * curF * 3 * t) * 0.08;
    s += (Math.random() * 2 - 1) * 0.035; // air breath

    samples[startSample + i] += s * env * amp;
  }
}

/** Devotional Tanpura Drone */
function renderTanpura(samples, baseF = 130.81, amp = 0.20) {
  const numSamples = samples.length;
  const strings = [
    { freq: baseF * 1.5, interval: 4.0, offset: 0.0 },   // Pa
    { freq: baseF * 2.0, interval: 4.0, offset: 1.0 },   // Sa'
    { freq: baseF * 2.0, interval: 4.0, offset: 2.0 },   // Sa'
    { freq: baseF * 1.0, interval: 4.0, offset: 3.0 },   // Sa
  ];

  for (const str of strings) {
    let t = str.offset;
    while (t < numSamples / SAMPLE_RATE) {
      const startIdx = Math.floor(t * SAMPLE_RATE);
      const strLen = Math.min(numSamples - startIdx, Math.floor(str.interval * 1.6 * SAMPLE_RATE));
      for (let i = 0; i < strLen; i++) {
        const lt = i / SAMPLE_RATE;
        const env = Math.exp(-lt * 0.7);
        let s = Math.sin(2 * Math.PI * str.freq * lt) * 0.5;
        s += Math.sin(2 * Math.PI * str.freq * 2 * lt) * 0.3;
        s += Math.sin(2 * Math.PI * str.freq * 3 * lt) * 0.18;
        s *= (1 + 0.12 * Math.sin(2 * Math.PI * 3.5 * lt));
        samples[startIdx + i] += s * env * amp;
      }
      t += str.interval;
    }
  }
}

/** Bhajan Dholak / Tabla Stroke */
function renderBhajanDholak(samples, startSample, type = 'dha', amp = 0.45) {
  const len = Math.min(samples.length - startSample, Math.floor(0.4 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    if (type === 'dha' || type === 'ge') {
      const pitch = 85 + 45 * Math.exp(-t * 22);
      const env = Math.exp(-t * 6.5);
      s += Math.sin(2 * Math.PI * pitch * t) * 0.7;
    }
    if (type === 'dha' || type === 'na' || type === 'ta') {
      const pitch = 261.63; // Sa ring
      const env = Math.exp(-t * (type === 'na' ? 14 : 7));
      s += Math.sin(2 * Math.PI * pitch * t) * 0.55;
      s += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.22;
    }
    samples[startSample + i] += s * amp;
  }
}

/** Puja Ghanti / Manjira Chime */
function renderGhantiChime(samples, startSample, amp = 0.22) {
  const len = Math.min(samples.length - startSample, Math.floor(1.5 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 3.8);
    const s = Math.sin(2 * Math.PI * 1480 * t) * 0.5 + Math.sin(2 * Math.PI * 2960 * t) * 0.3;
    samples[startSample + i] += s * env * amp;
  }
}

/** Manjira rhythm tap */
function renderManjiraTap(samples, startSample, amp = 0.16) {
  const len = Math.min(samples.length - startSample, Math.floor(0.25 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 24);
    const s = (Math.sin(2 * Math.PI * 4600 * t) + Math.sin(2 * Math.PI * 6900 * t)) * 0.5;
    samples[startSample + i] += s * env * amp;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HOME & HUB: "SUKHKARTA DUKHHARTA" (TRADITIONAL GANESH AARTI)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sukhkarta Dukhharta Varta Vighnachi — Complete Authentic Melody & Bhajan Beat
 * 100% Traditional Public Domain composition (Saint Ramdas, 17th Century)
 */
function generateSukhkartaDukhhartaTrack() {
  const bpm = 104; // Traditional Aarti devotional tempo
  const beatSec = 60 / bpm;
  const numBars = 16;
  const totalSec = numBars * 4 * beatSec; // ~37 seconds
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Sukhkarta Dukhharta Ganesh Aarti (${totalSec.toFixed(1)}s @ ${bpm} BPM)...`);

  // Layer 1: Sacred Tanpura Drone in C
  renderTanpura(samples, 130.81, 0.22);

  // Layer 2: Devotional Bhajan Dholak & Manjira Rhythm (Keherwa Tala)
  for (let beat = 0; beat < numBars * 4; beat++) {
    const tBeat = beat * beatSec;
    const idx = Math.floor(tBeat * SAMPLE_RATE);
    const b = beat % 4;

    if (b === 0) renderBhajanDholak(samples, idx, 'dha', 0.50);
    else if (b === 1) renderBhajanDholak(samples, idx, 'ge', 0.38);
    else if (b === 2) renderBhajanDholak(samples, idx, 'na', 0.42);
    else if (b === 3) renderBhajanDholak(samples, idx, 'ta', 0.35);

    // Manjira chime on beats
    renderManjiraTap(samples, Math.floor((tBeat + beatSec * 0.5) * SAMPLE_RATE), 0.18);
  }

  // Swara Frequencies: C4=Sa, D4=Re, E4=Ga, F4=Ma, G4=Pa, A4=Dha, B4=Ni, C5=Sa'
  const C = 261.63, D = 293.66, E = 329.63, F = 349.23, G = 392.00, A = 440.00, B = 493.88, C2 = 523.25;

  // The Exact Traditional Melody Notes of "Sukhkarta Dukhharta":
  // Bar 1-2: "Sukh-kar-ta Dukh-har-ta, Var-ta Vigh-na-chi"
  // Bar 3-4: "Nur-vi Pur-vi Prem, Kru-pa Ja-ya-chi"
  // Bar 5-6: "Sar-van-gi Sun-dar, Uti Shen-du-ra-chi"
  // Bar 7-8: "Kan-thi Jhalke Mal, Muk-ta-pha-lan-chi"
  // Bar 9-12: Chorus: "Jai Dev Jai Dev, Jai Man-gal Mur-ti, Dar-shan Ma-tre Man Kam-na Pur-ti, Jai Dev Jai Dev"
  const sukhkartaMelody = [
    // Sukh-kar-ta (C C C D E)
    { b: 0.0, f: C, d: 0.45 },
    { b: 0.5, f: C, d: 0.45 },
    { b: 1.0, f: C, d: 0.45 },
    { b: 1.5, f: D, d: 0.45 },
    { b: 2.0, f: E, d: 0.8 },

    // Dukh-har-ta (E E E F G)
    { b: 3.0, f: E, d: 0.45 },
    { b: 3.5, f: E, d: 0.45 },
    { b: 4.0, f: E, d: 0.45 },
    { b: 4.5, f: F, d: 0.45 },
    { b: 5.0, f: G, d: 0.9 },

    // Var-ta Vigh-na-chi (G A G F E D C)
    { b: 6.0, f: G, d: 0.45 },
    { b: 6.5, f: A, d: 0.45 },
    { b: 7.0, f: G, d: 0.45 },
    { b: 7.5, f: F, d: 0.45 },
    { b: 8.0, f: E, d: 0.45 },
    { b: 8.5, f: D, d: 0.45 },
    { b: 9.0, f: C, d: 1.0 },

    // Nur-vi Pur-vi Prem Kru-pa Ja-ya-chi
    { b: 10.5, f: C, d: 0.45 },
    { b: 11.0, f: D, d: 0.45 },
    { b: 11.5, f: E, d: 0.45 },
    { b: 12.0, f: G, d: 0.8 },
    { b: 13.0, f: F, d: 0.45 },
    { b: 13.5, f: E, d: 0.45 },
    { b: 14.0, f: D, d: 0.45 },
    { b: 14.5, f: C, d: 1.4 },

    // CHORUS: "Jai Dev Jai Dev, Jai Man-gal Mur-ti"
    // Jai Dev Jai Dev (G G C2 C2)
    { b: 16.0, f: G, d: 0.45 },
    { b: 16.5, f: G, d: 0.45 },
    { b: 17.0, f: C2, d: 0.9 },
    { b: 18.0, f: G, d: 0.45 },
    { b: 18.5, f: G, d: 0.45 },
    { b: 19.0, f: C2, d: 0.9 },

    // Jai Man-gal Mur-ti (C2 B A G F G)
    { b: 20.0, f: C2, d: 0.45 },
    { b: 20.5, f: B, d: 0.45 },
    { b: 21.0, f: A, d: 0.45 },
    { b: 21.5, f: G, d: 0.45 },
    { b: 22.0, f: F, d: 0.45 },
    { b: 22.5, f: G, d: 0.9 },

    // Dar-shan Ma-tre Man Kam-na Pur-ti (G A G F E D C)
    { b: 24.0, f: G, d: 0.45 },
    { b: 24.5, f: A, d: 0.45 },
    { b: 25.0, f: G, d: 0.45 },
    { b: 25.5, f: F, d: 0.45 },
    { b: 26.0, f: E, d: 0.45 },
    { b: 26.5, f: D, d: 0.45 },
    { b: 27.0, f: C, d: 1.0 },

    // Jai Dev Jai Dev (D E F E D C)
    { b: 28.5, f: D, d: 0.45 },
    { b: 29.0, f: E, d: 0.45 },
    { b: 29.5, f: F, d: 0.45 },
    { b: 30.0, f: E, d: 0.45 },
    { b: 30.5, f: D, d: 0.45 },
    { b: 31.0, f: C, d: 1.8 },
  ];

  // Render Harmonium + Sitar Duet playing the Aarti melody
  for (const n of sukhkartaMelody) {
    const tSec = n.b * beatSec;
    const startIdx = Math.floor(tSec * SAMPLE_RATE);
    const durSec = n.d * beatSec;
    renderHarmoniumNote(samples, startIdx, n.f, durSec, 0.32);
    renderSitar(samples, startIdx, n.f, durSec, 0.28);
  }

  // Bell chime on grand chorus entrance
  renderGhantiChime(samples, Math.floor(16.0 * beatSec * SAMPLE_RATE), 0.35);

  // Soft Limiter
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.08) * 0.85;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MANDAP DESIGNER: "JAI GANESH JAI GANESH DEVA"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Jai Ganesh Deva Aarti Melody on Sweet Bansuri Flute & Santoor with peaceful bells.
 * 100% Traditional Public Domain composition.
 */
function generateJaiGaneshDevaTrack() {
  const bpm = 96; // Peaceful devotional tempo
  const beatSec = 60 / bpm;
  const numBars = 16;
  const totalSec = numBars * 4 * beatSec; // ~40 seconds
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Jai Ganesh Deva Aarti (${totalSec.toFixed(1)}s @ ${bpm} BPM)...`);

  renderTanpura(samples, 130.81, 0.20);

  // Swaras
  const C = 261.63, D = 293.66, E = 329.63, F = 349.23, G = 392.00, A = 440.00, B = 493.88, C2 = 523.25;

  // Jai Ganesh Deva traditional melody:
  // "Jai Ganesh, Jai Ganesh, Jai Ganesh Deva"
  // "Mata Jaki Parvati, Pita Mahadeva"
  // "Ek Dant Dayavant, Char Bhujadhari"
  // "Mathe Sindur Shobhe, Muse Ki Savari"
  const jaiGaneshMelody = [
    // Jai Ganesh (C E G)
    { b: 0.0, f: C, d: 0.5 }, { b: 0.5, f: E, d: 0.5 }, { b: 1.0, f: G, d: 1.0 },
    // Jai Ganesh (G A G)
    { b: 2.0, f: G, d: 0.5 }, { b: 2.5, f: A, d: 0.5 }, { b: 3.0, f: G, d: 1.0 },
    // Jai Ganesh Deva (G A C2 B A G)
    { b: 4.0, f: G, d: 0.4 }, { b: 4.5, f: A, d: 0.4 }, { b: 5.0, f: C2, d: 0.6 },
    { b: 5.8, f: B, d: 0.4 }, { b: 6.2, f: A, d: 0.4 }, { b: 6.8, f: G, d: 1.2 },

    // Mata Jaki Parvati (C2 C2 C2 B A G)
    { b: 8.0, f: C2, d: 0.5 }, { b: 8.5, f: C2, d: 0.5 }, { b: 9.0, f: C2, d: 0.6 },
    { b: 9.8, f: B, d: 0.4 }, { b: 10.2, f: A, d: 0.4 }, { b: 10.8, f: G, d: 1.0 },

    // Pita Mahadeva (F E D E F G)
    { b: 12.0, f: F, d: 0.4 }, { b: 12.5, f: E, d: 0.4 }, { b: 13.0, f: D, d: 0.5 },
    { b: 13.5, f: E, d: 0.4 }, { b: 14.0, f: F, d: 0.5 }, { b: 14.5, f: G, d: 1.4 },

    // Ek Dant Dayavant (G G G C2 B A)
    { b: 16.0, f: G, d: 0.5 }, { b: 16.5, f: G, d: 0.5 }, { b: 17.0, f: G, d: 0.6 },
    { b: 17.8, f: C2, d: 0.5 }, { b: 18.5, f: B, d: 0.4 }, { b: 19.0, f: A, d: 1.0 },

    // Char Bhujadhari (G A G F E D)
    { b: 20.0, f: G, d: 0.5 }, { b: 20.5, f: A, d: 0.5 }, { b: 21.0, f: G, d: 0.5 },
    { b: 21.5, f: F, d: 0.5 }, { b: 22.0, f: E, d: 0.5 }, { b: 22.5, f: D, d: 1.2 },

    // Mathe Sindur Shobhe (C D E E F E)
    { b: 24.0, f: C, d: 0.5 }, { b: 24.5, f: D, d: 0.5 }, { b: 25.0, f: E, d: 0.6 },
    { b: 25.8, f: E, d: 0.4 }, { b: 26.2, f: F, d: 0.4 }, { b: 26.8, f: E, d: 1.0 },

    // Muse Ki Savari, Jai Ganesh Deva (D C D E D C)
    { b: 28.0, f: D, d: 0.5 }, { b: 28.5, f: C, d: 0.5 }, { b: 29.0, f: D, d: 0.5 },
    { b: 29.5, f: E, d: 0.5 }, { b: 30.0, f: D, d: 0.5 }, { b: 30.5, f: C, d: 1.6 },
  ];

  // Render Bansuri Flute melody with Santoor accents
  for (const n of jaiGaneshMelody) {
    const tSec = n.b * beatSec;
    const startIdx = Math.floor(tSec * SAMPLE_RATE);
    const durSec = n.d * beatSec;
    renderBansuri(samples, startIdx, n.f, durSec, 0.40);
    renderHarmoniumNote(samples, startIdx, n.f * 0.5, durSec, 0.18);
  }

  // Gentle rhythm & bells
  for (let b = 0; b < numBars * 4; b++) {
    const tBeat = b * beatSec;
    const idx = Math.floor(tBeat * SAMPLE_RATE);
    if (b % 4 === 0) {
      renderBhajanDholak(samples, idx, 'dha', 0.32);
      renderGhantiChime(samples, idx, 0.20);
    } else {
      renderManjiraTap(samples, idx, 0.12);
    }
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.05) * 0.82;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DHOL BEAT MINI-GAME: SHENDUR LAL CHADHAYO & DHOL TASHA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 128 BPM High-Energy Nashik/Pune Dhol-Tasha with Shendur Lal Chadhayo melody!
 */
function generateDholTashaShendurTrack() {
  const bpm = 128;
  const beatSec = 60 / bpm;
  const numBars = 8;
  const totalSec = numBars * 4 * beatSec; // ~15 seconds loop
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Dhol-Tasha Shendur Lal Chadhayo (${totalSec.toFixed(1)}s @ ${bpm} BPM)...`);

  const sixteenthSec = beatSec / 4;
  const totalSixteenths = numBars * 16;

  // Dhol Tasha High-Energy Pathak Rhythms
  for (let step = 0; step < totalSixteenths; step++) {
    const stepTime = step * sixteenthSec;
    const stepInBar = step % 16;

    const isDhol = (stepInBar === 0 || stepInBar === 4 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10 || stepInBar === 14);
    const isTasha = (stepInBar === 2 || stepInBar === 5 || stepInBar === 7 || stepInBar === 11 || stepInBar === 12 || stepInBar === 13 || stepInBar === 15);
    const isGhungroo = (step % 2 === 0);

    const startIndex = Math.floor(stepTime * SAMPLE_RATE);

    if (isDhol) {
      const dholLen = Math.floor(0.4 * SAMPLE_RATE);
      for (let j = 0; j < dholLen && (startIndex + j) < numSamples; j++) {
        const lt = j / SAMPLE_RATE;
        const pitch = 70 + 120 * Math.exp(-lt * 40);
        const env = Math.exp(-lt * 7.5);
        let s = Math.sin(2 * Math.PI * pitch * lt) * 0.65;
        s += Math.sin(2 * Math.PI * pitch * 0.5 * lt) * 0.35;
        if (lt < 0.01) s += (Math.random() * 2 - 1) * 0.45;
        samples[startIndex + j] += s * env * 0.65;
      }
    }

    if (isTasha) {
      const tashaLen = Math.floor(0.22 * SAMPLE_RATE);
      for (let j = 0; j < tashaLen && (startIndex + j) < numSamples; j++) {
        const lt = j / SAMPLE_RATE;
        const pitch = 440 + 280 * Math.exp(-lt * 55);
        const env = Math.exp(-lt * 25);
        let s = Math.sin(2 * Math.PI * pitch * lt) * 0.45;
        if (lt < 0.008) s += (Math.random() * 2 - 1) * 0.9;
        samples[startIndex + j] += s * env * 0.45;
      }
    }

    if (isGhungroo) {
      renderManjiraTap(samples, startIndex, 0.18);
    }
  }

  // Melodic Shehnai/Sitar Hook: "Shendur Lal Chadhayo Acchha Gajmukhko"
  const C = 261.63, E = 329.63, G = 392.00, A = 440.00, C2 = 523.25;
  const shendurHook = [
    { b: 0.0, f: C }, { b: 0.5, f: C }, { b: 1.0, f: E }, { b: 1.5, f: E },
    { b: 2.0, f: G }, { b: 2.5, f: G }, { b: 3.0, f: A }, { b: 3.5, f: G },
    { b: 4.0, f: G }, { b: 4.5, f: G }, { b: 5.0, f: C2 }, { b: 5.5, f: C2 },
    { b: 6.0, f: A }, { b: 6.5, f: G }, { b: 7.0, f: E }, { b: 7.5, f: C },
  ];

  for (let rep = 0; rep < 2; rep++) {
    const offset = rep * 8;
    for (const n of shendurHook) {
      const t = (n.b + offset) * beatSec;
      renderHarmoniumNote(samples, Math.floor(t * SAMPLE_RATE), n.f, 0.4, 0.35);
      renderSitar(samples, Math.floor(t * SAMPLE_RATE), n.f * 2, 0.35, 0.25);
    }
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.88;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MODAK CATCH: "GANPATI BAPPA MORYA" FESTIVAL FOLK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 132 BPM Cheerful Folk Groove with "Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya" tune!
 */
function generateModakBappaMoryaTrack() {
  const bpm = 132;
  const beatSec = 60 / bpm;
  const numBars = 8;
  const totalSec = numBars * 4 * beatSec;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Modak Catch Bappa Morya Folk (${totalSec.toFixed(1)}s @ ${bpm} BPM)...`);

  // Lively Tabla & Dholak Groove
  for (let b = 0; b < numBars * 4; b++) {
    const t = b * beatSec;
    const idx = Math.floor(t * SAMPLE_RATE);
    if (b % 2 === 0) renderBhajanDholak(samples, idx, 'dha', 0.55);
    else renderBhajanDholak(samples, idx, 'ge', 0.42);
    renderManjiraTap(samples, Math.floor((t + beatSec * 0.5) * SAMPLE_RATE), 0.22);
  }

  // Melody: "Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya"
  const C = 261.63, D = 293.66, E = 329.63, G = 392.00, A = 440.00, C2 = 523.25;
  const moryaNotes = [
    // Gan-pa-ti Bap-pa Mor-ya (C D E G E D C)
    { b: 0.0, f: C }, { b: 0.5, f: D }, { b: 1.0, f: E }, { b: 1.5, f: G },
    { b: 2.0, f: E }, { b: 2.5, f: D }, { b: 3.0, f: C },

    // Pudh-chya Var-shi Lav-kar Ya (G A C2 A G E D)
    { b: 4.0, f: G }, { b: 4.5, f: A }, { b: 5.0, f: C2 }, { b: 5.5, f: A },
    { b: 6.0, f: G }, { b: 6.5, f: E }, { b: 7.0, f: D },
  ];

  for (let rep = 0; rep < 4; rep++) {
    const barOff = rep * 8;
    for (const n of moryaNotes) {
      const t = (n.b + barOff) * beatSec;
      renderHarmoniumNote(samples, Math.floor(t * SAMPLE_RATE), n.f, 0.35, 0.35);
      renderSitar(samples, Math.floor(t * SAMPLE_RATE), n.f * 2, 0.25, 0.25);
    }
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.85;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BAPPA QUIZ: "VAKRATUNDA MAHAKAYA" SACRED SHLOKA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vakratunda Mahakaya Suryakoti Samaprabha — Sacred Sanskrit Shloka Melody
 * 100% Traditional Vedic public domain melody.
 */
function generateVakratundaShlokaTrack() {
  const bpm = 90;
  const beatSec = 60 / bpm;
  const numBars = 12;
  const totalSec = numBars * 4 * beatSec; // ~32s
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Vakratunda Mahakaya Sacred Shloka (${totalSec.toFixed(1)}s)...`);

  renderTanpura(samples, 130.81, 0.25);

  const C = 261.63, D = 293.66, E = 329.63, F = 349.23, G = 392.00, A = 440.00, C2 = 523.25;

  // "Vakra-tun-da Ma-ha-ka-ya, Sur-ya-ko-ti Sa-ma-pra-bha"
  // "Nir-vigh-nam Ku-ru Me De-va, Sar-va Kar-ye-shu Sar-va-da"
  const shlokaMelody = [
    // Vakra-tun-da (C D E G)
    { b: 0.0, f: C, d: 0.8 }, { b: 1.0, f: D, d: 0.8 }, { b: 2.0, f: E, d: 1.2 }, { b: 3.5, f: G, d: 1.5 },
    // Ma-ha-ka-ya (G A G E D C)
    { b: 6.0, f: G, d: 0.7 }, { b: 7.0, f: A, d: 0.7 }, { b: 8.0, f: G, d: 0.8 },
    { b: 9.0, f: E, d: 0.7 }, { b: 10.0, f: D, d: 0.7 }, { b: 11.0, f: C, d: 2.0 },

    // Sur-ya-ko-ti (G A C2 C2)
    { b: 14.0, f: G, d: 0.8 }, { b: 15.0, f: A, d: 0.8 }, { b: 16.0, f: C2, d: 1.2 }, { b: 17.5, f: C2, d: 1.5 },
    // Sa-ma-pra-bha (C2 B A G F E D)
    { b: 20.0, f: C2, d: 0.6 }, { b: 20.8, f: A, d: 0.6 }, { b: 21.6, f: G, d: 0.8 },
    { b: 22.5, f: F, d: 0.6 }, { b: 23.3, f: E, d: 0.6 }, { b: 24.0, f: D, d: 2.0 },

    // Nir-vigh-nam Ku-ru Me De-va (E F G G A G E)
    { b: 26.0, f: E, d: 0.7 }, { b: 27.0, f: F, d: 0.7 }, { b: 28.0, f: G, d: 1.0 },
    { b: 29.5, f: G, d: 0.6 }, { b: 30.5, f: A, d: 0.8 }, { b: 31.5, f: G, d: 0.7 }, { b: 32.5, f: E, d: 1.5 },

    // Sar-va Kar-ye-shu Sar-va-da (D E F E D C)
    { b: 35.0, f: D, d: 0.7 }, { b: 36.0, f: E, d: 0.7 }, { b: 37.0, f: F, d: 0.8 },
    { b: 38.0, f: E, d: 0.7 }, { b: 39.0, f: D, d: 0.7 }, { b: 40.0, f: C, d: 3.0 },
  ];

  for (const n of shlokaMelody) {
    const t = n.b * beatSec;
    const idx = Math.floor(t * SAMPLE_RATE);
    const dur = n.d * beatSec;
    renderBansuri(samples, idx, n.f, dur, 0.45);
    renderHarmoniumNote(samples, idx, n.f * 0.5, dur, 0.20);
  }

  // Periodic temple singing bowl
  renderGhantiChime(samples, Math.floor(0.2 * SAMPLE_RATE), 0.3);
  renderGhantiChime(samples, Math.floor(14.0 * beatSec * SAMPLE_RATE), 0.3);
  renderGhantiChime(samples, Math.floor(26.0 * beatSec * SAMPLE_RATE), 0.3);

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.05) * 0.80;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. COMPLETION: GRAND MAHA AARTI & TRIUMPH FANFARE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ghalin Lotangan Vandin Charan + Shankha Naad + Grand Aarti Finale!
 */
function generateGrandMahaAartiTrack() {
  const bpm = 124;
  const beatSec = 60 / bpm;
  const numBars = 8;
  const totalSec = numBars * 4 * beatSec; // ~16s
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Grand Maha Aarti Finale (${totalSec.toFixed(1)}s)...`);

  // 1. Ceremonial Sacred Conch Shell (Shankha) blast
  const shankhaLen = Math.floor(4.0 * SAMPLE_RATE);
  for (let i = 0; i < shankhaLen; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.5) env = t / 0.5;
    else if (t > 2.8) env = Math.max(0, (4.0 - t) / 1.2);
    const pitch = 440 * (1 + 0.03 * Math.sin(2 * Math.PI * 4.0 * t));
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.65;
    s += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.35;
    s += Math.sin(2 * Math.PI * pitch * 3 * t) * 0.20;
    samples[i] += s * env * 0.50;
  }

  // 2. High-energy celebratory Aarti rhythm & clanging temple bells from 3.5s onwards
  for (let t = 3.5; t < totalSec - 0.2; t += beatSec * 0.5) {
    const idx = Math.floor(t * SAMPLE_RATE);
    renderBhajanDholak(samples, idx, 'dha', 0.65);
    renderManjiraTap(samples, idx, 0.25);
    if (Math.floor(t / beatSec) % 2 === 0) {
      renderGhantiChime(samples, idx, 0.35);
    }
  }

  // 3. Triumphant Aarti Melody: "Jai Dev Jai Dev, Jai Mangal Murti"
  const G = 392.00, C2 = 523.25, B = 493.88, A = 440.00, F = 349.23, E = 329.63, D = 293.66, C = 261.63;
  const finaleNotes = [
    { t: 4.2, f: G }, { t: 4.6, f: G }, { t: 5.0, f: C2 },
    { t: 5.8, f: G }, { t: 6.2, f: G }, { t: 6.6, f: C2 },
    { t: 7.4, f: C2 }, { t: 7.8, f: B }, { t: 8.2, f: A }, { t: 8.6, f: G }, { t: 9.0, f: F }, { t: 9.4, f: G },
    { t: 10.5, f: G }, { t: 11.0, f: A }, { t: 11.5, f: G }, { t: 12.0, f: F }, { t: 12.5, f: E }, { t: 13.0, f: D }, { t: 13.5, f: C }
  ];

  for (const n of finaleNotes) {
    const idx = Math.floor(n.t * SAMPLE_RATE);
    renderHarmoniumNote(samples, idx, n.f, 0.55, 0.45);
    renderSitar(samples, idx, n.f * 2, 0.45, 0.30);
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.88;
  }

  return samples;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUND EFFECTS GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

function generateTempleBell() {
  const duration = 4.0;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  const partials = [
    { freq: 520, amp: 0.8, decay: 3.5 },
    { freq: 524, amp: 0.7, decay: 3.2 },
    { freq: 1040, amp: 0.5, decay: 2.5 },
    { freq: 1560, amp: 0.35, decay: 2.0 },
    { freq: 2080, amp: 0.25, decay: 1.5 },
    { freq: 3120, amp: 0.15, decay: 1.0 },
    { freq: 4160, amp: 0.08, decay: 0.6 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    if (t < 0.015) s += (Math.random() * 2 - 1) * (1 - t / 0.015) * 0.4;
    for (const p of partials) {
      const env = Math.exp(-t / (p.decay * 0.5));
      s += Math.sin(2 * Math.PI * p.freq * t) * p.amp * env;
    }
    samples[i] = s * 0.45;
  }
  return samples;
}

function generatePujaGhanti() {
  const duration = 1.8;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);
  const partials = [
    { freq: 1480, amp: 0.8, decay: 1.5 },
    { freq: 1488, amp: 0.75, decay: 1.4 },
    { freq: 2960, amp: 0.5, decay: 1.0 },
    { freq: 4440, amp: 0.3, decay: 0.7 },
    { freq: 5920, amp: 0.15, decay: 0.4 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    if (t < 0.008) s += (Math.random() * 2 - 1) * (1 - t / 0.008) * 0.3;
    for (const p of partials) {
      const env = Math.exp(-t / (p.decay * 0.4));
      s += Math.sin(2 * Math.PI * p.freq * t) * p.amp * env;
    }
    samples[i] = s * 0.35;
  }
  return samples;
}

function generateShankha() {
  const duration = 2.5;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.35) env = t / 0.35;
    else if (t > 1.8) env = (duration - t) / 0.7;

    const basePitch = 440 * (1 + 0.03 * Math.sin(2 * Math.PI * 4.0 * t));
    let s = Math.sin(2 * Math.PI * basePitch * t) * 0.6;
    s += Math.sin(2 * Math.PI * basePitch * 2 * t) * 0.35;
    s += Math.sin(2 * Math.PI * basePitch * 3 * t) * 0.2;
    s += (Math.random() * 2 - 1) * 0.06;

    samples[i] = s * env * 0.45;
  }
  return samples;
}

function generateDholHit() {
  const duration = 0.8;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const pitch = 65 + 130 * Math.exp(-t * 35);
    const env = Math.exp(-t * 6.5);
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.6;
    s += Math.sin(2 * Math.PI * pitch * 0.5 * t) * 0.4;
    if (t < 0.015) s += (Math.random() * 2 - 1) * (1 - t / 0.015) * 0.5;
    samples[i] = s * env * 0.6;
  }
  return samples;
}

function generateTashaFlam() {
  const duration = 0.4;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const pitch = 440 + 320 * Math.exp(-t * 50);
    const env = Math.exp(-t * 22);
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.4;
    if (t < 0.008) s += (Math.random() * 2 - 1) * 0.9;
    samples[i] = s * env * 0.45;
  }
  return samples;
}

function generateCorrectChime() {
  const duration = 0.9;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);
  const notes = [
    { t: 0.0, f: 523.25 },
    { t: 0.12, f: 659.25 },
    { t: 0.24, f: 783.99 },
    { t: 0.36, f: 1046.50 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (const n of notes) {
      if (t >= n.t) {
        const lt = t - n.t;
        const env = Math.exp(-lt * 5.0);
        s += Math.sin(2 * Math.PI * n.f * lt) * env * 0.25;
        s += Math.sin(2 * Math.PI * n.f * 2 * lt) * env * 0.1;
      }
    }
    samples[i] = s;
  }
  return samples;
}

function generateWrongThud() {
  const duration = 0.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const pitch = 160 * Math.exp(-t * 18);
    const env = Math.exp(-t * 9.0);
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.5;
    if (t < 0.02) s += (Math.random() * 2 - 1) * 0.4;
    samples[i] = s * env * 0.45;
  }
  return samples;
}

function generateModakCatch() {
  const duration = 0.6;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const pitch = 750 + 450 * Math.sin(2 * Math.PI * 4 * t);
    const env = Math.exp(-t * 6.5);
    const s = Math.sin(2 * Math.PI * pitch * t) * 0.35 + Math.sin(2 * Math.PI * pitch * 2 * t) * 0.15;
    samples[i] = s * env;
  }
  return samples;
}

function generateComboRise() {
  const duration = 0.7;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const pitch = 400 + 600 * (t / duration);
    const env = Math.exp(-t * 3.5);
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.3;
    s += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.15;
    samples[i] = s * env;
  }
  return samples;
}

function generateVictoryFanfare() {
  const duration = 2.2;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);
  const notes = [
    { t: 0.0, f: 392.00 },
    { t: 0.2, f: 523.25 },
    { t: 0.4, f: 659.25 },
    { t: 0.65, f: 783.99 },
    { t: 1.0, f: 1046.50 },
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
// GENERATION MAIN
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const sfxDir = path.resolve('public/audio/sfx');
  const musicDir = path.resolve('public/audio/music');

  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });

  console.log('\n================================================================');
  console.log('GENERATING AUTHENTIC GANESH AARTI & DEVOTIONAL SONG TRACKS');
  console.log('Zero Clapping • 100% Traditional Public Domain Melodies • Pure Studio Sound');
  console.log('================================================================\n');

  console.log('--- Generating Studio Sound Effects ---');
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

  console.log('\n--- Generating Real Ganesh Devotional Song Melodies ---');
  writeWavFile(path.join(musicDir, 'home_sanctum.wav'), generateSukhkartaDukhhartaTrack());
  writeWavFile(path.join(musicDir, 'mandap_ambience.wav'), generateJaiGaneshDevaTrack());
  writeWavFile(path.join(musicDir, 'dhol_tasha_rhythm.wav'), generateDholTashaShendurTrack());
  writeWavFile(path.join(musicDir, 'modak_playful.wav'), generateModakBappaMoryaTrack());
  writeWavFile(path.join(musicDir, 'quiz_meditation.wav'), generateVakratundaShlokaTrack());
  writeWavFile(path.join(musicDir, 'celebration_victory.wav'), generateGrandMahaAartiTrack());

  console.log('\n[ALL GANESH DEVOTIONAL MUSIC TRACKS GENERATED SUCCESSFULLY!]');
}

main();
