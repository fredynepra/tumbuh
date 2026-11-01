import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@tumbuh.app' },
  });

  if (!user) {
    console.error('Demo user not found!');
    return;
  }

  // 1. Reset user gamification profile to 0 XP (Level 1, Penyemai Benih)
  await prisma.gamificationProfile.update({
    where: { userId: user.id },
    data: {
      currentXp: 0,
      lifetimeXp: 0,
      currentLevel: 1,
      currentTitle: 'Penyemai Benih',
    },
  });
  console.log('✅ User gamification profile reset to 0 XP (Level 1, Penyemai Benih)');

  // 2. Reset user badges so the testing team can earn them anew
  const deletedBadges = await prisma.userBadge.deleteMany({
    where: { userId: user.id },
  });
  console.log(`✅ User badges reset (deleted ${deletedBadges.count} unlocked badges)`);

  // 3. Today's date
  const today = '2026-10-31';

  // For any habit that already has an XpTransaction for today, ensure it has a checkIn for today
  // so that frontend automatically marks it as "Sudah Disiram Hari Ini" (disabled).
  const todayXpTransactions = await prisma.xpTransaction.findMany({
    where: {
      userId: user.id,
      sourceType: 'WATERING',
      idempotencyKey: { endsWith: `:${today}` },
    },
  });

  let syncedCheckIns = 0;
  for (const tx of todayXpTransactions) {
    const parts = tx.idempotencyKey.split(':');
    if (parts.length === 4) {
      const habitId = parts[2];
      const habitExists = await prisma.habit.findUnique({ where: { id: habitId } });
      if (habitExists) {
        const existingCheckIn = await prisma.checkIn.findFirst({
          where: {
            habitId,
            checkInDate: today,
          },
        });

        if (!existingCheckIn) {
          await prisma.checkIn.create({
            data: {
              habitId,
              checkInDate: today,
            },
          });
          syncedCheckIns++;
        }
      }
    }
  }
  console.log(`✅ Synced ${syncedCheckIns} check-in records for habits watered/reset today so their buttons become "Sudah Disiram Hari Ini"`);

  // 4. Verify count of habits that can be tested right now (unwatered today)
  const allActiveHabits = await prisma.habit.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      checkIns: {
        where: { checkInDate: today },
      },
    },
  });

  const unwateredHabits = allActiveHabits.filter((h) => h.checkIns.length === 0);
  console.log(`🎉 Total active habits: ${allActiveHabits.length}`);
  console.log(`💧 Ready to water & test (+10 XP guaranteed): ${unwateredHabits.length} habits`);
  console.log('Sample habits ready to test:', unwateredHabits.slice(0, 5).map((h) => h.title));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
