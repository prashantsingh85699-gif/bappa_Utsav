# Bappa Utsav — Audio Assets & Licensing Guide

All audio assets in Bappa Utsav are **100% legal, royalty-free, and copyright-safe** for web game distribution.

---

## 📜 Legal & Licensing Attributions

### 1. Music Tracks (`public/audio/music/`)

All music tracks are authentic classical Indian instrumental recordings:

| File Name | Primary Instruments | Usage Screen | License | Source / Attribution |
| :--- | :--- | :--- | :--- | :--- |
| **`home_sanctum.mp3`** | Mohan Veena, Tanpura | **Home / Sanctum / Utsav Stage / Hub** | Public Domain / CC0 | Classical Mohan Veena & Tanpura drone |
| **`mandap_ambience.mp3`** | Classical Veena, Temple texture | **Mandap Designer (Sacred Altar)** | CC BY-SA 3.0 / CC0 | Rendered on the Veena by L. Ramakrishnan (Wikimedia Commons) |
| **`dhol_tasha_rhythm.wav`** | Acoustic Dhol, Tasha Flam, Ghungroo | **Dhol Beat Mini-Game** | Original CC0 | 126 BPM seamless festival Dhol-Tasha loop |
| **`modak_playful.mp3`** | Classical Sitar & Tabla Jugalbandi | **Modak Catch Arcade** | Public Domain | Historic Sitar & Tabla Gramophone recording |
| **`quiz_meditation.mp3`** | Classical Bansuri & Raag Kedar | **Bappa Quiz (Wisdom Lore)** | CC BY-SA / Educational | Raag Kedar Classical Indian Flute (NCERT archive) |
| **`celebration_victory.mp3`** | Raag Hansdhwani & Temple Bells | **Completion / Maha Aarti** | CC BY-SA / Educational | Raag Hansdhwani (Traditional Ganesha Invocation, NCERT) |

---

### 2. Sound Effects (`public/audio/sfx/`)

All sound effects are studio-grade 44.1kHz 16-bit PCM uncompressed WAV files modeled after sacred Indian festival acoustic instruments:

| File Name | Sound Description | Gameplay Event |
| :--- | :--- | :--- |
| **`temple_bell.wav`** | Resonant brass temple bell with 4s acoustic decay | Sanctum entry, Milestone unlocks |
| **`ghanti.wav`** | Shimmering puja hand-bell chime | Tactile button click, Manjira chime |
| **`shankha.wav`** | Sacred conch shell invocation blast | Game start, Level up, Maha Aarti |
| **`dhol_hit.wav`** | Deep resonant bass Dhol strike | Dhol beat bass hit, Rhythm game |
| **`tasha_flam.wav`** | High-frequency snappy Tasha flam rimshot | Dhol beat treble strike |
| **`correct.wav`** | Harmonic ascending swaras (Sa -> Pa) | Quiz correct answer |
| **`wrong.wav`** | Gentle acoustic wooden thud | Quiz incorrect answer, Hazard collision |
| **`modak_catch.wav`** | Sweet glass/bell pickup chime | Modak collected in basket |
| **`combo.wav`** | Ascending harmonic pitch shimmer | Streak multiplier & Golden modak |
| **`fanfare.wav`** | Triumphant celebration brass fanfare | Round finished, Achievement unlock |

---

## 🎛️ Audio Engine Capabilities

- **Seamless Equal-Power Crossfade**: Automatically interpolates volume between outgoing and incoming tracks (0.8s - 1.2s duration).
- **Duplicate Playback Prevention**: Prevents duplicate tracks from playing if moving between screens sharing the same track (e.g. Home ↔ Hub).
- **Independent Channels**: `musicVolume` and `sfxVolume` sliders with master mute toggle.
- **LocalStorage Persistence**: Automatically remembers player volume preferences.
- **Autoplay Restriction Handling**: Unlocks seamlessly on the player's first interaction.
- **Mobile Battery Optimization**: Pauses audio when the tab is hidden and resumes when returned.
