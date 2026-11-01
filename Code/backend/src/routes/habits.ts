import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import {
  evaluateStreakAndPlantStage,
  evaluateMinuteSimulation,
  getTodayDateString,
  getCurrentTimeString,
  buildWeeklyHistory,
} from '../services/streakEngine';
import { calculateLevelFromXp } from '../services/levelEngine';
import { evaluateEligibleBadges } from '../services/badgeEngine';
import {
  getSystemGrowthSettings,
  calculatePlantStageDynamic,
} from '../services/settingsEngine';

const router = Router();

// Helper to fetch or create the default demo user
export async function getDemoUser() {
  let user = await prisma.user.findFirst({
    where: { username: 'demo' },
    include: { gamificationProfile: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'demo',
        password: 'password123',
        email: 'demo@tumbuh.app',
        displayName: 'Pekebun Tumbuh',
        timezone: 'Asia/Jakarta',
        gamificationProfile: {
          create: {
            currentLevel: 1,
            currentXp: 0,
            lifetimeXp: 0,
            currentTitle: 'Penyemai Benih',
          },
        },
      },
      include: { gamificationProfile: true },
    });
  }
  return user as NonNullable<typeof user>;
}

// Helper untuk mengambil user aktif berdasarkan request header 'x-user-id'
export async function getRequestUser(req: Request) {
  const customUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (customUserId) {
    const user = await prisma.user.findUnique({
      where: { id: customUserId },
      include: { gamificationProfile: true },
    });
    if (user) return user;
  }
  return getDemoUser();
}

// ----------------------------------------------------
// 1. GET /api/habits - List habits with weekly history (supports ?status=active|archived|all)
// ----------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getRequestUser(req);
    const today = getTodayDateString(user.timezone);
    const { status } = req.query;

    let whereClause: any = { userId: user.id };
    if (status === 'archived') {
      whereClause.isActive = false;
    } else if (status === 'all') {
      // return all
    } else {
      whereClause.isActive = true;
    }

    const habits = await prisma.habit.findMany({
      where: whereClause,
      include: {
        checkIns: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Ambil konfigurasi sistem pertumbuhan aktif (bisa diatur oleh admin)
    const settings = await getSystemGrowthSettings();
    const isMinuteMode = settings.wateringIntervalMode === 'MINUTES';
    const intervalMs = settings.wateringIntervalMinutes * 60 * 1000;

    const todayWateringKeys = new Set(
      (
        await prisma.xpTransaction.findMany({
          where: {
            userId: user.id,
            sourceType: 'WATERING',
            idempotencyKey: { endsWith: `:${today}` },
          },
          select: { idempotencyKey: true },
        })
      ).map((x) => x.idempotencyKey)
    );

    const responseData = habits.map((h) => {
      let isWateredToday = false;
      let cooldownRemainingSeconds = 0;

      if (isMinuteMode) {
        if (h.checkIns.length > 0) {
          const lastCheckIn = h.checkIns[0];
          const elapsedMs = Date.now() - new Date(lastCheckIn.recordedAt).getTime();
          if (elapsedMs < intervalMs) {
            isWateredToday = true;
            cooldownRemainingSeconds = Math.max(0, Math.ceil((intervalMs - elapsedMs) / 1000));
          }
        }
      } else {
        const checkInDates = new Set(h.checkIns.map((c) => c.checkInDate));
        const hasWateringTxToday = todayWateringKeys.has(`${h.userId}:WATERING:${h.id}:${today}`);
        isWateredToday = checkInDates.has(today) || hasWateringTxToday;
      }

      const checkInDates = new Set(h.checkIns.map((c) => c.checkInDate));
      const weeklyHistory = buildWeeklyHistory(checkInDates, today);

      return {
        id: h.id,
        userId: h.userId,
        title: h.title,
        category: h.category,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        totalCompletions: h.totalCompletions,
        plantStage: h.plantStage,
        reminderTime: h.reminderTime || null,
        isActive: h.isActive,
        isWateredToday,
        cooldownRemainingSeconds,
        weeklyHistory,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      };
    });

    res.json({
      success: true,
      habits: responseData,
      today,
      wateringIntervalMode: settings.wateringIntervalMode,
      wateringIntervalMinutes: settings.wateringIntervalMinutes,
    });
  } catch (error: any) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// 2. POST /api/habits - Create a new habit
// ----------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, category, reminderTime } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Nama kebiasaan wajib diisi' });
    }

    const user = await getRequestUser(req);
    const today = getTodayDateString(user.timezone);

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: title.trim(),
        category: category?.trim() || 'Umum',
        reminderTime: reminderTime?.trim() || null,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        plantStage: 'SEED',
      },
    });

    const weeklyHistory = buildWeeklyHistory(new Set(), today);

    res.status(201).json({
      success: true,
      message: 'Kebiasaan berhasil ditanam di kebun! 🌱',
      habit: { ...habit, isWateredToday: false, weeklyHistory },
    });
  } catch (error: any) {
    console.error('Error creating habit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// 3. PUT /api/habits/:id - Update habit (Edit Title, Category, Reminder)
// ----------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, reminderTime, isActive } = req.body;

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(category && { category: category.trim() }),
        ...(reminderTime !== undefined && { reminderTime: reminderTime ? reminderTime.trim() : null }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      include: {
        checkIns: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
      },
    });

    const user = await getRequestUser(req);
    const today = getTodayDateString(user.timezone);
    const checkInDates = new Set(habit.checkIns.map((c) => c.checkInDate));
    const weeklyHistory = buildWeeklyHistory(checkInDates, today);

    res.json({
      success: true,
      message: 'Kebiasaan berhasil diperbarui! 🌿',
      habit: {
        ...habit,
        isWateredToday: checkInDates.has(today),
        weeklyHistory,
      },
    });
  } catch (error: any) {
    console.error('Error updating habit:', error);
    res.status(404).json({ success: false, message: 'Kebiasaan tidak ditemukan' });
  }
});

// ----------------------------------------------------
// 4. DELETE /api/habits/:id - Delete or Archive habit
// ----------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      await prisma.habit.delete({ where: { id } });
      return res.json({ success: true, message: 'Kebiasaan berhasil dihapus permanen dari kebun' });
    }

    // Soft delete / archive by default for non-destructive safety
    await prisma.habit.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Kebiasaan berhasil diarsipkan dari kebun 🪴' });
  } catch (error: any) {
    console.error('Error deleting habit:', error);
    res.status(404).json({ success: false, message: 'Kebiasaan tidak ditemukan' });
  }
});

// ----------------------------------------------------
// 4b. POST /api/habits/:id/restore - Restore an archived habit
// ----------------------------------------------------
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.update({
      where: { id },
      data: { isActive: true },
      include: {
        checkIns: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
      },
    });

    const user = await getRequestUser(req);
    const today = getTodayDateString(user.timezone);
    const checkInDates = new Set(habit.checkIns.map((c) => c.checkInDate));
    const weeklyHistory = buildWeeklyHistory(checkInDates, today);

    res.json({
      success: true,
      message: `Tanaman "${habit.title}" berhasil dipulihkan kembali ke Kebun Aktif! 🌱`,
      habit: {
        ...habit,
        isWateredToday: checkInDates.has(today),
        weeklyHistory,
      },
    });
  } catch (error: any) {
    console.error('Error restoring habit:', error);
    res.status(404).json({ success: false, message: 'Kebiasaan tidak ditemukan' });
  }
});

// ----------------------------------------------------
// 5. POST /api/habits/:id/water - Water / Check-in habit
// ----------------------------------------------------
router.post('/:id/water', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getRequestUser(req);
    const isMinuteSim = typeof req.body.simulateMinute === 'number';
    const today = isMinuteSim
      ? `sim-min-${req.body.simulateMinute}`
      : (req.body.clientDate || getTodayDateString(user.timezone));
    const currentTime = req.body.clientTime || getCurrentTimeString(user.timezone);

    // 1. Fetch habit and check if already watered today
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: {
        checkIns: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!habit || !habit.isActive) {
      return res.status(404).json({ success: false, message: 'Kebiasaan tidak ditemukan' });
    }

    // Ambil konfigurasi sistem pertumbuhan aktif (bisa diatur oleh admin)
    const settings = await getSystemGrowthSettings();
    const isMinuteMode = settings.wateringIntervalMode === 'MINUTES';
    const intervalMs = settings.wateringIntervalMinutes * 60 * 1000;

    // Get current profile
    const currentProfile = await prisma.gamificationProfile.findUnique({
      where: { userId: user.id },
    });
    const currentLvlInfo = calculateLevelFromXp(currentProfile?.currentXp || 0);

    // 2. Evaluasi apakah tanaman sedang dalam jeda penyiraman (cooldown)
    if (isMinuteMode) {
      if (habit.checkIns.length > 0) {
        const lastCheckIn = habit.checkIns[0];
        const elapsedMs = Date.now() - new Date(lastCheckIn.recordedAt).getTime();
        if (elapsedMs < intervalMs) {
          const remainingSec = Math.ceil((intervalMs - elapsedMs) / 1000);
          const remainingMin = Math.ceil(remainingSec / 60);
          return res.json({
            success: true,
            message: `Mode jeda demo (${settings.wateringIntervalMinutes} menit) aktif! Silakan tunggu ${remainingSec} detik (${remainingMin} menit) lagi untuk menyiram kembali.`,
            alreadyWatered: true,
            cooldownRemainingSeconds: remainingSec,
            baseXpAdded: 0,
            bonusXpAdded: 0,
            totalXpAdded: 0,
            isLevelUp: false,
            habit: {
              ...habit,
              isWateredToday: true,
              cooldownRemainingSeconds: remainingSec,
            },
            profile: {
              userId: user.id,
              displayName: user.displayName,
              ...currentLvlInfo,
              currentXp: currentProfile?.currentXp || 0,
              lifetimeXp: currentProfile?.lifetimeXp || 0,
            },
            unlockedBadges: [],
          });
        }
      }
    } else {
      const alreadyWateredToday = habit.checkIns.some((c) => c.checkInDate === today);
      if (alreadyWateredToday) {
        return res.json({
          success: true,
          message: isMinuteSim ? `Menit ke-${req.body.simulateMinute} sudah disiram!` : 'Kebiasaan sudah disiram hari ini!',
          alreadyWatered: true,
          baseXpAdded: 0,
          bonusXpAdded: 0,
          totalXpAdded: 0,
          isLevelUp: false,
          habit: {
            ...habit,
            isWateredToday: true,
          },
          profile: {
            userId: user.id,
            displayName: user.displayName,
            ...currentLvlInfo,
            currentXp: currentProfile?.currentXp || 0,
            lifetimeXp: currentProfile?.lifetimeXp || 0,
          },
          unlockedBadges: [],
        });
      }
    }

    // 3. Tentukan progres streak & plant stage secara dinamis berdasarkan konfigurasi
    let streakResult;
    if (isMinuteMode) {
      const newCompletions = habit.totalCompletions + 1;
      const newStreak = habit.currentStreak + 1;
      const longestStreak = Math.max(habit.longestStreak, newStreak);
      const plantStage = calculatePlantStageDynamic(newCompletions, settings);
      streakResult = {
        newStreak,
        longestStreak,
        newTotalCompletions: newCompletions,
        plantStage,
        isFirstWater: habit.totalCompletions === 0,
        isBloomStageReached: habit.totalCompletions < settings.bloomPerdanaMin && newCompletions >= settings.bloomPerdanaMin,
      };
    } else if (isMinuteSim) {
      const lastCheckIn = habit.checkIns.length > 0 ? habit.checkIns[0].checkInDate : null;
      let lastMin: number | null = null;
      if (lastCheckIn && lastCheckIn.startsWith('sim-min-')) {
        const parsed = parseInt(lastCheckIn.replace('sim-min-', ''), 10);
        if (!isNaN(parsed)) lastMin = parsed;
      }
      streakResult = evaluateMinuteSimulation(
        habit.currentStreak,
        habit.longestStreak,
        habit.totalCompletions,
        lastMin,
        req.body.simulateMinute
      );
      streakResult.plantStage = calculatePlantStageDynamic(streakResult.newTotalCompletions, settings);
    } else {
      const lastCheckIn = habit.checkIns.length > 0 ? habit.checkIns[0].checkInDate : null;
      streakResult = evaluateStreakAndPlantStage(
        habit.currentStreak,
        habit.longestStreak,
        habit.totalCompletions,
        lastCheckIn,
        today
      );
      streakResult.plantStage = calculatePlantStageDynamic(streakResult.newTotalCompletions, settings);
    }

    const checkInDateKey = isMinuteMode ? `${today}#${streakResult.newTotalCompletions}` : today;
    const baseXp = 10;
    const previousLevel = currentLvlInfo.level;
    const activeHabitCount = await prisma.habit.count({
      where: { userId: user.id, isActive: true },
    });

    // Execute atomic transaction for check-in, XP, streaks, and badges
    const txResult = await prisma.$transaction(async (tx) => {
      // a. Record CheckIn
      await tx.checkIn.create({
        data: {
          habitId: habit.id,
          checkInDate: checkInDateKey,
        },
      });

      // b. Update Habit
      const updatedHabit = await tx.habit.update({
        where: { id: habit.id },
        data: {
          currentStreak: streakResult.newStreak,
          longestStreak: streakResult.longestStreak,
          totalCompletions: streakResult.newTotalCompletions,
          plantStage: streakResult.plantStage,
        },
      });

      // c. Record Base Watering XP Transaction
      const wateringTxKey = `${user.id}:WATERING:${habit.id}:${checkInDateKey}`;
      await tx.xpTransaction.create({
        data: {
          userId: user.id,
          amount: baseXp,
          sourceType: 'WATERING',
          idempotencyKey: wateringTxKey,
          metadataJson: JSON.stringify({ habitId: habit.id, streak: streakResult.newStreak }),
        },
      });

      // d. Evaluate and award badges (e.g. streak_5, first_water, etc.)
      const unlockedBadges = await evaluateEligibleBadges(tx, {
        userId: user.id,
        habitId: habit.id,
        currentStreak: streakResult.newStreak,
        totalCompletions: streakResult.newTotalCompletions,
        activeHabitCount,
        currentTimeStr: currentTime,
      });

      const bonusXp = unlockedBadges.reduce((sum, b) => sum + b.bonusXp, 0);
      const totalXpAdded = baseXp + bonusXp;

      // e. Update Gamification Profile
      const updatedProfile = await tx.gamificationProfile.update({
        where: { userId: user.id },
        data: {
          currentXp: { increment: totalXpAdded },
          lifetimeXp: { increment: totalXpAdded },
        },
      });

      const newLvlInfo = calculateLevelFromXp(updatedProfile.currentXp);

      // Update level and title in profile
      await tx.gamificationProfile.update({
        where: { userId: user.id },
        data: {
          currentLevel: newLvlInfo.level,
          currentTitle: newLvlInfo.title,
        },
      });

      const isLevelUp = newLvlInfo.level > previousLevel;

      return {
        updatedHabit,
        updatedProfile,
        newLvlInfo,
        totalXpAdded,
        baseXp,
        bonusXp,
        isLevelUp,
        unlockedBadges,
      };
    });

    const checkInDates = new Set([
      ...habit.checkIns.map((c) => c.checkInDate),
      today,
    ]);
    const weeklyHistory = buildWeeklyHistory(checkInDates, today);

    res.json({
      success: true,
      message: `Tanaman berhasil disiram! +${txResult.totalXpAdded} XP didapatkan.`,
      alreadyWatered: false,
      baseXpAdded: txResult.baseXp,
      bonusXpAdded: txResult.bonusXp,
      totalXpAdded: txResult.totalXpAdded,
      isLevelUp: txResult.isLevelUp,
      cooldownRemainingSeconds: isMinuteMode ? Math.ceil(intervalMs / 1000) : 0,
      habit: {
        ...txResult.updatedHabit,
        isWateredToday: true,
        cooldownRemainingSeconds: isMinuteMode ? Math.ceil(intervalMs / 1000) : 0,
        weeklyHistory,
      },
      profile: {
        userId: user.id,
        displayName: user.displayName,
        ...txResult.newLvlInfo,
        currentXp: txResult.updatedProfile.currentXp,
        lifetimeXp: txResult.updatedProfile.lifetimeXp,
      },
      unlockedBadges: txResult.unlockedBadges,
    });
  } catch (error: any) {
    console.error('Error watering habit:', error);
    if (error.code === 'P2002') {
      // Unique constraint violation (already checked in today)
      return res.json({
        success: true,
        message: 'Kebiasaan sudah disiram hari ini!',
        alreadyWatered: true,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// 6. POST /api/habits/:id/reset-today - Reset today's watering check-in
// ----------------------------------------------------
router.post('/:id/reset-today', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getRequestUser(req);
    const today = req.body.clientDate || getTodayDateString(user.timezone);

    // Delete today's check-in records for this habit
    await prisma.checkIn.deleteMany({
      where: {
        habitId: id,
        checkInDate: today,
      },
    });

    // Also delete today's watering XP transaction so habit can be cleanly re-watered
    const wateringTxKey = `${user.id}:WATERING:${id}:${today}`;
    await prisma.xpTransaction.deleteMany({
      where: {
        idempotencyKey: wateringTxKey,
      },
    });

    const totalCompletions = await prisma.checkIn.count({
      where: { habitId: id },
    });

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        totalCompletions,
      },
      include: {
        checkIns: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
      },
    });

    const checkInDates = new Set(updatedHabit.checkIns.map((c) => c.checkInDate));
    const weeklyHistory = buildWeeklyHistory(checkInDates, today);

    res.json({
      success: true,
      message: `Status siram hari ini untuk "${updatedHabit.title}" telah di-reset! 🌱`,
      habit: {
        ...updatedHabit,
        isWateredToday: false,
        weeklyHistory,
      },
    });
  } catch (error: any) {
    console.error('Error resetting today watering:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

