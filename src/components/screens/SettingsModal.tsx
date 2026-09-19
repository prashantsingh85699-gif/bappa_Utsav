import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Eye, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import { GameSettings } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { audioManager } from '../../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  initialTab?: 'settings' | 'howToPlay' | 'about';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
  initialTab = 'settings',
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'howToPlay' | 'about'>(initialTab);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleToggleMusic = () => {
    audioManager.playClick();
    const next = !settings.sound.musicEnabled;
    audioManager.setMusicEnabled(next);
    onUpdateSettings({
      sound: { ...settings.sound, musicEnabled: next },
    });
  };

  const handleToggleSfx = () => {
    audioManager.playClick();
    const next = !settings.sound.sfxEnabled;
    audioManager.setSfxEnabled(next);
    onUpdateSettings({
      sound: { ...settings.sound, sfxEnabled: next },
    });
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioManager.setMusicVolume(val);
    onUpdateSettings({
      sound: { ...settings.sound, musicVolume: val, volume: val },
    });
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioManager.setSfxVolume(val);
    onUpdateSettings({
      sound: { ...settings.sound, sfxVolume: val },
    });
    // Live audition chime
    audioManager.playButtonClick();
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    audioManager.playButtonClick();
    onUpdateSettings({
      sound: { ...settings.sound, masterVolume: muted ? 0 : 1.0 },
    });
  };

  const handleToggleMotion = () => {
    audioManager.playClick();
    onUpdateSettings({
      reducedMotion: !settings.reducedMotion,
    });
  };

  const isMuted = audioManager.getIsMuted();
  const musicVolPercent = Math.round((settings.sound.musicVolume ?? 0.7) * 100);
  const sfxVolPercent = Math.round((settings.sound.sfxVolume ?? 0.8) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Festival Preferences"
      subtitle="Sound, accessibility, guides & cultural lore"
      icon={<span>🪔</span>}
      maxWidth="lg"
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-3 border-b border-amber-500/20 pb-2">
        {[
          { id: 'settings', label: 'Settings', icon: Volume2 },
          { id: 'howToPlay', label: 'How to Play', icon: HelpCircle },
          { id: 'about', label: 'About & Lore', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { audioManager.playClick(); setActiveTab(tab.id as typeof activeTab); }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-sm'
                  : 'text-amber-300/60 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-3.5 text-amber-100 text-sm">
        {activeTab === 'settings' && (
          <div className="space-y-3">
            {/* Master Audio Mute Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/40 border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl transition-all ${
                    isMuted
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  }`}
                  aria-label={isMuted ? 'Unmute All Audio' : 'Mute All Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-amber-200">
                    {isMuted ? 'All Audio Muted' : 'Master Audio Active'}
                  </span>
                  <span className="text-[10px] text-amber-400/70 block">
                    {isMuted ? 'Tap to restore all festival sounds' : 'Original Indian festival soundscape'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isMuted
                    ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute All'}
              </button>
            </div>

            {/* Music Ambient Card */}
            <Card variant="glass" padding="sm" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">Festival Ambience Music</h4>
                    <p className="text-xs text-amber-300/70">Original instrumental Tanpura & Bansuri</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className="touch-target flex items-center justify-center active-press"
                  aria-label="Toggle music"
                >
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      settings.sound.musicEnabled ? 'bg-amber-500 shadow-[0_0_10px_#F59E0B]' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.sound.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Music Volume Slider */}
              {settings.sound.musicEnabled && (
                <div className="pt-1 px-1 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-amber-400/80 w-12">
                    Vol: {musicVolPercent}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sound.musicVolume ?? 0.7}
                    onChange={handleMusicVolumeChange}
                    className="flex-1 h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    aria-label="Music Volume"
                  />
                </div>
              )}
            </Card>

            {/* Sound Effects Card */}
            <Card variant="glass" padding="sm" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                    {settings.sound.sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">Sound Effects (SFX)</h4>
                    <p className="text-xs text-amber-300/70">Dhol beats, bells, pops & chimes</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className="touch-target flex items-center justify-center active-press"
                  aria-label="Toggle SFX"
                >
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      settings.sound.sfxEnabled ? 'bg-amber-500 shadow-[0_0_10px_#F59E0B]' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.sound.sfxEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* SFX Volume Slider */}
              {settings.sound.sfxEnabled && (
                <div className="pt-1 px-1 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-amber-400/80 w-12">
                    Vol: {sfxVolPercent}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sound.sfxVolume ?? 0.8}
                    onChange={handleSfxVolumeChange}
                    className="flex-1 h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    aria-label="SFX Volume"
                  />
                </div>
              )}
            </Card>

            {/* Reduced Motion */}
            <Card variant="glass" padding="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-200 text-sm">Reduced Motion</h4>
                  <p className="text-xs text-amber-300/70">Reduces floating petals & heavy animations</p>
                </div>
              </div>
              <button
                onClick={handleToggleMotion}
                className="touch-target flex items-center justify-center active-press"
                aria-label="Toggle reduced motion"
              >
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.reducedMotion ? 'bg-amber-500 shadow-[0_0_10px_#F59E0B]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </Card>

            {/* Reset Data */}
            <Card variant="glass" padding="sm" className="border-rose-900/40 bg-rose-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-300 text-sm">Reset Progress</h4>
                  <p className="text-xs text-rose-300/70">Clear all saved points, levels, and unlocks</p>
                </div>
                {!confirmReset ? (
                  <Button
                    variant="crimson"
                    size="sm"
                    onClick={() => setConfirmReset(true)}
                  >
                    Reset
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="crimson"
                      size="sm"
                      onClick={() => {
                        audioManager.playHazardHit();
                        onResetProgress();
                        setConfirmReset(false);
                        onClose();
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmReset(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'howToPlay' && (
          <div className="space-y-2.5 text-xs sm:text-sm">
            <Card variant="glass" padding="sm">
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                🥁 1. Dhol Beat
              </h4>
              <p className="text-amber-200/80 leading-relaxed">
                Rhythm notes stream down 4 lanes. Tap the drum pads or press keys <b>[D] [F] [J] [K]</b> when the note reaches the glowing circle. Combo multiplier builds up to 5x!
              </p>
            </Card>

            <Card variant="glass" padding="sm">
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                🌸 2. Mandap Designer
              </h4>
              <p className="text-amber-200/80 leading-relaxed">
                Decorate Lord Ganesha’s sacred stage. Drag and place garlands, diyas, curtains, rangoli, and modak offerings. Tap placed items to scale, rotate, or delete.
              </p>
            </Card>

            <Card variant="glass" padding="sm">
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                🍬 3. Modak Catch
              </h4>
              <p className="text-amber-200/80 leading-relaxed">
                Move your basket using touch swipe, mouse drag, or Arrow / A-D keys. Catch sweet Modaks and golden laddoos for bonus points. Avoid hazards!
              </p>
            </Card>

            <Card variant="glass" padding="sm">
              <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                🧠 4. Bappa Quiz
              </h4>
              <p className="text-amber-200/80 leading-relaxed">
                10 respectful questions on traditions, symbolism, and history. Answer correctly in a streak for progressive bonus multiplier points!
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-amber-200/90">
            <Card variant="ornate" padding="sm">
              <h4 className="font-bold font-festive text-amber-200 text-base mb-1">
                Ganpati Bappa Morya! 🙏
              </h4>
              <p>
                <b>BAPPA UTSAV</b> is an interactive festival game celebrating the auspicious arrival of Lord Ganesha, the remover of obstacles (Vighnaharta) and patron of wisdom, arts, and joyful new beginnings.
              </p>
            </Card>

            <Card variant="glass" padding="sm" className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Offline Procedural Audio</span>
              </div>
              <p className="text-xs text-amber-300/70">
                All dhol percussion and temple bells are synthesized mathematically with zero copyrighted external files.
              </p>
            </Card>

            <Card variant="glass" padding="sm" className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Eco-Friendly Traditions</span>
              </div>
              <p className="text-xs text-amber-300/70">
                Celebrating clay idols (shadu mati), eco-friendly celebrations, and the timeless spirit of community.
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-amber-500/20 text-center">
        <Button variant="primary-gold" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
