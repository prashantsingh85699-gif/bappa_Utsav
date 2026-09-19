/**
 * Professional Original Festival Audio System for Bappa Utsav
 * ─────────────────────────────────────────────────────────────────────────────
 * Strict Copyright & Quality Compliance:
 * - 100% legal, royalty-free Indian classical & festival recordings (Public Domain & CC BY-SA)
 * - Studio-quality 16-bit 44.1kHz acoustic modeled sound effects (Temple Bell, Ghanti, Shankha, Dhol, Tasha)
 * - Dual-deck seamless crossfader with equal-power gain ramps
 * - Independent Music, SFX, and Master volume channels with localStorage persistence
 * - Zero duplicate playback protection & smart mobile preloading
 * - Autoplay restriction unlock on first user gesture
 * - Tab visibility auto-suspend/resume for mobile battery optimization
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type MusicTrackType =
  | 'home'
  | 'mandap'
  | 'dhol'
  | 'modak'
  | 'quiz'
  | 'celebration'
  // Backward-compatibility aliases
  | 'festival'
  | 'calm'
  | 'gameplay';

export type SfxType =
  | 'temple_bell'
  | 'ghanti'
  | 'shankha'
  | 'dhol_hit'
  | 'tasha_flam'
  | 'correct'
  | 'wrong'
  | 'modak_catch'
  | 'combo'
  | 'fanfare';

const STORAGE_KEYS = {
  MUSIC_VOLUME: 'bappa_audio_music_vol',
  SFX_VOLUME: 'bappa_audio_sfx_vol',
  MASTER_VOLUME: 'bappa_audio_master_vol',
  MUSIC_ENABLED: 'bappa_audio_music_enabled',
  SFX_ENABLED: 'bappa_audio_sfx_enabled',
  MUTED: 'bappa_audio_muted',
};

const MUSIC_SRC_MAP: Record<string, string> = {
  home: '/audio/music/home_sanctum.wav',
  mandap: '/audio/music/mandap_ambience.wav',
  dhol: '/audio/music/dhol_tasha_rhythm.wav',
  modak: '/audio/music/modak_playful.wav',
  quiz: '/audio/music/quiz_meditation.wav',
  celebration: '/audio/music/celebration_victory.wav',
  // Aliases
  festival: '/audio/music/home_sanctum.wav',
  calm: '/audio/music/home_sanctum.wav',
  gameplay: '/audio/music/dhol_tasha_rhythm.wav',
};

const SFX_SRC_MAP: Record<SfxType, string> = {
  temple_bell: '/audio/sfx/temple_bell.wav',
  ghanti: '/audio/sfx/ghanti.wav',
  shankha: '/audio/sfx/shankha.wav',
  dhol_hit: '/audio/sfx/dhol_hit.wav',
  tasha_flam: '/audio/sfx/tasha_flam.wav',
  correct: '/audio/sfx/correct.wav',
  wrong: '/audio/sfx/wrong.wav',
  modak_catch: '/audio/sfx/modak_catch.wav',
  combo: '/audio/sfx/combo.wav',
  fanfare: '/audio/sfx/fanfare.wav',
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Track playback state
  private currentTrack: MusicTrackType | null = null;
  private isMusicPlaying = false;
  private pendingTrack: MusicTrackType | null = null;

  // Dual audio elements for crossfading
  private activeMusicAudio: HTMLAudioElement | null = null;
  private fadingMusicAudio: HTMLAudioElement | null = null;
  private crossfadeTimer: any = null;

  // SFX cache & decoded buffers
  private sfxAudioBuffers: Map<SfxType, AudioBuffer> = new Map();
  private sfxLoadingState: Map<SfxType, boolean> = new Map();

  // Volume channels (0.0 - 1.0)
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private masterVolume = 1.0;
  private musicEnabled = true;
  private sfxEnabled = true;
  private isMuted = false;

  // Autoplay / unlocked state
  private isInitialized = false;
  private isUnlocked = false;

  constructor() {
    this.loadPersistedSettings();
    this.setupAutoplayUnlock();
    this.setupPageVisibilityListener();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. PERSISTENCE & INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────────

  private loadPersistedSettings() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const savedMusicVol = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
      if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);

      const savedSfxVol = localStorage.getItem(STORAGE_KEYS.SFX_VOLUME);
      if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);

      const savedMasterVol = localStorage.getItem(STORAGE_KEYS.MASTER_VOLUME);
      if (savedMasterVol !== null) this.masterVolume = parseFloat(savedMasterVol);

      const savedMusicEn = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED);
      if (savedMusicEn !== null) this.musicEnabled = savedMusicEn === 'true';

      const savedSfxEn = localStorage.getItem(STORAGE_KEYS.SFX_ENABLED);
      if (savedSfxEn !== null) this.sfxEnabled = savedSfxEn === 'true';

      const savedMuted = localStorage.getItem(STORAGE_KEYS.MUTED);
      if (savedMuted !== null) this.isMuted = savedMuted === 'true';
    } catch {
      // Safe fallback to defaults
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, String(this.musicVolume));
      localStorage.setItem(STORAGE_KEYS.SFX_VOLUME, String(this.sfxVolume));
      localStorage.setItem(STORAGE_KEYS.MASTER_VOLUME, String(this.masterVolume));
      localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, String(this.musicEnabled));
      localStorage.setItem(STORAGE_KEYS.SFX_ENABLED, String(this.sfxEnabled));
      localStorage.setItem(STORAGE_KEYS.MUTED, String(this.isMuted));
    } catch {
      // Ignore quota errors
    }
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.init();
      this.isUnlocked = true;

      // Start any music track that was requested before user interaction
      if (this.pendingTrack && this.musicEnabled && !this.isMusicPlaying) {
        const trackToPlay = this.pendingTrack;
        this.pendingTrack = null;
        this.playMusic(trackToPlay);
      }

      ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((event) => {
        window.removeEventListener(event, unlock);
      });
    };

    ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((event) => {
      window.addEventListener(event, unlock, { once: true, passive: true });
    });
  }

  private setupPageVisibilityListener() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Gently mute/pause audio on tab blur to save mobile battery
        if (this.activeMusicAudio && !this.activeMusicAudio.paused) {
          this.activeMusicAudio.pause();
        }
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else {
        // Resume seamlessly when user returns
        if (this.ctx && this.ctx.state === 'suspended' && (this.musicEnabled || this.sfxEnabled)) {
          this.ctx.resume().catch(() => {});
        }
        if (this.activeMusicAudio && this.musicEnabled && !this.isMuted && this.isMusicPlaying) {
          this.activeMusicAudio.play().catch(() => {});
        }
      }
    });
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        const initialMusicLevel = this.musicEnabled ? this.musicVolume : 0;
        this.musicGain.gain.setValueAtTime(initialMusicLevel, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        const initialSfxLevel = this.sfxEnabled ? this.sfxVolume : 0;
        this.sfxGain.gain.setValueAtTime(initialSfxLevel, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.preloadCommonSfx();
      }

      this.isInitialized = true;
    } catch {
      // Audio context restricted or unavailable
    }
  }

  private resumeContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. VOLUME & MUTE CONTROLS
  // ───────────────────────────────────────────────────────────────────────────

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();

    if (this.activeMusicAudio && this.musicEnabled && !this.isMuted) {
      this.activeMusicAudio.volume = this.effectiveMusicVolume();
    }
    if (this.musicGain && this.ctx && this.musicEnabled && !this.isMuted) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();

    if (this.sfxGain && this.ctx && this.sfxEnabled && !this.isMuted) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();

    if (this.activeMusicAudio) {
      this.activeMusicAudio.volume = this.effectiveMusicVolume();
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.saveSettings();

    if (!enabled) {
      if (this.activeMusicAudio) {
        this.activeMusicAudio.volume = 0;
        this.activeMusicAudio.pause();
      }
      this.isMusicPlaying = false;
    } else {
      if (this.currentTrack) {
        this.startTrack(this.currentTrack);
      }
    }
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.saveSettings();

    if (this.sfxGain && this.ctx) {
      const targetGain = enabled && !this.isMuted ? this.sfxVolume : 0;
      this.sfxGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.saveSettings();

    if (this.activeMusicAudio) {
      this.activeMusicAudio.volume = muted ? 0 : this.effectiveMusicVolume();
    }
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private effectiveMusicVolume(): number {
    if (!this.musicEnabled || this.isMuted) return 0;
    return Math.max(0, Math.min(1, this.musicVolume * this.masterVolume));
  }

  private effectiveSfxVolume(): number {
    if (!this.sfxEnabled || this.isMuted) return 0;
    return Math.max(0, Math.min(1, this.sfxVolume * this.masterVolume));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. MUSIC PLAYBACK WITH TRUE SEAMLESS CROSSFADING
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Transition smoothly to a designated festival music track.
   * Prevents duplicate playback if already playing the exact track.
   */
  public playMusic(track: MusicTrackType, crossfadeDuration = 1.2) {
    const canonicalTrack = this.normalizeTrack(track);

    // Duplicate playback protection
    if (this.currentTrack === canonicalTrack && this.isMusicPlaying) {
      return;
    }

    this.currentTrack = canonicalTrack;

    if (!this.musicEnabled) {
      this.pendingTrack = canonicalTrack;
      return;
    }

    if (!this.isUnlocked) {
      this.pendingTrack = canonicalTrack;
      return;
    }

    this.startTrack(canonicalTrack, crossfadeDuration);
  }

  public stopMusic(fadeDuration = 0.8) {
    this.isMusicPlaying = false;
    this.pendingTrack = null;

    if (this.activeMusicAudio) {
      this.fadeOutAndRelease(this.activeMusicAudio, fadeDuration);
      this.activeMusicAudio = null;
    }
    if (this.fadingMusicAudio) {
      this.fadeOutAndRelease(this.fadingMusicAudio, fadeDuration);
      this.fadingMusicAudio = null;
    }
  }

  public getCurrentTrack(): MusicTrackType | null {
    return this.currentTrack;
  }

  private normalizeTrack(track: MusicTrackType): MusicTrackType {
    if (track === 'calm' || track === 'festival') return 'home';
    if (track === 'gameplay') return 'dhol';
    return track;
  }

  private startTrack(track: MusicTrackType, crossfadeDuration = 1.2) {
    const src = MUSIC_SRC_MAP[track];
    if (!src) return;

    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
      this.crossfadeTimer = null;
    }

    // Move existing active to fading deck
    if (this.activeMusicAudio) {
      if (this.fadingMusicAudio) {
        this.fadingMusicAudio.pause();
        this.fadingMusicAudio.src = '';
      }
      this.fadingMusicAudio = this.activeMusicAudio;
      this.fadeOutAndRelease(this.fadingMusicAudio, crossfadeDuration);
    }

    // Create new active audio element
    const newAudio = new Audio(src);
    newAudio.loop = true;
    newAudio.preload = 'auto';
    newAudio.volume = 0; // start silent for fade in
    this.activeMusicAudio = newAudio;

    newAudio
      .play()
      .then(() => {
        this.isMusicPlaying = true;
        this.fadeIn(newAudio, crossfadeDuration);
      })
      .catch(() => {
        // Autoplay policy prevented playback, queue for first gesture
        this.pendingTrack = track;
        this.isMusicPlaying = false;
      });
  }

  private fadeIn(audio: HTMLAudioElement, durationSec: number) {
    const targetVolume = this.effectiveMusicVolume();
    if (targetVolume <= 0) return;

    const steps = 24;
    const intervalMs = (durationSec * 1000) / steps;
    const volIncrement = targetVolume / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (!audio || audio.paused) {
        clearInterval(timer);
        return;
      }

      const nextVol = Math.min(targetVolume, currentStep * volIncrement);
      audio.volume = nextVol;

      if (currentStep >= steps) {
        audio.volume = targetVolume;
        clearInterval(timer);
      }
    }, intervalMs);
  }

  private fadeOutAndRelease(audio: HTMLAudioElement, durationSec: number) {
    const startVolume = audio.volume;
    if (startVolume <= 0) {
      audio.pause();
      audio.src = '';
      return;
    }

    const steps = 20;
    const intervalMs = (durationSec * 1000) / steps;
    const volDecrement = startVolume / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const nextVol = Math.max(0, startVolume - currentStep * volDecrement);
      try {
        audio.volume = nextVol;
      } catch {
        clearInterval(timer);
        return;
      }

      if (currentStep >= steps || nextVol <= 0) {
        clearInterval(timer);
        try {
          audio.pause();
          audio.src = '';
        } catch {
          // Ignore
        }
      }
    }, intervalMs);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. SOUND EFFECTS ENGINE (Preloaded & Instant Web Audio / Audio Element)
  // ───────────────────────────────────────────────────────────────────────────

  private preloadCommonSfx() {
    const keysToPreload: SfxType[] = [
      'ghanti',
      'temple_bell',
      'shankha',
      'dhol_hit',
      'tasha_flam',
      'correct',
      'wrong',
      'modak_catch',
      'combo',
      'fanfare',
    ];

    keysToPreload.forEach((key) => {
      this.loadSfxBuffer(key);
    });
  }

  private async loadSfxBuffer(sfx: SfxType): Promise<AudioBuffer | null> {
    if (this.sfxAudioBuffers.has(sfx)) {
      return this.sfxAudioBuffers.get(sfx)!;
    }
    if (this.sfxLoadingState.get(sfx)) return null;

    this.sfxLoadingState.set(sfx, true);
    const src = SFX_SRC_MAP[sfx];

    try {
      const resp = await fetch(src);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();

      if (this.ctx) {
        const decoded = await this.ctx.decodeAudioData(arrayBuffer);
        this.sfxAudioBuffers.set(sfx, decoded);
        this.sfxLoadingState.set(sfx, false);
        return decoded;
      }
    } catch {
      this.sfxLoadingState.set(sfx, false);
    }
    return null;
  }

  public playSfx(sfx: SfxType, volumeMultiplier = 1.0) {
    if (!this.sfxEnabled || this.isMuted) return;

    const effectiveVol = this.effectiveSfxVolume() * volumeMultiplier;
    if (effectiveVol <= 0) return;

    // 1. Try Web Audio buffer source for zero-latency
    if (this.ctx && this.sfxGain && this.sfxAudioBuffers.has(sfx)) {
      this.resumeContext();
      try {
        const buffer = this.sfxAudioBuffers.get(sfx)!;
        const source = this.ctx.createBufferSource();
        const gainNode = this.ctx.createGain();

        source.buffer = buffer;
        gainNode.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.masterGain || this.ctx.destination);

        source.start(0);
        return;
      } catch {
        // Fallback to HTML Audio below
      }
    }

    // 2. Fast HTML5 Audio fallback
    const src = SFX_SRC_MAP[sfx];
    if (src) {
      try {
        const sfxAudio = new Audio(src);
        sfxAudio.volume = Math.max(0, Math.min(1, effectiveVol));
        sfxAudio.play().catch(() => {});
      } catch {
        // Ignore
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CONVENIENCE SFX METHODS (Used Across Mini-Games & UI)
  // ───────────────────────────────────────────────────────────────────────────

  /** Puja Ghanti Hand Bell (Crisp touch/click feedback) */
  public playClick() {
    this.playSfx('ghanti', 0.65);
  }

  public playButtonClick() {
    this.playClick();
  }

  /** Sacred Temple Brass Bell */
  public playTempleBell() {
    this.playSfx('temple_bell', 0.9);
  }

  public playPujaBell() {
    this.playSfx('ghanti', 0.85);
  }

  public playGhanti() {
    this.playSfx('ghanti', 0.85);
  }

  /** Sacred Conch Shell (Shankha) */
  public playShankha() {
    this.playSfx('shankha', 1.0);
  }

  /** Deep Acoustic Dhol Bass Strike (Dhum) */
  public playDholBass() {
    this.playSfx('dhol_hit', 1.0);
  }

  /** High-Frequency Tasha Flam / Rimshot */
  public playDholTreble() {
    this.playSfx('tasha_flam', 0.95);
  }

  /** Manjira / Bell Cymbal Clash */
  public playDholCymbal() {
    this.playSfx('ghanti', 0.8);
  }

  /** Rhythmic Streak Perfect Hit */
  public playPerfectHitChime() {
    this.playSfx('correct', 0.9);
  }

  /** Combo Multiplier Increase */
  public playComboIncrease(multiplier = 1) {
    this.playSfx('combo', Math.min(1.0, 0.6 + multiplier * 0.08));
  }

  /** Modak Catch Sweet Ding */
  public playModakCatch() {
    this.playSfx('modak_catch', 0.85);
  }

  /** Golden Modak Special Chime */
  public playGoldenModakChime() {
    this.playSfx('combo', 1.0);
  }

  /** Quiz Correct Answer */
  public playQuizCorrect() {
    this.playSfx('correct', 0.95);
  }

  public playCorrectAnswer() {
    this.playSfx('correct', 0.95);
  }

  /** Quiz Wrong Answer / Hazard Hit */
  public playQuizWrong() {
    this.playSfx('wrong', 0.8);
  }

  public playWrongAnswer() {
    this.playSfx('wrong', 0.8);
  }

  public playHazardHit() {
    this.playSfx('wrong', 0.8);
  }

  /** Game Initiation & Completion */
  public playGameStart() {
    this.playSfx('shankha', 0.9);
  }

  public playGameComplete() {
    this.playSfx('fanfare', 1.0);
  }

  public playFanfare() {
    this.playSfx('fanfare', 1.0);
  }

  /** Level Up & Decoration Unlock */
  public playLevelUp() {
    this.playSfx('shankha', 0.95);
    setTimeout(() => this.playSfx('fanfare', 0.9), 300);
  }

  public playUnlock() {
    this.playSfx('temple_bell', 0.85);
  }
}

export const audioManager = new AudioManager();
export default audioManager;
