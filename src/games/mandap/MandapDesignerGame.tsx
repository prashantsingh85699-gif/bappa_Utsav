import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, RotateCw, Trash2, ZoomIn, ZoomOut, Check, Sparkles,
  RotateCcw, Eye, Save, Layers, Undo2, Lock, Info, Flower2, Flame,
  Share2, Award, HeartHandshake
} from 'lucide-react';
import { GameResult, MandapItemInstance, DecorationDef, DecorationCategory } from '../../types';
import { DECORATION_CATALOG } from '../../data/decorations';
import { BappaMurti } from '../../components/common/BappaMurti';
import { DecorItemVector } from '../../components/common/DecorItemVector';
import { FloatingPetals } from '../../components/common/FloatingPetals';
import { calculateMandapScore } from '../../utils/scoring';
import { audioManager } from '../../services/audioService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface MandapDesignerGameProps {
  unlockedItemIds: string[];
  playerLevel: number;
  initialSaveData?: MandapItemInstance[];
  onSaveMandap: (items: MandapItemInstance[]) => void;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

export const MandapDesignerGame: React.FC<MandapDesignerGameProps> = ({
  unlockedItemIds,
  playerLevel,
  initialSaveData,
  onSaveMandap,
  onFinish,
  onExit,
}) => {
  // Main stage items state
  const [placedItems, setPlacedItems] = useState<MandapItemInstance[]>(() => {
    if (initialSaveData && initialSaveData.length > 0) return initialSaveData;
    // Default auspicious starting layout
    return [
      { instanceId: 'd1', itemId: 'clay_diya', x: 20, y: 78, scale: 1, rotation: 0, zIndex: 5 },
      { instanceId: 'd2', itemId: 'clay_diya', x: 80, y: 78, scale: 1, rotation: 0, zIndex: 5 },
      { instanceId: 'g1', itemId: 'marigold_single', x: 50, y: 15, scale: 1.2, rotation: 0, zIndex: 6 },
      { instanceId: 'm1', itemId: 'modak_plate', x: 50, y: 84, scale: 1, rotation: 0, zIndex: 8 },
    ];
  });

  // Undo history stack
  const [history, setHistory] = useState<MandapItemInstance[][]>([]);

  // Selection, category & presentation states
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [lockedModalItem, setLockedModalItem] = useState<DecorationDef | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const draggingItemRef = useRef<{
    instanceId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // 8 Specific Categories requested by the user + All & Offerings
  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'flowers', label: 'Flowers', icon: '🌸' },
    { id: 'diyas', label: 'Diyas', icon: '🪔' },
    { id: 'garlands', label: 'Garlands', icon: '🏵️' },
    { id: 'lights', label: 'Lights', icon: '💡' },
    { id: 'rangoli', label: 'Rangoli', icon: '💠' },
    { id: 'curtains', label: 'Curtains', icon: '🧣' },
    { id: 'banners', label: 'Banners', icon: '🚩' },
    { id: 'backgrounds', label: 'Backdrops', icon: '🌌' },
    { id: 'offerings', label: 'Offerings', icon: '🥟' },
  ];

  const availableItems = DECORATION_CATALOG.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Calculate current creative score
  const categoryCounts: Record<string, number> = {};
  placedItems.forEach((p) => {
    const def = DECORATION_CATALOG.find((d) => d.id === p.itemId);
    if (def) {
      categoryCounts[def.category] = (categoryCounts[def.category] || 0) + 1;
    }
  });
  const currentCreativeScore = calculateMandapScore(placedItems.length, categoryCounts);

  // Push current state to undo history
  const pushHistory = useCallback((items: MandapItemInstance[]) => {
    setHistory((prev) => [...prev.slice(-15), items]);
  }, []);

  // Undo previous action
  const handleUndo = () => {
    if (history.length === 0) return;
    audioManager.playClick();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setPlacedItems(previous);
    setSelectedInstanceId(null);
  };

  // Add item to stage
  const handleAddItem = (def: DecorationDef) => {
    const isUnlocked = unlockedItemIds.includes(def.id) || def.requiredLevel <= playerLevel;
    if (!isUnlocked) {
      audioManager.playHazardHit();
      setLockedModalItem(def);
      return;
    }

    audioManager.playClick();
    pushHistory(placedItems);

    // Contextual placement based on item category
    let initialX = 50;
    let initialY = 50;
    if (def.category === 'banners' || def.category === 'garlands') {
      initialY = 16 + Math.random() * 6;
    } else if (def.category === 'rangoli' || def.category === 'offerings') {
      initialY = 82 + Math.random() * 6;
    } else if (def.category === 'curtains') {
      initialX = placedItems.filter((i) => i.itemId.includes('curtain')).length % 2 === 0 ? 15 : 85;
      initialY = 48;
    } else if (def.category === 'backgrounds') {
      initialX = 50;
      initialY = 50;
    } else {
      initialX = 30 + Math.random() * 40;
      initialY = 35 + Math.random() * 40;
    }

    const newInstance: MandapItemInstance = {
      instanceId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      itemId: def.id,
      x: initialX,
      y: initialY,
      scale: 1,
      rotation: 0,
      zIndex: def.category === 'backgrounds' ? 2 : placedItems.length + 10,
    };

    setPlacedItems((prev) => [...prev, newInstance]);
    setSelectedInstanceId(newInstance.instanceId);
  };

  // Touch & Mouse Dragging Handlers
  const handlePointerDownItem = (e: React.PointerEvent, instanceId: string) => {
    e.stopPropagation();
    setSelectedInstanceId(instanceId);
    const item = placedItems.find((p) => p.instanceId === instanceId);
    if (!item) return;

    pushHistory(placedItems);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    draggingItemRef.current = {
      instanceId,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
    };
  };

  const handlePointerMoveStage = (e: React.PointerEvent) => {
    if (!draggingItemRef.current || !stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - draggingItemRef.current.startX) / stageRect.width) * 100;
    const dy = ((e.clientY - draggingItemRef.current.startY) / stageRect.height) * 100;

    const newX = Math.max(5, Math.min(95, draggingItemRef.current.origX + dx));
    const newY = Math.max(5, Math.min(95, draggingItemRef.current.origY + dy));

    setPlacedItems((prev) =>
      prev.map((item) =>
        item.instanceId === draggingItemRef.current?.instanceId
          ? { ...item, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }
          : item
      )
    );
  };

  const handlePointerUpStage = (e: React.PointerEvent) => {
    if (draggingItemRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      draggingItemRef.current = null;
    }
  };

  // Rotate object
  const handleRotateSelected = (angle: number = 45) => {
    if (!selectedInstanceId) return;
    audioManager.playClick();
    pushHistory(placedItems);
    setPlacedItems((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, rotation: (item.rotation + angle) % 360 }
          : item
      )
    );
  };

  // Resize object
  const handleScaleSelected = (delta: number) => {
    if (!selectedInstanceId) return;
    audioManager.playClick();
    pushHistory(placedItems);
    setPlacedItems((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId
          ? { ...item, scale: Math.max(0.5, Math.min(2.2, +(item.scale + delta).toFixed(1))) }
          : item
      )
    );
  };

  // Delete object
  const handleDeleteSelected = () => {
    if (!selectedInstanceId) return;
    audioManager.playHazardHit();
    pushHistory(placedItems);
    setPlacedItems((prev) => prev.filter((item) => item.instanceId !== selectedInstanceId));
    setSelectedInstanceId(null);
  };

  // Layer ordering: Bring to front
  const handleBringToFront = () => {
    if (!selectedInstanceId) return;
    audioManager.playClick();
    pushHistory(placedItems);
    const maxZ = Math.max(...placedItems.map((p) => p.zIndex), 10);
    setPlacedItems((prev) =>
      prev.map((item) =>
        item.instanceId === selectedInstanceId ? { ...item, zIndex: maxZ + 1 } : item
      )
    );
  };

  // Reset to Empty Mandap
  const handleResetToEmpty = () => {
    audioManager.playHazardHit();
    pushHistory(placedItems);
    setPlacedItems([]);
    setSelectedInstanceId(null);
  };

  // Save Design
  const handleSaveOnly = () => {
    audioManager.playTempleBell();
    onSaveMandap(placedItems);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Finish & Present Mandap
  const handleOpenPresentation = () => {
    audioManager.playTempleBell();
    onSaveMandap(placedItems);
    setIsPresentationMode(true);
    setSelectedInstanceId(null);
  };

  // Final submission from presentation screen
  const handleClaimAndFinish = () => {
    audioManager.playFanfare();
    const varietyBonus = Object.keys(categoryCounts).length * 150;
    const completenessBonus = placedItems.length >= 6 ? 400 : 200;
    const finalScore = currentCreativeScore.score + completenessBonus;

    onFinish({
      gameId: 'mandap',
      gameName: 'Mandap Designer',
      baseScore: currentCreativeScore.score,
      bonusScore: completenessBonus,
      comboOrAccuracy: currentCreativeScore.rating,
      finalScore,
      statsPayload: {
        itemsCount: placedItems.length,
        isFlawless: placedItems.length >= 8,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-2 sm:py-3 flex flex-col space-y-3 select-none animate-fade-in relative">
      {/* Toast Banner for Saved Design */}
      {saveToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600/90 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-emerald-400 animate-toast-in">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>Mandap design saved successfully! 🌸</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary-glass"
          size="sm"
          onClick={onExit}
          icon={<ArrowLeft className="w-4 h-4 text-amber-400" />}
        >
          Exit
        </Button>

        <div className="text-center">
          <h2 className="text-base sm:text-xl font-bold font-festive text-amber-100 flex items-center justify-center gap-1.5">
            <span>🌸 Mandap Designer</span>
          </h2>
          <span className="text-[10px] sm:text-xs text-amber-300 font-semibold">
            Score: <b className="text-yellow-300">{currentCreativeScore.score} pts</b> • {currentCreativeScore.rating}
          </span>
        </div>

        {/* Top Actions: Undo, Save, Present */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
              title="Undo last change"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          <button
            onClick={handleSaveOnly}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/40 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
            title="Save design to profile"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <Button
            variant="primary-gold"
            size="sm"
            shine
            glow
            onClick={handleOpenPresentation}
            icon={<Sparkles className="w-4 h-4 fill-slate-950" />}
            className="whitespace-nowrap"
          >
            <span><span className="hidden sm:inline">Finish & </span>Present</span>
          </Button>
        </div>
      </div>

      {/* Main Mandap Stage Viewport */}
      <div
        ref={stageRef}
        onPointerMove={handlePointerMoveStage}
        onPointerUp={handlePointerUpStage}
        onClick={() => setSelectedInstanceId(null)}
        className="relative w-full h-[370px] sm:h-[450px] rounded-3xl border-2 border-amber-500/40 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] festive-glass-glow cursor-crosshair select-none touch-none"
      >
        {/* Ambient Divine Atmosphere Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#18042B] via-[#2A0845] to-[#120224] pointer-events-none opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(245,158,11,0.22),_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

        {/* Lord Ganesha Murti in Center Stage */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
          <BappaMurti size={235} className="scale-95 sm:scale-105" />
        </div>

        {/* Placed Items on Stage */}
        {placedItems.map((instance) => {
          const def = DECORATION_CATALOG.find((d) => d.id === instance.itemId);
          if (!def) return null;
          const isSelected = selectedInstanceId === instance.instanceId;

          return (
            <div
              key={instance.instanceId}
              onPointerDown={(e) => handlePointerDownItem(e, instance.instanceId)}
              onClick={(e) => e.stopPropagation()}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform touch-none ${
                isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/60 rounded-2xl shadow-[0_0_20px_#F59E0B]' : ''
              }`}
              style={{
                left: `${instance.x}%`,
                top: `${instance.y}%`,
                zIndex: instance.zIndex,
                transform: `translate(-50%, -50%) scale(${instance.scale}) rotate(${instance.rotation}deg)`,
              }}
            >
              <DecorItemVector svgType={def.svgType} width={def.width} height={def.height} />
            </div>
          );
        })}

        {/* Floating Toolbar for Currently Selected Item */}
        {selectedInstanceId && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/85 border border-amber-400/60 shadow-2xl backdrop-blur-md animate-fade-in max-w-[95%]">
            <button
              onClick={() => handleRotateSelected(45)}
              className="p-2 rounded-xl hover:bg-white/15 text-amber-300 active-press transition-all touch-target"
              title="Rotate 45°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScaleSelected(0.1)}
              className="p-2 rounded-xl hover:bg-white/15 text-amber-300 active-press transition-all touch-target"
              title="Enlarge (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScaleSelected(-0.1)}
              className="p-2 rounded-xl hover:bg-white/15 text-amber-300 active-press transition-all touch-target"
              title="Shrink (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleBringToFront}
              className="p-2 rounded-xl hover:bg-white/15 text-amber-300 active-press transition-all touch-target"
              title="Bring to Front"
            >
              <Layers className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-amber-500/40 mx-0.5" />
            <button
              onClick={handleDeleteSelected}
              className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 active-press transition-all touch-target"
              title="Delete Decoration"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stage Reset button bottom left */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2">
          <button
            onClick={handleResetToEmpty}
            className="px-2.5 py-1 rounded-xl bg-black/60 border border-rose-800/60 hover:bg-rose-950/60 text-rose-300 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-sm"
            title="Start with an empty mandap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Empty Mandap</span>
          </button>
        </div>

        {/* Helpful Touch/Drag Instructions */}
        <div className="absolute bottom-3 right-3 z-30 text-[10px] text-amber-300/80 bg-black/60 px-2.5 py-1 rounded-xl border border-amber-500/20 backdrop-blur-sm">
          Drag objects to position • Tap for rotate & resize
        </div>
      </div>

      {/* 8-Category Decoration Inventory Drawer */}
      <div className="festive-glass rounded-3xl p-3 sm:p-4 border border-amber-500/30 space-y-2.5 shadow-xl">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar touch-pan-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                audioManager.playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md'
                  : 'bg-black/40 border border-amber-500/25 text-amber-200 hover:border-amber-400/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Decoration Inventory Items Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-44 overflow-y-auto pr-1">
          {availableItems.map((item) => {
            const isUnlocked = unlockedItemIds.includes(item.id) || item.requiredLevel <= playerLevel;

            return (
              <button
                key={item.id}
                onClick={() => handleAddItem(item)}
                className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-between transition-all active:scale-95 ${
                  isUnlocked
                    ? 'bg-black/45 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/15 cursor-pointer shadow-sm'
                    : 'bg-black/30 border-purple-900/40 opacity-60 hover:opacity-80 cursor-pointer'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center text-2xl mb-1">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-100 truncate w-full leading-tight">
                  {item.name}
                </span>

                {/* Unlocked status or Lock Requirement Badge */}
                {isUnlocked ? (
                  <span className="text-[9px] font-bold text-amber-400/80 mt-0.5">
                    + Add
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-300 mt-0.5">
                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                    <span>Lv.{item.requiredLevel}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOCKED DECORATION REQUIREMENT MODAL */}
      {lockedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <Card variant="glow" padding="md" className="max-w-sm w-full border-amber-400/60 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto">
              {lockedModalItem.icon}
            </div>

            <div>
              <h3 className="text-lg font-bold font-festive text-amber-100">
                {lockedModalItem.name}
              </h3>
              <p className="text-xs text-amber-300/80 mt-1">
                {lockedModalItem.description || 'A sacred offering for the Lord’s mandap.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-xs">
              <span className="text-amber-400 font-bold block mb-1">Unlock Requirement:</span>
              <span className="text-amber-200">
                Requires <b>Festival Level {lockedModalItem.requiredLevel}</b>
              </span>
              <p className="text-[11px] text-amber-300/70 mt-1">
                Earn festival points in Dhol Beat, Modak Catch, and Bappa Quiz to unlock!
              </p>
            </div>

            <Button
              variant="primary-gold"
              fullWidth
              onClick={() => {
                audioManager.playClick();
                setLockedModalItem(null);
              }}
            >
              Understood
            </Button>
          </Card>
        </div>
      )}

      {/* PRESENTATION MODE / “YOUR BAPPA UTSAV” ANIMATION SCREEN */}
      {isPresentationMode && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0E021C]/95 backdrop-blur-xl text-center overflow-y-auto animate-modal-pop">
          {/* Cascading Sacred Floating Flower Petals Animation */}
          <FloatingPetals count={16} />

          {/* Top Presentation Header */}
          <div className="pt-2 z-10 space-y-1">
            <span className="text-xs text-amber-300/80 font-festive uppercase tracking-widest">
              ॥ श्री गणेशाय नमः ॥
            </span>
            <h1 className="text-2xl sm:text-4xl font-festive font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
              Your Bappa Utsav
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
              Lord Ganesha is divinely enshrined in your sacred mandap!
            </p>
          </div>

          {/* Full-View Mandap Presentation Stage */}
          <div className="relative w-full max-w-2xl h-[340px] sm:h-[400px] my-3 rounded-3xl border-2 border-yellow-300/80 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.45)] bg-gradient-to-b from-[#18042B] via-[#2A0845] to-[#120224]">
            {/* Ambient Celestial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(245,158,11,0.3),_transparent_65%)] pointer-events-none animate-pulse-glow" />

            {/* Central Bappa Murti */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <BappaMurti size={240} className="scale-95 sm:scale-105" />
            </div>

            {/* Placed Items on Presentation Stage */}
            {placedItems.map((instance) => {
              const def = DECORATION_CATALOG.find((d) => d.id === instance.itemId);
              if (!def) return null;
              return (
                <div
                  key={instance.instanceId}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${instance.x}%`,
                    top: `${instance.y}%`,
                    zIndex: instance.zIndex,
                    transform: `translate(-50%, -50%) scale(${instance.scale}) rotate(${instance.rotation}deg)`,
                  }}
                >
                  <DecorItemVector svgType={def.svgType} width={def.width} height={def.height} />
                </div>
              );
            })}
          </div>

          {/* Creative Score & Completeness Card */}
          <Card variant="glass" padding="sm" className="w-full max-w-md border-amber-400/40 z-10">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2 mb-2">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                  Mandap Creative Rating
                </span>
                <span className="text-base sm:text-lg font-black text-amber-200">
                  {currentCreativeScore.rating}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                  Score Earned
                </span>
                <span className="text-xl sm:text-2xl font-black festive-text-gold">
                  +{currentCreativeScore.score.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Score Breakdown Pills */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] text-amber-200/90 font-medium text-center">
              <div className="p-1 rounded-xl bg-black/40 border border-amber-500/20">
                <span className="text-amber-400 block font-bold">{placedItems.length}</span>
                <span>Decorations</span>
              </div>
              <div className="p-1 rounded-xl bg-black/40 border border-amber-500/20">
                <span className="text-amber-400 block font-bold">
                  {Object.keys(categoryCounts).length} Types
                </span>
                <span>Variety</span>
              </div>
              <div className="p-1 rounded-xl bg-black/40 border border-amber-500/20">
                <span className="text-amber-400 block font-bold">Blessed 🪔</span>
                <span>Completeness</span>
              </div>
            </div>
          </Card>

          {/* Action Controls */}
          <div className="flex items-center gap-3 w-full max-w-md pt-3 z-10">
            <Button
              variant="secondary-glass"
              fullWidth
              onClick={() => {
                audioManager.playClick();
                setIsPresentationMode(false);
              }}
              icon={<RotateCcw className="w-4 h-4 text-amber-400" />}
            >
              Edit Mandap
            </Button>

            <Button
              variant="primary-gold"
              fullWidth
              shine
              glow
              onClick={handleClaimAndFinish}
              icon={<Sparkles className="w-4 h-4 fill-slate-950" />}
            >
              Save & Claim Blessings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
