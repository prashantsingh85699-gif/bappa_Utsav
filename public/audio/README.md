# Bappa Utsav — Audio Assets & Licensing Guide

All audio assets in Bappa Utsav are **100% original, copyright-free, and studio-quality** specifically composed and synthesized for this web game.

> **Zero Clapping / Audience Noise Guarantee:**  
> Unlike live concert or hall recordings, all tracks in Bappa Utsav are rendered from high-fidelity physical acoustic models and pure studio synthesizers. There is **zero audience coughing, clapping, or room echo** — providing a clean, professional, video-game grade auditory experience.

---

## 📜 Music Tracks (`public/audio/music/`)

All music tracks are high-fidelity 44.1kHz 16-bit uncompressed WAV compositions:

| File Name | Primary Instruments | Usage Screen | Mood & Musical Style |
| :--- | :--- | :--- | :--- |
| **`home_sanctum.wav`** | Sitar, Resonant Tanpura, Ghanti | **Home / Sanctum / Utsav Stage / Hub** | Raag Bhupali — Peaceful, sacred, meditative welcoming melody |
| **`mandap_ambience.wav`** | Santoor, Bansuri (Flute), Tanpura | **Mandap Designer (Sacred Altar)** | Raag Yaman — Auspicious evening prayer, serene altar craft |
| **`dhol_tasha_rhythm.wav`** | Acoustic Dhol, Tasha Flam, Ghungroo | **Dhol Beat Mini-Game** | Authentic 126 BPM Pune-Nashik Dhol-Tasha festive rhythm |
| **`modak_playful.wav`** | Tabla, Jal Tarang, Plucked Sitar, Manjira | **Modak Catch Arcade** | 132 BPM lively classical folk jugalbandi, bouncy and joyful |
| **`quiz_meditation.wav`** | Vedic Om Drone, Classical Bansuri | **Bappa Quiz (Wisdom Lore)** | Raag Kedar — Deep, contemplative, sacred wisdom atmosphere |
| **`celebration_victory.wav`** | Shankha Invocation, Dhol, Fanfare | **Completion / Maha Aarti / Results** | Triumphant sacred conch fanfare, celebratory bells and dhol bursts |

---

## 🔔 Sound Effects (`public/audio/sfx/`)

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

- **Equal-Power Crossfading**: Seamlessly transitions between screens (0.8s - 1.2s duration).
- **Duplicate Playback Prevention**: Guards against re-triggering tracks when moving between screens that share music.
- **Dedicated Volume Channels**: Music, Sound Effects, and Master volume with local storage persistence.
- **Autoplay Restriction Handling**: Unlocks cleanly on the user's first tap or click.
- **Page Visibility Management**: Automatically pauses audio when the user leaves the tab and resumes upon return.
