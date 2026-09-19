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
    const s = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    data.writeInt16LE(Math.floor(intSample), i * 2);
  }

  const finalBuffer = Buffer.concat([header, data]);
  fs.writeFileSync(filepath, finalBuffer);
  console.log(`[GENERATED] ${path.basename(filepath)} (${(finalBuffer.length / 1024).toFixed(1)} KB)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ACOUSTIC INSTRUMENT SYNTHESIS PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Plucked Sitar/Veena note with jawari bridge buzz */
function renderSitarNote(samples, startSample, freq, duration, amp = 0.5) {
  const len = Math.min(samples.length - startSample, Math.floor(duration * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope: fast pluck attack, long organic decay
    const env = Math.exp(-t * 2.8);
    // Jawari harmonics (fundamental + upper shimmering partials)
    let s = Math.sin(2 * Math.PI * freq * t) * 0.5;
    s += Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
    s += Math.sin(2 * Math.PI * freq * 3 * t) * 0.18;
    s += Math.sin(2 * Math.PI * freq * 4 * t) * 0.12;
    s += Math.sin(2 * Math.PI * freq * 5 * t) * 0.08;
    // Gentle jawari non-linear buzz
    s += Math.sin(2 * Math.PI * freq * 6 * t) * 0.05 * Math.sin(2 * Math.PI * 4 * t);
    // Attack transient snap
    if (t < 0.008) s += (Math.random() * 2 - 1) * (1 - t / 0.008) * 0.25;
    samples[startSample + i] += s * env * amp;
  }
}

/** Bansuri (Bamboo Flute) phrase note with breath air & gentle vibrato */
function renderFluteNote(samples, startSample, freq, duration, amp = 0.4) {
  const len = Math.min(samples.length - startSample, Math.floor(duration * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    // Smooth flute envelope: gentle breath in, sustain, smooth release
    let env = 1.0;
    if (t < 0.08) env = t / 0.08;
    else if (t > duration - 0.12) env = Math.max(0, (duration - t) / 0.12);

    // Natural 5.2Hz breath vibrato
    const vibrato = 1 + 0.012 * Math.sin(2 * Math.PI * 5.2 * t);
    const curFreq = freq * vibrato;

    // Warm bamboo acoustic harmonics
    let s = Math.sin(2 * Math.PI * curFreq * t) * 0.7;
    s += Math.sin(2 * Math.PI * curFreq * 2 * t) * 0.22;
    s += Math.sin(2 * Math.PI * curFreq * 3 * t) * 0.08;
    // Soft breath noise
    s += (Math.random() * 2 - 1) * 0.04;

    samples[startSample + i] += s * env * amp;
  }
}

/** Tanpura continuous resonant drone (Pa - Sa' - Sa' - Sa) */
function renderTanpuraDrone(samples, baseFreq = 130.81, amp = 0.22) {
  const numSamples = samples.length;
  // Strings: Pa (1.5x), Sa' (2x), Sa' (2x), Sa (1x)
  const strings = [
    { freq: baseFreq * 1.5, interval: 4.5, offset: 0.0 },   // Pa
    { freq: baseFreq * 2.0, interval: 4.5, offset: 1.1 },   // Sa'
    { freq: baseFreq * 2.0, interval: 4.5, offset: 2.2 },   // Sa'
    { freq: baseFreq * 1.0, interval: 4.5, offset: 3.3 },   // Sa
  ];

  for (const str of strings) {
    let tPluck = str.offset;
    while (tPluck < numSamples / SAMPLE_RATE) {
      const startIdx = Math.floor(tPluck * SAMPLE_RATE);
      const strLen = Math.min(numSamples - startIdx, Math.floor(str.interval * 1.8 * SAMPLE_RATE));
      for (let i = 0; i < strLen; i++) {
        const t = i / SAMPLE_RATE;
        const env = Math.exp(-t * 0.65);
        let s = Math.sin(2 * Math.PI * str.freq * t) * 0.5;
        s += Math.sin(2 * Math.PI * str.freq * 2 * t) * 0.3;
        s += Math.sin(2 * Math.PI * str.freq * 3 * t) * 0.2;
        s += Math.sin(2 * Math.PI * str.freq * 4 * t) * 0.12;
        s += Math.sin(2 * Math.PI * str.freq * 5 * t) * 0.08;
        // Jawari thread shimmer
        s *= (1 + 0.15 * Math.sin(2 * Math.PI * 3.5 * t));
        samples[startIdx + i] += s * env * amp;
      }
      tPluck += str.interval;
    }
  }
}

/** Jal Tarang (Melodic tuned water bowl chime) */
function renderJalTarang(samples, startSample, freq, amp = 0.35) {
  const len = Math.min(samples.length - startSample, Math.floor(1.2 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4.2);
    let s = Math.sin(2 * Math.PI * freq * t) * 0.75;
    s += Math.sin(2 * Math.PI * freq * 2.75 * t) * 0.25;
    if (t < 0.005) s += (Math.random() * 2 - 1) * 0.3;
    samples[startSample + i] += s * env * amp;
  }
}

/** Acoustic Tabla Stroke (Dayan ring or Bayan bass) */
function renderTablaStroke(samples, startSample, type = 'dha', amp = 0.45) {
  const len = Math.min(samples.length - startSample, Math.floor(0.4 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    if (type === 'dha' || type === 'ge') {
      // Bayan modulation (bass modulation)
      const pitch = 85 + 40 * Math.exp(-t * 25);
      const env = Math.exp(-t * 6.0);
      s += Math.sin(2 * Math.PI * pitch * t) * 0.7;
    }
    if (type === 'dha' || type === 'na' || type === 'tin') {
      // Dayan ring (tuned high rim)
      const pitch = 261.63; // Sa
      const env = Math.exp(-t * (type === 'na' ? 12 : 5));
      s += Math.sin(2 * Math.PI * pitch * t) * 0.6;
      s += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.2;
    }
    samples[startSample + i] += s * amp;
  }
}

/** Manjira (Brass hand cymbal tick) */
function renderManjira(samples, startSample, amp = 0.18) {
  const len = Math.min(samples.length - startSample, Math.floor(0.3 * SAMPLE_RATE));
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 22);
    const s = (Math.sin(2 * Math.PI * 4500 * t) + Math.sin(2 * Math.PI * 6800 * t)) * 0.5;
    samples[startSample + i] += s * env * amp;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE FESTIVAL MUSIC TRACK GENERATORS (100% PURE ACOUSTIC COMPOSITIONS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. HOME SANCTUM TRACK (home_sanctum.wav)
 * Sacred Raag Bhupali melody on Sitar with Tanpura drone and peaceful puja bell.
 * Zero background noise, zero audience, clean looping!
 */
function generateHomeSanctumTrack() {
  const totalSec = 24.0;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Home Sanctum (${totalSec}s in Raag Bhupali)...`);

  // Layer 1: Resonant Tanpura Drone in C (Sa=130.81)
  renderTanpuraDrone(samples, 130.81, 0.26);

  // Swaras: Sa=261.63, Re=293.66, Ga=329.63, Pa=392.00, Dha=440.00, Sa'=523.25
  const S = 261.63, R = 293.66, G = 329.63, P = 392.00, D = 440.00, S2 = 523.25;

  // Auspicious Sitar Melody Phrase Structure
  const melody = [
    // Phrase 1: Divine Ascent
    { t: 0.8, f: S, d: 1.4 },
    { t: 2.2, f: R, d: 1.2 },
    { t: 3.4, f: G, d: 2.2 },
    { t: 5.6, f: P, d: 1.6 },
    { t: 7.2, f: G, d: 1.2 },
    { t: 8.4, f: R, d: 1.4 },
    { t: 9.8, f: S, d: 2.2 },

    // Phrase 2: Higher Devotion
    { t: 12.0, f: G, d: 1.2 },
    { t: 13.2, f: P, d: 1.2 },
    { t: 14.4, f: D, d: 1.8 },
    { t: 16.2, f: S2, d: 2.4 },
    { t: 18.6, f: D, d: 1.2 },
    { t: 19.8, f: P, d: 1.4 },
    { t: 21.2, f: G, d: 1.2 },
    { t: 22.4, f: S, d: 1.6 },
  ];

  for (const n of melody) {
    renderSitarNote(samples, Math.floor(n.t * SAMPLE_RATE), n.f, n.d, 0.42);
  }

  // Soft puja bell chiming at cadences
  renderManjira(samples, Math.floor(0.1 * SAMPLE_RATE), 0.25);
  renderManjira(samples, Math.floor(12.0 * SAMPLE_RATE), 0.25);

  // Gentle limiter
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.05) * 0.82;
  }

  return samples;
}

/**
 * 2. MANDAP AMBIENCE TRACK (mandap_ambience.wav)
 * Meditative Raag Yaman with Santoor cascades and warm Bansuri flute phrases.
 */
function generateMandapAmbienceTrack() {
  const totalSec = 24.0;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Mandap Ambience (${totalSec}s in Raag Yaman)...`);

  // Tanpura drone in C (rich warm background)
  renderTanpuraDrone(samples, 130.81, 0.24);

  // Raag Yaman: Ni(low)=246.94, Re=293.66, Ga=329.63, Ma'=369.99, Pa=392.00, Dha=440.00, Ni=493.88
  const N0 = 246.94, R = 293.66, G = 329.63, M = 369.99, P = 392.00, D = 440.00, N = 493.88, S2 = 523.25;

  // Santoor gentle ripples
  const santoorNotes = [
    { t: 0.5, f: N0 }, { t: 0.9, f: R }, { t: 1.3, f: G }, { t: 2.1, f: M }, { t: 2.6, f: P },
    { t: 6.0, f: M }, { t: 6.4, f: D }, { t: 6.8, f: N }, { t: 7.4, f: S2 },
    { t: 12.5, f: N0 }, { t: 12.9, f: R }, { t: 13.3, f: G }, { t: 14.1, f: P },
    { t: 18.0, f: D }, { t: 18.4, f: P }, { t: 18.8, f: M }, { t: 19.3, f: G }, { t: 19.8, f: R }
  ];

  for (const sn of santoorNotes) {
    renderJalTarang(samples, Math.floor(sn.t * SAMPLE_RATE), sn.f, 0.28);
  }

  // Bansuri Flute Solos
  const flutePhrases = [
    { t: 3.2, f: G, d: 2.4 },
    { t: 5.8, f: M, d: 1.8 },
    { t: 7.8, f: D, d: 2.2 },
    { t: 10.2, f: P, d: 2.0 },
    { t: 14.5, f: G, d: 2.2 },
    { t: 16.8, f: R, d: 1.8 },
    { t: 20.2, f: G, d: 2.5 },
  ];

  for (const fn of flutePhrases) {
    renderFluteNote(samples, Math.floor(fn.t * SAMPLE_RATE), fn.f, fn.d, 0.38);
  }

  // Limiter
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.05) * 0.80;
  }

  return samples;
}

/**
 * 3. MODAK PLAYFUL JUGALBANDI TRACK (modak_playful.wav)
 * Lively 132 BPM folk groove with bouncy Tabla, Jal Tarang, and Sitar melodies.
 */
function generateModakPlayfulTrack() {
  const bpm = 132;
  const beatSec = 60 / bpm;
  const numBars = 8;
  const totalSec = numBars * 4 * beatSec;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Modak Playful Jugalbandi (${totalSec.toFixed(2)}s @ ${bpm} BPM)...`);

  const S = 261.63, R = 293.66, G = 329.63, P = 392.00, D = 440.00, S2 = 523.25;

  // Rhythm grid: 32 beats
  for (let beat = 0; beat < numBars * 4; beat++) {
    const tBeat = beat * beatSec;
    const startIdx = Math.floor(tBeat * SAMPLE_RATE);

    // Tabla Keherwa beat: Dha (0), Ge (1), Na (2), Tin (3)
    const beatInBar = beat % 4;
    if (beatInBar === 0) renderTablaStroke(samples, startIdx, 'dha', 0.55);
    else if (beatInBar === 1) renderTablaStroke(samples, startIdx, 'ge', 0.45);
    else if (beatInBar === 2) renderTablaStroke(samples, startIdx, 'na', 0.45);
    else if (beatInBar === 3) renderTablaStroke(samples, startIdx, 'tin', 0.40);

    // Manjira accent on upbeat
    const upbeatIdx = Math.floor((tBeat + beatSec * 0.5) * SAMPLE_RATE);
    renderManjira(samples, upbeatIdx, 0.15);
  }

  // Bouncy Jal Tarang Melody
  const notes = [
    S, R, G, P, G, R, S, P,
    G, P, D, S2, D, P, G, R,
    S, G, P, S2, P, G, R, S,
    R, G, P, D, P, G, R, S
  ];

  for (let i = 0; i < notes.length; i++) {
    const tNote = i * (beatSec * 0.5);
    renderJalTarang(samples, Math.floor(tNote * SAMPLE_RATE), notes[i], 0.32);
    if (i % 2 === 0) {
      renderSitarNote(samples, Math.floor(tNote * SAMPLE_RATE), notes[i] * 0.5, 0.4, 0.25);
    }
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.85;
  }

  return samples;
}

/**
 * 4. QUIZ MEDITATION TRACK (quiz_meditation.wav)
 * Contemplative Vedic drone with warm acoustic Bansuri flute swaras.
 */
function generateQuizMeditationTrack() {
  const totalSec = 22.0;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Quiz Meditation (${totalSec}s Vedic atmosphere)...`);

  // Deep Om drone (fundamental C2=65.4Hz and C3=130.81Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = Math.sin(2 * Math.PI * 65.41 * t) * 0.35;
    s += Math.sin(2 * Math.PI * 130.81 * t) * 0.25;
    s += Math.sin(2 * Math.PI * 196.00 * t) * 0.15; // Pa fifth
    s += Math.sin(2 * Math.PI * 261.63 * t) * 0.10;
    // Slow meditative wave modulation
    s *= (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.15 * t));
    samples[i] += s * 0.32;
  }

  // Raag Kedar contemplative flute swaras
  const S = 261.63, M = 349.23, P = 392.00, D = 440.00, S2 = 523.25;
  const fluteNotes = [
    { t: 1.5, f: S, d: 2.8 },
    { t: 4.8, f: M, d: 3.2 },
    { t: 8.5, f: P, d: 2.6 },
    { t: 11.8, f: D, d: 2.2 },
    { t: 14.5, f: P, d: 2.8 },
    { t: 17.8, f: M, d: 2.4 },
    { t: 19.5, f: S, d: 2.5 }
  ];

  for (const fn of fluteNotes) {
    renderFluteNote(samples, Math.floor(fn.t * SAMPLE_RATE), fn.f, fn.d, 0.42);
  }

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.05) * 0.80;
  }

  return samples;
}

/**
 * 5. CELEBRATION VICTORY TRACK (celebration_victory.wav)
 * Auspicious Shankha invocation, festive Dhol bursts, and triumphant temple bells!
 */
function generateCelebrationVictoryTrack() {
  const totalSec = 16.0;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Celebration Victory (${totalSec}s Grand Fanfare)...`);

  // Sacred Conch Shell (Shankha) invocation blast at start
  const shankhaLen = Math.floor(3.8 * SAMPLE_RATE);
  for (let i = 0; i < shankhaLen; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.6) env = t / 0.6;
    else if (t > 2.8) env = Math.max(0, (3.8 - t) / 1.0);
    const pitch = 440 * (1 + 0.04 * Math.sin(2 * Math.PI * 3.5 * t));
    let s = Math.sin(2 * Math.PI * pitch * t) * 0.6;
    s += Math.sin(2 * Math.PI * pitch * 2 * t) * 0.35;
    s += Math.sin(2 * Math.PI * pitch * 3 * t) * 0.20;
    s += (Math.random() * 2 - 1) * 0.08;
    samples[i] += s * env * 0.48;
  }

  // Joyous Dhol rhythm bursts from second 3.5 onwards
  const bpm = 128;
  const beatSec = 60 / bpm;
  for (let t = 3.5; t < totalSec - 0.5; t += beatSec) {
    const idx = Math.floor(t * SAMPLE_RATE);
    renderTablaStroke(samples, idx, 'dha', 0.65);
    renderManjira(samples, Math.floor((t + beatSec * 0.5) * SAMPLE_RATE), 0.22);
  }

  // Triumphant Swara Fanfare: Sa -> Ga -> Pa -> Sa' -> Pa -> Sa'
  const S = 261.63, G = 329.63, P = 392.00, S2 = 523.25;
  const fanfare = [
    { t: 4.2, f: S }, { t: 5.0, f: G }, { t: 5.8, f: P }, { t: 6.6, f: S2 },
    { t: 8.2, f: P }, { t: 9.0, f: S2 }, { t: 10.2, f: S2 }, { t: 12.0, f: P }, { t: 13.2, f: S2 }
  ];

  for (const fn of fanfare) {
    renderSitarNote(samples, Math.floor(fn.t * SAMPLE_RATE), fn.f, 1.4, 0.45);
    renderJalTarang(samples, Math.floor(fn.t * SAMPLE_RATE), fn.f * 2, 0.30);
  }

  // Temple bell resonance rings
  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.85;
  }

  return samples;
}

/**
 * 6. NASHIK DHOL-TASHA FESTIVAL RHYTHM TRACK (dhol_tasha_rhythm.wav)
 */
function generateDholTashaRhythmTrack() {
  const bpm = 126;
  const beatSec = 60 / bpm;
  const numBars = 4;
  const totalSec = numBars * 4 * beatSec;
  const numSamples = Math.floor(totalSec * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  console.log(`Composing Nashik Dhol-Tasha Rhythm (${totalSec.toFixed(2)}s @ ${bpm} BPM)...`);

  const sixteenthSec = beatSec / 4;
  const totalSixteenths = numBars * 16;

  for (let step = 0; step < totalSixteenths; step++) {
    const stepTime = step * sixteenthSec;
    const stepInBar = step % 16;

    const isDhol = (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10 || stepInBar === 14);
    const isTasha = (stepInBar === 2 || stepInBar === 4 || stepInBar === 7 || stepInBar === 11 || stepInBar === 12 || stepInBar === 13 || stepInBar === 15);
    const isGhungroo = (step % 2 === 0);

    const startIndex = Math.floor(stepTime * SAMPLE_RATE);

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

  for (let i = 0; i < numSamples; i++) {
    samples[i] = Math.tanh(samples[i] * 1.1) * 0.85;
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
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const sfxDir = path.resolve('public/audio/sfx');
  const musicDir = path.resolve('public/audio/music');

  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });

  console.log('\n================================================================');
  console.log('GENERATING 100% ORIGINAL, NO-COPYRIGHT, PURE STUDIO FESTIVAL AUDIO');
  console.log('Zero background audience, zero clapping, zero artifacts!');
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

  console.log('\n--- Generating Original Classical Festival Music Tracks ---');
  writeWavFile(path.join(musicDir, 'home_sanctum.wav'), generateHomeSanctumTrack());
  writeWavFile(path.join(musicDir, 'mandap_ambience.wav'), generateMandapAmbienceTrack());
  writeWavFile(path.join(musicDir, 'dhol_tasha_rhythm.wav'), generateDholTashaRhythmTrack());
  writeWavFile(path.join(musicDir, 'modak_playful.wav'), generateModakPlayfulTrack());
  writeWavFile(path.join(musicDir, 'quiz_meditation.wav'), generateQuizMeditationTrack());
  writeWavFile(path.join(musicDir, 'celebration_victory.wav'), generateCelebrationVictoryTrack());

  console.log('\n[ALL ORIGINAL STUDIO ASSETS GENERATED SUCCESSFULLY!]');
}

main();
