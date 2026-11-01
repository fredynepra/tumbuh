import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles } from 'lucide-react';
import { UnlockedBadgeItem } from '../types';

interface BadgeModalProps {
  badge: UnlockedBadgeItem;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#F59E0B', '#E78A61', '#10B981'],
      });
    } catch {
      // fallback
    }
  }, []);

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

  const iconEmoji = badgeIcons[badge.iconSvgName] || '🏆';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          }}
        >
          {iconEmoji}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#D97706' }}>
          <Award size={18} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lencana Baru Terbuka!
          </span>
          <Sparkles size={18} />
        </div>

        <h2 style={{ fontSize: '1.6rem', margin: '0.4rem 0', color: 'var(--text-main)' }}>
          {badge.title}
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
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
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
            }}
          >
            <span>Hadiah:</span>
            <span>+{badge.bonusXp} Bonus XP</span>
          </div>
        )}

        <button
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
