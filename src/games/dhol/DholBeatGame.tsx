import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Flame, Sparkles, Trophy, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';
import { GameResult } from '../../types';
import { audioManager } from '../../services/audioService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface DholBeatGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

interface Note {
  id: number;
  lane: number; // 0, 1, 2, 3
  y: number; // percentage from top: -5% to 100%
  type: 'bass' | 'treble' | 'cymbal';
  hit: boolean;
}

interface FloatingText {
  id: number;
  text: string;
  points: number;
  color: string;
  lane: number;
}

const LANES = [
  {
    key: 'D',
    altKey: '1',
    label: 'DHA',
    sound: 'bass',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500',
    glow: 'rgba(245, 158, 11, 0.5)',
    icon: '🥁',
    name: 'Bari Dhol',
  },
  {
    key: 'F',
    altKey: '2',
    label: 'GE',
    sound: 'bass',
    color: 'from-rose-500 to-red-600',
    border: 'border-rose-500',
    glow: 'rgba(244, 63, 94, 0.5)',
    icon: '🪘',
    name: 'Ghumke Dhol',
  },
  {
    key: 'J',
    altKey: '3',
    label: 'TA',
    sound: 'treble',
    color: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400',
    glow: 'rgba(250, 204, 21, 0.5)',
    icon: '🔔',
    name: 'Tasha Lead',
  },
  {
    key: 'K',
    altKey: '4',
    label: 'TIN',
    sound: 'cymbal',
    color: 'from-orange-400 to-amber-600',
    border: 'border-orange-400',
    glow: 'rgba(251, 146, 60, 0.5)',
    icon: '✨',
    name: 'Manjira Clash',
  },
];

const ROUND_TIME = 60; // 60-second round

export const DholBeatGame: React.FC<DholBeatGameProps> = ({ onFinish, onExit }) => {
  // Game lifecycle states: 'start' | 'playing' | 'paused' | 'results'
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'results'>('start');
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Timing breakdown stats
  const [perfectCount, setPerfectCount] = useState(0);
  const [greatCount, setGreatCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [missCount, setMissCount] = useState(0);

  // Active feedback states
  const [activePad, setActivePad] = useState<number | null>(null);
  const [judgement, setJudgement] = useState<{ text: string; color: string; id: number } | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [screenFlash, setScreenFlash] = useState<'perfect' | 'miss' | null>(null);

  // High performance game-loop refs
  const gameStateRef = useRef<'start' | 'playing' | 'paused' | 'results'>('start');
  gameStateRef.current = gameState;

  const timeLeftRef = useRef(ROUND_TIME);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const perfectRef = useRef(0);
  const greatRef = useRef(0);
  const goodRef = useRef(0);
  const missRef = useRef(0);
  const totalNotesRef = useRef(0);
  const notesRef = useRef<Note[]>([]);
  const requestRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastSpawnRef = useRef<number>(0);
  const noteCounterRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finalResultRef = useRef<GameResult | null>(null);

  // Unmount cleanup: cancel any pending animation frame loop
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, []);

  // Sound generator helper
  const playSoundForLane = useCallback((laneIndex: number) => {
    const lane = LANES[laneIndex];
    if (lane.sound === 'bass') {
      audioManager.playDholBass();
    } else if (lane.sound === 'treble') {
      audioManager.playDholTreble();
    } else {
      audioManager.playDholCymbal();
    }
  }, []);

  // Pad hit trigger for Touch, Mouse, and Keyboard
  const handleHit = useCallback(
    (laneIndex: number) => {
      setActivePad(laneIndex);
      setTimeout(() => setActivePad(null), 120);

      playSoundForLane(laneIndex);

      if (gameStateRef.current !== 'playing') return;

      // Target zone line is at y = 88%
      const targetY = 88;
      const hitTolerance = 12; // Maximum window for 'GOOD'

      // Find closest note in this lane
      let candidateIndex = -1;
      let minDistance = 999;

      notesRef.current.forEach((n, idx) => {
        if (n.lane === laneIndex && !n.hit) {
          const distance = Math.abs(n.y - targetY);
          if (distance <= hitTolerance && distance < minDistance) {
            minDistance = distance;
            candidateIndex = idx;
          }
        }
      });

      if (candidateIndex !== -1) {
        const note = notesRef.current[candidateIndex];
        note.hit = true;
        const diff = Math.abs(note.y - targetY);

        let basePoints = 50;
        let text = 'GOOD';
        let color = 'text-yellow-400';
        let judgementType: 'perfect' | 'great' | 'good' = 'good';

        if (diff <= 4.0) {
          // PERFECT: highest points
          basePoints = 150;
          text = 'PERFECT! 🌟';
          color = 'text-amber-300';
          judgementType = 'perfect';
          perfectRef.current += 1;
          setPerfectCount(perfectRef.current);
          audioManager.playPerfectHitChime();
          setScreenFlash('perfect');
          setTimeout(() => setScreenFlash(null), 180);
        } else if (diff <= 7.8) {
          // GREAT: medium-high points
          basePoints = 100;
          text = 'GREAT! ✨';
          color = 'text-emerald-300';
          judgementType = 'great';
          greatRef.current += 1;
          setGreatCount(greatRef.current);
        } else {
          // GOOD: normal points
          basePoints = 50;
          text = 'GOOD';
          color = 'text-yellow-300';
          judgementType = 'good';
          goodRef.current += 1;
          setGoodCount(goodRef.current);
        }

        // Combo Multiplier calculation
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        maxComboRef.current = Math.max(maxComboRef.current, nextCombo);

        const multiplier =
          nextCombo >= 50 ? 5.0 : nextCombo >= 35 ? 4.0 : nextCombo >= 20 ? 3.0 : nextCombo >= 10 ? 2.0 : nextCombo >= 5 ? 1.5 : 1.0;

        if ([5, 10, 20, 35, 50].includes(nextCombo)) {
          audioManager.playComboIncrease(Math.floor(multiplier));
        }

        const awardedPoints = Math.round(basePoints * multiplier);
        scoreRef.current += awardedPoints;

        setCombo(nextCombo);
        setMaxCombo(maxComboRef.current);
        setScore(scoreRef.current);

        // Update live accuracy
        const totalAttempts = perfectRef.current + greatRef.current + goodRef.current + missRef.current;
        const accuracyPct =
          totalAttempts > 0
            ? Math.round(
                ((perfectRef.current * 100 + greatRef.current * 80 + goodRef.current * 50) /
                  (totalAttempts * 100)) *
                  100
              )
            : 100;
        setAccuracy(accuracyPct);

        // Floating score feedback
        const floatId = Date.now() + Math.random();
        setFloatingTexts((prev) => [
          ...prev.slice(-4),
          { id: floatId, text, points: awardedPoints, color, lane: laneIndex },
        ]);
        setTimeout(() => {
          setFloatingTexts((prev) => prev.filter((f) => f.id !== floatId));
        }, 800);

        setJudgement({ text, color, id: Date.now() });
      } else {
        // Strike with no note in timing window: resets combo
        if (comboRef.current > 0) {
          comboRef.current = 0;
          setCombo(0);
        }
      }
    },
    [playSoundForLane]
  );

  // Keyboard navigation: [D, F, J, K], numbers [1, 2, 3, 4], arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();

      // Pause toggle with Escape or P
      if (key === 'ESCAPE' || key === 'P') {
        if (gameStateRef.current === 'playing') {
          handlePause();
        } else if (gameStateRef.current === 'paused') {
          handleResume();
        }
        return;
      }

      let laneIndex = LANES.findIndex((l) => l.key === key || l.altKey === key);
      if (laneIndex === -1) {
        if (e.key === 'ArrowLeft') laneIndex = 0;
        else if (e.key === 'ArrowDown') laneIndex = 1;
        else if (e.key === 'ArrowUp') laneIndex = 2;
        else if (e.key === 'ArrowRight') laneIndex = 3;
      }

      if (laneIndex !== -1) {
        handleHit(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHit]);

  // Main high-performance 60fps game loop
  const runGameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const now = performance.now();
    const elapsedRoundTime = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, Math.ceil(ROUND_TIME - elapsedRoundTime));

    if (remaining !== timeLeftRef.current) {
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
    }

    // 60-second round finished
    if (remaining <= 0) {
      gameStateRef.current = 'results';
      setGameState('results');
      audioManager.playFanfare();

      const totalAttempts = perfectRef.current + greatRef.current + goodRef.current + missRef.current;
      const finalAccuracy =
        totalAttempts > 0
          ? Math.round(
              ((perfectRef.current * 100 + greatRef.current * 80 + goodRef.current * 50) /
                (totalAttempts * 100)) *
                100
            )
          : 100;
      const comboBonus = maxComboRef.current * 30;
      const accuracyBonus = finalAccuracy >= 95 ? 750 : finalAccuracy >= 85 ? 500 : finalAccuracy >= 70 ? 250 : 0;
      const finalScore = scoreRef.current + comboBonus + accuracyBonus;

      // Save final result ref to submit upon user action
      const finalGameResult: GameResult = {
        gameId: 'dhol',
        gameName: 'Dhol Beat Rhythm',
        baseScore: scoreRef.current,
        bonusScore: comboBonus + accuracyBonus,
        comboOrAccuracy: `${finalAccuracy}% Accuracy • ${maxComboRef.current}x Max Combo`,
        finalScore,
        statsPayload: {
          perfectCount: perfectRef.current,
          maxCombo: maxComboRef.current,
          accuracyPct: finalAccuracy,
          isFlawless: missRef.current === 0 && finalAccuracy >= 95,
        },
      };
      finalResultRef.current = finalGameResult;
      return;
    }

    // Progressive Difficulty Scaling:
    // Starts easy (speed ~ 0.45, interval ~ 820ms) and accelerates toward a festival climax frenzy!
    const progressFactor = (ROUND_TIME - remaining) / ROUND_TIME; // 0 to 1
    const fallSpeed = 0.44 + progressFactor * 0.46; // 0.44 to 0.90
    const spawnInterval = Math.max(340, 850 - progressFactor * 480); // 850ms down to 340ms

    // Spawn new rhythm notes
    if (now - lastSpawnRef.current > spawnInterval) {
      lastSpawnRef.current = now;
      noteCounterRef.current += 1;

      // Primary note lane
      const lane = Math.floor(Math.random() * 4);
      const noteType = lane < 2 ? 'bass' : lane === 2 ? 'treble' : 'cymbal';

      notesRef.current.push({
        id: noteCounterRef.current,
        lane,
        y: -4,
        type: noteType,
        hit: false,
      });
      totalNotesRef.current += 1;

      // In the final 20 seconds, occasionally spawn syncopated dual notes for festival crescendo!
      if (progressFactor > 0.65 && Math.random() < 0.28) {
        noteCounterRef.current += 1;
        const secondLane = (lane + 2) % 4;
        notesRef.current.push({
          id: noteCounterRef.current,
          lane: secondLane,
          y: -4,
          type: secondLane < 2 ? 'bass' : 'treble',
          hit: false,
        });
        totalNotesRef.current += 1;
      }
    }

    // Update positions and handle misses
    const updatedNotes: Note[] = [];
    for (const note of notesRef.current) {
      if (!note.hit) {
        note.y += fallSpeed;

        // Passed target threshold without being hit -> MISS
        if (note.y > 96) {
          note.hit = true;
          missRef.current += 1;
          setMissCount(missRef.current);
          comboRef.current = 0;
          setCombo(0);

          setScreenFlash('miss');
          setTimeout(() => setScreenFlash(null), 150);

          setJudgement({ text: 'MISS', color: 'text-rose-400', id: Date.now() });

          const floatId = Date.now() + Math.random();
          setFloatingTexts((prev) => [
            ...prev.slice(-4),
            { id: floatId, text: 'MISS', points: 0, color: 'text-rose-400', lane: note.lane },
          ]);
          setTimeout(() => {
            setFloatingTexts((prev) => prev.filter((f) => f.id !== floatId));
          }, 600);
          continue;
        }
      }

      if (note.y <= 96 && !note.hit) {
        updatedNotes.push(note);
      }
    }
    notesRef.current = updatedNotes;

    // Draw falling notes onto canvas with DPR scaling at 60 FPS
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

        const laneWidth = rect.width / 4;
        const noteRadius = Math.min(22, laneWidth * 0.32);

        for (const note of updatedNotes) {
          const cx = (note.lane + 0.5) * laneWidth;
          const cy = (note.y / 100) * rect.height;

          // Outer ambient glow
          ctx.beginPath();
          ctx.arc(cx, cy, noteRadius + 2, 0, Math.PI * 2);
          ctx.fillStyle = note.type === 'bass' ? '#E11D48' : note.type === 'treble' ? '#F59E0B' : '#FBBF24';
          ctx.shadowColor = note.type === 'bass' ? '#FB7185' : '#FDE68A';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Main note body
          ctx.beginPath();
          ctx.arc(cx, cy, noteRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#1F0A38';
          ctx.shadowBlur = 0;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = note.type === 'bass' ? '#FDA4AF' : note.type === 'treble' ? '#FDE68A' : '#FEF08A';
          ctx.stroke();

          // Inner icon
          ctx.font = `${Math.round(noteRadius * 1.1)}px system-ui, apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = LANES[note.lane]?.icon || '🥁';
          ctx.fillText(icon, cx, cy + 1);
        }
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(runGameLoop);
  }, []);

  // Start new round
  const handleStart = () => {
    audioManager.init();
    audioManager.playTempleBell();

    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectRef.current = 0;
    greatRef.current = 0;
    goodRef.current = 0;
    missRef.current = 0;
    totalNotesRef.current = 0;
    timeLeftRef.current = ROUND_TIME;
    notesRef.current = [];

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAccuracy(100);
    setPerfectCount(0);
    setGreatCount(0);
    setGoodCount(0);
    setMissCount(0);
    setTimeLeft(ROUND_TIME);
    setFloatingTexts([]);

    startTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    gameStateRef.current = 'playing';
    setGameState('playing');

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(runGameLoop);
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
    handleStart();
  };

  useEffect(() => {
    return () => {
      gameStateRef.current = 'start';
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Multiplier calculation for HUD
  const currentMultiplier =
    combo >= 50 ? 5.0 : combo >= 35 ? 4.0 : combo >= 20 ? 3.0 : combo >= 10 ? 2.0 : combo >= 5 ? 1.5 : 1.0;

  // Round progress percentage (0% to 100%)
  const progressPercent = Math.min(100, Math.max(0, Math.round(((ROUND_TIME - timeLeft) / ROUND_TIME) * 100)));

  // Performance grade for results screen
  const getRankBadge = () => {
    if (accuracy >= 95 || score >= 2800) return { title: 'Maha Dhol Maestro', rank: 'S', badge: '👑', color: 'text-amber-300' };
    if (accuracy >= 85 || score >= 1800) return { title: 'Rhythm Virtuoso', rank: 'A', badge: '🌟', color: 'text-yellow-300' };
    if (accuracy >= 70 || score >= 1000) return { title: 'Devoted Celebrant', rank: 'B', badge: '🌸', color: 'text-emerald-300' };
    return { title: 'Blessed Aspirant', rank: 'C', badge: '🌱', color: 'text-amber-200' };
  };

  const rankInfo = getRankBadge();

  return (
    <div className="max-w-xl mx-auto px-3 py-2 sm:py-3 flex flex-col items-center select-none animate-fade-in relative">
      {/* Screen Effects for Perfect / Miss Hits */}
      {screenFlash === 'perfect' && (
        <div className="fixed inset-0 pointer-events-none z-30 border-4 border-amber-400/60 bg-amber-400/5 animate-pulse" />
      )}
      {screenFlash === 'miss' && (
        <div className="fixed inset-0 pointer-events-none z-30 border-4 border-rose-500/50 bg-rose-500/5" />
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
            <span>🥁 Dhol Beat</span>
          </h2>
          <span className="text-[10px] sm:text-xs text-amber-400 font-semibold">
            Bolo Ganpati Bappa Morya!
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

      {/* Score, Combo & Accuracy HUD Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mb-2.5 text-center">
        <Card variant="glass" padding="sm" className="border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Score</span>
          <span className="text-base sm:text-xl font-black festive-text-gold tracking-wide">
            {score.toLocaleString()}
          </span>
        </Card>

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

        <Card variant="glass" padding="sm" className="border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400/80 block">Accuracy</span>
          <span className="text-base sm:text-xl font-extrabold text-amber-200">{accuracy}%</span>
        </Card>
      </div>

      {/* Main Rhythm Highway Stage */}
      <div className="relative w-full h-[370px] sm:h-[430px] rounded-3xl festive-glass-glow border-2 border-amber-500/45 overflow-hidden flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] touch-none">
        {/* Highway Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#18042B] via-[#24083D] to-[#0E021C] pointer-events-none opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.22),_transparent_70%)] pointer-events-none" />

        {/* 4 Highway Lanes Dividers */}
        <div className="absolute inset-0 grid grid-cols-4 divide-x divide-amber-500/20 pointer-events-none">
          <div className="hover:bg-amber-500/5 transition-colors" />
          <div className="hover:bg-amber-500/5 transition-colors" />
          <div className="hover:bg-amber-500/5 transition-colors" />
          <div className="hover:bg-amber-500/5 transition-colors" />
        </div>

        {/* 60 FPS Hardware-Accelerated Canvas for Falling Rhythm Notes */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none game-canvas z-10" />

        <div className="relative w-full h-full z-20">

          {/* Floating Score Popup Text */}
          {floatingTexts.map((item) => (
            <div
              key={item.id}
              className={`absolute -translate-x-1/2 pointer-events-none font-festive font-black text-center text-sm sm:text-base animate-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${item.color}`}
              style={{
                left: `${item.lane * 25 + 12.5}%`,
                top: '76%',
                animationDuration: '0.6s',
              }}
            >
              <div>{item.text}</div>
              {item.points > 0 && (
                <div className="text-[11px] font-bold text-amber-200">+{item.points}</div>
              )}
            </div>
          ))}

          {/* Central Hit / Judgement Floating Feedback Text */}
          {judgement && (
            <div
              key={judgement.id}
              className={`absolute top-24 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-black font-festive animate-ping pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] ${judgement.color}`}
              style={{ animationDuration: '0.5s' }}
            >
              {judgement.text}
            </div>
          )}

          {/* Target Strike Line Zone (at y = 88%) */}
          <div className="absolute left-0 right-0 top-[88%] -translate-y-1/2 h-16 border-y-2 border-amber-400/40 bg-amber-400/10 backdrop-blur-sm pointer-events-none flex items-center justify-around">
            {[0, 1, 2, 3].map((laneIdx) => {
              const isHitActive = activePad === laneIdx;
              const laneInfo = LANES[laneIdx];
              return (
                <div
                  key={laneIdx}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    isHitActive
                      ? 'scale-125 bg-amber-400/40 border-white shadow-[0_0_24px_#F59E0B]'
                      : 'border-amber-300/50 bg-black/40'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      isHitActive ? 'bg-white scale-125' : 'bg-amber-400/80'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* START SCREEN OVERLAY */}
          {gameState === 'start' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-4xl mb-2 shadow-lg shadow-amber-500/30 border-2 border-yellow-300/50 animate-bounce">
                🥁
              </div>
              <h3 className="text-2xl sm:text-3xl font-festive font-black text-amber-100 mb-1 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                Dhol Beat Rhythm
              </h3>
              <p className="text-xs sm:text-sm text-amber-300/90 max-w-xs mb-3 font-medium">
                60 seconds of high-energy dhol-tasha beats! Strike notes as they align with the glowing circles.
              </p>

              {/* Timing Windows Guide */}
              <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs mb-4 text-[10px] font-bold">
                <div className="bg-amber-500/20 border border-amber-400/40 p-1.5 rounded-xl text-amber-200">
                  <div className="text-amber-300 font-black">PERFECT</div>
                  <div className="text-[9px] text-amber-400/80">+150 pts</div>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-400/40 p-1.5 rounded-xl text-emerald-200">
                  <div className="text-emerald-300 font-black">GREAT</div>
                  <div className="text-[9px] text-emerald-400/80">+100 pts</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-400/40 p-1.5 rounded-xl text-yellow-200">
                  <div className="text-yellow-300 font-black">GOOD</div>
                  <div className="text-[9px] text-yellow-400/80">+50 pts</div>
                </div>
                <div className="bg-rose-500/20 border border-rose-400/40 p-1.5 rounded-xl text-rose-200">
                  <div className="text-rose-300 font-black">MISS</div>
                  <div className="text-[9px] text-rose-400/80">0 pts</div>
                </div>
              </div>

              {/* Controls Note */}
              <div className="text-[11px] text-amber-300/80 mb-5 font-mono">
                Keyboard: <b>[D] [F] [J] [K]</b> or <b>[1] [2] [3] [4]</b> • Touch on mobile
              </div>

              <Button
                variant="primary-gold"
                size="lg"
                shine
                glow
                onClick={handleStart}
                icon={<Play className="w-5 h-5 fill-slate-950" />}
                className="px-6 py-2.5 text-base font-bold shadow-[0_5px_0_#B45309,0_10px_20px_rgba(245,158,11,0.4)]"
              >
                START DHOL BEAT 🥁
              </Button>
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
                  Resume Beats
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
              {/* Rank & Trophy Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 border-2 border-yellow-300 flex items-center justify-center text-3xl sm:text-4xl mb-1 shadow-lg shadow-amber-500/30">
                {rankInfo.badge}
              </div>

              <h3 className="text-xl sm:text-2xl font-festive font-black text-amber-100">
                {rankInfo.title}
              </h3>
              <span className={`text-xs font-bold ${rankInfo.color} mb-3`}>
                Rank {rankInfo.rank} Devotion
              </span>

              {/* Final Score Pill */}
              <div className="w-full max-w-xs p-3 rounded-2xl bg-black/60 border border-amber-500/40 mb-3 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                  Final Festival Score
                </span>
                <span className="text-2xl sm:text-3xl font-black festive-text-gold tracking-wide">
                  {(score + maxCombo * 30 + (accuracy >= 95 ? 750 : accuracy >= 85 ? 500 : accuracy >= 70 ? 250 : 0)).toLocaleString()}{' '}
                  <span className="text-sm font-normal text-amber-400">pts</span>
                </span>
                <span className="text-[10px] text-amber-300/80 block mt-0.5">
                  Base: {score.toLocaleString()} • Combo Bonus: +{(maxCombo * 30).toLocaleString()}
                </span>
              </div>

              {/* Timing Breakdown 4-Stats Grid */}
              <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs mb-3 text-[10px]">
                <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30">
                  <span className="text-amber-300 font-bold block">🌟 Perfect</span>
                  <span className="text-xs font-black text-amber-100">{perfectCount}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                  <span className="text-emerald-300 font-bold block">✨ Great</span>
                  <span className="text-xs font-black text-emerald-100">{greatCount}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-yellow-500/15 border border-yellow-400/30">
                  <span className="text-yellow-300 font-bold block">🪔 Good</span>
                  <span className="text-xs font-black text-yellow-100">{goodCount}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-400/30">
                  <span className="text-rose-300 font-bold block">❌ Miss</span>
                  <span className="text-xs font-black text-rose-100">{missCount}</span>
                </div>
              </div>

              {/* Max Combo & Accuracy Details */}
              <div className="flex items-center justify-between w-full max-w-xs px-2 text-xs font-bold text-amber-300/90 mb-4">
                <span>Max Combo: {maxCombo}x 🔥</span>
                <span>Accuracy: {accuracy}% 🎯</span>
              </div>

              {/* Actions: Replay & Done */}
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
      </div>

      {/* Mobile Touch & Desktop Strike Pads */}
      <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-3 mt-2.5 touch-none">
        {LANES.map((lane, idx) => {
          const isActive = activePad === idx;
          return (
            <button
              key={lane.key}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleHit(idx);
              }}
              className={`relative min-h-[58px] sm:min-h-[72px] py-2 sm:py-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 active-press transition-all shadow-md touch-none ${
                isActive
                  ? `border-white scale-95 shadow-[0_0_24px_#F59E0B] bg-gradient-to-tr ${lane.color}`
                  : `border-amber-500/35 bg-black/45 hover:bg-black/65`
              }`}
            >
              <span className="text-xl sm:text-2xl filter drop-shadow">{lane.icon}</span>
              <span className="text-xs sm:text-sm font-black text-amber-100">{lane.label}</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono font-bold">
                [{lane.key}] / [{lane.altKey}]
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
