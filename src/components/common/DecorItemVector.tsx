import React from 'react';
import { DiyaVector } from './DiyaVector';

interface DecorItemVectorProps {
  svgType: string;
  className?: string;
  width?: number;
  height?: number;
}

export const DecorItemVector: React.FC<DecorItemVectorProps> = ({ svgType, className = '', width, height }) => {
  switch (svgType) {
    case 'clay_diya':
      return <DiyaVector size={width || 56} className={className} />;

    case 'brass_samai':
      return (
        <svg width={width || 60} height={height || 120} viewBox="0 0 60 120" fill="none" className={className}>
          <defs>
            <linearGradient id="brass" x1="10" y1="10" x2="50" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <path d="M30 6 Q27 15 30 20 Q33 15 30 6 Z" fill="#FDE047" className="animate-diya-flicker" />
          <circle cx="30" cy="20" r="3" fill="#DC2626" />
          <ellipse cx="30" cy="28" rx="22" ry="6" fill="url(#brass)" stroke="#78350F" strokeWidth="1" />
          <rect x="27" y="32" width="6" height="60" fill="url(#brass)" />
          <circle cx="30" cy="45" r="7" fill="url(#brass)" />
          <circle cx="30" cy="70" r="7" fill="url(#brass)" />
          <ellipse cx="30" cy="92" rx="24" ry="7" fill="url(#brass)" stroke="#78350F" strokeWidth="1" />
          <path d="M12 116 C12 100, 48 100, 48 116 Z" fill="url(#brass)" stroke="#78350F" strokeWidth="1.5" />
          <ellipse cx="30" cy="116" rx="22" ry="4" fill="#92400E" />
        </svg>
      );

    case 'panchaarti_diya':
      return (
        <svg width={width || 75} height={height || 60} viewBox="0 0 75 60" fill="none" className={className}>
          {/* 5 Flames */}
          {[12, 23, 37.5, 52, 63].map((cx, i) => (
            <path
              key={i}
              d={`M${cx} 8 Q${cx - 3} 16 ${cx} 20 Q${cx + 3} 16 ${cx} 8 Z`}
              fill="#FDE047"
              className="animate-diya-flicker"
            />
          ))}
          {/* Silver Tray with 5 cups */}
          <ellipse cx="37.5" cy="28" rx="34" ry="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M37.5 38 L37.5 56 M30 56 L45 56" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'hanging_lantern':
      return (
        <svg width={width || 65} height={height || 95} viewBox="0 0 65 95" fill="none" className={className}>
          <path d="M32 0 L32 14" stroke="#F59E0B" strokeWidth="2" />
          <polygon points="32,14 55,42 32,70 9,42" fill="#E11D48" stroke="#FDE047" strokeWidth="2.5" />
          <polygon points="32,24 45,42 32,60 19,42" fill="#FBBF24" />
          <circle cx="32" cy="42" r="5" fill="#FFFBEB" className="animate-pulse" />
          <path d="M16 66 L12 92 M24 70 L22 95 M32 70 L32 95 M40 70 L42 95 M48 66 L52 92" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'akhand_jyot':
      return (
        <svg width={width || 70} height={height || 80} viewBox="0 0 70 80" fill="none" className={className}>
          <rect x="20" y="24" width="30" height="34" rx="6" fill="#FDE68A" fillOpacity="0.25" stroke="#FDE047" strokeWidth="1.5" />
          <path d="M35 30 C30 40, 31 46, 35 52 C39 46, 40 40, 35 30 Z" fill="#F59E0B" className="animate-diya-flicker" />
          <circle cx="35" cy="44" r="3" fill="#FFFBEB" />
          <path d="M22 24 C22 14, 48 14, 48 24 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="35" cy="14" r="3" fill="#FEF08A" />
          <rect x="15" y="58" width="40" height="12" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="35" cy="70" rx="24" ry="5" fill="#78350F" />
        </svg>
      );

    case 'marigold_garland_orange':
    case 'marigold_garland_yellow': {
      const isOrange = svgType === 'marigold_garland_orange';
      const c1 = isOrange ? '#EA580C' : '#F59E0B';
      const c2 = isOrange ? '#F59E0B' : '#FEF08A';
      return (
        <svg width={width || 140} height={height || 38} viewBox="0 0 140 38" fill="none" className={className}>
          <path d="M0 8 Q70 30 140 8" stroke="#15803D" strokeWidth="2.5" fill="none" />
          {[12, 32, 52, 70, 88, 108, 128].map((cx, idx) => {
            const cy = 8 + Math.sin((idx / 6) * Math.PI) * 16;
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="10" fill={c1} />
                <circle cx={cx} cy={cy} r="7" fill={c2} />
                <circle cx={cx} cy={cy} r="3" fill="#DC2626" />
              </g>
            );
          })}
        </svg>
      );
    }

    case 'royal_toran':
      return (
        <svg width={width || 220} height={height || 55} viewBox="0 0 220 55" fill="none" className={className}>
          <rect x="0" y="2" width="220" height="6" fill="#F59E0B" />
          {[18, 52, 86, 120, 154, 188].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 8 C${x - 8} 25, ${x - 4} 45, ${x} 50 C${x + 4} 45, ${x + 8} 25, ${x} 8 Z`} fill="#16A34A" stroke="#14532D" strokeWidth="1" />
              <circle cx={x} cy={8} r="5" fill="#E11D48" />
              <circle cx={x} cy={8} r="2.5" fill="#FDE047" />
            </g>
          ))}
        </svg>
      );

    case 'jasmine_garland':
      return (
        <svg width={width || 130} height={height || 36} viewBox="0 0 130 36" fill="none" className={className}>
          <path d="M0 8 Q65 26 130 8" stroke="#15803D" strokeWidth="2" fill="none" />
          {[10, 26, 42, 58, 74, 90, 106, 120].map((cx, idx) => {
            const cy = 8 + Math.sin((idx / 7) * Math.PI) * 14;
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx={cx} cy={cy} r="3.5" fill="#FEF08A" />
              </g>
            );
          })}
        </svg>
      );

    case 'fairy_lights':
      return (
        <svg width={width || 180} height={height || 35} viewBox="0 0 180 35" fill="none" className={className}>
          <path d="M0 6 Q45 22 90 6 Q135 22 180 6" stroke="#B45309" strokeWidth="1.5" fill="none" />
          {[15, 35, 55, 75, 95, 115, 135, 155, 170].map((cx, i) => {
            const cy = 8 + Math.sin((i / 8) * Math.PI * 2) * 8;
            return (
              <g key={i} className="animate-pulse">
                <circle cx={cx} cy={cy} r="4.5" fill="#FEF08A" />
                <circle cx={cx} cy={cy} r="7" fill="#FDE047" fillOpacity="0.3" />
              </g>
            );
          })}
        </svg>
      );

    case 'mandap_chandelier':
      return (
        <svg width={width || 110} height={height || 80} viewBox="0 0 110 80" fill="none" className={className}>
          <path d="M55 0 L55 20" stroke="#F59E0B" strokeWidth="2.5" />
          <path d="M25 35 Q55 20 85 35" stroke="#F59E0B" strokeWidth="3" fill="none" />
          <path d="M35 50 Q55 35 75 50" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          {[25, 40, 55, 70, 85].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy={35 + Math.abs(cx - 55) * 0.2} r="4" fill="#FEF08A" className="animate-diya-flicker" />
              <path d={`M${cx} 40 L${cx} 60`} stroke="#FDE047" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx={cx} cy={60} r="3" fill="#38BDF8" />
            </g>
          ))}
        </svg>
      );

    case 'lotus_pair':
      return (
        <svg width={width || 90} height={height || 60} viewBox="0 0 90 60" fill="none" className={className}>
          <g transform="translate(10, 8)">
            <ellipse cx="18" cy="36" rx="16" ry="6" fill="#15803D" />
            <path d="M18 10 C10 22, 10 32, 18 36 C26 32, 26 22, 18 10 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
            <path d="M8 20 C4 28, 8 34, 18 36 C12 30, 10 25, 8 20 Z" fill="#F43F5E" />
            <path d="M28 20 C32 28, 28 34, 18 36 C24 30, 26 25, 28 20 Z" fill="#F43F5E" />
            <circle cx="18" cy="24" r="3" fill="#FDE047" />
          </g>
          <g transform="translate(48, 8)">
            <ellipse cx="18" cy="36" rx="16" ry="6" fill="#15803D" />
            <path d="M18 10 C10 22, 10 32, 18 36 C26 32, 26 22, 18 10 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
            <path d="M8 20 C4 28, 8 34, 18 36 C12 30, 10 25, 8 20 Z" fill="#F43F5E" />
            <path d="M28 20 C32 28, 28 34, 18 36 C24 30, 26 25, 28 20 Z" fill="#F43F5E" />
            <circle cx="18" cy="24" r="3" fill="#FDE047" />
          </g>
        </svg>
      );

    case 'marigold_bunch':
      return (
        <svg width={width || 65} height={height || 65} viewBox="0 0 65 65" fill="none" className={className}>
          {[
            { cx: 24, cy: 24, c1: '#F59E0B', c2: '#FEF08A' },
            { cx: 42, cy: 22, c1: '#EA580C', c2: '#F59E0B' },
            { cx: 33, cy: 40, c1: '#F59E0B', c2: '#FEF08A' },
          ].map((item, i) => (
            <g key={i}>
              <circle cx={item.cx} cy={item.cy} r="14" fill={item.c1} />
              <circle cx={item.cx} cy={item.cy} r="9" fill={item.c2} />
              <circle cx={item.cx} cy={item.cy} r="4" fill="#DC2626" />
            </g>
          ))}
        </svg>
      );

    case 'red_hibiscus':
      return (
        <svg width={width || 60} height={height || 60} viewBox="0 0 60 60" fill="none" className={className}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M30 30 C20 10, 40 10, 30 30 Z"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="1"
              transform={`rotate(${deg} 30 30)`}
            />
          ))}
          <circle cx="30" cy="30" r="7" fill="#DC2626" />
          {/* Pistil */}
          <path d="M30 30 L46 16" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="46" cy="16" r="3" fill="#F59E0B" />
        </svg>
      );

    case 'curtain_gold':
    case 'curtain_crimson':
    case 'curtain_emerald': {
      const isGold = svgType === 'curtain_gold';
      const isEmerald = svgType === 'curtain_emerald';
      const fill = isGold ? '#D97706' : isEmerald ? '#047857' : '#9F1239';
      const border = isGold ? '#FDE047' : isEmerald ? '#34D399' : '#FB7185';
      return (
        <svg width={width || 70} height={height || 190} viewBox="0 0 70 190" fill="none" className={className}>
          <path d="M5 0 L65 0 C55 60, 68 130, 60 190 L10 190 C2 130, 15 60, 5 0 Z" fill={fill} stroke={border} strokeWidth="1.5" />
          <path d="M15 0 C25 60, 22 130, 20 190 M35 0 C42 60, 38 130, 35 190 M50 0 C58 60, 52 130, 48 190" stroke={border} strokeWidth="1.2" opacity="0.6" />
          <ellipse cx="35" cy="80" rx="26" ry="6" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
        </svg>
      );
    }

    case 'makhar_banner':
      return (
        <svg width={width || 280} height={height || 70} viewBox="0 0 280 70" fill="none" className={className}>
          <path d="M10 50 Q140 0 270 50 L270 65 Q140 15 10 65 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <path d="M30 52 Q140 18 250 52" stroke="#FEF08A" strokeWidth="2" strokeDasharray="5 5" fill="none" />
          <circle cx="140" cy="28" r="14" fill="#DC2626" stroke="#FEF08A" strokeWidth="2" />
          <text x="140" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">ॐ</text>
        </svg>
      );

    case 'morya_banner':
      return (
        <svg width={width || 240} height={height || 55} viewBox="0 0 240 55" fill="none" className={className}>
          <rect x="10" y="8" width="220" height="38" rx="8" fill="#E11D48" stroke="#FDE047" strokeWidth="2" />
          <text x="120" y="33" textAnchor="middle" fill="#FEF08A" fontSize="14" fontWeight="bold" fontFamily="serif">
            ॥ गणपति बाप्पा मोरया ॥
          </text>
        </svg>
      );

    case 'shubh_labh_banner':
      return (
        <svg width={width || 200} height={height || 50} viewBox="0 0 200 50" fill="none" className={className}>
          <path d="M10 10 L190 10 L180 40 L20 40 Z" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
          <text x="50" y="28" fill="#FEF08A" fontSize="11" fontWeight="bold">शुभ</text>
          <text x="100" y="28" textAnchor="middle" fill="#DC2626" fontSize="14" fontWeight="bold">卐</text>
          <text x="150" y="28" fill="#FEF08A" fontSize="11" fontWeight="bold">लाभ</text>
        </svg>
      );

    case 'rangoli_floral':
      return (
        <svg width={width || 120} height={height || 60} viewBox="0 0 120 60" fill="none" className={className}>
          <ellipse cx="60" cy="30" rx="55" ry="25" fill="#881337" opacity="0.6" />
          <ellipse cx="60" cy="30" rx="45" ry="20" stroke="#FDE047" strokeWidth="2" strokeDasharray="6 4" fill="none" />
          <ellipse cx="60" cy="30" rx="30" ry="14" fill="#EA580C" />
          <ellipse cx="60" cy="30" rx="14" ry="7" fill="#FBBF24" />
          <circle cx="60" cy="30" r="4" fill="#FFFFFF" />
        </svg>
      );

    case 'swastik_rangoli':
      return (
        <svg width={width || 100} height={height || 50} viewBox="0 0 100 50" fill="none" className={className}>
          <ellipse cx="50" cy="25" rx="45" ry="20" fill="#9F1239" opacity="0.8" />
          <ellipse cx="50" cy="25" rx="35" ry="15" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
          <text x="50" y="32" textAnchor="middle" fill="#FDE047" fontSize="22" fontWeight="bold">卐</text>
        </svg>
      );

    case 'rangoli_peacock':
      return (
        <svg width={width || 160} height={height || 80} viewBox="0 0 160 80" fill="none" className={className}>
          <ellipse cx="80" cy="40" rx="75" ry="35" fill="#1E1B4B" opacity="0.8" />
          {[-50, -30, -10, 10, 30, 50].map((dx, i) => (
            <g key={i} transform={`translate(${80 + dx}, 30)`}>
              <ellipse cx="0" cy="0" rx="12" ry="18" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
              <ellipse cx="0" cy="-2" rx="7" ry="11" fill="#15803D" />
              <ellipse cx="0" cy="-3" rx="4" ry="6" fill="#F59E0B" />
              <circle cx="0" cy="-3" r="2" fill="#1E3A8A" />
            </g>
          ))}
          <ellipse cx="80" cy="45" rx="20" ry="12" fill="#059669" />
          <circle cx="80" cy="45" r="5" fill="#FDE047" />
        </svg>
      );

    case 'bg_starry':
      return (
        <svg width={width || 320} height={height || 160} viewBox="0 0 320 160" fill="none" className={className}>
          <rect width="320" height="160" rx="16" fill="#0E021C" fillOpacity="0.85" />
          <circle cx="160" cy="70" r="60" fill="#F59E0B" fillOpacity="0.15" filter="blur(10px)" />
          {[15, 45, 78, 120, 180, 230, 270, 300].map((x, i) => (
            <circle key={i} cx={x} cy={20 + (i * 15) % 80} r={1.5} fill="#FEF08A" className="animate-pulse" />
          ))}
        </svg>
      );

    case 'bg_palace_pillars':
      return (
        <svg width={width || 320} height={height || 180} viewBox="0 0 320 180" fill="none" className={className}>
          {/* Left Pillar */}
          <rect x="15" y="10" width="28" height="160" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
          <circle cx="29" cy="30" r="10" fill="#F59E0B" />
          {/* Right Pillar */}
          <rect x="277" y="10" width="28" height="160" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
          <circle cx="291" cy="30" r="10" fill="#F59E0B" />
          {/* Top Temple Arch */}
          <path d="M15 30 Q160 -10 305 30" stroke="#F59E0B" strokeWidth="4" fill="none" />
        </svg>
      );

    case 'bg_floral_wall':
      return (
        <svg width={width || 320} height={height || 180} viewBox="0 0 320 180" fill="none" className={className}>
          <rect width="320" height="180" rx="16" fill="#14532D" fillOpacity="0.8" />
          {[20, 60, 100, 140, 180, 220, 260, 300].map((x) =>
            [20, 60, 100, 140].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="12" fill={(x + y) % 40 === 0 ? '#F59E0B' : '#EA580C'} />
            ))
          )}
        </svg>
      );

    case 'modak_thali':
      return (
        <svg width={width || 90} height={height || 60} viewBox="0 0 90 60" fill="none" className={className}>
          <ellipse cx="45" cy="38" rx="42" ry="18" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="45" cy="36" rx="36" ry="14" fill="#F1F5F9" />
          {[
            { cx: 30, cy: 32 }, { cx: 45, cy: 30 }, { cx: 60, cy: 32 },
            { cx: 22, cy: 38 }, { cx: 37, cy: 38 }, { cx: 53, cy: 38 }, { cx: 68, cy: 38 },
            { cx: 32, cy: 44 }, { cx: 45, cy: 45 }, { cx: 58, cy: 44 },
          ].map((pos, idx) => (
            <path key={idx} d={`M${pos.cx - 5} ${pos.cy + 3} Q${pos.cx} ${pos.cy - 7} ${pos.cx + 5} ${pos.cy + 3} Z`} fill="#FEF08A" stroke="#EA580C" strokeWidth="0.8" />
          ))}
          <path d="M40 33 Q45 22 50 33 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <circle cx="45" cy="33" r="1.5" fill="#DC2626" />
        </svg>
      );

    case 'sacred_kalash':
      return (
        <svg width={width || 70} height={height || 85} viewBox="0 0 70 85" fill="none" className={className}>
          <ellipse cx="35" cy="60" rx="25" ry="20" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="35" cy="46" rx="16" ry="5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          <path d="M22 46 C15 32, 10 30, 5 35 C15 38, 20 44, 22 46 Z" fill="#16A34A" />
          <path d="M48 46 C55 32, 60 30, 65 35 C55 38, 50 44, 48 46 Z" fill="#16A34A" />
          <path d="M28 46 C25 28, 26 20, 22 18 C30 25, 30 38, 28 46 Z" fill="#16A34A" />
          <path d="M42 46 C45 28, 44 20, 48 18 C40 25, 40 38, 42 46 Z" fill="#16A34A" />
          <circle cx="35" cy="32" r="14" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          <circle cx="35" cy="62" r="4" fill="#DC2626" />
        </svg>
      );

    case 'durva_grass':
      return (
        <svg width={width || 50} height={height || 50} viewBox="0 0 50 50" fill="none" className={className}>
          <path d="M25 45 C15 30, 10 15, 12 5 M25 45 C20 28, 20 12, 22 2 M25 45 C28 26, 32 14, 38 6 M25 45 C32 30, 36 20, 42 15" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
          <rect x="21" y="38" width="8" height="6" rx="2" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
        </svg>
      );

    case 'hanging_bell':
      return (
        <svg width={width || 45} height={height || 90} viewBox="0 0 45 90" fill="none" className={className}>
          <path d="M22 0 L22 45" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 3" />
          <path d="M12 70 C12 50, 32 50, 32 70 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <ellipse cx="22" cy="70" rx="16" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="22" cy="78" r="3.5" fill="#78350F" />
        </svg>
      );

    case 'flower_scatter':
      return (
        <svg width={width || 110} height={height || 40} viewBox="0 0 110 40" fill="none" className={className}>
          {[
            { cx: 15, cy: 20, r: 6, c: '#EA580C' },
            { cx: 30, cy: 28, r: 5, c: '#E11D48' },
            { cx: 48, cy: 15, r: 7, c: '#F59E0B' },
            { cx: 65, cy: 24, r: 6, c: '#F43F5E' },
            { cx: 82, cy: 18, r: 5, c: '#EA580C' },
            { cx: 98, cy: 25, r: 6, c: '#FBBF24' },
          ].map((f, i) => (
            <g key={i}>
              <circle cx={f.cx} cy={f.cy} r={f.r} fill={f.c} />
              <circle cx={f.cx} cy={f.cy} r={f.r * 0.4} fill="#FEF08A" />
            </g>
          ))}
        </svg>
      );

    default:
      return (
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
          ✨
        </div>
      );
  }
};
