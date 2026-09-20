import React, { useState, useEffect } from 'react';
import { audioManager } from '../../services/audioService';

export type BappaSwaroop = 'lalbaug' | 'siddhivinayak' | 'dagdusheth' | 'bal_ganesha';

export interface SwaroopMeta {
  id: BappaSwaroop;
  name: string;
  hindiName: string;
  tagline: string;
  icon: string;
  badgeBg: string;
}

export const BAPPA_SWAROOPS: SwaroopMeta[] = [
  {
    id: 'lalbaug',
    name: 'Lalbaugcha Raja',
    hindiName: 'लालबागचा राजा',
    tagline: 'विशाल राजसी रूप • Navasacha Ganpati',
    icon: '👑',
    badgeBg: 'from-amber-600 to-rose-700',
  },
  {
    id: 'siddhivinayak',
    name: 'Shree Siddhivinayak',
    hindiName: 'सिद्धिविनायक',
    tagline: 'स्वर्ण रूप • Dakshinabhimukhi Wish Fulfiller',
    icon: '✨',
    badgeBg: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'dagdusheth',
    name: 'Shrimant Dagdusheth',
    hindiName: 'दगडूशेठ हलवाई',
    tagline: 'रत्नजड़ित रूप • Sovereign of Riches & Joy',
    icon: '💎',
    badgeBg: 'from-purple-700 to-amber-600',
  },
  {
    id: 'bal_ganesha',
    name: 'Bal Ganesha',
    hindiName: 'बाल गणेश',
    tagline: 'मनोहर बाल रूप • Playful Sweet Blessings',
    icon: '🌸',
    badgeBg: 'from-pink-600 to-orange-500',
  },
];

const BLESSINGS = [
  'विघ्नहर्ता का दिव्य आशीर्वाद! 🌸',
  'मंगलमूर्ती मोरया! गणपती बाप्पा मोरया! 🐘',
  'ऋद्धि-सिद्धि दाता, सुख समृद्धि द्यो! 🪔',
  'वक्रतुण्ड महाकाय, सूर्यकोटि समप्रभ! 🕉️',
  'सर्व मंगल मांगल्ये, शिवे सर्वार्थ साधिके! ✨',
];

interface BappaMurtiProps {
  className?: string;
  size?: number;
  glow?: boolean;
  swaroop?: BappaSwaroop;
  showLightning?: boolean;
  interactive?: boolean;
  onSwaroopChange?: (swaroop: BappaSwaroop) => void;
}

export const BappaMurti: React.FC<BappaMurtiProps> = ({
  className = '',
  size = 260,
  glow = true,
  swaroop: controlledSwaroop,
  showLightning = true,
  interactive = true,
  onSwaroopChange,
}) => {
  // Local state or controlled
  const [internalSwaroop, setInternalSwaroop] = useState<BappaSwaroop>(() => {
    try {
      const saved = localStorage.getItem('bappa_preferred_swaroop');
      if (saved && ['lalbaug', 'siddhivinayak', 'dagdusheth', 'bal_ganesha'].includes(saved)) {
        return saved as BappaSwaroop;
      }
    } catch {}
    return 'lalbaug';
  });

  const activeSwaroop = controlledSwaroop || internalSwaroop;

  const [isFlashing, setIsFlashing] = useState(false);
  const [activeBlessing, setActiveBlessing] = useState<string | null>(null);

  const handleBappaClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();

    // Trigger divine audio chime
    try {
      audioManager.init();
      audioManager.playTempleBell();
    } catch {}

    // Trigger divine lightning burst
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 800);

    // Pick a random sacred blessing
    const randomBlessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setActiveBlessing(randomBlessing);
    setTimeout(() => setActiveBlessing(null), 2800);
  };

  // Color palletes for each Swaroop
  const getSwaroopTheme = () => {
    switch (activeSwaroop) {
      case 'siddhivinayak':
        return {
          skinGradId: 'skinGradGold',
          dhotiGradId: 'dhotiGradGold',
          crownGradId: 'goldCrown',
          auraColor: 'from-amber-400/50 via-yellow-300/40 to-yellow-600/30',
          lightningColor: '#FEF08A',
        };
      case 'dagdusheth':
        return {
          skinGradId: 'skinGradWarm',
          dhotiGradId: 'dhotiGradRoyalPurple',
          crownGradId: 'jeweledCrown',
          auraColor: 'from-purple-600/40 via-amber-400/40 to-emerald-500/25',
          lightningColor: '#67E8F9',
        };
      case 'bal_ganesha':
        return {
          skinGradId: 'skinGradSweet',
          dhotiGradId: 'dhotiGradYellow',
          crownGradId: 'sweetCrown',
          auraColor: 'from-rose-400/45 via-amber-300/40 to-pink-500/30',
          lightningColor: '#F472B6',
        };
      case 'lalbaug':
      default:
        return {
          skinGradId: 'skinGradSaffron',
          dhotiGradId: 'dhotiGradCrimson',
          crownGradId: 'royalMormukut',
          auraColor: 'from-amber-500/40 via-yellow-400/40 to-rose-600/35',
          lightningColor: '#FDE047',
        };
    }
  };

  const theme = getSwaroopTheme();

  return (
    <div
      onClick={handleBappaClick}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      title={interactive ? 'Click Bappa for Divine Lightning & Blessings! 🪔' : undefined}
    >
      {/* Radiant Divine Aura (Multi-layer Glow) */}
      {glow && (
        <>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${theme.auraColor} blur-2xl animate-pulse-glow pointer-events-none transition-all duration-700`}
            style={{ width: size * 1.18, height: size * 1.18 }}
          />
          {/* Pulsating energy halo */}
          <div
            className="absolute rounded-full border border-amber-300/30 blur-[1px] animate-divine-aura-pulse pointer-events-none"
            style={{ width: size * 1.05, height: size * 1.05 }}
          />
        </>
      )}

      {/* Divine Lightning Flash Explosion (upon tap) */}
      {isFlashing && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-radial from-amber-100/90 via-yellow-300/60 to-transparent blur-xl pointer-events-none animate-ping z-30"
          style={{ width: size * 1.4, height: size * 1.4 }}
        />
      )}

      {/* Floating Auspicious Blessing Banner */}
      {activeBlessing && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-600/95 via-rose-700/95 to-amber-700/95 text-amber-100 font-bold text-xs sm:text-sm border border-amber-300/80 shadow-[0_0_25px_rgba(245,158,11,0.8)] backdrop-blur-md animate-blessing-float pointer-events-none">
          {activeBlessing}
        </div>
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative transition-transform duration-300 ${
          interactive ? 'group-hover:scale-105 active:scale-95' : ''
        } drop-shadow-[0_12px_28px_rgba(245,158,11,0.5)] select-none`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="royalMormukut" x1="140" y1="10" x2="260" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.25" stopColor="#FDE047" />
            <stop offset="0.65" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="goldCrown" x1="150" y1="20" x2="250" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.3" stopColor="#FEF08A" />
            <stop offset="0.7" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="jeweledCrown" x1="140" y1="15" x2="260" y2="125" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0E7FF" />
            <stop offset="0.3" stopColor="#FBBF24" />
            <stop offset="0.7" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="sweetCrown" x1="150" y1="30" x2="250" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF3C7" />
            <stop offset="0.4" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>

          {/* Skin Gradients */}
          <linearGradient id="skinGradSaffron" x1="150" y1="100" x2="250" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FED7AA" />
            <stop offset="0.5" stopColor="#FDBA74" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="skinGradGold" x1="150" y1="100" x2="250" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="skinGradWarm" x1="150" y1="100" x2="250" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFEDD5" />
            <stop offset="0.5" stopColor="#FB923C" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>

          <linearGradient id="skinGradSweet" x1="150" y1="100" x2="250" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF1F2" />
            <stop offset="0.5" stopColor="#FECDD3" />
            <stop offset="1" stopColor="#FB7185" />
          </linearGradient>

          {/* Dhoti Gradients */}
          <linearGradient id="dhotiGradCrimson" x1="120" y1="260" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.3" stopColor="#EA580C" />
            <stop offset="1" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="dhotiGradGold" x1="120" y1="260" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.5" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="dhotiGradRoyalPurple" x1="120" y1="260" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.3" stopColor="#7E22CE" />
            <stop offset="1" stopColor="#3B0764" />
          </linearGradient>

          <linearGradient id="dhotiGradYellow" x1="120" y1="260" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF9C3" />
            <stop offset="0.5" stopColor="#FACC15" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>

          {/* Lotus */}
          <linearGradient id="lotusGrad" x1="80" y1="340" x2="320" y2="390" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDA4AF" />
            <stop offset="0.5" stopColor="#F43F5E" />
            <stop offset="1" stopColor="#9F1239" />
          </linearGradient>

          {/* Radial Halos */}
          <radialGradient id="haloGrad" cx="200" cy="170" r="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunburstGrad" cx="200" cy="170" r="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" stopOpacity="0.9" />
            <stop offset="0.3" stopColor="#FDE047" stopOpacity="0.6" />
            <stop offset="0.7" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="1" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>

          {/* Lightning Filter */}
          <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ─────────────────────────────────────────────────────────────
            DIVINE PRABHAVALI HALO & CELESTIAL SUNBURST
           ───────────────────────────────────────────────────────────── */}
        <circle cx="200" cy="170" r="145" fill="url(#haloGrad)" />

        {/* Rotating Celestial Chakra (Spokes of Dharma) */}
        <g className="animate-chakra-spin-slow" style={{ transformOrigin: '200px 170px' }}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <line
              key={angle}
              x1="200"
              y1="170"
              x2={200 + 138 * Math.cos((angle * Math.PI) / 180)}
              y2={170 + 138 * Math.sin((angle * Math.PI) / 180)}
              stroke="#FDE047"
              strokeWidth="1.2"
              strokeOpacity="0.6"
              strokeDasharray="4 6"
            />
          ))}
          <circle cx="200" cy="170" r="136" stroke="#FBBF24" strokeWidth="2.2" strokeDasharray="8 4" opacity="0.8" />
        </g>

        {/* Counter-rotating subtle energy ring */}
        <g className="animate-chakra-spin-reverse" style={{ transformOrigin: '200px 170px' }}>
          <circle cx="200" cy="170" r="122" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 7" opacity="0.6" />
        </g>

        {/* ─────────────────────────────────────────────────────────────
            DYNAMIC DIVINE LIGHTNING ARCS (Vidyut Prabha)
           ───────────────────────────────────────────────────────────── */}
        {showLightning && (
          <g id="divineLightningArcs" filter="url(#lightningGlow)">
            {/* Top-Right Crackling Lightning Bolt */}
            <path
              d="M 200 45 L 225 75 L 215 90 L 255 120 L 245 135 L 295 165"
              stroke={theme.lightningColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-lightning-arc-1"
            />

            {/* Top-Left Crackling Lightning Bolt */}
            <path
              d="M 200 45 L 175 75 L 185 90 L 145 120 L 155 135 L 105 165"
              stroke={theme.lightningColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-lightning-arc-2"
            />

            {/* Halo Perimeter Electric Sparks */}
            <path
              d="M 95 190 Q 75 140 115 105 L 130 118 Q 165 75 200 68"
              stroke="#FFF"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="animate-lightning-arc-3"
            />
            <path
              d="M 305 190 Q 325 140 285 105 L 270 118 Q 235 75 200 68"
              stroke="#FFF"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="animate-lightning-arc-3"
            />

            {/* Radiant Trishul / Lightning Spark above Mukut */}
            <circle cx="200" cy="35" r="4.5" fill="#FFF" className="animate-pulse" />
            <path d="M 194 35 L 206 35 M 200 29 L 200 41" stroke="#FDE047" strokeWidth="2" />
          </g>
        )}

        {/* ─────────────────────────────────────────────────────────────
            LOTUS THRONE BASE
           ───────────────────────────────────────────────────────────── */}
        <g id="lotusBase">
          <ellipse cx="200" cy="365" rx="130" ry="24" fill="#881337" opacity="0.6" />
          <path d="M100 365 C130 335, 170 345, 200 375 C170 375, 130 375, 100 365 Z" fill="url(#lotusGrad)" />
          <path d="M300 365 C270 335, 230 345, 200 375 C230 375, 270 375, 300 365 Z" fill="url(#lotusGrad)" />
          <path d="M140 372 C170 340, 200 340, 200 380 C170 380, 150 378, 140 372 Z" fill="url(#lotusGrad)" />
          <path d="M260 372 C230 340, 200 340, 200 380 C230 380, 250 378, 260 372 Z" fill="url(#lotusGrad)" />
          <path d="M170 375 C190 350, 210 350, 230 375 C210 382, 190 382, 170 375 Z" fill="#FFE4E6" />
        </g>

        {/* ─────────────────────────────────────────────────────────────
            BODY & PITAMBAR DHOTI
           ───────────────────────────────────────────────────────────── */}
        <g id="body">
          {/* Seated legs in Lalitasana */}
          <path
            d="M110 330 C110 290, 160 280, 200 295 C240 280, 290 290, 290 330 C290 360, 250 365, 200 365 C150 365, 110 360, 110 330 Z"
            fill={`url(#${theme.dhotiGradId})`}
          />
          {/* Dhoti Zari & Pleats */}
          <path d="M185 295 L180 365 L220 365 L215 295 Z" fill="#F59E0B" />
          <path d="M190 300 L188 365 M200 298 L200 365 M210 300 L212 365" stroke="#B45309" strokeWidth="1.5" />

          {/* Pot-Belly (Lambodara) */}
          <circle cx="200" cy="275" r="58" fill={`url(#${theme.skinGradId})`} />

          {/* Sacred Yajnopavita Thread */}
          <path d="M165 240 Q190 270 230 310" stroke="#78350F" strokeWidth="2.5" fill="none" />
          <path d="M165 242 Q190 272 230 312" stroke="#FEF08A" strokeWidth="1" fill="none" strokeDasharray="4 2" />

          {/* Dagdusheth Swaroop Heavy Tiered Pearl & Emerald Kanthi Haar */}
          {activeSwaroop === 'dagdusheth' && (
            <g id="dagdushethHaar">
              <path d="M 170 248 Q 200 282 230 248" stroke="#FDE047" strokeWidth="6" fill="none" />
              <path d="M 175 258 Q 200 292 225 258" stroke="#10B981" strokeWidth="4" fill="none" />
              <circle cx="200" cy="285" r="7" fill="#E11D48" stroke="#FDE047" strokeWidth="1.5" />
            </g>
          )}

          {/* Lalbaugcha Raja Grand Royal Golden Angavastra */}
          {activeSwaroop === 'lalbaug' && (
            <path d="M 155 235 Q 185 275 190 340" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
          )}
        </g>

        {/* ─────────────────────────────────────────────────────────────
            FOUR DIVINE ARMS & WEAPONS
           ───────────────────────────────────────────────────────────── */}
        <g id="arms">
          {/* Upper Right Hand (Ankusha Axe) */}
          <path d="M145 220 C120 200, 105 180, 112 165 C118 152, 135 158, 142 180" stroke={`url(#${theme.skinGradId})`} strokeWidth="18" strokeLinecap="round" />
          <path d="M102 160 L115 130 M110 142 Q92 142 100 128 Q108 140 122 142" stroke="#FDE047" strokeWidth="3.2" fill="none" strokeLinecap="round" />

          {/* Upper Left Hand (Pasha Noose / Lotus for Siddhivinayak) */}
          <path d="M255 220 C280 200, 295 180, 288 165 C282 152, 265 158, 258 180" stroke={`url(#${theme.skinGradId})`} strokeWidth="18" strokeLinecap="round" />
          {activeSwaroop === 'siddhivinayak' ? (
            /* Sacred Lotus Blossom for Siddhivinayak */
            <g transform="translate(284, 138) scale(0.9)">
              <circle cx="10" cy="10" r="10" fill="#FDA4AF" />
              <path d="M 10 0 C 4 7, 4 13, 10 20 C 16 13, 16 7, 10 0 Z" fill="#F43F5E" />
              <path d="M 0 10 C 7 4, 13 4, 20 10 C 13 16, 7 16, 0 10 Z" fill="#FB7185" />
            </g>
          ) : (
            /* Pasha (Golden Loop Noose) */
            <ellipse cx="292" cy="145" rx="10" ry="16" stroke="#FDE047" strokeWidth="3" fill="none" transform="rotate(15 292 145)" />
          )}

          {/* Lower Right Hand (Abhaya Mudra / Blessings) */}
          <path d="M150 245 C125 255, 118 280, 130 295" stroke={`url(#${theme.skinGradId})`} strokeWidth="17" strokeLinecap="round" />
          <circle cx="128" cy="295" r="9" fill="#FDBA74" />
          <circle cx="128" cy="295" r="3.8" fill="#DC2626" />
          {/* Radiant blessing rays from palm */}
          <path d="M 120 288 L 115 285 M 120 302 L 115 305 M 115 295 L 108 295" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />

          {/* Lower Left Hand (Holding Golden Modak Thali) */}
          <path d="M250 245 C275 255, 280 275, 268 295" stroke={`url(#${theme.skinGradId})`} strokeWidth="17" strokeLinecap="round" />
          
          {/* Modak Plate (Extra huge mountain for Bal Ganesha) */}
          {activeSwaroop === 'bal_ganesha' ? (
            <g id="balGaneshaModakHeap">
              <ellipse cx="270" cy="295" rx="18" ry="9" fill="#F59E0B" />
              <path d="M258 295 C258 276, 270 268, 270 268 C270 268, 282 276, 282 295 Z" fill="#FEF08A" stroke="#EA580C" strokeWidth="1.5" />
              <circle cx="270" cy="282" r="3" fill="#F59E0B" />
              <circle cx="264" cy="292" r="4.5" fill="#FEF08A" />
              <circle cx="276" cy="292" r="4.5" fill="#FEF08A" />
            </g>
          ) : (
            <g id="regularModak">
              <ellipse cx="270" cy="295" rx="14" ry="7" fill="#F59E0B" />
              <path d="M265 295 C265 285, 270 280, 270 280 C270 280, 275 285, 275 295 Z" fill="#FEF08A" stroke="#EA580C" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* ─────────────────────────────────────────────────────────────
            LARGE EARS (Surpa-Karna)
           ───────────────────────────────────────────────────────────── */}
        <g id="ears">
          {/* Left Ear */}
          <path d="M165 150 C125 125, 95 160, 110 200 C125 230, 160 215, 165 205 Z" fill={`url(#${theme.skinGradId})`} stroke="#EA580C" strokeWidth="1.5" />
          <path d="M155 160 C130 145, 115 170, 125 195" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.6" />

          {/* Right Ear */}
          <path d="M235 150 C275 125, 305 160, 290 200 C275 230, 240 215, 235 205 Z" fill={`url(#${theme.skinGradId})`} stroke="#EA580C" strokeWidth="1.5" />
          <path d="M245 160 C270 145, 285 170, 275 195" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.6" />

          {/* Gold Ear Ornaments (Kundal) */}
          <circle cx="118" cy="210" r="5" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
          <circle cx="282" cy="210" r="5" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
        </g>

        {/* ─────────────────────────────────────────────────────────────
            DIVINE FACE, TILAK, AND TRUNK
           ───────────────────────────────────────────────────────────── */}
        <g id="face">
          <ellipse cx="200" cy="180" rx="42" ry="46" fill={`url(#${theme.skinGradId})`} />

          {/* Gentle Loving Eyes */}
          <path d="M176 168 Q184 163 192 168" stroke="#451A03" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="184" cy="172" r={activeSwaroop === 'bal_ganesha' ? 3.8 : 2.5} fill="#451A03" />
          {activeSwaroop === 'bal_ganesha' && <circle cx="185" cy="170" r="1.2" fill="#FFF" />}

          <path d="M208 168 Q216 163 224 168" stroke="#451A03" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="216" cy="172" r={activeSwaroop === 'bal_ganesha' ? 3.8 : 2.5} fill="#451A03" />
          {activeSwaroop === 'bal_ganesha' && <circle cx="217" cy="170" r="1.2" fill="#FFF" />}

          {/* Sacred Chandan Tilak / Trinetra */}
          {activeSwaroop === 'siddhivinayak' ? (
            /* Golden Glowing Trinetra for Siddhivinayak */
            <g id="trinetra">
              <ellipse cx="200" cy="148" rx="6" ry="10" fill="#FDE047" stroke="#EA580C" strokeWidth="1.5" />
              <circle cx="200" cy="148" r="3" fill="#DC2626" />
              <circle cx="200" cy="148" r="1" fill="#FFF" />
            </g>
          ) : activeSwaroop === 'lalbaug' ? (
            /* Iconic Royal Chandan Crescent Tilak of Lalbaugcha Raja */
            <g id="lalbaugTilak">
              <path d="M 188 145 Q 200 156 212 145" stroke="#FEF08A" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 197 138 Q 200 130 203 138 Q 200 152 197 138 Z" fill="#DC2626" />
              <circle cx="200" cy="154" r="3" fill="#F59E0B" />
            </g>
          ) : (
            /* Classic Sacred Tripundra Tilak */
            <g id="classicTilak">
              <path d="M192 145 H208 M190 148 H210 M192 151 H208" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M197 142 Q200 134 203 142 Q200 156 197 142 Z" fill="#DC2626" />
              <circle cx="200" cy="155" r="2.5" fill="#F59E0B" />
            </g>
          )}

          {/* Tusks */}
          <path d="M182 202 Q176 218 178 225 Q185 220 186 205 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.8" />
          <path d="M218 202 L223 209 L217 210 Z" fill="#FFFFFF" />

          {/* ─────────────────────────────────────────────────────────
              CURVED TRUNK:
              - Siddhivinayak: DAKSHINABHIMUKHI (Right-turned trunk)
              - Lalbaug / Dagdusheth / Bal: VAMAMUKHI (Left-turned trunk)
             ───────────────────────────────────────────────────────── */}
          {activeSwaroop === 'siddhivinayak' ? (
            /* Right-turned Trunk (Iconic to Siddhivinayak) */
            <g id="rightTurnedTrunk">
              <path
                d="M207 195 
                   C207 235, 215 245, 215 260 
                   C215 285, 185 285, 165 280 
                   C145 275, 140 262, 148 258 
                   C156 254, 170 265, 185 264 
                   C195 263, 195 240, 193 195 Z"
                fill={`url(#${theme.skinGradId})`}
                stroke="#EA580C"
                strokeWidth="1.5"
              />
              <path d="M208 225 Q200 230 193 225" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
              <path d="M209 240 Q201 245 194 240" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
              <circle cx="152" cy="260" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
            </g>
          ) : (
            /* Left-turned Trunk */
            <g id="leftTurnedTrunk">
              <path
                d="M193 195 
                   C193 235, 185 245, 185 260 
                   C185 285, 215 285, 235 280 
                   C255 275, 260 262, 252 258 
                   C244 254, 230 265, 215 264 
                   C205 263, 205 240, 207 195 Z"
                fill={`url(#${theme.skinGradId})`}
                stroke="#EA580C"
                strokeWidth="1.5"
              />
              <path d="M192 225 Q200 230 207 225" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
              <path d="M191 240 Q199 245 206 240" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
              <circle cx="248" cy="260" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* ─────────────────────────────────────────────────────────────
            DISTINCTIVE ROYAL CROWNS (Mukut) FOR EACH SWAROOP
           ───────────────────────────────────────────────────────────── */}
        {activeSwaroop === 'lalbaug' ? (
          /* Lalbaugcha Raja: Royal Mormukut with Peacock Crest */
          <g id="crownLalbaug">
            <path d="M162 142 L172 55 L200 28 L228 55 L238 142 Z" fill="url(#royalMormukut)" stroke="#B45309" strokeWidth="1.8" />
            {/* Peacock Feather (Mor-Pankh) crowning glory */}
            <g id="morPankh" transform="translate(200, 22)">
              <ellipse cx="0" cy="-12" rx="10" ry="15" fill="#047857" stroke="#FDE047" strokeWidth="1.2" />
              <ellipse cx="0" cy="-12" rx="6" ry="9" fill="#1D4ED8" />
              <circle cx="0" cy="-12" r="3" fill="#FBBF24" />
            </g>
            {/* Royal Ruby Diamond Medallion */}
            <circle cx="200" cy="50" r="5.5" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
            <path d="M185 85 L200 68 L215 85 L200 102 Z" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
            <ellipse cx="200" cy="116" rx="20" ry="8" fill="#FBBF24" stroke="#991B1B" strokeWidth="1.5" />
          </g>
        ) : activeSwaroop === 'dagdusheth' ? (
          /* Dagdusheth Halwai: Heavily Jeweled Crown */
          <g id="crownDagdusheth">
            <path d="M165 142 L172 60 L200 35 L228 60 L235 142 Z" fill="url(#jeweledCrown)" stroke="#FBBF24" strokeWidth="2" />
            {/* Emeralds and Rubies Inset */}
            <circle cx="200" cy="50" r="6" fill="#10B981" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="182" cy="75" r="4.5" fill="#DC2626" />
            <circle cx="218" cy="75" r="4.5" fill="#DC2626" />
            <circle cx="188" cy="112" r="4" fill="#10B981" />
            <circle cx="212" cy="112" r="4" fill="#10B981" />
            <circle cx="200" cy="115" r="5" fill="#F43F5E" />
            <circle cx="200" cy="30" r="6" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
          </g>
        ) : activeSwaroop === 'bal_ganesha' ? (
          /* Bal Ganesha: Sweet cute crown with lotus petal finial */
          <g id="crownBal">
            <path d="M168 142 L176 80 L200 60 L224 80 L232 142 Z" fill="url(#sweetCrown)" stroke="#EA580C" strokeWidth="1.5" />
            <circle cx="200" cy="75" r="4.5" fill="#F43F5E" />
            <circle cx="200" cy="52" r="6" fill="#FEF08A" stroke="#EA580C" strokeWidth="1" />
            <ellipse cx="200" cy="120" rx="16" ry="6" fill="#FDE047" />
          </g>
        ) : (
          /* Siddhivinayak: Golden Splendor Crown */
          <g id="crownSiddhivinayak">
            <path d="M165 142 L175 62 L200 38 L225 62 L235 142 Z" fill="url(#goldCrown)" stroke="#B45309" strokeWidth="1.8" />
            <circle cx="200" cy="52" r="4.5" fill="#DC2626" />
            <path d="M185 85 L200 70 L215 85 L200 100 Z" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.5" />
            <ellipse cx="200" cy="116" rx="17" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="200" cy="33" r="5.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1.2" />
          </g>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MOOSHAK MAHARAJ (Mouse Vahana)
           ───────────────────────────────────────────────────────────── */}
        <g id="mooshak" transform="translate(295, 330) scale(0.65)">
          <ellipse cx="40" cy="40" rx="26" ry="16" fill="#9CA3AF" />
          <circle cx="58" cy="25" r="9" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1" />
          <circle cx="58" cy="25" r="5" fill="#F472B6" />
          <path d="M50 32 L70 40 L50 48 Z" fill="#9CA3AF" />
          <circle cx="70" cy="40" r="2.5" fill="#1F2937" />
          <circle cx="56" cy="34" r="2" fill="#111827" />
          <path d="M16 42 Q5 30 15 20 Q22 15 18 10" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M58 44 C62 42, 64 42, 66 45" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M65 42 Q68 37 71 42 Z" fill="#FDE047" stroke="#EA580C" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE SWAROOP SELECTOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface BappaSwaroopSelectorProps {
  currentSwaroop: BappaSwaroop;
  onSelectSwaroop: (swaroop: BappaSwaroop) => void;
  className?: string;
}

export const BappaSwaroopSelector: React.FC<BappaSwaroopSelectorProps> = ({
  currentSwaroop,
  onSelectSwaroop,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap ${className}`}>
      {BAPPA_SWAROOPS.map((sw) => {
        const isSelected = currentSwaroop === sw.id;
        return (
          <button
            key={sw.id}
            onClick={() => {
              audioManager.playClick();
              try {
                localStorage.setItem('bappa_preferred_swaroop', sw.id);
              } catch {}
              onSelectSwaroop(sw.id);
            }}
            className={`px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm border ${
              isSelected
                ? `bg-gradient-to-r ${sw.badgeBg} text-amber-100 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 ring-1 ring-yellow-300/60`
                : 'bg-black/50 hover:bg-black/70 text-amber-200/80 border-amber-500/25 hover:border-amber-400/50'
            }`}
            title={sw.tagline}
          >
            <span>{sw.icon}</span>
            <span className="leading-tight">{sw.name}</span>
          </button>
        );
      })}
    </div>
  );
};
