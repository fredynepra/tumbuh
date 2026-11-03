export type PlantStage = 'SEED' | 'SPROUT' | 'GROWING' | 'BLOOM';

export interface DayHistoryItem {
  date: string;
  dayLabel: string;
  isWatered: boolean;
  isToday: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  plantStage: PlantStage;
  reminderTime?: string | null;
  isActive: boolean;
  isWateredToday: boolean;
  cooldownRemainingSeconds?: number;
  weeklyHistory?: DayHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  userId: string;
  displayName: string;
  timezone: string;
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentProgressXp: number;
  progressPercent: number;
  isMaxLevel?: boolean;
  currentXp: number;
  lifetimeXp: number;
  stats?: {
    totalWaterings: number;
    unlockedBadges: number;
    activeHabits: number;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: string;
  bonusXp: number;
  iconSvgName: string;
  sortOrder: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface UnlockedBadgeItem {
  id: string;
  title: string;
  description: string;
  bonusXp: number;
  iconSvgName: string;
}

export interface WaterResponse {
  success: boolean;
  message: string;
  alreadyWatered: boolean;
  baseXpAdded: number;
  bonusXpAdded: number;
  totalXpAdded: number;
  isLevelUp: boolean;
  isMahkotaMegahReached?: boolean;
  previousLevel?: number;
  cooldownRemainingSeconds?: number;
  habit: Habit;
  profile: Profile;
  unlockedBadges: UnlockedBadgeItem[];
}

export type SocialPlatform = 'whatsapp' | 'facebook';

export type SocialShareType = 'BADGE' | 'MAHKOTA_MEGAH';

export interface SocialShareBadgeInfo {
  id: string;
  title: string;
  description: string;
  bonusXp: number;
  iconSvgName: string;
}

export interface SocialSharePayload {
  type: SocialShareType;
  badge?: SocialShareBadgeInfo;
  habit?: Habit;
  userName?: string;
  userLevel?: number;
  userTitle?: string;
}

export type ReengagementSituation =
  | 'ALL_WATERED'
  | 'HABIT_INCOMPLETE_TODAY'
  | 'SEVERAL_MISSED_DAYS'
  | 'USER_RETURNS';

export interface ReengagementResponse {
  success: boolean;
  situation: ReengagementSituation;
  title: string;
  copy: string;
  actionText: string;
  targetHabitId?: string;
  targetHabitTitle?: string;
  missedDaysCount: number;
}

// Model data user login sederhana
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role?: string; // 'USER' atau 'ADMIN'
  level?: number;
  currentXp?: number;
}

// Konfigurasi tahapan pertumbuhan dan durasi penyiraman (diatur oleh Administrator)
export interface GrowthSettings {
  seedMax: number;                 // Batas bibit (default: 2)
  sproutMin: number;               // Mulai tunas (default: 3)
  growingMin: number;              // Mulai rindang (default: 7)
  bloomPerdanaMin: number;         // 30x Siram: Mekar Perdana (🌸 1/5)
  tunasCabangMin: number;          // 31x Siram: Tunas Cabang Baru
  bloomBercabangMin: number;       // 32-33x Siram: Mekar Bercabang (🌸 2/5)
  rindangBerbungaMin: number;      // 34-35x Siram: Rindang Berbunga (🌸 3/5)
  harmoniMahkotaMin: number;       // 36-37x Siram: Harmoni Mahkota (🌸 4/5)
  mahkotaMegahMin: number;         // >= 38x Siram: Mahkota Megah (🌸 5/5)
  wateringIntervalMode: 'DAILY' | 'MINUTES'; // Mode Harian atau Menit
  wateringIntervalMinutes: number;          // Durasi jeda dalam satuan menit (min. 1 menit)
  maxWateringPerInterval: number;           // Kuota siram per jeda (default: 1)
}

