import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

/**
 * ============================================================================
 * ROUTE AUTHENTICATION SEDERHANA (TUMBUH V2)
 * ============================================================================
 * Sesuai kebutuhan:
 * 1. Pendaftaran sederhana hanya memerlukan User (Username) dan Password.
 * 2. Login hanya memvalidasi kecocokan username dan password dari database.
 * 3. Tidak menggunakan token JWT atau session cookies rumit.
 * 4. User ID yang dikembalikan digunakan oleh frontend untuk mengisolasi
 *    seluruh relasi: Tanaman (Habit), XP, dan Lencana (Badge) masing-masing.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. POST /api/auth/signup (atau /register) - Mendaftarkan user baru
// ----------------------------------------------------------------------------
const handleSignup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi input dasar
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username wajib diisi!',
      });
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password wajib diisi!',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 2. Cek apakah username sudah ada di database
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Username "${cleanUsername}" sudah terdaftar! Silakan gunakan username lain atau login.`,
      });
    }

    // 3. Buat user baru di tabel users
    // Sekaligus buatkan profil gamifikasi awal (Level 1, 0 XP, Penyemai Benih)
    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: cleanPassword, // Disimpan langsung di database sesuai instruksi sederhana
        displayName: cleanUsername, // Default display name menggunakan username
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
      include: {
        gamificationProfile: true,
      },
    });

    // 4. Buatkan 3 tanaman starter agar kebun user baru langsung siap dirawat
    await prisma.habit.createMany({
      data: [
        {
          userId: newUser.id,
          title: 'Minum Air 2 Liter',
          category: 'Kesehatan',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
        {
          userId: newUser.id,
          title: 'Membaca Buku 15 Menit',
          category: 'Belajar',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
        {
          userId: newUser.id,
          title: 'Jalan Santai 20 Menit',
          category: 'Kebugaran',
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          plantStage: 'SEED',
        },
      ],
    });

    // 5. Kembalikan data user sukses (tanpa token / session)
    return res.status(201).json({
      success: true,
      message: `Pendaftaran berhasil! Selamat datang di kebun Tumbuh, ${cleanUsername}! 🌱`,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        role: newUser.role || 'USER',
        level: newUser.gamificationProfile?.currentLevel || 1,
        currentXp: newUser.gamificationProfile?.currentXp || 0,
      },
    });
  } catch (error: any) {
    console.error('Error on signup:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat pendaftaran: ' + error.message,
    });
  }
};

router.post('/signup', handleSignup);
router.post('/register', handleSignup);

// ----------------------------------------------------------------------------
// 2. POST /api/auth/login - Validasi username dan password
// ----------------------------------------------------------------------------
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi kelengkapan form
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi!',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 2. Cari user di database berdasarkan username
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      include: {
        gamificationProfile: true,
      },
    });

    // 3. Validasi keberadaan user dan kecocokan password
    if (!user || user.password !== cleanPassword) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah! Periksa kembali data login Anda.',
      });
    }

    // 4. Jika cocok, langsung kembalikan data user untuk masuk ke Kebun Saya
    return res.json({
      success: true,
      message: `Login berhasil! Selamat datang kembali, ${user.displayName}! 🌿`,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role || 'USER',
        level: user.gamificationProfile?.currentLevel || 1,
        currentXp: user.gamificationProfile?.currentXp || 0,
      },
    });
  } catch (error: any) {
    console.error('Error on login:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login: ' + error.message,
    });
  }
});

// ----------------------------------------------------------------------------
// 3. GET /api/auth/me - Cek info user aktif saat halaman dimuat ulang
// ----------------------------------------------------------------------------
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Ambil user ID dari header 'x-user-id' atau parameter query
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID tidak ditemukan pada request header!',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        gamificationProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan di database.',
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role || 'USER',
        level: user.gamificationProfile?.currentLevel || 1,
        currentXp: user.gamificationProfile?.currentXp || 0,
      },
    });
  } catch (error: any) {
    console.error('Error on get me:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa user aktif.',
    });
  }
});

export default router;
