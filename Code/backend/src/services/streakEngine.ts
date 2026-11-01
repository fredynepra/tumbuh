export type PlantStage = 'SEED' | 'SPROUT' | 'GROWING' | 'BLOOM';

export interface StreakEvaluationResult {
  newStreak: number;
  longestStreak: number;
  newTotalCompletions: number;
  plantStage: PlantStage;
  isFirstWater: boolean;
  isBloomStageReached: boolean;
}

export interface DayHistoryItem {
  date: string;
  dayLabel: string;
  isWatered: boolean;
  isToday: boolean;
}

export function getLast7Days(todayDateStr: string): { date: string; dayLabel: string; isToday: boolean }[] {
  const result: { date: string; dayLabel: string; isToday: boolean }[] = [];
  const validDateStr =
    todayDateStr && todayDateStr.includes('-') && !todayDateStr.startsWith('sim-')
      ? todayDateStr
      : getTodayDateString();
  const today = new Date(validDateStr + 'T00:00:00Z');
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getUTCDay()];
    result.push({
      date: dateStr,
      dayLabel,
      isToday: i === 0,
    });
  }
  return result;
}

export function buildWeeklyHistory(checkInDates: Set<string>, todayDateStr: string): DayHistoryItem[] {
  const days = getLast7Days(todayDateStr);
  return days.map((d) => ({
    ...d,
    isWatered: checkInDates.has(d.date),
  }));
}

export function getCalendarDayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getTodayDateString(timezone = 'Asia/Jakarta'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Output format: 'YYYY-MM-DD'
}

export function getCurrentTimeString(timezone = 'Asia/Jakarta'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(now); // Output format: 'HH:MM:SS'
}

export function evaluateStreakAndPlantStage(
  currentStreak: number,
  longestStreak: number,
  totalCompletions: number,
  lastCheckInDate: string | null,
  todayDate: string
): StreakEvaluationResult {
  const newTotalCompletions = totalCompletions + 1;
  let newStreak = 1;

  if (lastCheckInDate) {
    const diffDays = getCalendarDayDifference(lastCheckInDate, todayDate);
    if (diffDays === 1) {
      newStreak = currentStreak + 1;
    } else if (diffDays <= 0) {
      newStreak = currentStreak; // same day fallback
    } else {
      // Missed one or more days: gentle reset to 1
      newStreak = 1;
    }
  }

  const newLongestStreak = Math.max(longestStreak, newStreak);

  // Plant stage based on total completions
  let plantStage: PlantStage = 'SEED';
  if (newTotalCompletions >= 30) {
    plantStage = 'BLOOM';
  } else if (newTotalCompletions >= 7) {
    plantStage = 'GROWING';
  } else if (newTotalCompletions >= 3) {
    plantStage = 'SPROUT';
  }

  const isFirstWater = totalCompletions === 0;
  const isBloomStageReached = totalCompletions < 30 && newTotalCompletions >= 30;

  return {
    newStreak,
    longestStreak: newLongestStreak,
    newTotalCompletions,
    plantStage,
    isFirstWater,
    isBloomStageReached,
  };
}

export function evaluateMinuteSimulation(
  currentStreak: number,
  longestStreak: number,
  totalCompletions: number,
  lastMinute: number | null,
  currentMinute: number
): StreakEvaluationResult {
  const newTotalCompletions = totalCompletions + 1;
  let newStreak = 1;

  if (lastMinute !== null) {
    const diff = currentMinute - lastMinute;
    if (diff === 1) {
      newStreak = currentStreak + 1;
    } else if (diff <= 0) {
      newStreak = currentStreak;
    } else {
      newStreak = 1; // Missed minute: reset streak
    }
  }

  const newLongestStreak = Math.max(longestStreak, newStreak);

  // Growth thresholds:
  // Minute 1-2: SEED
  // Minute 3-6: SPROUT
  // Minute 7-29: GROWING
  // Minute 30+: BLOOM
  let plantStage: PlantStage = 'SEED';
  if (newTotalCompletions >= 30) {
    plantStage = 'BLOOM';
  } else if (newTotalCompletions >= 7) {
    plantStage = 'GROWING';
  } else if (newTotalCompletions >= 3) {
    plantStage = 'SPROUT';
  }

  return {
    newStreak,
    longestStreak: newLongestStreak,
    newTotalCompletions,
    plantStage,
    isFirstWater: totalCompletions === 0,
    isBloomStageReached: totalCompletions < 30 && newTotalCompletions >= 30,
  };
}

