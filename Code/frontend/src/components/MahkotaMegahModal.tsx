import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Sparkles, Flame, Droplet } from 'lucide-react';
import { GrowthSettings, Habit, Profile, SocialSharePayload } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { QuickSocialShareSection } from './SocialShareModal';

interface MahkotaMegahModalProps {
  habit: Habit;
  profile?: Profile | null;
  userName?: string;
  growthSettings?: GrowthSettings;
  onOpenShareStudio?: (payload: SocialSharePayload) => void;
  onClose: () => void;
}

export const MahkotaMegahModal: React.FC<MahkotaMegahModalProps> = ({
  habit,
  profile,
  userName,
  growthSettings,
  onOpenShareStudio,
  onClose,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#F59E0B', '#F43F5E', '#FB7185', '#10B981'],
      });
      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 55,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#FDE047', '#F59E0B', '#22C55E', '#FB7185'],
          });
        } catch {}
      }, 380);
      return () => clearTimeout(timer);
    } catch {
      // fallback if canvas unavailable
    }
  }, []);

  const sharePayload: SocialSharePayload = useMemo(
    () => ({
      type: 'MAHKOTA_MEGAH',
      habit,
      userName: profile?.displayName || userName || 'Pekebun Tumbuh',
      userLevel: profile?.level || 1,
      userTitle: profile?.title || 'Penyemai Benih',
    }),
    [habit, profile, userName]
  );

  const longestStreak = Math.max(habit.longestStreak || 0, habit.currentStreak || 0);

  return (
    <div id="mahkota-megah-celebration-modal" className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: 500,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.65rem 1.45rem',
          border: '2px solid #FACC15',
          boxShadow: '0 20px 50px rgba(245, 158, 11, 0.28), 0 8px 24px rgba(0, 0, 0, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Crown Ribbon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1.5px solid #F59E0B',
            color: '#B45309',
            padding: '0.32rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: '0.76rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}
        >
          <Crown size={15} />
          <span>Pencapaian Puncak • Mahkota Megah (5/5 🌸)</span>
          <Sparkles size={14} />
        </div>

        {/* Glowing Tree Centerpiece */}
        <div
          style={{
            width: 156,
            height: 156,
            margin: '0 auto 0.85rem',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FEFCE8 0%, #ECFDF5 72%, #DCFCE7 100%)',
            border: '3px solid #FACC15',
            boxShadow: '0 0 0 6px rgba(250, 204, 21, 0.18), 0 10px 25px rgba(22, 163, 74, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlantIllustration
            stage="BLOOM"
            totalCompletions={Math.max(habit.totalCompletions, growthSettings?.mahkotaMegahMin ?? 38)}
            isWatering={false}
            growthSettings={growthSettings}
          />
        </div>

        <h2 style={{ fontSize: '1.5rem', margin: '0.2rem 0 0.3rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
          Selamat! Mahkota Megah Mekar Sempurna!
        </h2>

        <div
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#15803D',
            marginBottom: '0.7rem',
          }}
        >
          &ldquo;{habit.title}&rdquo;
        </div>

        {/* Stats Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Droplet size={13} />
            <span>{habit.totalCompletions}x Siram</span>
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              color: '#C2410C',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Flame size={13} />
            <span>Rekor {longestStreak} Hari</span>
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              color: '#92400E',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
            }}
          >
            <span>🌸 5/5 Bunga Mekar</span>
          </span>
        </div>

        {/* Ucapan Selamat, Semangat Motivasi & Tombol Share IG / FB / TikTok */}
        <QuickSocialShareSection payload={sharePayload} onOpenStudio={onOpenShareStudio} />

        {/* Tombol Tutup / Lanjutkan */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.98rem',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
          }}
        >
          Terus Tumbuh & Rawat Kebun 🌱
        </button>
      </div>
    </div>
  );
};
export default MahkotaMegahModal;
