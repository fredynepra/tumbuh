import { prisma } from './prisma';
import { seedBadges } from './services/badgeEngine';

export async function runSeed() {
  console.log('Seeding Tumbuh V2 default data...');

  // 1. Seed Badges
  await seedBadges(prisma);
  console.log('✔ Badges catalog seeded successfully.');

  // 2. Ensure default demo user exists
  const demoEmail = 'demo@tumbuh.app';
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: { gamificationProfile: true, habits: true },
  });

  if (!user) {
    const createdUser = await prisma.user.create({
      data: {
        username: 'demo',
        password: 'password123',
        email: demoEmail,
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
      include: { gamificationProfile: true, habits: true },
    });
    console.log('✔ Created demo user:', createdUser.email);

    // Create 3 starter habits
    await prisma.habit.createMany({
      data: [
        {
          userId: createdUser.id,
          title: 'Minum Air 2 Liter',
          category: 'Kesehatan',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
        {
          userId: createdUser.id,
          title: 'Membaca Buku 15 Menit',
          category: 'Belajar',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
        {
          userId: createdUser.id,
          title: 'Jalan Santai 20 Menit',
          category: 'Kebugaran',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
      ],
    });
    console.log('✔ Created 3 default starter habits.');
  } else {
    console.log('✔ Demo user already exists.');
  }

  console.log('✔ Database seeding complete.');
}

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
