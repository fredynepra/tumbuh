export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentProgressXp: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

export const LEVEL_THRESHOLDS: { level: number; title: string; minXp: number }[] = [
  { level: 1, title: 'Penyemai Benih', minXp: 0 },
  { level: 2, title: 'Penyiram Rajin', minXp: 100 },
  { level: 3, title: 'Penjaga Tunas', minXp: 250 },
  { level: 4, title: 'Pekebun Muda', minXp: 450 },
  { level: 5, title: 'Sahabat Daun', minXp: 700 },
  { level: 6, title: 'Pengurus Kebun', minXp: 1000 },
  { level: 7, title: 'Botanis Berbakat', minXp: 1400 },
  { level: 8, title: 'Penjaga Rindang', minXp: 1900 },
  { level: 9, title: 'Ahli Ekosistem', minXp: 2500 },
  { level: 10, title: 'Dewa Flora', minXp: 3200 },
];

export function calculateLevelFromXp(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);
  let matched = LEVEL_THRESHOLDS[0];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i].minXp) {
      matched = LEVEL_THRESHOLDS[i];
      break;
    }
  }

  // Find next level
  const nextConfig = LEVEL_THRESHOLDS.find((t) => t.level === matched.level + 1);
  const nextLevelXp = nextConfig ? nextConfig.minXp : matched.minXp + (matched.level + 1) * 80;

  const isMaxLevel = matched.level >= 10;
  const currentProgressXp = safeXp - matched.minXp;
  const xpSpan = Math.max(1, nextLevelXp - matched.minXp);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.floor((currentProgressXp / xpSpan) * 100));

  return {
    level: matched.level,
    title: matched.title,
    minXp: matched.minXp,
    nextLevelXp,
    currentProgressXp,
    progressPercent,
    isMaxLevel,
  };
}
