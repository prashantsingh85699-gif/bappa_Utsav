export const AVATAR_EMOJIS: Record<string, string> = {
  bappa: '🐘',
  dhol: '🥁',
  modak: '🥟',
  diya: '🪔',
  aarti: '🌸',
};

export const getAvatarEmoji = (avatarId?: string): string => {
  if (!avatarId) return '🐘';
  return AVATAR_EMOJIS[avatarId] || '🐘';
};
