import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, ChevronDown, Sparkles, Disc3, Play, Pause } from 'lucide-react';
import { audioManager, DEVOTIONAL_PLAYLIST, DevotionalSong } from '../../services/audioService';

interface DevotionalMusicWidgetProps {
  className?: string;
  compact?: boolean;
}

export const DevotionalMusicWidget: React.FC<DevotionalMusicWidgetProps> = ({
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioManager.isMusicActive());
  const [selectedSongId, setSelectedSongId] = useState<string>('jai_ganesh');
  const [volume, setVolume] = useState<number>(() => audioManager.getMusicVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuteActive());

  // Listen to periodic state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(audioManager.isMusicActive());
      setIsMuted(audioManager.isMuteActive());
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const currentSong = DEVOTIONAL_PLAYLIST.find((s) => s.id === selectedSongId) || DEVOTIONAL_PLAYLIST[0];

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioManager.init();
    if (isPlaying) {
      audioManager.stopMusic();
      setIsPlaying(false);
    } else {
      audioManager.playDevotionalSong(currentSong.id);
      setIsPlaying(true);
    }
  };

  const handleSelectSong = (song: DevotionalSong) => {
    audioManager.init();
    setSelectedSongId(song.id);
    audioManager.playDevotionalSong(song.id);
    setIsPlaying(true);
    setIsOpen(false);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioManager.init();
    audioManager.toggleMute();
    setIsMuted(audioManager.isMuteActive());
  };

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Trigger Button Pill */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-black/60 hover:bg-black/80 border border-amber-400/40 hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] backdrop-blur-md cursor-pointer active-press transition-all max-w-[280px] sm:max-w-xs"
        title="Bappa Devotional Aarti Player • Click to change song"
      >
        {/* Spinning Disc / Icon */}
        <div
          onClick={handleTogglePlay}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base flex-shrink-0 transition-transform ${
            isPlaying
              ? 'bg-gradient-to-tr from-amber-500 to-rose-600 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-spin-slow'
              : 'bg-zinc-800 text-zinc-400'
          }`}
          title={isPlaying ? 'Pause Song' : 'Play Song'}
        >
          {isPlaying ? <span>{currentSong.icon}</span> : <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300 ml-0.5" />}
        </div>

        {/* Song Info */}
        <div className="flex flex-col min-w-0 text-left flex-1 pr-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-300/80 tracking-wider">
              {isPlaying ? 'Now Playing Aarti' : 'Aarti Paused'}
            </span>
            {isPlaying && (
              <span className="flex gap-0.5 items-end h-2.5">
                <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2" />
                <span className="w-0.5 bg-yellow-300 rounded-full animate-pulse h-3 delay-75" />
                <span className="w-0.5 bg-rose-400 rounded-full animate-pulse h-1.5 delay-150" />
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-100 truncate leading-tight">
            {currentSong.name}
          </span>
        </div>

        {/* Dropdown chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-300 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Playlist Popover Menu */}
      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 rounded-3xl bg-[#1C062E]/95 border-2 border-amber-400/60 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-3 z-50 animate-fade-in space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-amber-100 font-festive">
                  Bappa Devotional Songs
                </span>
              </div>
              <button
                onClick={handleToggleMute}
                className="p-1 rounded-xl bg-black/40 text-amber-300 hover:bg-white/10 text-xs"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Song options */}
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {DEVOTIONAL_PLAYLIST.map((song) => {
                const isThisSong = selectedSongId === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className={`w-full text-left p-2 rounded-2xl flex items-center gap-2.5 transition-all active:scale-95 border ${
                      isThisSong
                        ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/20 border-amber-400/70 shadow-sm'
                        : 'bg-black/30 hover:bg-white/10 border-transparent hover:border-amber-500/30'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{song.icon}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isThisSong ? 'text-yellow-300' : 'text-amber-100'
                          }`}
                        >
                          {song.name}
                        </span>
                        {isThisSong && isPlaying && (
                          <span className="text-[10px] text-emerald-400 font-bold ml-1">● Live</span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-300/75 truncate mt-0.5">
                        {song.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint footer */}
            <div className="pt-1 text-[10px] text-amber-300/60 text-center border-t border-amber-500/20">
              Devotional audio loops seamlessly in the sanctum
            </div>
          </div>
        </>
      )}
    </div>
  );
};
