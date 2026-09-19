import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  LogOut,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { authService, AuthUser } from '../../services/authService';
import { audioManager } from '../../services/audioService';
import { getAvatarEmoji } from '../../utils/avatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: AuthUser) => void;
}

const AVATAR_OPTIONS = [
  { id: 'bappa', icon: '🐘', name: 'Bal Ganesha' },
  { id: 'dhol', icon: '🥁', name: 'Dhol Master' },
  { id: 'modak', icon: '🥟', name: 'Modak Chef' },
  { id: 'diya', icon: '🪔', name: 'Diya Bearer' },
  { id: 'aarti', icon: '🌸', name: 'Aarti Devotee' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [emailOrUser, setEmailOrUser] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState('bappa');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    audioManager.playClick();

    try {
      const user = await authService.login(emailOrUser, password);
      audioManager.playTempleBell();
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      audioManager.playSfx('wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    audioManager.playClick();

    try {
      const user = await authService.register(nickname, emailOrUser, password, avatarId);
      audioManager.playTempleBell();
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      audioManager.playSfx('wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = () => {
    audioManager.playClick();
    const guestUser = authService.continueAsGuest(nickname || 'Guest Devotee', avatarId);
    if (onAuthSuccess) onAuthSuccess(guestUser);
    onClose();
  };

  const handleLogout = () => {
    audioManager.playClick();
    authService.logout();
    setEmailOrUser('');
    setPassword('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser?.isVerified ? 'Devotee Credentials' : 'Devotee Verification'}
      subtitle={
        currentUser?.isVerified
          ? 'Authenticated for Official Leaderboards'
          : 'Login to secure your scores & leaderboard rank'
      }
      icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-4">
        {/* If user is already authenticated */}
        {currentUser && currentUser.isVerified ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-2xl border border-amber-300 shadow-md">
                {getAvatarEmoji(currentUser.avatarId)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold text-amber-100 truncate">
                    {currentUser.nickname}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-slate-950" />
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-amber-300/80 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Leaderboard Active</span>
              </div>
              <p>
                All your high scores in Dhol Beat, Mandap Designer, Modak Catch, and Quiz are recorded with your verified devotee badge.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary-glass"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="crimson"
                size="md"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Authentication Form */
          <div>
            {/* Banner: Why Authenticate? */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 mb-4 text-xs text-amber-200 leading-snug">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Authentic Devotee Verification:</strong>
                Create credentials to prevent fake or unknown entries. Only verified devotees appear on the Official Leaderboard!
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2 mb-4 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Tabs: Login / Register */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/50 border border-amber-500/20 text-xs font-bold mb-4">
              <button
                type="button"
                onClick={() => { audioManager.playClick(); setIsLoginTab(true); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  isLoginTab
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm'
                    : 'text-amber-400/60 hover:text-amber-200'
                }`}
              >
                Devotee Sign In
              </button>
              <button
                type="button"
                onClick={() => { audioManager.playClick(); setIsLoginTab(false); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  !isLoginTab
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm'
                    : 'text-amber-400/60 hover:text-amber-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {isLoginTab ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Username or Devotee Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. prashant or devotee@mail.com"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 focus:border-amber-400 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Passcode / Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your passcode"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 focus:border-amber-400 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-500/40"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary-gold"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full justify-center text-sm font-bold shadow-lg shadow-amber-500/20 mt-2"
                >
                  {isSubmitting ? 'Verifying...' : 'Sign In as Devotee'}
                </Button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Devotee Name (Nickname)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="text"
                      required
                      maxLength={20}
                      placeholder="e.g. Prashant Singh"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 focus:border-amber-400 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Username / Devotee Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. prashant856 or user@gmail.com"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 focus:border-amber-400 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Create Passcode / Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      placeholder="At least 4 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 focus:border-amber-400 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-amber-500/40"
                    />
                  </div>
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">
                    Choose Devotee Avatar
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => { audioManager.playClick(); setAvatarId(a.id); }}
                        className={`p-2 rounded-xl border text-xl flex flex-col items-center gap-1 transition-all ${
                          avatarId === a.id
                            ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                            : 'bg-black/30 border-amber-500/20 hover:border-amber-400/40'
                        }`}
                      >
                        <span>{a.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary-gold"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full justify-center text-sm font-bold shadow-lg shadow-amber-500/20 mt-2"
                >
                  {isSubmitting ? 'Creating Account...' : 'Register & Get Verified Badge'}
                </Button>
              </form>
            )}

            {/* Quick Guest mode option */}
            <div className="mt-4 pt-3 border-t border-amber-500/20 text-center">
              <button
                type="button"
                onClick={handleGuest}
                className="text-xs text-amber-400/70 hover:text-amber-300 underline font-medium transition-colors"
              >
                Or play casually as Guest (unverified)
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default AuthModal;
