import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Sparkles, Flame, Trophy, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GameResult } from '../../types';
import { audioManager } from '../../services/audioService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ModakCatchGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

interface FallingItem {
  id: number;
  x: number; // percentage: 8% to 92%
  y: number; // percentage: -5% to 105%
  type: 'modak' | 'gold_modak' | 'laddoo' | 'banana' | 'durva' | 'chili' | 'cracker';
  points: number;
  isHazard: boolean;
  speed: number;
  icon: string;
  name: string;
}

interface CatchPopup {
  id: number;
  text: string;
  points: number;
  x: number;
  color: string;
}

const ROUND_TIME = 60; // 60-second round

export const ModakCatchGame: React.FC<ModakCatchGameProps> = ({ onFinish, onExit }) => {
  // Game lifecycle: 'start' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'results'
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'results'>('start');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalCaught, setTotalCaught] = useState(0);
  const [goldModaksCaught, setGoldModaksCaught] = useState(0);
  const [missesCount, setMissesCount] = useState(0);

  // Basket coordinate (0% to 100%)
  const [basketX, setBasketX] = useState(50);
  const [isBasketCatching, setIsBasketCatching] = useState(false);

  // Visual feedback
  const [popups, setPopups] = useState<CatchPopup[]>([]);
  const [screenFlash, setScreenFlash] = useState<'gold' | 'hazard' | null>(null);

  // High-performance refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const basketDomRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const itemIdCounter = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const basketXRef = useRef<number>(50);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, []);

  // Game state refs
  const gameStateRef = useRef<'start' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'results'>('start');
  gameStateRef.current = gameState;
  const timeLeftRef = useRef(ROUND_TIME);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const totalCaughtRef = useRef(0);
  const goldModaksRef = useRef(0);
  const missesRef = useRef(0);
  const finalResultRef = useRef<GameResult | null>(null);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Basket movement: Direct DOM update avoiding 60fps React re-renders
  const updateBasketFromClientX = useCallback((clientX: number) => {
    if (gameStateRef.current !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const bounded = Math.max(12, Math.min(88, pct));
    basketXRef.current = bounded;
    if (basketDomRef.current) {
      basketDomRef.current.style.left = `${bounded}%`;
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    updateBasketFromClientX(e.clientX);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameStateRef.current !== 'playing' || !containerRef.current) return;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateBasketFromClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      updateBasketFromClientX(e.touches[0].clientX);
    }
  };

  // Keyboard navigation: Arrow keys & A/D keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === 'escape' || key === 'p') {
        if (gameStateRef.current === 'playing') {
          handlePause();
        } else if (gameStateRef.current === 'paused') {
          handleResume();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || key === 'a') {
        keysPressedRef.current.left = true;
      } else if (e.key === 'ArrowRight' || key === 'd') {
        keysPressedRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowLeft' || key === 'a') {
        keysPressedRef.current.left = false;
      } else if (e.key === 'ArrowRight' || key === 'd') {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn dynamic falling items with progressive difficulty
  const spawnItem = (now: number, elapsed: number) => {
    itemIdCounter.current += 1;
    // Speed ramps up from 1.0x at 0s up to 1.85x at 60s
    const speedRamp = 1.0 + (elapsed / ROUND_TIME) * 0.85;

    const roll = Math.random();
    let type: FallingItem['type'] = 'modak';
    let points = 100;
    let isHazard = false;
    let icon = '🥟';
    let name = 'Steamed Modak';

    if (roll < 0.12) {
      type = 'gold_modak';
      points = 250;
      icon = '✨🥟';
      name = 'Golden Modak';
    } else if (roll < 0.32) {
      type = 'laddoo';
      points = 150;
      icon = '🟠';
      name = 'Motichoor Laddoo';
    } else if (roll < 0.48) {
      type = 'banana';
      points = 80;
      icon = '🍌';
      name = 'Prasad Banana';
    } else if (roll < 0.62) {
      type = 'durva';
      points = 120;
      icon = '🌿';
      name = 'Holy Durva';
    } else if (roll < 0.80) {
      type = 'chili';
      points = 0;
      isHazard = true;
      icon = '🌶️';
      name = 'Spicy Chili';
    } else {
      type = 'cracker';
      points = 0;
      isHazard = true;
      icon = '🧨';
      name = 'Firecracker';
    }

    // Safely clamped spawn X position (8% to 92%)
    const safeX = 8 + Math.random() * 84;

    const newItem: FallingItem = {
      id: itemIdCounter.current,
      x: safeX,
      y: -6,
      type,
      points,
      isHazard,
      speed: (0.42 + Math.random() * 0.22) * speedRamp,
      icon,
      name,
    };

    itemsRef.current.push(newItem);
  };

  // Main 60fps physics game loop
  const runGameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    // Smooth keyboard or touch steering position update (no React re-render overhead)
    if (keysPressedRef.current.left) {
      const next = Math.max(12, basketXRef.current - 1.8);
      basketXRef.current = next;
      if (basketDomRef.current) {
        basketDomRef.current.style.left = `${next}%`;
      }
    }
    if (keysPressedRef.current.right) {
      const next = Math.min(88, basketXRef.current + 1.8);
      basketXRef.current = next;
      if (basketDomRef.current) {
        basketDomRef.current.style.left = `${next}%`;
      }
    }

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, Math.ceil(ROUND_TIME - elapsed));

    if (remaining !== timeLeftRef.current) {
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
    }

    // Round end or Lives depleted
    if (remaining <= 0 || livesRef.current <= 0) {
      gameStateRef.current = 'results';
      setGameState('results');

      if (livesRef.current <= 0) {
        audioManager.playHazardHit();
      } else {
        audioManager.playFanfare();
      }

      const currentLives = livesRef.current;
      const livesBonus = currentLives * 300;
      const comboBonus = maxComboRef.current * 35;
      const goldBonus = goldModaksRef.current * 150;
      const finalScore = scoreRef.current + livesBonus + comboBonus + goldBonus;

      const finalGameResult: GameResult = {
        gameId: 'modak',
        gameName: 'Modak Catch Arcade',
        baseScore: scoreRef.current,
        bonusScore: livesBonus + comboBonus + goldBonus,
        comboOrAccuracy: `${totalCaughtRef.current} Offerings Caught • ${maxComboRef.current}x Max Combo`,
        finalScore,
        statsPayload: {
          itemsCount: totalCaughtRef.current,
          maxCombo: maxComboRef.current,
          perfectCount: goldModaksRef.current,
          isFlawless: livesRef.current === 3,
        },
      };
      finalResultRef.current = finalGameResult;
      return;
    }

    // Spawn interval decreases progressively (starts ~880ms, scales down to ~380ms)
    const progressFactor = elapsed / ROUND_TIME;
    const spawnInterval = Math.max(380, 880 - progressFactor * 500);

    if (now - lastSpawnRef.current > spawnInterval) {
      lastSpawnRef.current = now;
      spawnItem(now, elapsed);

      // In the final 15s, occasionally spawn an extra offering
      if (progressFactor > 0.75 && Math.random() < 0.35) {
        spawnItem(now, elapsed);
      }
    }

    // Basket collision boundary parameters (centered at basketXRef.current, y = 88%)
    const basketY = 88;
    const basketWidth = 24; // 24% width catch zone

    const remainingItems: FallingItem[] = [];

    for (const item of itemsRef.current) {
      item.y += item.speed;

      // Check collision with basket zone
      if (item.y >= basketY - 5 && item.y <= basketY + 6) {
        const dist = Math.abs(item.x - basketXRef.current);
        if (dist <= basketWidth / 2) {
          // Basket Caught item!
          setIsBasketCatching(true);
          setTimeout(() => setIsBasketCatching(false), 120);

          if (item.isHazard) {
            // Hazard hit
            audioManager.playHazardHit();
            const newLives = Math.max(0, livesRef.current - 1);
            livesRef.current = newLives;
            setLives(newLives);

            comboRef.current = 0;
            setCombo(0);

            setScreenFlash('hazard');
            setTimeout(() => setScreenFlash(null), 180);

            const popupId = Date.now() + Math.random();
            setPopups((prev) => [
              ...prev.slice(-3),
              { id: popupId, text: '-1 LIFE! 💥', points: 0, x: item.x, color: 'text-rose-400' },
            ]);
            setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== popupId)), 700);
          } else {
            // Sweet caught!
            if (item.type === 'gold_modak') {
              audioManager.playGoldenModakChime();
              goldModaksRef.current += 1;
              setGoldModaksCaught(goldModaksRef.current);
              setScreenFlash('gold');
              setTimeout(() => setScreenFlash(null), 180);
            } else {
              audioManager.playModakCatch();
            }

            const nextCombo = comboRef.current + 1;
            comboRef.current = nextCombo;
            maxComboRef.current = Math.max(maxComboRef.current, nextCombo);

            const multiplier =
              nextCombo >= 50 ? 5.0 : nextCombo >= 35 ? 4.0 : nextCombo >= 20 ? 3.0 : nextCombo >= 10 ? 2.0 : nextCombo >= 5 ? 1.5 : 1.0;

            const awardedPoints = Math.round(item.points * multiplier);
            scoreRef.current += awardedPoints;
            totalCaughtRef.current += 1;

            setCombo(nextCombo);
            setMaxCombo(maxComboRef.current);
            setScore(scoreRef.current);
            setTotalCaught(totalCaughtRef.current);

            const popupId = Date.now() + Math.random();
            const textMsg = item.type === 'gold_modak' ? `+${awardedPoints} GOLD! ✨` : `+${awardedPoints}`;
            setPopups((prev) => [
              ...prev.slice(-3),
              { id: popupId, text: textMsg, points: awardedPoints, x: item.x, color: item.type === 'gold_modak' ? 'text-yellow-300' : 'text-amber-200' },
            ]);
            setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== popupId)), 700);
          }
          continue; // Item collected, remove from falling list
        }
      }

      // If item fell past bottom without being caught
      if (item.y > 103) {
        if (!item.isHazard) {
          // Missed non-hazard offering -> reduces/resets combo!
          if (comboRef.current > 0) {
            comboRef.current = 0;
            setCombo(0);
          }
          missesRef.current += 1;
          setMissesCount(missesRef.current);

          const popupId = Date.now() + Math.random();
          setPopups((prev) => [
            ...prev.slice(-3),
            { id: popupId, text: 'MISS', points: 0, x: item.x, color: 'text-zinc-400' },
          ]);
          setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== popupId)), 500);
        }
        continue;
      }

      remainingItems.push(item);
    }

    itemsRef.current = remainingItems;

    // 60 FPS Hardware-Accelerated Canvas rendering with DPR scaling
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const displayW = Math.round(rect.width * dpr);
        const displayH = Math.round(rect.height * dpr);
        if (canvas.width !== displayW || canvas.height !== displayH) {
          canvas.width = displayW;
          canvas.height = displayH;
        }
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        for (const item of remainingItems) {
          const cx = (item.x / 100) * rect.width;
          const cy = (item.y / 100) * rect.height;

          // Glowing aura for special items
          if (item.type === 'gold_modak') {
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
            ctx.shadowColor = '#FBBF24';
            ctx.shadowBlur = 15;
            ctx.fill();
          } else if (item.isHazard) {
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
            ctx.shadowColor = '#F43F5E';
            ctx.shadowBlur = 12;
            ctx.fill();
          }

          // Item icon
          ctx.font = '28px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(item.icon, cx, cy);
        }
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(runGameLoop);
  }, []);

  // Initiate game with 3-2-1 countdown
  const handleStartCountdown = () => {
    audioManager.init();
    audioManager.playTempleBell();

    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setTotalCaught(0);
    setGoldModaksCaught(0);
    setMissesCount(0);
    setTimeLeft(ROUND_TIME);
    setBasketX(50);
    setPopups([]);

    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 0;
    maxComboRef.current = 0;
    totalCaughtRef.current = 0;
    goldModaksRef.current = 0;
    missesRef.current = 0;
    timeLeftRef.current = ROUND_TIME;
    itemsRef.current = [];

    setCountdown(3);
    gameStateRef.current = 'countdown';
    setGameState('countdown');

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        audioManager.playClick();
      } else {
        clearInterval(interval);
        audioManager.playTempleBell();
        startTimeRef.current = performance.now();
        lastSpawnRef.current = performance.now();
        gameStateRef.current = 'playing';
        setGameState('playing');
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(runGameLoop);
      }
    }, 850);
  };

  // Pause game
  const handlePause = () => {
    if (gameStateRef.current !== 'playing') return;
    audioManager.playClick();
    gameStateRef.current = 'paused';
    setGameState('paused');
    pausedTimeRef.current = performance.now();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // Resume game
  const handleResume = () => {
    if (gameStateRef.current !== 'paused') return;
    audioManager.playClick();
    const pauseDuration = performance.now() - pausedTimeRef.current;
    startTimeRef.current += pauseDuration;
    lastSpawnRef.current += pauseDuration;

    gameStateRef.current = 'playing';
    setGameState('playing');
    requestRef.current = requestAnimationFrame(runGameLoop);
  };

  // Restart game
  const handleRestart = () => {
    audioManager.playClick();
    handleStartCountdown();
  };

  useEffect(() => {
    return () => {
      gameStateRef.current = 'start';
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const currentMultiplier =
    combo >= 50 ? 5.0 : combo >= 35 ? 4.0 : combo >= 20 ? 3.0 : combo >= 10 ? 2.0 : combo >= 5 ? 1.5 : 1.0;

  // Round progress percentage
  const progressPercent = Math.min(100, Math.max(0, Math.round(((ROUND_TIME - timeLeft) / ROUND_TIME) * 100)));

  // Performance rank for results
  const getRankBadge = () => {
    if (score >= 3200 || totalCaught >= 35) return { title: 'Maha Modak Master', rank: 'S', badge: '👑', color: 'text-amber-300' };
    if (score >= 2000 || totalCaught >= 25) return { title: 'Sweet Devotee', rank: 'A', badge: '🌟', color: 'text-yellow-300' };
    if (score >= 1200 || totalCaught >= 15) return { title: 'Joyful Collector', rank: 'B', badge: '🌸', color: 'text-emerald-300' };
    return { title: 'Blessed Devotee', rank: 'C', badge: '🌱', color: 'text-amber-200' };
  };

  const rankInfo = getRankBadge();

  return (
    <div className="max-w-xl mx-auto px-3 py-2 sm:py-3 flex flex-col items-center select-none animate-fade-in relative">
      {/* Screen Effects for Gold Modak / Hazard Hits */}
      {screenFlash === 'gold' && (
        <div className="fixed inset-0 pointer-events-none z-30 border-4 border-yellow-400/80 bg-yellow-400/10 animate-pulse" />
      )}
      {screenFlash === 'hazard' && (
        <div className="fixed inset-0 pointer-events-none z-30 border-4 border-rose-600/70 bg-rose-600/15" />
      )}

      {/* Top Header Bar: Exit, Title, Pause, Timer */}
      <div className="w-full flex items-center justify-between mb-2.5 px-1">
        <Button
          variant="secondary-glass"
          size="sm"
          onClick={onExit}
          icon={<ArrowLeft className="w-4 h-4 text-amber-400" />}
        >
          Exit
        </Button>

        <div className="text-center">
          <h2 className="text-base sm:text-xl font-bold font-festive text-amber-100 flex items-center justify-center gap-1.5 leading-tight">
            <span>🍬 Modak Catch</span>
          </h2>
          <span className="text-[10px] sm:text-xs text-amber-400 font-semibold">
            Gather sweet offerings for Bappa!
          </span>
        </div>

        {/* Controls: Pause & Timer */}
        <div className="flex items-center gap-2">
          {gameState === 'playing' && (
            <button
              onClick={handlePause}
              className="p-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 active:scale-95 transition-all shadow-sm"
              title="Pause Game (Esc or P)"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-black/50 border border-amber-500/40 text-amber-200 font-mono font-bold text-xs sm:text-sm shadow-inner">
            <span className="text-amber-400">⏳</span>
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Round Progress Indicator Bar */}
      <div className="w-full mb-2">
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-amber-500/20 p-0.5 shadow-inner">
          <div
            className="h-full rounded-full festive-gold-gradient transition-all duration-300 shadow-[0_0_8px_#F59E0B]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Score, Lives & Combo HUD Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mb-2.5 text-center">
        <Card variant="glass" padding="sm" className="border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Score</span>
          <span className="text-base sm:text-xl font-black festive-text-gold tracking-wide">
            {score.toLocaleString()}
          </span>
        </Card>

        {/* Lives / Hearts with cracked state */}
        <Card variant="glass" padding="sm" className="border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Lives</span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  heartIndex <= lives
                    ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    : 'text-zinc-600 scale-90'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Combo with Flame Animation */}
        <Card variant="glass" padding="sm" className="relative overflow-hidden border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Combo</span>
          <div className="flex items-center justify-center gap-1">
            {combo >= 5 && (
              <Flame
                className={`w-3.5 h-3.5 animate-bounce ${
                  combo >= 35 ? 'text-yellow-300' : combo >= 20 ? 'text-amber-400' : 'text-orange-500'
                }`}
              />
            )}
            <span
              className={`text-base sm:text-xl font-black transition-transform ${
                combo >= 10 ? 'text-yellow-300 scale-105' : 'text-amber-200'
              }`}
            >
              {combo}x
            </span>
          </div>
          {currentMultiplier > 1 && (
            <span className="text-[9px] font-bold text-yellow-300/90 block leading-none">
              {currentMultiplier}x Boost!
            </span>
          )}
        </Card>
      </div>

      {/* Main Arcade Catch Arena */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[380px] sm:h-[440px] rounded-3xl festive-glass-glow border-2 border-amber-500/40 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-ew-resize touch-none select-none"
      >
        {/* Atmosphere Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#18042B] via-[#2A0845] to-[#120224] pointer-events-none opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,_rgba(245,158,11,0.22),_transparent_70%)] pointer-events-none" />

        {/* 60 FPS Hardware-Accelerated Canvas for Falling Modaks & Offerings */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none game-canvas z-10" />

        {/* Floating Catch / Miss Popups */}
        {popups.map((popup) => (
          <div
            key={popup.id}
            className={`absolute pointer-events-none font-festive font-black text-sm sm:text-base animate-bounce -translate-x-1/2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${popup.color}`}
            style={{
              left: `${popup.x}%`,
              top: '78%',
              animationDuration: '0.6s',
            }}
          >
            {popup.text}
          </div>
        ))}

        {/* Festive Offering Basket (Controlled by Player) */}
        <div
          ref={basketDomRef}
          className={`absolute top-[88%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 will-change-transform ${
            isBasketCatching ? 'scale-110' : 'scale-100'
          }`}
          style={{ left: `${basketXRef.current}%` }}
        >
          {/* Bamboo & Floral Woven Basket Vector */}
          <div className="relative flex flex-col items-center drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
            {/* Floral garland rim on basket */}
            <div className="w-24 sm:w-28 h-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full border border-yellow-200 flex items-center justify-around px-1 shadow-md">
              <span className="text-[10px]">🌼</span>
              <span className="text-[10px]">🌸</span>
              <span className="text-[10px]">🌼</span>
              <span className="text-[10px]">🌸</span>
            </div>
            {/* Basket Body */}
            <div className="w-22 sm:w-26 h-10 sm:h-12 bg-gradient-to-b from-[#B45309] via-[#92400E] to-[#78350F] rounded-b-2xl border-2 border-amber-300/80 shadow-xl flex items-center justify-center text-xl">
              🧺
            </div>
          </div>
        </div>

        {/* START SCREEN OVERLAY */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-4xl mb-2 shadow-lg shadow-amber-500/30 border-2 border-yellow-300/50 animate-bounce">
              🥟
            </div>
            <h3 className="text-2xl sm:text-3xl font-festive font-black text-amber-100 mb-1 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
              Modak Catch Arcade
            </h3>
            <p className="text-xs sm:text-sm text-amber-300/90 max-w-xs mb-4 font-medium">
              Catch sweet modaks and golden sweets in your basket! Avoid firecrackers and red chilies.
            </p>

            {/* Items & Points Key */}
            <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs mb-4 text-[10px] font-bold">
              <div className="bg-amber-500/20 border border-amber-400/40 p-1.5 rounded-xl text-amber-200">
                <div className="text-lg">🥟</div>
                <div>Modak (+100)</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-400/40 p-1.5 rounded-xl text-yellow-200">
                <div className="text-lg">✨🥟</div>
                <div>Gold (+250)</div>
              </div>
              <div className="bg-orange-500/20 border border-orange-400/40 p-1.5 rounded-xl text-orange-200">
                <div className="text-lg">🟠</div>
                <div>Laddoo (+150)</div>
              </div>
              <div className="bg-rose-500/20 border border-rose-400/40 p-1.5 rounded-xl text-rose-200">
                <div className="text-lg">🧨</div>
                <div>Hazard (-1 ❤️)</div>
              </div>
            </div>

            <div className="text-[11px] text-amber-300/80 mb-5 font-mono">
              Desktop: <b>[←] [→]</b> or <b>[A] [D]</b> • Mobile: Touch/drag basket
            </div>

            <Button
              variant="primary-gold"
              size="lg"
              shine
              glow
              onClick={handleStartCountdown}
              icon={<Play className="w-5 h-5 fill-slate-950" />}
              className="px-6 py-2.5 text-base font-bold shadow-[0_5px_0_#B45309,0_10px_20px_rgba(245,158,11,0.4)]"
            >
              START CATCHING 🥟
            </Button>
          </div>
        )}

        {/* 3-2-1 START COUNTDOWN OVERLAY */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md text-center">
            <div className="text-7xl sm:text-8xl font-black font-festive festive-text-gold animate-bounce drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">
              {countdown > 0 ? countdown : 'MORYA! 🌟'}
            </div>
            <p className="text-sm font-bold text-amber-300 mt-3 tracking-widest uppercase">
              Get Your Basket Ready!
            </p>
          </div>
        )}

        {/* PAUSE SCREEN OVERLAY */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mb-2 text-amber-300">
              ⏸️
            </div>
            <h3 className="text-2xl font-festive font-black text-amber-100 mb-1">
              Game Paused
            </h3>
            <p className="text-xs text-amber-300/80 mb-4">
              Time remaining: <b>{timeLeft}s</b> • Score: <b>{score.toLocaleString()}</b>
            </p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <Button
                variant="primary-gold"
                size="md"
                shine
                onClick={handleResume}
                icon={<Play className="w-4 h-4 fill-slate-950" />}
              >
                Resume Catching
              </Button>
              <Button
                variant="secondary-glass"
                size="md"
                onClick={handleRestart}
                icon={<RotateCcw className="w-4 h-4 text-amber-400" />}
              >
                Restart Round
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={onExit}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Quit to Hub
              </Button>
            </div>
          </div>
        )}

        {/* FINAL RESULTS SCREEN OVERLAY */}
        {gameState === 'results' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-5 bg-black/90 backdrop-blur-lg text-center overflow-y-auto animate-modal-pop">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 border-2 border-yellow-300 flex items-center justify-center text-3xl sm:text-4xl mb-1 shadow-lg shadow-amber-500/30">
              {rankInfo.badge}
            </div>

            <h3 className="text-xl sm:text-2xl font-festive font-black text-amber-100">
              {rankInfo.title}
            </h3>
            <span className={`text-xs font-bold ${rankInfo.color} mb-3`}>
              Rank {rankInfo.rank} Offering
            </span>

            {/* Final Score Banner */}
            <div className="w-full max-w-xs p-3 rounded-2xl bg-black/60 border border-amber-500/40 mb-3 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                Final Festival Score
              </span>
              <span className="text-2xl sm:text-3xl font-black festive-text-gold tracking-wide">
                {(score + lives * 300 + maxCombo * 35 + goldModaksCaught * 150).toLocaleString()}{' '}
                <span className="text-sm font-normal text-amber-400">pts</span>
              </span>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">
                Base: {score.toLocaleString()} • Lives Bonus: +{(lives * 300).toLocaleString()} • Combo: +{(maxCombo * 35).toLocaleString()}
              </span>
            </div>

            {/* Performance Stats Breakdown Grid */}
            <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs mb-3 text-[10px]">
              <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30">
                <span className="text-amber-300 font-bold block">🥟 Caught</span>
                <span className="text-xs font-black text-amber-100">{totalCaught}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-yellow-500/15 border border-yellow-400/30">
                <span className="text-yellow-300 font-bold block">✨ Gold</span>
                <span className="text-xs font-black text-yellow-100">{goldModaksCaught}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-orange-500/15 border border-orange-400/30">
                <span className="text-orange-300 font-bold block">🔥 Streak</span>
                <span className="text-xs font-black text-orange-100">{maxCombo}x</span>
              </div>
              <div className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-400/30">
                <span className="text-rose-300 font-bold block">❤️ Lives</span>
                <span className="text-xs font-black text-rose-100">{lives}/3</span>
              </div>
            </div>

            {/* Actions: Replay & Hub */}
            <div className="flex gap-2 w-full max-w-xs">
              <Button
                variant="secondary-glass"
                size="md"
                fullWidth
                onClick={handleRestart}
                icon={<RotateCcw className="w-4 h-4 text-amber-400" />}
              >
                Play Again
              </Button>
              <Button
                variant="primary-gold"
                size="md"
                fullWidth
                shine
                onClick={() => {
                  if (finalResultRef.current) {
                    onFinishRef.current(finalResultRef.current);
                  } else {
                    onExit();
                  }
                }}
                icon={<CheckCircle2 className="w-4 h-4 fill-slate-950" />}
              >
                Festival Hub
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Steering Controls & Desktop Key Indicators */}
      <div className="w-full flex items-center justify-between gap-2.5 mt-2.5 touch-none">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            keysPressedRef.current.left = true;
          }}
          onPointerUp={() => {
            keysPressedRef.current.left = false;
          }}
          onPointerLeave={() => {
            keysPressedRef.current.left = false;
          }}
          onPointerCancel={() => {
            keysPressedRef.current.left = false;
          }}
          className="flex-1 min-h-[52px] py-2 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400/50 text-amber-200 font-bold active:scale-95 active:bg-amber-500/40 flex items-center justify-center gap-2 shadow-md touch-none select-none active-press"
          aria-label="Move basket left"
        >
          <span className="text-xl leading-none">◀</span>
          <span className="text-xs font-black uppercase tracking-wider">Left</span>
        </button>

        <div className="text-center px-1 text-[10px] text-amber-400/70 font-semibold hidden sm:block whitespace-nowrap">
          <div>Drag canvas or [←] [→] / [A] [D]</div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            keysPressedRef.current.right = true;
          }}
          onPointerUp={() => {
            keysPressedRef.current.right = false;
          }}
          onPointerLeave={() => {
            keysPressedRef.current.right = false;
          }}
          onPointerCancel={() => {
            keysPressedRef.current.right = false;
          }}
          className="flex-1 min-h-[52px] py-2 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400/50 text-amber-200 font-bold active:scale-95 active:bg-amber-500/40 flex items-center justify-center gap-2 shadow-md touch-none select-none active-press"
          aria-label="Move basket right"
        >
          <span className="text-xs font-black uppercase tracking-wider">Right</span>
          <span className="text-xl leading-none">▶</span>
        </button>
      </div>
    </div>
  );
};
