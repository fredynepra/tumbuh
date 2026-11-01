import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { calculateLevelFromXp } from '../services/levelEngine';
import { getRequestUser } from './habits';

const router = Router();

// ----------------------------------------------------
// 1. GET /api/profile - Gamification Profile & Stats
// ----------------------------------------------------
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await getRequestUser(req);
    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.gamificationProfile.create({
        data: {
          userId: user.id,
          currentLevel: 1,
          currentXp: 0,
          lifetimeXp: 0,
          currentTitle: 'Penyemai Benih',
        },
      });
    }

    const lvlInfo = calculateLevelFromXp(profile.currentXp);
    const totalCompletions = await prisma.checkIn.count({
      where: { habit: { userId: user.id } },
    });
    const unlockedBadgesCount = await prisma.userBadge.count({
      where: { userId: user.id },
    });
    const activeHabitsCount = await prisma.habit.count({
      where: { userId: user.id, isActive: true },
    });

    res.json({
      success: true,
      profile: {
        userId: user.id,
        displayName: user.displayName,
        timezone: user.timezone,
        ...lvlInfo,
        currentXp: profile.currentXp,
        lifetimeXp: profile.lifetimeXp,
        stats: {
          totalWaterings: totalCompletions,
          unlockedBadges: unlockedBadgesCount,
          activeHabits: activeHabitsCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// 2. GET /api/badges - All badges with unlocked status
// ----------------------------------------------------
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const user = await getRequestUser(req);
    const allBadges = await prisma.badge.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
    });
    const userBadgesMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.unlockedAt]));

    const result = allBadges.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      category: b.category,
      bonusXp: b.bonusXp,
      iconSvgName: b.iconSvgName,
      sortOrder: b.sortOrder,
      isUnlocked: userBadgesMap.has(b.id),
      unlockedAt: userBadgesMap.get(b.id) || null,
    }));

    res.json({
      success: true,
      badges: result,
      unlockedCount: userBadges.length,
      totalCount: allBadges.length,
    });
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
