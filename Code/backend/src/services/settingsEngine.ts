import { prisma } from '../prisma';

/**
 * ============================================================================
 * ENGINE PENGATURAN PERTUMBUHAN TANAMAN & DURASI DEMO (TUMBUH V2)
 * ============================================================================
 * Menyediakan konfigurasi fleksibel yang dapat diatur oleh Administrator:
 * 1. Jumlah X kali siram untuk setiap tahapan morfologi (Seed, Sprout, Growing,
 *    dan pemekaran bertahap 1-5 bunga sesuai tabel kebutuhan).
 * 2. Mode durasi siram berikutnya:
 *    - 'DAILY': Standar kalender harian (1x per hari kalender).
 *    - 'MINUTES': Mode demo dipercepat dengan jeda minimal dalam menit.
 * ============================================================================
 */

export interface GrowthSettings {
  // --- 1. Ambang Batas Morfologi Dasar (x kali siram) ---
  seedMax: number;                 // default: 2 (0-2 kali siram)
  sproutMin: number;               // default: 3 (3-6 kali siram)
  growingMin: number;              // default: 7 (7-29 kali siram)

  // --- 2. Ambang Batas Pemekaran Bunga & Cabang (Spesifikasi Standar Pabrik) ---
  bloomPerdanaMin: number;         // default: 30 (30x siram: Mekar Perdana 🌸 1/5)
  tunasCabangMin: number;          // default: 31 (31x siram: Tunas Cabang Baru)
  bloomBercabangMin: number;       // default: 32 (32-33x siram: Mekar Bercabang 🌸 2/5)
  rindangBerbungaMin: number;      // default: 34 (34-35x siram: Rindang Berbunga 🌸 3/5)
  harmoniMahkotaMin: number;       // default: 36 (36-37x siram: Harmoni Mahkota 🌸 4/5)
  mahkotaMegahMin: number;         // default: 38 (>= 38x siram: Mahkota Megah 🌸 5/5)

  // --- 3. Pengaturan Durasi Siram Berikutnya (Untuk Kemudahan Demo) ---
  wateringIntervalMode: 'DAILY' | 'MINUTES'; // 'DAILY' atau 'MINUTES'
  wateringIntervalMinutes: number;          // jeda dalam menit (misal: 1 menit, 2 menit)
  maxWateringPerInterval: number;           // kuota siram per jeda (default: 1)
}

export const DEFAULT_GROWTH_SETTINGS: GrowthSettings = {
  seedMax: 2,
  sproutMin: 3,
  growingMin: 7,
  bloomPerdanaMin: 30,
  tunasCabangMin: 31,
  bloomBercabangMin: 32,
  rindangBerbungaMin: 34,
  harmoniMahkotaMin: 36,
  mahkotaMegahMin: 38,
  wateringIntervalMode: 'DAILY',
  wateringIntervalMinutes: 1,
  maxWateringPerInterval: 1,
};

const SETTINGS_KEY = 'growth_settings';

/**
 * Mengambil pengaturan sistem saat ini dari database PostgreSQL.
 * Jika belum ada di database, kembalikan nilai default standar.
 */
export async function getSystemGrowthSettings(): Promise<GrowthSettings> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (!record || !record.value) {
      return { ...DEFAULT_GROWTH_SETTINGS };
    }

    const parsed = JSON.parse(record.value);
    return {
      ...DEFAULT_GROWTH_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.error('Error membaca system settings dari database:', err);
    return { ...DEFAULT_GROWTH_SETTINGS };
  }
}

/**
 * Menyimpan pembaruan pengaturan dari Administrator ke database.
 */
export async function saveSystemGrowthSettings(
  updates: Partial<GrowthSettings>
): Promise<GrowthSettings> {
  const current = await getSystemGrowthSettings();

  // Validasi dan normalisasi angka (pastikan non-negatif dan tipe data benar)
  const merged: GrowthSettings = {
    seedMax: Math.max(0, Number(updates.seedMax ?? current.seedMax)),
    sproutMin: Math.max(1, Number(updates.sproutMin ?? current.sproutMin)),
    growingMin: Math.max(1, Number(updates.growingMin ?? current.growingMin)),
    bloomPerdanaMin: Math.max(1, Number(updates.bloomPerdanaMin ?? current.bloomPerdanaMin)),
    tunasCabangMin: Math.max(1, Number(updates.tunasCabangMin ?? current.tunasCabangMin)),
    bloomBercabangMin: Math.max(1, Number(updates.bloomBercabangMin ?? current.bloomBercabangMin)),
    rindangBerbungaMin: Math.max(1, Number(updates.rindangBerbungaMin ?? current.rindangBerbungaMin)),
    harmoniMahkotaMin: Math.max(1, Number(updates.harmoniMahkotaMin ?? current.harmoniMahkotaMin)),
    mahkotaMegahMin: Math.max(1, Number(updates.mahkotaMegahMin ?? current.mahkotaMegahMin)),
    wateringIntervalMode: updates.wateringIntervalMode === 'MINUTES' ? 'MINUTES' : 'DAILY',
    wateringIntervalMinutes: Math.max(1, Number(updates.wateringIntervalMinutes ?? current.wateringIntervalMinutes)),
    maxWateringPerInterval: Math.max(1, Number(updates.maxWateringPerInterval ?? current.maxWateringPerInterval)),
  };

  await prisma.systemSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: JSON.stringify(merged),
      description: 'Pengaturan tahapan pertumbuhan tanaman dan durasi jeda demo penyiraman',
    },
    update: {
      value: JSON.stringify(merged),
      updatedAt: new Date(),
    },
  });

  return merged;
}

/**
 * Mereset pengaturan kembali ke default standar (30x, 31x, 32x, dll).
 */
export async function resetSystemGrowthSettings(): Promise<GrowthSettings> {
  await prisma.systemSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: JSON.stringify(DEFAULT_GROWTH_SETTINGS),
      description: 'Pengaturan tahapan pertumbuhan tanaman dan durasi jeda demo penyiraman (Default)',
    },
    update: {
      value: JSON.stringify(DEFAULT_GROWTH_SETTINGS),
      updatedAt: new Date(),
    },
  });

  return { ...DEFAULT_GROWTH_SETTINGS };
}

/**
 * Menghitung tahap morfologi ('SEED' | 'SPROUT' | 'GROWING' | 'BLOOM')
 * secara dinamis berdasarkan total penyiraman dan pengaturan yang aktif.
 */
export function calculatePlantStageDynamic(
  totalCompletions: number,
  settings: GrowthSettings = DEFAULT_GROWTH_SETTINGS
): 'SEED' | 'SPROUT' | 'GROWING' | 'BLOOM' {
  if (totalCompletions >= settings.bloomPerdanaMin) {
    return 'BLOOM';
  }
  if (totalCompletions >= settings.growingMin) {
    return 'GROWING';
  }
  if (totalCompletions >= settings.sproutMin) {
    return 'SPROUT';
  }
  return 'SEED';
}
