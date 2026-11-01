import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { getRequestUser } from './habits';
import {
  getSystemGrowthSettings,
  saveSystemGrowthSettings,
  resetSystemGrowthSettings,
  DEFAULT_GROWTH_SETTINGS,
  GrowthSettings,
} from '../services/settingsEngine';

const router = Router();

/**
 * ============================================================================
 * ROUTE PENGATURAN & ADMINISTRATOR (TUMBUH V2)
 * ============================================================================
 * Menyediakan antarmuka API bagi user Administrator (admin / bismillah) untuk:
 * 1. Melihat dan memperbarui batas X kali siram setiap tahapan pertumbuhan:
 *    - Seed, Sprout, Growing, Bloom Perdana (1/5), Tunas Cabang,
 *      Bloom 2/5, Bloom 3/5, Bloom 4/5, Bloom 5/5.
 * 2. Mengatur durasi interval siram berikutnya (satuan minimal dalam menit)
 *    untuk mempermudah demonstrasi dan evaluasi langsung.
 * ============================================================================
 */

// Middleware sederhana untuk memvalidasi apakah pemanggil adalah Administrator
async function requireAdmin(req: Request, res: Response, next: Function) {
  try {
    const user = await getRequestUser(req);
    const isAdmin = user.role === 'ADMIN' || user.username.toLowerCase() === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak! Menu Settings ini hanya dapat diakses oleh Administrator.',
      });
    }

    // Teruskan ke handler berikutnya jika valid
    (req as any).adminUser = user;
    next();
  } catch (err: any) {
    console.error('Error in requireAdmin middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi hak akses administrator.',
    });
  }
}

// ----------------------------------------------------------------------------
// 1. GET /api/settings - Publik / Klien (Membaca konfigurasi pertumbuhan aktif)
// ----------------------------------------------------------------------------
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getSystemGrowthSettings();
    return res.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      settings: DEFAULT_GROWTH_SETTINGS,
      message: 'Gagal memuat pengaturan sistem, menggunakan nilai default.',
    });
  }
});

// ----------------------------------------------------------------------------
// 2. GET /api/admin/settings - Khusus Admin
// ----------------------------------------------------------------------------
router.get('/admin/settings', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const settings = await getSystemGrowthSettings();
    return res.json({
      success: true,
      settings,
      defaultSettings: DEFAULT_GROWTH_SETTINGS,
    });
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membaca pengaturan admin.',
    });
  }
});

// ----------------------------------------------------------------------------
// 3. PUT /api/admin/settings - Khusus Admin (Menyimpan pembaruan pengaturan)
// ----------------------------------------------------------------------------
router.put('/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload: Partial<GrowthSettings> = req.body;

    // Simpan ke database
    const updated = await saveSystemGrowthSettings(payload);

    return res.json({
      success: true,
      message: 'Pengaturan tahapan pertumbuhan dan durasi demo berhasil disimpan! 🌱✨',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Error saving admin settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan pengaturan: ' + error.message,
    });
  }
});

// ----------------------------------------------------------------------------
// 4. POST /api/admin/settings/reset - Khusus Admin (Reset ke nilai bawaan standar)
// ----------------------------------------------------------------------------
router.post('/admin/settings/reset', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const reset = await resetSystemGrowthSettings();
    return res.json({
      success: true,
      message: 'Pengaturan berhasil dikembalikan ke standar awal (30x, 31x, 32x, dst.) 🌾',
      settings: reset,
    });
  } catch (error: any) {
    console.error('Error resetting admin settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mereset pengaturan ke default.',
    });
  }
});

// ----------------------------------------------------------------------------
// 5. GET /api/admin/overview - Khusus Admin (Ringkasan pengguna & kebun)
// ----------------------------------------------------------------------------
router.get('/admin/overview', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
        gamificationProfile: {
          select: {
            currentLevel: true,
            currentXp: true,
          },
        },
        _count: {
          select: {
            habits: true,
            userBadges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      totalUsers: users.length,
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        level: u.gamificationProfile?.currentLevel || 1,
        xp: u.gamificationProfile?.currentXp || 0,
        habitCount: u._count.habits,
        badgeCount: u._count.userBadges,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat data ringkasan admin.',
    });
  }
});

export default router;
