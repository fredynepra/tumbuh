import { PrismaClient } from '@prisma/client';

export interface DefaultBadgeData {
  id: string;
  title: string;
  description: string;
  category: string;
  bonusXp: number;
  iconSvgName: string;
  sortOrder: number;
}

export const DEFAULT_BADGES: DefaultBadgeData[] = [
  {
    id: 'first_water',
    title: 'Tetesan Pertama',
    description: 'Menyiram kebiasaan untuk pertama kali.',
    category: 'MILESTONE',
    bonusXp: 20,
    iconSvgName: 'droplet',
    sortOrder: 1,
  },
  {
    id: 'streak_3',
    title: 'Langkah Awal',
    description: 'Mencapai streak 3 hari berturut-turut.',
    category: 'STREAK',
    bonusXp: 25,
    iconSvgName: 'sprout',
    sortOrder: 2,
  },
  {
    id: 'streak_5',
    title: 'Konsistensi Tunas',
    description: 'Luar biasa! Mencapai streak 5 hari berturut-turut.',
    category: 'STREAK',
    bonusXp: 50,
    iconSvgName: 'leaves_five',
    sortOrder: 3,
  },
  {
    id: 'streak_14',
    title: 'Akar Kokoh',
    description: 'Hebat! Mencapai streak 14 hari tanpa putus.',
    category: 'STREAK',
    bonusXp: 100,
    iconSvgName: 'tree_roots',
    sortOrder: 4,
  },
  {
    id: 'streak_30',
    title: 'Bunga Abadi',
    description: 'Master dedikasi! Mencapai streak 30 hari penuh.',
    category: 'STREAK',
    bonusXp: 200,
    iconSvgName: 'lotus_crystal',
    sortOrder: 5,
  },
  {
    id: 'habit_trio',
    title: 'Kebun Asri',
    description: 'Merawat minimal 3 kebiasaan aktif bersamaan.',
    category: 'DIVERSITY',
    bonusXp: 30,
    iconSvgName: 'pots_trio',
    sortOrder: 6,
  },
  {
    id: 'first_bloom',
    title: 'Panen Perdana',
    description: 'Membawa tanaman mencapai tahap Mekar (Bloom 30 hari).',
    category: 'GROWTH',
    bonusXp: 150,
    iconSvgName: 'flower_harvest',
    sortOrder: 7,
  },
  {
    id: 'early_bird',
    title: 'Embun Pagi',
    description: 'Menyiram tanaman pagi hari sebelum pukul 07:30.',
    category: 'TIME',
    bonusXp: 15,
    iconSvgName: 'sun_rise',
    sortOrder: 8,
  },
  {
    id: 'night_owl',
    title: 'Penyiram Senja',
    description: 'Menyiram tanaman malam hari setelah pukul 20:00.',
    category: 'TIME',
    bonusXp: 15,
    iconSvgName: 'moon_stars',
    sortOrder: 9,
  },
];

export async function seedBadges(prisma: PrismaClient) {
  for (const b of DEFAULT_BADGES) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: {
        title: b.title,
        description: b.description,
        bonusXp: b.bonusXp,
        iconSvgName: b.iconSvgName,
        sortOrder: b.sortOrder,
      },
      create: {
        id: b.id,
        title: b.title,
        description: b.description,
        category: b.category,
        bonusXp: b.bonusXp,
        iconSvgName: b.iconSvgName,
        sortOrder: b.sortOrder,
      },
    });
  }
}

export interface BadgeEvalContext {
  userId: string;
  habitId: string;
  currentStreak: number;
  totalCompletions: number;
  activeHabitCount: number;
  currentTimeStr: string; // 'HH:MM:SS'
}

export interface NewlyUnlockedBadge {
  id: string;
  title: string;
  description: string;
  bonusXp: number;
  iconSvgName: string;
}

export async function evaluateEligibleBadges(
  prisma: any,
  ctx: BadgeEvalContext
): Promise<NewlyUnlockedBadge[]> {
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId: ctx.userId },
    select: { badgeId: true },
  });
  const alreadyUnlocked = new Set<string>(existingBadges.map((b: any) => b.badgeId));

  const eligibleBadgeIds: string[] = [];

  // 1. First water
  if (ctx.totalCompletions >= 1 && !alreadyUnlocked.has('first_water')) {
    eligibleBadgeIds.push('first_water');
  }

  // 2. Streaks
  if (ctx.currentStreak >= 3 && !alreadyUnlocked.has('streak_3')) {
    eligibleBadgeIds.push('streak_3');
  }
  if (ctx.currentStreak >= 5 && !alreadyUnlocked.has('streak_5')) {
    eligibleBadgeIds.push('streak_5');
  }
  if (ctx.currentStreak >= 14 && !alreadyUnlocked.has('streak_14')) {
    eligibleBadgeIds.push('streak_14');
  }
  if (ctx.currentStreak >= 30 && !alreadyUnlocked.has('streak_30')) {
    eligibleBadgeIds.push('streak_30');
  }

  // 3. Habit diversity
  if (ctx.activeHabitCount >= 3 && !alreadyUnlocked.has('habit_trio')) {
    eligibleBadgeIds.push('habit_trio');
  }

  // 4. Bloom
  if (ctx.totalCompletions >= 30 && !alreadyUnlocked.has('first_bloom')) {
    eligibleBadgeIds.push('first_bloom');
  }

  // 5. Time badges
  if (ctx.currentTimeStr < '07:30:00' && !alreadyUnlocked.has('early_bird')) {
    eligibleBadgeIds.push('early_bird');
  } else if (ctx.currentTimeStr >= '20:00:00' && !alreadyUnlocked.has('night_owl')) {
    eligibleBadgeIds.push('night_owl');
  }

  if (eligibleBadgeIds.length === 0) return [];

  const client = prisma;
  const badgesInfo = await client.badge.findMany({
    where: { id: { in: eligibleBadgeIds } },
  });

  const newlyUnlocked: NewlyUnlockedBadge[] = [];

  for (const badge of badgesInfo) {
    // Record UserBadge
    await client.userBadge.create({
      data: {
        userId: ctx.userId,
        badgeId: badge.id,
      },
    });

    // Record XP Transaction for badge
    if (badge.bonusXp > 0) {
      const badgeKey = `${ctx.userId}:BADGE:${badge.id}`;
      await client.xpTransaction.upsert({
        where: { idempotencyKey: badgeKey },
        update: {
          amount: badge.bonusXp,
          sourceType: 'BADGE_AWARD',
        },
        create: {
          userId: ctx.userId,
          amount: badge.bonusXp,
          sourceType: 'BADGE_AWARD',
          idempotencyKey: badgeKey,
          metadataJson: JSON.stringify({ badgeId: badge.id, badgeTitle: badge.title }),
        },
      });
    }

    newlyUnlocked.push({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      bonusXp: badge.bonusXp,
      iconSvgName: badge.iconSvgName,
    });
  }

  return newlyUnlocked;
}
