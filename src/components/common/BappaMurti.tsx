import React from 'react';

interface BappaMurtiProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const BappaMurti: React.FC<BappaMurtiProps> = ({ className = '', size = 260, glow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-400/35 to-rose-500/25 blur-2xl animate-pulse-glow pointer-events-none"
          style={{ width: size * 1.1, height: size * 1.1 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_10px_25px_rgba(245,158,11,0.45)] select-none"
      >
        <defs>
          <linearGradient id="goldCrown" x1="150" y1="20" x2="250" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.3" stopColor="#FDE047" />
            <stop offset="0.7" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="150" y1="100" x2="250" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FED7AA" />
            <stop offset="0.5" stopColor="#FDBA74" />
            <stop offset="1" stopColor="#FB923C" />
          </linearGradient>

          <linearGradient id="dhotiGrad" x1="120" y1="260" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="lotusGrad" x1="80" y1="340" x2="320" y2="390" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDA4AF" />
            <stop offset="0.5" stopColor="#F43F5E" />
            <stop offset="1" stopColor="#9F1239" />
          </linearGradient>

          <radialGradient id="haloGrad" cx="200" cy="180" r="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" stopOpacity="0.7" />
            <stop offset="0.6" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radiant Divine Halo (Prabhavali) */}
        <circle cx="200" cy="170" r="135" fill="url(#haloGrad)" />
        <circle cx="200" cy="170" r="125" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.75" />

        {/* Lotus Throne Base */}
        <g id="lotusBase">
          <ellipse cx="200" cy="365" rx="130" ry="24" fill="#881337" opacity="0.6" />
          {/* Lotus Petals */}
          <path d="M100 365 C130 335, 170 345, 200 375 C170 375, 130 375, 100 365 Z" fill="url(#lotusGrad)" />
          <path d="M300 365 C270 335, 230 345, 200 375 C230 375, 270 375, 300 365 Z" fill="url(#lotusGrad)" />
          <path d="M140 372 C170 340, 200 340, 200 380 C170 380, 150 378, 140 372 Z" fill="url(#lotusGrad)" />
          <path d="M260 372 C230 340, 200 340, 200 380 C230 380, 250 378, 260 372 Z" fill="url(#lotusGrad)" />
          <path d="M170 375 C190 350, 210 350, 230 375 C210 382, 190 382, 170 375 Z" fill="#FFE4E6" />
        </g>

        {/* Body & Dhoti */}
        <g id="body">
          {/* Seated legs in Lalitasana */}
          <path d="M110 330 C110 290, 160 280, 200 295 C240 280, 290 290, 290 330 C290 360, 250 365, 200 365 C150 365, 110 360, 110 330 Z" fill="url(#dhotiGrad)" />
          {/* Folded dhoti pleats & gold border */}
          <path d="M185 295 L180 365 L220 365 L215 295 Z" fill="#F59E0B" />
          <path d="M190 300 L188 365 M200 298 L200 365 M210 300 L212 365" stroke="#B45309" strokeWidth="1.5" />

          {/* Large Round Pot-Belly (Lambodara) */}
          <circle cx="200" cy="275" r="58" fill="url(#skinGrad)" />
          {/* Sacred Thread (Yajnopavita / Nagabandha) across chest */}
          <path d="M165 240 Q190 270 230 310" stroke="#78350F" strokeWidth="2.5" fill="none" />
          <path d="M165 242 Q190 272 230 312" stroke="#FEF08A" strokeWidth="1" fill="none" strokeDasharray="4 2" />
        </g>

        {/* Lord Ganesha's Four Divine Arms */}
        <g id="arms">
          {/* Upper Right Hand (Holding Ankusha Axe) */}
          <path d="M145 220 C120 200, 105 180, 112 165 C118 152, 135 158, 142 180" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />
          {/* Ankusha (Goad) */}
          <path d="M102 160 L115 130 M110 142 Q92 142 100 128 Q108 140 122 142" stroke="#FDE047" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Upper Left Hand (Holding Pasha Noose) */}
          <path d="M255 220 C280 200, 295 180, 288 165 C282 152, 265 158, 258 180" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />
          {/* Pasha (Golden Loop Noose) */}
          <ellipse cx="292" cy="145" rx="10" ry="16" stroke="#FDE047" strokeWidth="3" fill="none" transform="rotate(15 292 145)" />

          {/* Lower Right Hand (Abhaya Mudra - Bestowing Blessings) */}
          <path d="M150 245 C125 255, 118 280, 130 295" stroke="url(#skinGrad)" strokeWidth="17" strokeLinecap="round" />
          {/* Blessing Palm */}
          <circle cx="128" cy="295" r="9" fill="#FDBA74" />
          <circle cx="128" cy="295" r="3.5" fill="#DC2626" /> {/* Sacred Red Swastik dot */}

          {/* Lower Left Hand (Holding Golden Modak Thali) */}
          <path d="M250 245 C275 255, 280 275, 268 295" stroke="url(#skinGrad)" strokeWidth="17" strokeLinecap="round" />
          {/* Small Gold Bowl & Modak */}
          <ellipse cx="270" cy="295" rx="14" ry="7" fill="#F59E0B" />
          <path d="M265 295 C265 285, 270 280, 270 280 C270 280, 275 285, 275 295 Z" fill="#FEF08A" stroke="#EA580C" strokeWidth="1" />
        </g>

        {/* Large Divine Ears (Surpa-Karna) */}
        <g id="ears">
          {/* Left Ear */}
          <path d="M165 150 C125 125, 95 160, 110 200 C125 230, 160 215, 165 205 Z" fill="url(#skinGrad)" stroke="#EA580C" strokeWidth="1.5" />
          {/* Left Ear Inner Detailing */}
          <path d="M155 160 C130 145, 115 170, 125 195" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.6" />

          {/* Right Ear */}
          <path d="M235 150 C275 125, 305 160, 290 200 C275 230, 240 215, 235 205 Z" fill="url(#skinGrad)" stroke="#EA580C" strokeWidth="1.5" />
          {/* Right Ear Inner Detailing */}
          <path d="M245 160 C270 145, 285 170, 275 195" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.6" />
        </g>

        {/* Divine Head & Face */}
        <g id="face">
          <ellipse cx="200" cy="180" rx="42" ry="46" fill="url(#skinGrad)" />

          {/* Gentle Loving Eyes */}
          <path d="M176 168 Q184 163 192 168" stroke="#451A03" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="184" cy="172" r="2.5" fill="#451A03" />

          <path d="M208 168 Q216 163 224 168" stroke="#451A03" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="216" cy="172" r="2.5" fill="#451A03" />

          {/* Sacred Triratna / Chandan Tilak (Tripundra & Vermilion) */}
          <path d="M192 145 H208 M190 148 H210 M192 151 H208" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M197 142 Q200 134 203 142 Q200 156 197 142 Z" fill="#DC2626" />
          <circle cx="200" cy="155" r="2.5" fill="#F59E0B" />

          {/* Single Intact Tusk (Right side of Bappa) & Broken Tusk (Left) */}
          <path d="M182 202 Q176 218 178 225 Q185 220 186 205 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.8" />
          <path d="M218 202 L223 209 L217 210 Z" fill="#FFFFFF" /> {/* Broken tusk */}

          {/* Majestic Curved Trunk (Vamamukhi - curved leftwards toward modak) */}
          <path 
            d="M193 195 
               C193 235, 185 245, 185 260 
               C185 285, 215 285, 235 280 
               C255 275, 260 262, 252 258 
               C244 254, 230 265, 215 264 
               C205 263, 205 240, 207 195 Z" 
            fill="url(#skinGrad)" 
            stroke="#EA580C" 
            strokeWidth="1.5"
          />
          {/* Trunk Gold Rings & Tilak */}
          <path d="M192 225 Q200 230 207 225" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
          <path d="M191 240 Q199 245 206 240" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
          <circle cx="248" cy="260" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1" /> {/* Modak morsel on trunk */}
        </g>

        {/* Majestic Royal Crown (Mukut) */}
        <g id="crown">
          <path d="M165 142 L175 65 L200 40 L225 65 L235 142 Z" fill="url(#goldCrown)" stroke="#B45309" strokeWidth="1.5" />
          {/* Crown Jewels & Engravings */}
          <circle cx="200" cy="55" r="4" fill="#E11D48" />
          <path d="M185 85 L200 70 L215 85 L200 100 Z" fill="#E11D48" stroke="#FEF08A" strokeWidth="1.5" />
          <ellipse cx="200" cy="115" rx="16" ry="7" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <circle cx="178" cy="120" r="3" fill="#10B981" />
          <circle cx="222" cy="120" r="3" fill="#10B981" />
          <circle cx="200" cy="115" r="3.5" fill="#DC2626" />
          {/* Crown Top Golden Kalash Finial */}
          <circle cx="200" cy="35" r="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
        </g>

        {/* Sweet Mooshak (Mouse Vahana) at bottom right */}
        <g id="mooshak" transform="translate(295, 330) scale(0.65)">
          {/* Body */}
          <ellipse cx="40" cy="40" rx="26" ry="16" fill="#9CA3AF" />
          {/* Ears */}
          <circle cx="58" cy="25" r="9" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1" />
          <circle cx="58" cy="25" r="5" fill="#F472B6" />
          {/* Head & Snout */}
          <path d="M50 32 L70 40 L50 48 Z" fill="#9CA3AF" />
          <circle cx="70" cy="40" r="2.5" fill="#1F2937" /> {/* Nose */}
          <circle cx="56" cy="34" r="2" fill="#111827" /> {/* Eye */}
          {/* Long curled tail */}
          <path d="M16 42 Q5 30 15 20 Q22 15 18 10" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Tiny hands offering Modak */}
          <path d="M58 44 C62 42, 64 42, 66 45" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M65 42 Q68 37 71 42 Z" fill="#FDE047" stroke="#EA580C" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};
