import { LeaderboardEntry } from '../types';

export const DEFAULT_DAILY_LEADERS: LeaderboardEntry[] = [
  { id: 'd1', nickname: 'Aarav Sharma', avatarId: 'dhol', score: 4850, level: 3, badge: '🥁 Dhol Utsavi', timestamp: Date.now() - 3600000 * 2 },
  { id: 'd2', nickname: 'Pooja Kulkarni', avatarId: 'aarti', score: 4320, level: 3, badge: '🪔 Aarti Premee', timestamp: Date.now() - 3600000 * 4 },
  { id: 'd3', nickname: 'Rohan Deshmukh', avatarId: 'modak', score: 3950, level: 3, badge: '🥟 Modak Champ', timestamp: Date.now() - 3600000 * 6 },
  { id: 'd4', nickname: 'Ananya Joshi', avatarId: 'bappa', score: 3400, level: 2, badge: '🌸 Mandap Artist', timestamp: Date.now() - 3600000 * 7 },
  { id: 'd5', nickname: 'Siddharth Patil', avatarId: 'diya', score: 2980, level: 2, badge: '✨ Jyoti Bhakt', timestamp: Date.now() - 3600000 * 10 },
  { id: 'd6', nickname: 'Kavya Nair', avatarId: 'aarti', score: 2450, level: 2, badge: '🌱 New Devotee', timestamp: Date.now() - 3600000 * 12 },
  { id: 'd7', nickname: 'Omkar Shinde', avatarId: 'dhol', score: 1820, level: 2, badge: '🥁 Tasha Vaadak', timestamp: Date.now() - 3600000 * 15 },
  { id: 'd8', nickname: 'Tanvi Gokhale', avatarId: 'modak', score: 1400, level: 2, badge: '🍬 Laddoo Lover', timestamp: Date.now() - 3600000 * 18 },
];

export const DEFAULT_WEEKLY_LEADERS: LeaderboardEntry[] = [
  { id: 'w1', nickname: 'Chinmayee Rane', avatarId: 'bappa', score: 9450, level: 5, badge: '👑 Maha Utsav Legend', timestamp: Date.now() - 86400000 * 1 },
  { id: 'w2', nickname: 'Aditya Godbole', avatarId: 'dhol', score: 8700, level: 4, badge: '🥁 Rhythm Samrat', timestamp: Date.now() - 86400000 * 2 },
  { id: 'w3', nickname: 'Meera Soni', avatarId: 'aarti', score: 8150, level: 4, badge: '🌸 Pandal Designer', timestamp: Date.now() - 86400000 * 3 },
  { id: 'w4', nickname: 'Varun Chitale', avatarId: 'modak', score: 7600, level: 4, badge: '🥟 Modak Guru', timestamp: Date.now() - 86400000 * 3 },
  { id: 'w5', nickname: 'Aarav Sharma', avatarId: 'dhol', score: 6900, level: 4, badge: '✨ Utsav Ratna', timestamp: Date.now() - 86400000 * 4 },
  { id: 'w6', nickname: 'Pooja Kulkarni', avatarId: 'aarti', score: 5800, level: 4, badge: '🪔 Aarti Ratna', timestamp: Date.now() - 86400000 * 5 },
  { id: 'w7', nickname: 'Gaurav Kadam', avatarId: 'diya', score: 5120, level: 4, badge: '🌱 Devotee', timestamp: Date.now() - 86400000 * 6 },
];

export const DEFAULT_ALL_TIME_LEADERS: LeaderboardEntry[] = [
  { id: 'a1', nickname: 'MoryaBhakt_99', avatarId: 'bappa', score: 18450, level: 6, badge: '✨ Infinite Morya', timestamp: Date.now() - 86400000 * 10 },
  { id: 'a2', nickname: 'Chinmayee Rane', avatarId: 'bappa', score: 14200, level: 5, badge: '👑 Maha Utsav Queen', timestamp: Date.now() - 86400000 * 12 },
  { id: 'a3', nickname: 'Lalbaugcha Raja Fan', avatarId: 'dhol', score: 12850, level: 5, badge: '🥁 Puneri Dhol Master', timestamp: Date.now() - 86400000 * 14 },
  { id: 'a4', nickname: 'Siddhivinayak Seva', avatarId: 'aarti', score: 11400, level: 5, badge: '🌸 Divine Decorator', timestamp: Date.now() - 86400000 * 16 },
  { id: 'a5', nickname: 'Aditya Godbole', avatarId: 'dhol', score: 10200, level: 5, badge: '🥁 Tasha Maestro', timestamp: Date.now() - 86400000 * 20 },
  { id: 'a6', nickname: 'ModakMaster_Om', avatarId: 'modak', score: 9800, level: 5, badge: '🥟 Modak King', timestamp: Date.now() - 86400000 * 25 },
  { id: 'a7', nickname: 'Meera Soni', avatarId: 'aarti', score: 8900, level: 4, badge: '🪔 Diya Light', timestamp: Date.now() - 86400000 * 30 },
];
