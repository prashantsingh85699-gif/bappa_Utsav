# 🐘 BAPPA UTSAV
> **“Play • Celebrate • Create • Morya!”**

A polished, responsive, respectful, and joyful interactive Ganesh Chaturthi festival web experience built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and a zero-dependency **Web Audio API** procedural sound synthesizer.

---

## 🌟 Key Features

1. **Splash Screen**:
   - Lord Ganesha vector silhouette with radiant golden halo and diya particle effects.
   - Invocation: *॥ श्री गणेशाय नमः ॥*
   - AudioContext priming on first user touch/click.

2. **Devotee Profile & Customization**:
   - Customizable nickname and festive avatars (*Bal Ganesha*, *Dhol Master*, *Modak Chef*, *Diya Bearer*, *Aarti Devotee*).
   - Local persistence with graceful fallbacks.

3. **Festival Hub (Virtual Pandala Courtyard)**:
   - Dynamic Leveling System (Levels 1–6: *Aagman*, *Sthapana*, *Aarti Bhakt*, *Dhol Master*, *Maha Utsav King/Queen*, *Morya Legend*).
   - Real-time progress bar to next level tier.
   - High score tracking for each mini-game and unlocked mandap decoration counters.

4. **🥁 Mini-Game 1: Dhol Beat (Rhythm & Percussion)**:
   - 4-lane rhythm highway synced with the cadence of *“Bolo Ganpati Bappa Morya”*.
   - Keyboard (`[D]`, `[F]`, `[J]`, `[K]`) and touch pads on mobile.
   - Judgements: `PERFECT`, `GREAT`, `GOOD`, `MISS`.
   - Dynamic combo multiplier up to 5x with celebratory feedback.
   - Procedural dhol dual-head strokes (deep bass *dha* + sharp treble *ta*).

5. **🌸 Mini-Game 2: Mandap Designer (Stage Craft & Sandbox)**:
   - Decorate Lord Ganesha’s sacred mandap.
   - Placeable items: Diyas, Royal Brass Samai, Akhand Jyot, Mango Leaf Torans, Lotus Flowers, Velvet & Silk Curtains, Kolam & Peacock Rangoli, Kalash, and Modak Offerings.
   - Touch drag on mobile, mouse drag on desktop.
   - Rotate, resize (zoom in/out), delete, reset, and bring-to-front controls.
   - Creative score algorithm rating variety, symmetry, diya lighting, and holy offerings.
   - Preview mode & save state.

6. **🍬 Mini-Game 3: Modak Catch (Arcade Reflex)**:
   - Smooth 60fps physics basket catching game.
   - Touch drag, mouse tracking, or arrow keys (`←`, `→` / `A`, `D`).
   - Catch steamed modaks (+100 pts), golden modaks (+250 pts), motichoor laddoos (+150 pts), and sacred bananas (+80 pts).
   - Avoid hazards (spicy red chilis and firecrackers).
   - 3-lives system and consecutive catch combo multiplier.

7. **🧠 Mini-Game 4: Bappa Quiz (Wisdom & Lore)**:
   - 25+ culturally respectful trivia questions on history (Lokmanya Tilak 1893 initiative), symbolism (ears, trunk direction, mouse vahana, one tusk), traditions, and eco-friendly celebrations.
   - 10 randomized questions per round with 4 choices.
   - Immediate visual feedback, streak bonus multipliers, and detailed sacred lore explanation cards.

8. **Unified Scoring & Level Progression**:
   - Unified festival points across all activities.
   - Unlocks new mandap decorations automatically as player advances levels.

9. **Leaderboard**:
   - Tabs: *Today (Daily)*, *This Week*, *All-Time Legends*.
   - Live rank tracking, user avatar display, level title, and score sync.
   - Firestore integration ready with seamless local storage fallback.

10. **Festival Completion (Maha Aarti Ceremony)**:
    - Triggered after experiencing the 4 festival activities.
    - Full-screen celebration with flower showers, flickering diyas, fireworks/confetti, and achievement summary.

11. **Settings & Accessibility**:
    - Toggle festival tanpura ambient drone music on/off.
    - Toggle sound effects on/off.
    - Reduced motion mode for accessibility and lower-end mobile devices.
    - How-to-play guides and cultural tribute lore.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000/
```

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📁 Folder Structure

```
c:\Users\chtus\Downloads\Bappa Utsav\
├── index.html                  # HTML entrypoint with Outfit & Cinzel fonts
├── package.json                # Project scripts & dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Festive colors, keyframes & animations
├── postcss.config.js
└── src/
    ├── App.tsx                 # Root orchestrator, screen routing & modals
    ├── main.tsx                # React DOM root mounting
    ├── vite-env.d.ts           # Environment variable types
    ├── types/
    │   └── index.ts            # TypeScript interfaces (PlayerProfile, GameResult, etc.)
    ├── styles/
    │   └── globals.css         # Festive gradients, glassmorphism & scrollbar
    ├── services/
    │   ├── audioService.ts     # Procedural Web Audio API synthesizer
    │   ├── storageService.ts   # Safe LocalStorage persistence
    │   └── leaderboardService.ts# Dual-mode Firebase / Local leaderboard
    ├── utils/
    │   ├── scoring.ts          # Unified scoring, levels, and mandap rating algorithm
    │   └── confetti.ts         # Festive canvas confetti effects
    ├── data/
    │   ├── quizQuestions.ts    # 25+ curated, respectful festival trivia questions
    │   ├── decorations.ts      # Mandap decoration catalog (Diyas, Garlands, Curtains, etc.)
    │   ├── unlocks.ts          # Level-based unlocks progression
    │   └── defaultLeaders.ts   # Seed leaderboard participants
    ├── components/
    │   ├── common/
    │   │   ├── BappaMurti.tsx       # Detailed vector SVG of Lord Ganesha
    │   │   ├── DiyaVector.tsx       # Flickering earthen diya with glow
    │   │   ├── DecorItemVector.tsx  # Dynamic vector renderer for all 18 mandap items
    │   │   ├── FloatingPetals.tsx   # Ambient marigold & rose floating petals
    │   │   └── Header.tsx           # Global navigation, stats, and audio controls
    │   └── screens/
    │       ├── SplashScreen.tsx     # Animated entrance and audio primer
    │       ├── HomeScreen.tsx       # Main festival landing screen
    │       ├── HubScreen.tsx        # Activity cards and level progress
    │       ├── LeaderboardScreen.tsx# Daily, Weekly, All-Time leaderboards
    │       ├── CompletionScreen.tsx # Grand Maha Aarti celebration
    │       ├── ProfileModal.tsx     # Nickname and avatar selector
    │       ├── SettingsModal.tsx    # Audio, motion, guides and lore modal
    │       └── ResultModal.tsx      # Mini-game completion and unlocks popup
    └── games/
        ├── dhol/
        │   └── DholBeatGame.tsx     # 4-lane rhythm mini-game
        ├── mandap/
        │   └── MandapDesignerGame.tsx# Interactive mandap decoration sandbox
        ├── modak/
        │   └── ModakCatchGame.tsx   # Arcade falling items catching game
        └── quiz/
            └── BappaQuizGame.tsx    # 10-question trivia game with explanations
```

---

## ⚙️ Environment Variables (Firebase Setup)

By default, the game runs **100% offline** with pre-seeded realistic festival players and local storage persistence.

To connect to a live Firebase Firestore database:
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Create a `.env` file in the root directory with:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
3. The `leaderboardService.ts` layer automatically checks for these environment variables. When omitted, it gracefully defaults to local storage without any errors or disruption.

---

## 🎨 Design & Accessibility

- **Mobile First**: Optimized touch targets (minimum 48px), responsive flex and grid layouts that fit Android phones, tablets, and desktops.
- **Audio Autoplay Safety**: Complies with browser autoplay policies by initializing the Web Audio context on the first user interaction on the splash screen or header.
- **Zero Asset Failures**: All audio is generated procedurally via the Web Audio API (sine waves, harmonic partials, and envelope-shaped noise). All artwork is rendered as crisp, scalable SVGs.
- **Reduced Motion**: Easily accessible toggle in the Settings modal that stops floating petals and dampens heavy animations for users with motion sensitivities.

---

## 📜 Known Limitations & Considerations
- Procedural Web Audio requires user gesture initiation (a standard browser security requirement handled on the splash screen).
- Browser local storage is subject to domain clearance if browser history is wiped.
