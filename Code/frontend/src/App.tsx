import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, RefreshCw, LogOut, X, Share2 } from 'lucide-react';
import {
  Habit,
  Profile,
  Badge,
  UnlockedBadgeItem,
  WaterResponse,
  ReengagementResponse,
  ReengagementSituation,
  AuthUser,
  GrowthSettings,
  SocialSharePayload,
} from './types';
import { LoginPage } from './components/LoginPage';
import { GamificationHeader } from './components/GamificationHeader';
import { HabitCard } from './components/HabitCard';
import { LevelUpModal } from './components/LevelUpModal';
import { BadgeModal } from './components/BadgeModal';
import { MahkotaMegahModal } from './components/MahkotaMegahModal';
import { SocialShareModal } from './components/SocialShareModal';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { AddHabitModal } from './components/AddHabitModal';
import { EditHabitModal } from './components/EditHabitModal';
import { HabitDetailModal } from './components/HabitDetailModal';
import { ReengagementBanner } from './components/ReengagementBanner';
import { ArchivedHabitCard } from './components/ArchivedHabitCard';
import { GardenPagination } from './components/GardenPagination';
import { AdminSettingsPage } from './components/AdminSettingsPage';
import { getBloomFlowerCount } from './components/PlantIllustration';

const HABITS_PER_PAGE = 6;

export const App: React.FC = () => {
  // --------------------------------------------------------------------------
  // AUTH STATE SEDERHANA (TUMBUH V2)
  // Menyimpan data user aktif di localStorage.
  // Tanpa token JWT atau session cookies rumit.
  // --------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('tumbuh_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Apakah user yang login adalah Administrator (admin / bismillah)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.username?.toLowerCase() === 'admin';

  // Helper fetch yang secara otomatis menyertakan header 'x-user-id'
  const authFetch = (url: string, options: RequestInit = {}) => {
    const customHeaders = (options.headers as Record<string, string>) || {};
    const mergedHeaders: Record<string, string> = {
      ...customHeaders,
    };
    if (currentUser?.id) {
      mergedHeaders['x-user-id'] = currentUser.id;
    }
    return fetch(url, {
      ...options,
      headers: mergedHeaders,
    });
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [growthSettings, setGrowthSettings] = useState<GrowthSettings | null>(null);
  const [reengagement, setReengagement] = useState<ReengagementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'garden' | 'trophy' | 'settings'>('garden');
  const [gardenSubTab, setGardenSubTab] = useState<'active' | 'archived'>('active');
  const [activePage, setActivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);

  // Modals state
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);

  // Celebration Queues
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [unlockedBadgesQueue, setUnlockedBadgesQueue] = useState<UnlockedBadgeItem[]>([]);
  const [currentBadgeModal, setCurrentBadgeModal] = useState<UnlockedBadgeItem | null>(null);
  const [pendingMahkotaHabit, setPendingMahkotaHabit] = useState<Habit | null>(null);
  const [mahkotaMegahModalHabit, setMahkotaMegahModalHabit] = useState<Habit | null>(null);
  const [socialSharePayload, setSocialSharePayload] = useState<SocialSharePayload | null>(null);

  const openBadgeShareStudio = (badge: Badge | UnlockedBadgeItem) => {
    setSocialSharePayload({
      type: 'BADGE',
      badge: {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        bonusXp: badge.bonusXp,
        iconSvgName: badge.iconSvgName,
      },
      userName: profile?.displayName || currentUser?.displayName || currentUser?.username || 'Pekebun Tumbuh',
      userLevel: profile?.level || 1,
      userTitle: profile?.title || 'Penyemai Benih',
    });
  };

  const openMahkotaShareStudio = (habit: Habit) => {
    setSocialSharePayload({
      type: 'MAHKOTA_MEGAH',
      habit,
      userName: profile?.displayName || currentUser?.displayName || currentUser?.username || 'Pekebun Tumbuh',
      userLevel: profile?.level || 1,
      userTitle: profile?.title || 'Penyemai Benih',
    });
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Daily Reminder state
  interface ActiveReminderItem {
    id: string;
    habitId: string;
    title: string;
    time: string;
  }
  const [activeReminders, setActiveReminders] = useState<ActiveReminderItem[]>([]);

  // Floating Browser Notification state (Pojok Kanan Bawah seperti native OS)
  interface FloatingNotificationItem {
    id: string;
    habitId: string;
    title: string;
    body: string;
    timeLabel?: string;
    isDemo?: boolean;
  }
  const [floatingNotification, setFloatingNotification] = useState<FloatingNotificationItem | null>(null);

  // Auto-dismiss floating notification after 15 seconds
  useEffect(() => {
    if (!floatingNotification) return;
    const timer = setTimeout(() => {
      setFloatingNotification(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [floatingNotification]);

  // Gentle audio chime for scheduled reminder
  const playReminderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Dispatch unified notification: In-App Floating Card + Web Notification API (Safari & Chrome)
  const dispatchNotification = async ({
    habitId,
    title,
    body,
    tag,
    timeLabel,
    isDemo = false,
  }: {
    habitId: string;
    title: string;
    body: string;
    tag?: string;
    timeLabel?: string;
    isDemo?: boolean;
  }) => {
    // 1. Play Audio Chime
    playReminderChime();

    // 2. Selalu tampilkan floating in-app notification di pojok kanan bawah (100% muncul di Chrome & Safari)
    setFloatingNotification({
      id: `${habitId}-${Date.now()}`,
      habitId,
      title,
      body,
      timeLabel,
      isDemo,
    });

    // 3. Notifikasi Web Browser Native (Google Chrome & Safari macOS)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {}
      }

      if (Notification.permission === 'granted') {
        let shownBySw = false;

        // Prioritas 1: Service Worker showNotification (Sangat stabil di Safari macOS/iOS & Chrome background)
        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
              await reg.showNotification(title, {
                body,
                icon: '/favicon.ico',
                tag: tag || `tumbuh-${habitId}`,
                data: { habitId },
              });
              shownBySw = true;
            }
          } catch (swErr) {
            console.warn('SW notification fallback:', swErr);
          }
        }

        // Prioritas 2: Direct constructor (fallback desktop)
        if (!shownBySw) {
          try {
            const notif = new Notification(title, {
              body,
              icon: '/favicon.ico',
              tag: tag || `tumbuh-${habitId}`,
            });
            notif.onclick = () => {
              window.focus();
              const cardEl = document.getElementById(`habit-card-${habitId}`);
              cardEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              notif.close();
            };
          } catch (err) {
            console.warn('Direct notification error (misal Safari restriction):', err);
          }
        }
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch supportive re-engagement status
  const loadReengagement = async (simMode?: string, overrideUserId?: string) => {
    try {
      const targetUserId = overrideUserId || currentUser?.id;
      if (!targetUserId) return;
      const url = simMode ? `/api/reengagement?simulate=${simMode}` : '/api/reengagement';
      const res = await fetch(url, {
        headers: { 'x-user-id': targetUserId },
      }).then((r) => r.json());
      if (res.success) {
        setReengagement(res);
      }
    } catch (err) {
      console.error('Error loading re-engagement:', err);
    }
  };

  // Fetch all initial data untuk user aktif
  const loadData = async (userToLoad?: AuthUser | null) => {
    const activeUser = userToLoad !== undefined ? userToLoad : currentUser;
    if (!activeUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const reqHeaders = { 'x-user-id': activeUser.id };
      const [habitsRes, profileRes, badgesRes, settingsRes] = await Promise.all([
        fetch('/api/habits?status=all', { headers: reqHeaders }).then((r) => r.json()),
        fetch('/api/profile', { headers: reqHeaders }).then((r) => r.json()),
        fetch('/api/badges', { headers: reqHeaders }).then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (habitsRes.success) setHabits(habitsRes.habits);
      if (profileRes.success) setProfile(profileRes.profile);
      if (badgesRes.success) setBadges(badgesRes.badges);
      if (settingsRes.success && settingsRes.settings) setGrowthSettings(settingsRes.settings);
      await loadReengagement(undefined, activeUser.id);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Gagal terhubung ke server backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData(currentUser);
    } else {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Handler jika user berhasil login atau daftar akun baru
  const handleLoginSuccess = (user: AuthUser) => {
    try {
      localStorage.setItem('tumbuh_active_user', JSON.stringify(user));
    } catch (e) {
      console.error('Storage error:', e);
    }
    setCurrentUser(user);
    showToast(`Selamat datang di Kebun Saya, ${user.displayName || user.username}! 🌱`);
  };

  // Handler untuk keluar (logout) / ganti akun
  const handleLogout = () => {
    try {
      localStorage.removeItem('tumbuh_active_user');
    } catch (e) {
      console.error('Storage error:', e);
    }
    setCurrentUser(null);
    setProfile(null);
    setHabits([]);
    setBadges([]);
    setReengagement(null);
    showToast('Berhasil keluar dari akun. Sampai jumpa kembali! 👋');
  };


  // Daily Reminder Ticker & Live Cooldown Ticker for Demo Mode
  useEffect(() => {
    // Daftarkan Service Worker untuk Safari & Chrome
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });

      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'FOCUS_HABIT' && event.data?.habitId) {
          const cardEl = document.getElementById(`habit-card-${event.data.habitId}`);
          cardEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    const checkTicker = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${currentHours}:${currentMinutes}`;
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
      const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const isMinuteMode = growthSettings?.wateringIntervalMode === 'MINUTES';

      setHabits((prevHabits) => {
        let hasChanges = false;
        const updatedHabits = prevHabits.map((habit) => {
          // --- A. PENANGANAN COOLDOWN INTERVAL MENIT (MODE DEMO) ---
          if (isMinuteMode && habit.cooldownRemainingSeconds !== undefined && habit.cooldownRemainingSeconds > 0) {
            const nextCooldown = habit.cooldownRemainingSeconds - 1;
            hasChanges = true;

            // Saat cooldown mencapai 0, tanaman SIAP DISIRAM KEMBALI!
            if (nextCooldown === 0) {
              // Picu notifikasi melayang bahwa jeda demo telah selesai!
              dispatchNotification({
                habitId: habit.id,
                title: `⏰ Waktunya Menyiram: ${habit.title}! 🌱`,
                body: `Waktu jeda ${growthSettings?.wateringIntervalMinutes || 1} menit telah selesai! Luangkan 1 menit untuk merawat tanaman kebiasaanmu dan klaim +10 XP.`,
                tag: `demo-cooldown-${habit.id}-${Date.now()}`,
                isDemo: true,
              });

              // Masukkan ke banner pengingat aktif di layar
              setActiveReminders((prev) => {
                if (prev.some((r) => r.habitId === habit.id)) return prev;
                return [
                  ...prev,
                  {
                    id: `demo_ready_${habit.id}_${Date.now()}`,
                    habitId: habit.id,
                    title: habit.title,
                    time: `${growthSettings?.wateringIntervalMinutes || 1}m Demo`,
                  },
                ];
              });

              return {
                ...habit,
                isWateredToday: false,
                cooldownRemainingSeconds: 0,
              };
            }

            return {
              ...habit,
              cooldownRemainingSeconds: nextCooldown,
            };
          }

          // --- B. PENANGANAN PENGINGAT TERJADWAL (JAM & MENIT) ---
          if (habit.isActive !== false && habit.reminderTime && !habit.isWateredToday) {
            const habitTime = habit.reminderTime.trim();
            const parts = habitTime.split(':').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              const remTotalMinutes = parts[0] * 60 + parts[1];
              const diff = currentTotalMinutes - remTotalMinutes;

              // Toleransi 0 - 5 menit dari jam pengingat
              if (diff >= 0 && diff <= 5) {
                const key = isMinuteMode
                  ? `tumbuh_reminder_${habit.id}_${todayDateStr}_${currentHHMM}`
                  : `tumbuh_reminder_${habit.id}_${todayDateStr}_${habitTime}`;
                const alreadyNotified = localStorage.getItem(key);

                if (!alreadyNotified) {
                  localStorage.setItem(key, 'true');

                  dispatchNotification({
                    habitId: habit.id,
                    title: `⏰ Waktunya Menyiram: ${habit.title}! 🌱`,
                    body: `Waktu pengingat ${habitTime} telah tiba! Luangkan 1 menit untuk merawat tanaman kebiasaanmu dan klaim +10 XP.`,
                    tag: `reminder-${habit.id}-${todayDateStr}`,
                    timeLabel: habitTime,
                    isDemo: isMinuteMode,
                  });

                  setActiveReminders((prev) => {
                    if (prev.some((r) => r.habitId === habit.id)) return prev;
                    return [
                      ...prev,
                      {
                        id: key,
                        habitId: habit.id,
                        title: habit.title,
                        time: habitTime,
                      },
                    ];
                  });
                }
              }
            }
          }

          return habit;
        });

        return hasChanges ? updatedHabits : prevHabits;
      });
    };

    (window as any).__tumbuh_check_reminders__ = checkTicker;
    checkTicker();
    const interval = setInterval(checkTicker, 1000);
    return () => clearInterval(interval);
  }, [growthSettings]);

  // Process celebration queue: when level up is closed, show badge or Mahkota Megah if any
  const handleCloseLevelUp = () => {
    setLevelUpData(null);
    if (unlockedBadgesQueue.length > 0) {
      const nextBadge = unlockedBadgesQueue[0];
      setUnlockedBadgesQueue((prev) => prev.slice(1));
      setCurrentBadgeModal(nextBadge);
    } else if (pendingMahkotaHabit) {
      setMahkotaMegahModalHabit(pendingMahkotaHabit);
      setPendingMahkotaHabit(null);
    }
  };

  const handleCloseBadgeModal = () => {
    setCurrentBadgeModal(null);
    if (unlockedBadgesQueue.length > 0) {
      const nextBadge = unlockedBadgesQueue[0];
      setUnlockedBadgesQueue((prev) => prev.slice(1));
      setCurrentBadgeModal(nextBadge);
    } else if (pendingMahkotaHabit) {
      setMahkotaMegahModalHabit(pendingMahkotaHabit);
      setPendingMahkotaHabit(null);
    }
  };

  // Water Habit action handler
  const handleWaterHabit = async (habitId: string) => {
    const prevHabit = habits.find((h) => h.id === habitId);
    const prevFlowers = prevHabit
      ? getBloomFlowerCount(prevHabit.plantStage, prevHabit.totalCompletions, growthSettings || undefined)
      : 0;

    try {
      const res = await authFetch(`/api/habits/${habitId}/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: WaterResponse = await res.json();

      if (data.success) {
        // Dismiss active reminder and floating notification for this habit
        setActiveReminders((prev) => prev.filter((r) => r.habitId !== habitId));
        setFloatingNotification((prev) => (prev?.habitId === habitId ? null : prev));

        // Update local state
        if (data.habit && data.profile) {
          const isMinute = growthSettings?.wateringIntervalMode === 'MINUTES';
          const cooldownSec = isMinute
            ? data.cooldownRemainingSeconds || (growthSettings?.wateringIntervalMinutes || 1) * 60
            : 0;

          setHabits((prev) =>
            prev.map((h) =>
              h.id === habitId
                ? {
                    ...data.habit,
                    isWateredToday: true,
                    cooldownRemainingSeconds: cooldownSec,
                  }
                : h
            )
          );
          setProfile(data.profile);
        } else {
          // Respons tidak membawa data habit/profil (mis. fallback konflik idempotensi P2002).
          // Jangan menimpa state dengan undefined; ambil ulang data terbaru dari server.
          try {
            const [habitsRes, profileRes] = await Promise.all([
              authFetch('/api/habits?status=all').then((r) => r.json()),
              authFetch('/api/profile').then((r) => r.json()),
            ]);
            if (habitsRes.success) setHabits(habitsRes.habits);
            if (profileRes.success) setProfile(profileRes.profile);
          } catch (refreshErr) {
            console.error('Error refreshing data after watering:', refreshErr);
          }
        }

        showToast(data.message);

        const newFlowers = data.habit
          ? getBloomFlowerCount(data.habit.plantStage, data.habit.totalCompletions, growthSettings || undefined)
          : 0;
        const reachedMahkota =
          !data.alreadyWatered &&
          Boolean(data.habit) &&
          (Boolean(data.isMahkotaMegahReached) || (prevFlowers < 5 && newFlowers === 5));

        // Check if level up, badges unlocked, or Mahkota Megah (5/5) reached
        if (data.isLevelUp) {
          setLevelUpData({ level: data.profile.level, title: data.profile.title });
          if (data.unlockedBadges && data.unlockedBadges.length > 0) {
            setUnlockedBadgesQueue(data.unlockedBadges);
          }
          if (reachedMahkota && data.habit) {
            setPendingMahkotaHabit(data.habit);
          }
        } else if (data.unlockedBadges && data.unlockedBadges.length > 0) {
          setCurrentBadgeModal(data.unlockedBadges[0]);
          setUnlockedBadgesQueue(data.unlockedBadges.slice(1));
          if (reachedMahkota && data.habit) {
            setPendingMahkotaHabit(data.habit);
          }
        } else if (reachedMahkota && data.habit) {
          setMahkotaMegahModalHabit(data.habit);
        }

        if (data.habit && detailHabit && detailHabit.id === habitId) {
          setDetailHabit({ ...data.habit, isWateredToday: true });
        }

        // Refresh badges catalog
        authFetch('/api/badges')
          .then((r) => r.json())
          .then((bData) => {
            if (bData.success) setBadges(bData.badges);
          });

        // Refresh re-engagement state
        await loadReengagement();
      }
    } catch (err) {
      console.error('Watering error:', err);
      showToast('Gagal menyiram tanaman. Silakan coba lagi.');
    }
  };

  // Action handler when user clicks CTA in supportive re-engagement banner
  const handleReengagementAction = (situation: ReengagementSituation, targetHabitId?: string) => {
    if (situation === 'HABIT_INCOMPLETE_TODAY') {
      if (targetHabitId) {
        const targetCard = document.getElementById(`habit-card-${targetHabitId}`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.style.transition = 'box-shadow 0.3s ease';
          targetCard.style.boxShadow = '0 0 0 3px #10B981';
          setTimeout(() => {
            targetCard.style.boxShadow = '';
          }, 1500);
          return;
        }
      }
      const grid = document.querySelector('.garden-grid');
      grid?.scrollIntoView({ behavior: 'smooth' });
    } else if (situation === 'SEVERAL_MISSED_DAYS' || situation === 'USER_RETURNS') {
      const grid = document.querySelector('.garden-grid');
      grid?.scrollIntoView({ behavior: 'smooth' });
    } else if (situation === 'ALL_WATERED') {
      setIsTrophyOpen(true);
    }
  };

  // Add Habit handler (Point 8: with optional reminderTime)
  const handleAddHabit = async (title: string, category: string, reminderTime?: string) => {
    try {
      const res = await authFetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, reminderTime }),
      });
      const data = await res.json();
      if (data.success) {
        if (reminderTime) {
          const now = new Date();
          const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          localStorage.removeItem(`tumbuh_reminder_${data.habit.id}_${todayDateStr}_${reminderTime.trim()}`);
        }
        setHabits((prev) => [...prev, data.habit]);
        // Tanaman baru selalu tampil di halaman 1 Kebun Aktif
        setGardenSubTab('active');
        setActivePage(1);
        showToast('Kebiasaan baru berhasil ditanam! 🌱');
        await loadReengagement();
      }
    } catch (err) {
      console.error('Add habit error:', err);
      showToast('Gagal menambahkan kebiasaan baru.');
    }
  };

  // Edit Habit handler (Point 10)
  const handleSaveEditHabit = async (
    id: string,
    payload: { title: string; category: string; reminderTime?: string | null }
  ) => {
    try {
      const res = await authFetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Clear all previous reminder cache for this habit so new time triggers cleanly
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`tumbuh_reminder_${id}_`)) {
            localStorage.removeItem(k);
          }
        }
        setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
        if (detailHabit && detailHabit.id === id) {
          setDetailHabit(data.habit);
        }
        if (editingHabit && editingHabit.id === id) {
          setEditingHabit(data.habit);
        }
        showToast('Kebiasaan berhasil diperbarui! 🌿');
      }
    } catch (err) {
      console.error('Error editing habit:', err);
      showToast('Gagal memperbarui kebiasaan.');
    }
  };

  // Reset today's watering check-in (for re-testing and flexible management)
  const handleResetToday = async (habitId: string) => {
    try {
      const res = await authFetch(`/api/habits/${habitId}/reset-today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.map((h) => (h.id === habitId ? data.habit : h)));
        if (detailHabit && detailHabit.id === habitId) {
          setDetailHabit(data.habit);
        }
        if (editingHabit && editingHabit.id === habitId) {
          setEditingHabit(data.habit);
        }
        // Clear any previous reminder cache for this habit so it can trigger freshly
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`tumbuh_reminder_${habitId}_`)) {
            localStorage.removeItem(k);
          }
        }
        showToast(data.message || 'Status siram hari ini berhasil di-reset!');
        await loadReengagement();
      }
    } catch (err) {
      console.error('Error resetting today watering:', err);
      showToast('Gagal mereset status siram.');
    }
  };

  // Instant Test Reminder Trigger
  const triggerTestReminder = (habitTitle: string, habitTime: string) => {
    playReminderChime();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`⏰ [Uji Coba] Waktunya Menyiram: ${habitTitle}! 🌱`, {
          body: `Waktu pengingat ${habitTime} berhasil berbunyi! Notifikasi browser Anda berfungsi sempurna. ✨`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(`⏰ [Uji Coba] Waktunya Menyiram: ${habitTitle}! 🌱`, {
              body: `Notifikasi browser berhasil diaktifkan! ✨`,
              icon: '/favicon.ico',
            });
          }
        });
      }
    }
    setActiveReminders((prev) => [
      ...prev.filter((r) => r.id !== 'test-reminder'),
      {
        id: 'test-reminder',
        habitId: 'test-id',
        title: habitTitle,
        time: habitTime,
        isWateredToday: false,
      },
    ]);
    showToast('🔔 Uji coba pengingat & suara berhasil dikirim!');
  };

  // Delete / Archive Habit handler (Point 10)
  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await authFetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, isActive: false } : h)));
        if (detailHabit && detailHabit.id === id) {
          setDetailHabit(null);
        }
        showToast('Kebiasaan berhasil dipindahkan ke Arsip Kebun 📦');
        await loadReengagement();
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
      showToast('Gagal mengarsipkan kebiasaan.');
    }
  };

  // Restore Habit handler
  const handleRestoreHabit = async (id: string) => {
    try {
      const res = await authFetch(`/api/habits/${id}/restore`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
        showToast(data.message || 'Tanaman berhasil dipulihkan kembali ke Kebun Aktif! 🌱');
        await loadReengagement();
      }
    } catch (err) {
      console.error('Error restoring habit:', err);
      showToast('Gagal memulihkan kebiasaan.');
    }
  };

  // Permanent Delete Habit handler
  const handlePermanentDeleteHabit = async (id: string, title: string) => {
    if (!window.confirm(`Hapus permanen tanaman "${title}"? Data historis tanaman ini akan dihapus seutuhnya.`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/habits/${id}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        showToast('Tanaman berhasil dihapus permanen.');
        await loadReengagement();
      }
    } catch (err) {
      console.error('Error permanently deleting habit:', err);
      showToast('Gagal menghapus tanaman.');
    }
  };

  // Kebun Aktif diurutkan dari yang terbaru ditanam agar tanaman baru muncul di halaman 1
  const activeHabits = habits
    .filter((h) => h.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const archivedHabits = habits.filter((h) => !h.isActive);

  // Pagination (maksimal 6 tanaman per halaman)
  const activeTotalPages = Math.max(1, Math.ceil(activeHabits.length / HABITS_PER_PAGE));
  const archivedTotalPages = Math.max(1, Math.ceil(archivedHabits.length / HABITS_PER_PAGE));
  const safeActivePage = Math.min(activePage, activeTotalPages);
  const safeArchivedPage = Math.min(archivedPage, archivedTotalPages);
  const pagedActiveHabits = activeHabits.slice(
    (safeActivePage - 1) * HABITS_PER_PAGE,
    safeActivePage * HABITS_PER_PAGE
  );
  const pagedArchivedHabits = archivedHabits.slice(
    (safeArchivedPage - 1) * HABITS_PER_PAGE,
    safeArchivedPage * HABITS_PER_PAGE
  );

  const scrollToGardenTop = () => {
    document.querySelector('.section-banner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleActivePageChange = (page: number) => {
    setActivePage(Math.min(Math.max(1, page), activeTotalPages));
    scrollToGardenTop();
  };
  const handleArchivedPageChange = (page: number) => {
    setArchivedPage(Math.min(Math.max(1, page), archivedTotalPages));
    scrollToGardenTop();
  };

  // Jika belum ada user aktif yang login, tampilkan Halaman Login & Sign Up
  if (!currentUser) {
    return (
      <div className="login-root">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="toast-notification animate-bounce-subtle">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sticky Gamification Header */}
      <GamificationHeader
        profile={profile}
        currentUser={currentUser}
        onOpenTrophyRoom={() => setIsTrophyOpen(true)}
      />

      {/* Nav Tabs & Main Page Logout Bar */}
      <div className="nav-bar-container">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'garden' ? 'active' : ''}`}
            onClick={() => setActiveTab('garden')}
          >
            Kebun Saya (Garden)
          </button>
          <button
            className={`tab-btn ${activeTab === 'trophy' ? 'active' : ''}`}
            onClick={() => setActiveTab('trophy')}
          >
            Koleksi Lencana ({badges.filter((b) => b.isUnlocked).length}/{badges.length})
          </button>
          {isAdmin && (
            <button
              id="admin-settings-tab"
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderLeft: '1px solid #E2E8F0',
                marginLeft: '6px',
                paddingLeft: '14px',
                color: activeTab === 'settings' ? '#059669' : '#475569',
                fontWeight: 700,
              }}
            >
              <span>⚙️ Settings</span>
            </button>
          )}
        </div>

        {/* User Status & Dedicated Logout Button on Main Page */}
        <div className="main-logout-bar">
          <div className="user-pill" title="Akun pekebun yang sedang aktif">
            <span className="user-pill-icon">👤</span>
            <span className="user-pill-name">{currentUser.username || currentUser.displayName}</span>
          </div>
          <button
            type="button"
            className="main-logout-btn"
            onClick={handleLogout}
            title="Keluar dari akun ini (Logout)"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Section Content */}
      {activeTab === 'garden' ? (
        <div>
          {/* Supportive Re-engagement Banner */}
          <ReengagementBanner
            data={reengagement}
            onActionClick={handleReengagementAction}
            onRefresh={loadReengagement}
          />

          {/* Active Scheduled Daily Reminder Banners */}
          {activeReminders.map((rem) => (
            <div
              key={rem.id}
              id={`reminder-banner-${rem.habitId}`}
              className="daily-reminder-banner"
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '1.5px solid #F59E0B',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  ⏰
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#B45309',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Waktu Pengingat Harian ({rem.time})
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#78350F' }}>
                    Waktunya menyiram &quot;{rem.title}&quot;! 🌿
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400E' }}>
                    Waktu pengingat telah tiba. Siram sekarang untuk menjaga konsistensi kebunmu dan
                    raih +10 XP.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  id={`reminder-water-btn-${rem.habitId}`}
                  className="reminder-water-btn"
                  onClick={() => handleWaterHabit(rem.habitId)}
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>💧</span>
                  <span>Siram Sekarang (+10 XP)</span>
                </button>
                <button
                  onClick={() => setActiveReminders((prev) => prev.filter((r) => r.id !== rem.id))}
                  style={{
                    background: '#F5F5F4',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    color: '#78716C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                  title="Tutup pengingat"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Sub Navigation: Kebun Aktif vs Arsip Kebun */}
          <div
            className="garden-subtabs"
            style={{
              display: 'inline-flex',
              background: '#E7E5E4',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '1.25rem',
              gap: '4px',
            }}
          >
            <button
              className={`garden-subtab-btn ${gardenSubTab === 'active' ? 'active' : ''}`}
              onClick={() => setGardenSubTab('active')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: gardenSubTab === 'active' ? '#FFFFFF' : 'transparent',
                color: gardenSubTab === 'active' ? 'var(--primary-800)' : 'var(--text-muted)',
                boxShadow: gardenSubTab === 'active' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🌱 Kebun Aktif</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: gardenSubTab === 'active' ? 'var(--primary-100)' : '#D6D3D1',
                  color: gardenSubTab === 'active' ? 'var(--primary-800)' : '#78716C',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                }}
              >
                {activeHabits.length}
              </span>
            </button>
            <button
              className={`garden-subtab-btn ${gardenSubTab === 'archived' ? 'active' : ''}`}
              onClick={() => setGardenSubTab('archived')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: gardenSubTab === 'archived' ? '#FFFFFF' : 'transparent',
                color: gardenSubTab === 'archived' ? 'var(--primary-800)' : 'var(--text-muted)',
                boxShadow: gardenSubTab === 'archived' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>📦 Arsip Kebun</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: gardenSubTab === 'archived' ? 'var(--primary-100)' : '#D6D3D1',
                  color: gardenSubTab === 'archived' ? 'var(--primary-800)' : '#78716C',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                }}
              >
                {archivedHabits.length}
              </span>
            </button>
          </div>

          {gardenSubTab === 'active' ? (
            /* ACTIVE GARDEN VIEW */
            <div>
              {/* Header Action Row */}
              <div className="section-banner">
                <div>
                  <h1 style={{ fontSize: '1.45rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    Kebun Kebiasaan
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Siram setiap hari untuk menumbuhkan tunas & raih lencana konsistensi!
                  </p>
                </div>
                <button className="add-habit-btn" onClick={() => setIsAddHabitOpen(true)}>
                  <Plus size={18} />
                  <span>Tanam Habit</span>
                </button>
              </div>

              {/* Habit Cards Grid */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.5rem' }} />
                  <p>Menyiapkan kebun Anda...</p>
                </div>
              ) : activeHabits.length === 0 ? (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    border: '1px dashed #D6D3D1',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪴</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Kebun Masih Kosong</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Mulai perjalanan konsistensi Anda dengan menanam kebiasaan pertama!
                  </p>
                  <button className="add-habit-btn" onClick={() => setIsAddHabitOpen(true)}>
                    <Plus size={18} />
                    <span>Tanam Kebiasaan Pertama</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="garden-grid">
                    {pagedActiveHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onWater={handleWaterHabit}
                        onEdit={(h) => setEditingHabit(h)}
                        onViewDetail={(h) => setDetailHabit(h)}
                        onShareMahkota={(h) => openMahkotaShareStudio(h)}
                        growthSettings={growthSettings || undefined}
                      />
                    ))}
                  </div>
                  <GardenPagination
                    idPrefix="active-garden"
                    currentPage={safeActivePage}
                    totalPages={activeTotalPages}
                    totalItems={activeHabits.length}
                    pageSize={HABITS_PER_PAGE}
                    onPageChange={handleActivePageChange}
                  />
                </>
              )}
            </div>
          ) : (
            /* ARCHIVED GARDEN VIEW */
            <div>
              {/* Header Action Row */}
              <div className="section-banner">
                <div>
                  <h1 style={{ fontSize: '1.45rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    Arsip Tanaman
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Tanaman yang diarsipkan disimpan dengan aman di sini. Kamu bisa memulihkannya kembali ke kebun aktif kapan saja!
                  </p>
                </div>
              </div>

              {/* Archived Habit Cards Grid */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.5rem' }} />
                  <p>Memuat arsip kebun...</p>
                </div>
              ) : archivedHabits.length === 0 ? (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    border: '1px dashed #D6D3D1',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Arsip Masih Kosong</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Belum ada tanaman yang diarsipkan. Semua kebiasaanmu masih aktif bertumbuh di Kebun Aktif!
                  </p>
                </div>
              ) : (
                <>
                  <div className="garden-grid">
                    {pagedArchivedHabits.map((habit) => (
                      <ArchivedHabitCard
                        key={habit.id}
                        habit={habit}
                        onRestore={handleRestoreHabit}
                        onPermanentDelete={handlePermanentDeleteHabit}
                        growthSettings={growthSettings || undefined}
                      />
                    ))}
                  </div>
                  <GardenPagination
                    idPrefix="archived-garden"
                    currentPage={safeArchivedPage}
                    totalPages={archivedTotalPages}
                    totalItems={archivedHabits.length}
                    pageSize={HABITS_PER_PAGE}
                    onPageChange={handleArchivedPageChange}
                  />
                </>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'trophy' ? (
        /* Trophy Room Tab View */
        <div>
          <div className="section-banner">
            <div>
              <h1 style={{ fontSize: '1.45rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                Lemari Trofi & Penghargaan
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Buka lencana khusus seperti "Konsistensi Tunas" (Streak 5 Hari) dan dapatkan bonus XP!
              </p>
            </div>
          </div>

          <div className="trophy-grid">
            {badges.map((badge) => {
              const badgeIcons: Record<string, string> = {
                droplet: '💧',
                sprout: '🌱',
                leaves_five: '🌿',
                tree_roots: '🌳',
                lotus_crystal: '🪷',
                pots_trio: '🪴',
                flower_harvest: '🌸',
                sun_rise: '🌅',
                moon_stars: '🌙',
              };
              const emoji = badgeIcons[badge.iconSvgName] || '🏆';

              return (
                <div key={badge.id} className={`badge-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="badge-icon-box">{badge.isUnlocked ? emoji : '🔒'}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {badge.title}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {badge.description}
                  </p>
                  {badge.isUnlocked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803D' }}>
                        ✔ Terbuka (+{badge.bonusXp} XP)
                      </span>
                      <button
                        type="button"
                        className="trophy-badge-share-btn"
                        onClick={() => openBadgeShareStudio(badge)}
                        title={`Bagikan lencana ${badge.title} ke Instagram, Facebook & TikTok`}
                      >
                        <Share2 size={11} />
                        <span>Bagikan</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#A8A29E' }}>
                      Hadiah: +{badge.bonusXp} XP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'settings' && isAdmin ? (
        /* Settings Tab View - Khusus Administrator (admin) */
        <AdminSettingsPage
          authFetch={authFetch}
          onSettingsSaved={(newSettings) => {
            setGrowthSettings(newSettings);
            loadData(currentUser);
            showToast('Pengaturan pertumbuhan & durasi berhasil diperbarui! 🌱✨');
          }}
        />
      ) : null}

      {/* Level Up Celebration Modal */}
      {levelUpData && (
        <LevelUpModal
          level={levelUpData.level}
          title={levelUpData.title}
          onClose={handleCloseLevelUp}
        />
      )}

      {/* Badge Unlocked Celebration Modal */}
      {currentBadgeModal && (
        <BadgeModal
          badge={currentBadgeModal}
          profile={profile}
          userName={currentUser.displayName || currentUser.username}
          onOpenShareStudio={(payload) => setSocialSharePayload(payload)}
          onClose={handleCloseBadgeModal}
        />
      )}

      {/* Mahkota Megah (5/5) Pinnacle Celebration Modal */}
      {mahkotaMegahModalHabit && (
        <MahkotaMegahModal
          habit={mahkotaMegahModalHabit}
          profile={profile}
          userName={currentUser.displayName || currentUser.username}
          growthSettings={growthSettings || undefined}
          onOpenShareStudio={(payload) => setSocialSharePayload(payload)}
          onClose={() => setMahkotaMegahModalHabit(null)}
        />
      )}

      {/* Trophy Room Modal Popup (from header button) */}
      {isTrophyOpen && (
        <TrophyRoomModal
          badges={badges}
          onShareBadge={(b) => openBadgeShareStudio(b)}
          onClose={() => setIsTrophyOpen(false)}
        />
      )}

      {/* Add Habit Modal */}
      {isAddHabitOpen && (
        <AddHabitModal onClose={() => setIsAddHabitOpen(false)} onAdd={handleAddHabit} />
      )}

      {/* Edit Habit Modal (Point 10) */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={handleSaveEditHabit}
          onDelete={handleDeleteHabit}
        />
      )}

      {/* Habit Detail & Recovery Modal (Points 7 & 9) */}
      {detailHabit && (
        <HabitDetailModal
          habit={detailHabit}
          onClose={() => setDetailHabit(null)}
          onWater={handleWaterHabit}
          onOpenEdit={(h) => {
            setDetailHabit(null);
            setEditingHabit(h);
          }}
          onShareMahkota={(h) => openMahkotaShareStudio(h)}
          growthSettings={growthSettings || undefined}
        />
      )}

      {/* Social Media Share Studio Modal (Instagram, Facebook, TikTok) */}
      {socialSharePayload && (
        <SocialShareModal
          payload={socialSharePayload}
          onClose={() => setSocialSharePayload(null)}
        />
      )}

      {/* Floating Browser Notification at Bottom Right Corner */}
      {floatingNotification && (
        <div
          id="floating-browser-notification"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(15, 23, 42, 0.08)',
            padding: '16px 18px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                🌱
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                Google Chrome &bull; Safari
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>• tumbuh.towingkediri.com</span>
            </div>
            <button
              id="close-floating-notification"
              onClick={() => setFloatingNotification(null)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              title="Tutup Notifikasi"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title & Body */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', lineHeight: 1.35 }}>
              {floatingNotification.title}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
              {floatingNotification.body}
            </div>
          </div>

          {/* Action Button & Mode Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              {floatingNotification.isDemo ? '⏱️ Mode Demo Menit' : '⏰ Pengingat Terjadwal'}
            </span>
            <button
              id="floating-water-btn"
              onClick={async () => {
                const targetHabitId = floatingNotification.habitId;
                setFloatingNotification(null);
                await handleWaterHabit(targetHabitId);
              }}
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(22, 163, 74, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>💧</span>
              <span>Siram Sekarang (+10 XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(28, 25, 23, 0.92)',
            color: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.88rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Sparkles size={16} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
