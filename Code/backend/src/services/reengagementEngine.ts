import { getCalendarDayDifference, getTodayDateString } from './streakEngine';

export type ReengagementSituation =
  | 'ALL_WATERED'
  | 'HABIT_INCOMPLETE_TODAY'
  | 'SEVERAL_MISSED_DAYS'
  | 'USER_RETURNS';

export interface ReengagementEvaluationInput {
  todayDate: string;
  habits: {
    id: string;
    title: string;
    isWateredToday: boolean;
  }[];
  latestPriorCheckInDate: string | null;
  hasWateredToday: boolean;
}

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

export function evaluateReengagement(input: ReengagementEvaluationInput): ReengagementResponse {
  const { todayDate, habits, latestPriorCheckInDate, hasWateredToday } = input;

  if (habits.length === 0) {
    return {
      success: true,
      situation: 'HABIT_INCOMPLETE_TODAY',
      title: 'Selamat Datang di Kebunmu',
      copy: 'Mulai tanam kebiasaan pertamamu dan saksikan ia mekar bersama waktu! 🌱',
      actionText: 'Tanam Kebiasaan',
      missedDaysCount: 0,
    };
  }

  const unwateredHabits = habits.filter((h) => !h.isWateredToday);
  let missedDays = 0;

  if (latestPriorCheckInDate) {
    missedDays = getCalendarDayDifference(latestPriorCheckInDate, todayDate);
  }

  // 1. Situation: Several missed days without check-in today
  if (!hasWateredToday && missedDays >= 2) {
    return {
      success: true,
      situation: 'SEVERAL_MISSED_DAYS',
      title: 'Tanamanmu Merindukanmu',
      copy: 'Tanamanmu merindukanmu. Yuk bantu ia tumbuh kembali! 🌿',
      actionText: 'Kembali ke Kebun',
      missedDaysCount: missedDays,
    };
  }

  // 2. Situation: User returns today after a gap of >= 2 days
  if (hasWateredToday && missedDays >= 2) {
    return {
      success: true,
      situation: 'USER_RETURNS',
      title: 'Selamat Datang Kembali!',
      copy: 'Selamat datang kembali! Senang melihatmu lagi, tanamanmu mulai tumbuh kembali. ✨',
      actionText: 'Rawat Kebun',
      missedDaysCount: 0,
    };
  }

  // 3. Situation: Habit incomplete today
  if (unwateredHabits.length > 0) {
    const targetHabit = unwateredHabits[0];
    return {
      success: true,
      situation: 'HABIT_INCOMPLETE_TODAY',
      title: 'Waktunya Menyiram!',
      copy: `Tanaman ${targetHabit.title}-mu menunggumu hari ini. Yuk siram sebentar! 🌱`,
      actionText: 'Siram Sekarang',
      targetHabitId: targetHabit.id,
      targetHabitTitle: targetHabit.title,
      missedDaysCount: 0,
    };
  }

  // 4. Situation: All watered today
  return {
    success: true,
    situation: 'ALL_WATERED',
    title: 'Kebun Tersenyum Bahagia!',
    copy: 'Semua tanamanmu sudah disiram hari ini. Kebunmu tersenyum bahagia! 🌸',
    actionText: 'Lihat Profil',
    missedDaysCount: 0,
  };
}
