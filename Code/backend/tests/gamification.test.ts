import assert from 'node:assert';
import test from 'node:test';
import { calculateLevelFromXp, LEVEL_THRESHOLDS } from '../src/services/levelEngine';
import { evaluateStreakAndPlantStage, getCalendarDayDifference } from '../src/services/streakEngine';

test('Level Engine - calculateLevelFromXp', () => {
  // Test Level 1 baseline
  const lvl1 = calculateLevelFromXp(0);
  assert.strictEqual(lvl1.level, 1);
  assert.strictEqual(lvl1.title, 'Penyemai Benih');
  assert.strictEqual(lvl1.progressPercent, 0);

  // Test Level 1 near threshold
  const lvl1Near = calculateLevelFromXp(90);
  assert.strictEqual(lvl1Near.level, 1);
  assert.strictEqual(lvl1Near.progressPercent, 90);

  // Test Level 2 threshold (100 XP)
  const lvl2 = calculateLevelFromXp(100);
  assert.strictEqual(lvl2.level, 2);
  assert.strictEqual(lvl2.title, 'Penyiram Rajin');
  assert.strictEqual(lvl2.nextLevelXp, 250);
  assert.strictEqual(lvl2.progressPercent, 0);

  // Test Level 3 threshold (250 XP)
  const lvl3 = calculateLevelFromXp(250);
  assert.strictEqual(lvl3.level, 3);
  assert.strictEqual(lvl3.title, 'Penjaga Tunas');

  // Test Level 10 threshold (3200 XP)
  const lvl10 = calculateLevelFromXp(3200);
  assert.strictEqual(lvl10.level, 10);
  assert.strictEqual(lvl10.title, 'Dewa Flora');
});

test('Streak Engine - getCalendarDayDifference', () => {
  assert.strictEqual(getCalendarDayDifference('2026-10-25', '2026-10-26'), 1);
  assert.strictEqual(getCalendarDayDifference('2026-10-25', '2026-10-27'), 2);
  assert.strictEqual(getCalendarDayDifference('2026-10-25', '2026-10-25'), 0);
});

test('Streak Engine - evaluateStreakAndPlantStage', () => {
  // 1st water: streak becomes 1, plant is SEED
  const first = evaluateStreakAndPlantStage(0, 0, 0, null, '2026-10-25');
  assert.strictEqual(first.newStreak, 1);
  assert.strictEqual(first.longestStreak, 1);
  assert.strictEqual(first.newTotalCompletions, 1);
  assert.strictEqual(first.plantStage, 'SEED');
  assert.strictEqual(first.isFirstWater, true);

  // 2nd water consecutive day (diff = 1): streak becomes 2
  const second = evaluateStreakAndPlantStage(1, 1, 1, '2026-10-25', '2026-10-26');
  assert.strictEqual(second.newStreak, 2);
  assert.strictEqual(second.plantStage, 'SEED');

  // 3rd water consecutive day: plant becomes SPROUT (completions = 3)
  const third = evaluateStreakAndPlantStage(2, 2, 2, '2026-10-26', '2026-10-27');
  assert.strictEqual(third.newStreak, 3);
  assert.strictEqual(third.plantStage, 'SPROUT');

  // 5th streak (milestone for streak_5 badge)
  const fifth = evaluateStreakAndPlantStage(4, 4, 4, '2026-10-28', '2026-10-29');
  assert.strictEqual(fifth.newStreak, 5);

  // 7th water: plant becomes GROWING (completions = 7)
  const seventh = evaluateStreakAndPlantStage(6, 6, 6, '2026-10-30', '2026-10-31');
  assert.strictEqual(seventh.plantStage, 'GROWING');

  // 30th water: plant becomes BLOOM
  const bloom = evaluateStreakAndPlantStage(29, 29, 29, '2026-10-30', '2026-10-31');
  assert.strictEqual(bloom.plantStage, 'BLOOM');
  assert.strictEqual(bloom.isBloomStageReached, true);

  // Skipped day: streak resets to 1, but historical completions are preserved
  const skipped = evaluateStreakAndPlantStage(5, 5, 10, '2026-10-20', '2026-10-25');
  assert.strictEqual(skipped.newStreak, 1);
  assert.strictEqual(skipped.longestStreak, 5);
  assert.strictEqual(skipped.newTotalCompletions, 11);
  assert.strictEqual(skipped.plantStage, 'GROWING'); // never demotes
});
