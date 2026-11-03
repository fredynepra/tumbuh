import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles } from 'lucide-react';
import { Profile, SocialSharePayload, UnlockedBadgeItem } from '../types';
import { BADGE_EMOJI_MAP } from '../utils/socialShare';
import { QuickSocialShareSection } from './SocialShareModal';

interface BadgeModalProps {
  badge: UnlockedBadgeItem;
  profile?: Profile | null;
  userName?: string;
  onOpenShareStudio?: (payload: SocialSharePayload) => void;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  badge,
  profile,
  userName,
  onOpenShareStudio,
  onClose,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#F59E0B', '#E78A61', '#10B981'],
      });
    } catch {
      // fallback
    }
  }, []);

  const iconEmoji = BADGE_EMOJI_MAP[badge.iconSvgName] || '🏆';

  const sharePayload: SocialSharePayload = useMemo(
    () => ({
      type: 'BADGE',
      badge: {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        bonusXp: badge.bonusXp,
        iconSvgName: badge.iconSvgName,
      },
      userName: profile?.displayName || userName || 'Pekebun Tumbuh',
      userLevel: profile?.level || 1,
      userTitle: profile?.title || 'Penyemai Benih',
    }),
    [badge, profile, userName]
  );

  return (
    <div id="badge-unlocked-celebration-modal" className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: 490,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.65rem 1.45rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '3px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            margin: '0 auto 0.85rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          }}
        >
          {iconEmoji}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#D97706' }}>
          <Award size={18} />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lencana Baru Terbuka!
          </span>
          <Sparkles size={18} />
        </div>

        <h2 style={{ fontSize: '1.55rem', margin: '0.35rem 0', color: 'var(--text-main)' }}>
          {badge.title}
        </h2>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
          {badge.description}
        </p>

        {badge.bonusXp > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '0.32rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            <span>Hadiah:</span>
            <span>+{badge.bonusXp} Bonus XP</span>
          </div>
        )}

        {/* Ucapan Selamat, Semangat Motivasi & Tombol Share Instagram, Facebook, TikTok */}
        <QuickSocialShareSection payload={sharePayload} onOpenStudio={onOpenShareStudio} />

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          }}
        >
          Koleksi Lencana
        </button>
      </div>
    </div>
  );
};
