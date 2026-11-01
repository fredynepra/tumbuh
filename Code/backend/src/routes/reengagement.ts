import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { getRequestUser } from './habits';
import { getTodayDateString, getCalendarDayDifference } from '../services/streakEngine';
import { evaluateReengagement, ReengagementResponse, ReengagementSituation } from '../services/reengagementEngine';

const router = Router();

// GET /api/reengagement
// Evaluates user status and returns supportive, warm re-engagement messaging
router.get('/reengagement', async (req: Request, res: Response) => {
  try {
    const { simulate, targetHabitTitle } = req.query;

    // Simulation override for testing or UI preview
    if (simulate) {
      const simMode = String(simulate).toUpperCase();
      if (simMode.includes('MISSED')) {
        return res.json({
          success: true,
          situation: 'SEVERAL_MISSED_DAYS',
          title: 'Tanamanmu Merindukanmu',
          copy: 'Tanamanmu merindukanmu. Yuk bantu ia tumbuh kembali! 🌿',
          actionText: 'Kembali ke Kebun',
          missedDaysCount: 3,
        } as ReengagementResponse);
      }
      if (simMode.includes('RETURN')) {
        return res.json({
          success: true,
          situation: 'USER_RETURNS',
          title: 'Selamat Datang Kembali!',
          copy: 'Selamat datang kembali! Senang melihatmu lagi, tanamanmu mulai tumbuh kembali. ✨',
          actionText: 'Rawat Kebun',
          missedDaysCount: 0,
        } as ReengagementResponse);
      }
      if (simMode.includes('INCOMPLETE')) {
        const title = (targetHabitTitle as string) || 'Minum Air 2L';
        return res.json({
          success: true,
          situation: 'HABIT_INCOMPLETE_TODAY',
          title: 'Waktunya Menyiram!',
          copy: `Tanaman ${title}-mu menunggumu hari ini. Yuk siram sebentar! 🌱`,
          actionText: 'Siram Sekarang',
          targetHabitTitle: title,
          missedDaysCount: 0,
        } as ReengagementResponse);
      }
      if (simMode.includes('WATERED') || simMode.includes('ALL')) {
        return res.json({
          success: true,
          situation: 'ALL_WATERED',
          title: 'Kebun Tersenyum Bahagia!',
          copy: 'Semua tanamanmu sudah disiram hari ini. Kebunmu tersenyum bahagia! 🌸',
          actionText: 'Lihat Profil',
          missedDaysCount: 0,
        } as ReengagementResponse);
      }
    }

    const user = await getRequestUser(req);
    const today = getTodayDateString(user.timezone);

    // Fetch active habits with today's check-ins
    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        checkIns: {
          where: { checkInDate: today },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedHabits = habits.map((h) => ({
      id: h.id,
      title: h.title,
      isWateredToday: h.checkIns.length > 0,
    }));

    // Find latest check-in prior to today across all user habits
    const priorCheckIn = await prisma.checkIn.findFirst({
      where: {
        habit: { userId: user.id },
        checkInDate: { lt: today },
      },
      orderBy: { checkInDate: 'desc' },
    });

    const hasWateredToday = habits.some((h) => h.checkIns.length > 0);

    const result = evaluateReengagement({
      todayDate: today,
      habits: mappedHabits,
      latestPriorCheckInDate: priorCheckIn ? priorCheckIn.checkInDate : null,
      hasWateredToday,
    });

    return res.json(result);
  } catch (error) {
    console.error('Error evaluating reengagement:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengevaluasi status notifikasi dan re-engagement.',
    });
  }
});

export default router;
