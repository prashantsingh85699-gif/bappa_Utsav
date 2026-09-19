import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Award,
  RotateCcw,
  Home,
  BookOpen,
  Trophy,
  ChevronRight,
  Star,
  Target,
  Clock
} from 'lucide-react';
import { GameResult, QuizQuestion } from '../../types';
import { getRandomQuizRound, QUIZ_QUESTIONS, QuizTopic } from '../../data/quizQuestions';
import { audioManager } from '../../services/audioService';
import { fireFestiveConfetti } from '../../utils/confetti';

interface BappaQuizGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

const QUESTIONS_PER_ROUND = 10;

// Topic visual styling
const TOPIC_BADGES: Record<string, { label: string; icon: string; color: string; border: string }> = {
  'Modak': { label: 'Modak Prasad', icon: '🥟', color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
  'Lord Ganesha': { label: 'Lord Ganesha', icon: '🕉️', color: 'bg-orange-500/20 text-orange-300', border: 'border-orange-500/40' },
  'Ganesh Chaturthi': { label: 'Ganesh Chaturthi', icon: '🌺', color: 'bg-rose-500/20 text-rose-300', border: 'border-rose-500/40' },
  'Festival Traditions': { label: 'Traditions', icon: '🪔', color: 'bg-yellow-500/20 text-yellow-300', border: 'border-yellow-500/40' },
  'Decorations': { label: 'Decorations', icon: '🌸', color: 'bg-pink-500/20 text-pink-300', border: 'border-pink-500/40' },
  'Cultural Facts': { label: 'Cultural Lore', icon: '🥁', color: 'bg-purple-500/20 text-purple-300', border: 'border-purple-500/40' },
};

export const BappaQuizGame: React.FC<BappaQuizGameProps> = ({ onFinish, onExit }) => {
  // Game states: 'intro' | 'playing' | 'results'
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Score & Streak Tracking
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastPointGain, setLastPointGain] = useState<{ amount: number; isBonus: boolean } | null>(null);

  // Results calculation state
  const [finalResult, setFinalResult] = useState<GameResult | null>(null);

  // Initialize round questions
  const startNewRound = useCallback(() => {
    const roundQuestions = getRandomQuizRound(QUESTIONS_PER_ROUND);
    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setLastPointGain(null);
    setFinalResult(null);
    setGameState('playing');
  }, []);

  const currentQ = questions[currentIndex];

  // Option selection logic
  const handleSelectOption = useCallback((index: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      audioManager.playQuizCorrect();
      setCorrectCount((c) => c + 1);

      setStreak((currStreak) => {
        const nextStreak = currStreak + 1;
        setMaxStreak((m) => Math.max(m, nextStreak));

        // Scoring Formula: 100 base points + 30 points per streak level
        const streakBonus = (nextStreak - 1) * 30;
        const totalEarned = 100 + streakBonus;

        setScore((prev) => prev + totalEarned);
        setLastPointGain({ amount: totalEarned, isBonus: nextStreak > 1 });

        return nextStreak;
      });
    } else {
      audioManager.playQuizWrong();
      setStreak(0);
      setLastPointGain(null);
    }
  }, [isAnswered, currentQ]);

  // Next Question or Final Results
  const handleNextQuestion = useCallback(() => {
    audioManager.playClick();

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setLastPointGain(null);
    } else {
      // Round Complete - Calculate Bonuses and Final Results
      const accuracyPct = Math.round((correctCount / QUESTIONS_PER_ROUND) * 100);
      const perfectBonus = correctCount === QUESTIONS_PER_ROUND ? 500 : correctCount >= 8 ? 250 : 0;
      const streakReward = maxStreak * 40;
      const totalBonus = perfectBonus + streakReward;
      const finalRoundScore = score + totalBonus;

      const resultData: GameResult = {
        gameId: 'quiz',
        gameName: 'Bappa Wisdom Quiz',
        baseScore: score,
        bonusScore: totalBonus,
        comboOrAccuracy: `${correctCount}/${QUESTIONS_PER_ROUND} Correct (${accuracyPct}%) • Max Streak: ${maxStreak}x`,
        finalScore: finalRoundScore,
        statsPayload: {
          itemsCount: correctCount,
          maxCombo: maxStreak,
          accuracyPct: accuracyPct,
          isFlawless: correctCount === QUESTIONS_PER_ROUND,
        },
      };

      setFinalResult(resultData);
      setGameState('results');
      audioManager.playGameComplete();
      fireFestiveConfetti();
    }
  }, [currentIndex, questions.length, correctCount, maxStreak, score]);

  // Keyboard accessibility: 1-4, A-D for options, Space/Enter for Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption(0);
        else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption(1);
        else if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption(2);
        else if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isAnswered, handleSelectOption, handleNextQuestion]);

  // Determine Devotee Wisdom Title
  const getDevoteeTitle = (correct: number) => {
    if (correct === 10) return { title: 'Maha Vidvan (Supreme Scholar) 👑', desc: 'Flawless divine wisdom! Lord Ganesha has showered you with boundless knowledge.' };
    if (correct >= 8) return { title: 'Bappa Bhakt (Devoted Seeker) 🌸', desc: 'Outstanding devotion! You hold profound reverence and knowledge of our holy traditions.' };
    if (correct >= 5) return { title: 'Jnani Devotee (Wise Pilgrim) 🕉️', desc: 'Commendable understanding of Bappa’s lore and cultural heritage.' };
    return { title: 'Shishya (Humble Learner) 🪔', desc: 'A blessed start on the path of wisdom. Keep learning the sacred lore of Bappa!' };
  };

  // ==========================================
  // VIEW 1: INTRO SCREEN
  // ==========================================
  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center select-none animate-slide-in-up">
        {/* Back navigation */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => { audioManager.playClick(); onExit(); }}
            className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 active-press transition-all touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Festival Hub</span>
          </button>
          <span className="text-xs font-bold text-amber-400/80 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Round: 10 Sacred Questions
          </span>
        </div>

        {/* Hero Card */}
        <div className="w-full festive-glass-glow rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-scale-pulse">
            <span className="text-4xl">🧠</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-festive festive-text-gold mb-2">
            Bappa Wisdom Quiz
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-md mx-auto mb-6 leading-relaxed">
            Test your spiritual devotion, cultural lore, and knowledge of Lord Ganesha across 10 sacred questions.
          </p>

          {/* 6 Core Topics Grid */}
          <div className="mb-6 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sacred Topics Explored</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(TOPIC_BADGES).map(([key, topic]) => (
                <div
                  key={key}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${topic.color} ${topic.border} backdrop-blur-sm card-hover-lift`}
                >
                  <span className="text-lg">{topic.icon}</span>
                  <span className="text-xs font-semibold">{topic.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Bonuses Pill */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-amber-500/20 mb-6 text-center text-xs">
            <div>
              <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Per Question</span>
              <span className="font-bold text-amber-100">+100 Pts</span>
            </div>
            <div>
              <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Streak Bonus</span>
              <span className="font-bold text-orange-400">+30 Pts/Streak</span>
            </div>
            <div>
              <span className="text-amber-400/70 block text-[10px] uppercase font-bold">Perfect Round</span>
              <span className="font-bold text-emerald-400">+500 Pts</span>
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={() => {
              audioManager.playGameStart();
              startNewRound();
            }}
            className="w-full py-4 px-8 rounded-2xl festive-gold-gradient text-slate-950 font-extrabold text-base sm:text-lg shadow-xl hover:brightness-110 active-press transition-all flex items-center justify-center gap-2"
          >
            <span>Begin Quiz Round</span>
            <Sparkles className="w-5 h-5 text-amber-900 animate-spin-slow" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: FINAL RESULTS SCREEN
  // ==========================================
  if (gameState === 'results' && finalResult) {
    const accuracy = Math.round((correctCount / QUESTIONS_PER_ROUND) * 100);
    const titleInfo = getDevoteeTitle(correctCount);

    return (
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col items-center select-none animate-slide-in-up">
        {/* Results Card */}
        <div className="w-full festive-glass-glow rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/50 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-scale-pulse">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-festive festive-text-gold mb-1">
            Quiz Round Completed!
          </h2>
          <p className="text-xs text-amber-300/80 mb-5 font-semibold">
            Bappa Wisdom & Cultural Lore Blessings
          </p>

          {/* Devotee Title Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
              Devotee Wisdom Title
            </span>
            <h3 className="text-lg sm:text-xl font-black text-amber-100 mb-1">
              {titleInfo.title}
            </h3>
            <p className="text-xs text-amber-200/90 italic">
              "{titleInfo.desc}"
            </p>
          </div>

          {/* Stats 4-Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Final Score */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-400/70">Score</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black festive-text-gold">
                {finalResult.finalScore.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/60 block mt-0.5">festival points</span>
            </div>

            {/* Correct Answers */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-400/70">Correct</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-300">
                {correctCount} / {QUESTIONS_PER_ROUND}
              </span>
              <span className="text-[10px] text-emerald-400/70 block mt-0.5">{accuracy}% Accuracy</span>
            </div>

            {/* Accuracy Bar */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-400/70">Accuracy</span>
                <Target className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-sky-300">
                {accuracy}%
              </span>
              <span className="text-[10px] text-sky-400/70 block mt-0.5">precision rating</span>
            </div>

            {/* Max Streak */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-amber-400/70">Max Streak</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-orange-300">
                {maxStreak}x
              </span>
              <span className="text-[10px] text-orange-400/70 block mt-0.5">consecutive correct</span>
            </div>
          </div>

          {/* Score breakdown detail */}
          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 mb-6 text-xs text-left space-y-1.5">
            <div className="flex justify-between text-amber-200/80">
              <span>Base Points ({correctCount} × 100):</span>
              <span className="font-semibold">{score} pts</span>
            </div>
            {finalResult.bonusScore > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Streak & Perfection Bonus:</span>
                <span className="font-semibold">+{finalResult.bonusScore} pts</span>
              </div>
            )}
            <div className="border-t border-amber-500/20 pt-1.5 flex justify-between font-bold text-amber-100">
              <span>Total Points Earned:</span>
              <span className="festive-text-gold text-sm">{finalResult.finalScore.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                audioManager.playTempleBell();
                onFinish(finalResult);
              }}
              className="w-full py-3.5 px-6 rounded-2xl festive-gold-gradient text-slate-950 font-extrabold text-sm sm:text-base shadow-xl hover:brightness-110 active-press transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Claim Blessings & Return to Hub</span>
            </button>

            <button
              onClick={() => {
                audioManager.playClick();
                startNewRound();
              }}
              className="w-full py-3 px-6 rounded-2xl bg-black/50 hover:bg-black/70 border border-amber-500/40 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 active-press transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another 10-Question Round</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE PLAYING HUD & QUESTIONS
  // ==========================================
  if (!currentQ) return null;

  const topicConfig = TOPIC_BADGES[currentQ.category] || {
    label: currentQ.category,
    icon: '🪔',
    color: 'bg-amber-500/20 text-amber-300',
    border: 'border-amber-500/40',
  };

  const progressPct = ((currentIndex + 1) / QUESTIONS_PER_ROUND) * 100;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 flex flex-col items-center select-none animate-slide-in-up">
      {/* Top Bar Navigation & Counters */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => { audioManager.playClick(); onExit(); }}
          className="p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 active-press touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold font-festive text-amber-100 flex items-center justify-center gap-1.5">
            <span>🧠 Bappa Wisdom Quiz</span>
          </h2>
        </div>

        {/* Question Counter Pill */}
        <div className="px-3 py-1 rounded-xl bg-black/50 border border-amber-500/40 text-amber-200 font-mono font-bold text-xs sm:text-sm">
          {currentIndex + 1} / {QUESTIONS_PER_ROUND}
        </div>
      </div>

      {/* Progress Bar with Shimmer */}
      <div className="w-full h-2 bg-black/50 rounded-full mb-3 overflow-hidden border border-amber-500/20 relative">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progressPct}%` }}
        >
          <div className="absolute inset-0 progress-bar-shimmer" />
        </div>
      </div>

      {/* HUD: Score, Streak, Correct Count */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {/* Score */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 text-center relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Score</span>
          <span className="text-base sm:text-lg font-black festive-text-gold block">
            {score.toLocaleString()}
          </span>
          {lastPointGain && (
            <span className="absolute top-1 right-2 text-xs font-black text-emerald-400 animate-score-pop pointer-events-none">
              +{lastPointGain.amount}
            </span>
          )}
        </div>

        {/* Streak with Fire Indicator */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Streak</span>
          <div className="flex items-center justify-center gap-1">
            {streak >= 2 && <Flame className="w-4 h-4 text-orange-500 animate-pulse-glow" />}
            <span className={`text-base sm:text-lg font-black ${streak >= 2 ? 'text-orange-400' : 'text-amber-200'}`}>
              {streak}x
            </span>
          </div>
        </div>

        {/* Correct Answers */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400/70 block">Correct</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 block">
            {correctCount} / {currentIndex + (isAnswered ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full festive-glass-glow rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-2xl relative">
        {/* Question Header: Topic Category & ID */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${topicConfig.color} ${topicConfig.border}`}>
            <span>{topicConfig.icon}</span>
            <span>{topicConfig.label}</span>
          </span>
          <span className="text-xs text-amber-400/70 font-medium flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Question {currentIndex + 1} of {QUESTIONS_PER_ROUND}</span>
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-amber-100 leading-snug mb-5">
          {currentQ.question}
        </h3>

        {/* Four Large Answer Buttons */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            // Default State: Large, tactile, clear letter badge
            let buttonStyle =
              'bg-black/40 border-amber-500/30 text-amber-100 hover:border-amber-400 hover:bg-black/60 shadow-md';

            if (isAnswered) {
              if (isCorrect) {
                // Correct answer glows green
                buttonStyle =
                  'bg-emerald-600/30 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_18px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400';
              } else if (isSelected && !isCorrect) {
                // Selected wrong answer glows red
                buttonStyle =
                  'bg-rose-600/30 border-rose-400 text-rose-100 font-bold shadow-[0_0_18px_rgba(244,63,94,0.35)] ring-1 ring-rose-400';
              } else {
                // Dim other unselected answers
                buttonStyle = 'bg-black/20 border-zinc-800 text-zinc-500 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-200 active-press min-h-[52px] ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5 pr-2">
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold font-mono transition-all ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-400 text-slate-950 shadow-md'
                        : isAnswered && isSelected && !isCorrect
                        ? 'bg-rose-400 text-slate-950 shadow-md'
                        : 'bg-amber-500/20 border border-amber-400/40 text-amber-200'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {isAnswered && (
                  <div className="flex-shrink-0 ml-2">
                    {isCorrect && (
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-scale-pulse" />
                        <span className="hidden sm:inline">Correct</span>
                      </div>
                    )}
                    {isSelected && !isCorrect && (
                      <div className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span className="hidden sm:inline">Incorrect</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sacred Lore & Wisdom Explanation Card */}
        {isAnswered && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-purple-950/80 border border-amber-400/50 text-left shadow-xl animate-slide-in-up">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sacred Lore & Spiritual Wisdom</span>
              </div>
              {streak >= 2 && selectedOption === currentQ.correctIndex && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  🔥 {streak}x Streak (+{ (streak - 1) * 30 } pts bonus)
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed mb-4">
              {currentQ.explanation}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
              <span className="text-[11px] text-amber-400/60 font-mono hidden sm:inline">
                Press [Enter] or click to continue
              </span>

              <button
                onClick={handleNextQuestion}
                className="ml-auto py-2.5 px-6 rounded-xl festive-gold-gradient text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:brightness-110 active-press transition-all flex items-center gap-1.5"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Final Results'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
