import React from 'react';
import { Award, X, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../types';

interface TrophyRoomModalProps {
  badges: Badge[];
  onClose: () => void;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ badges, onClose }) => {
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

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 640, textAlign: 'left', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B45309', fontWeight: 700, fontSize: '0.9rem' }}>
              <Award size={18} />
              <span>LEMARI TROFI</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
              Koleksi Lencana ({unlockedCount}/{badges.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F5F5F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Badge Grid */}
        <div className="trophy-grid">
          {badges.map((badge) => {
            const emoji = badgeIcons[badge.iconSvgName] || '🏆';
            return (
              <div key={badge.id} className={`badge-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon-box">
                  {badge.isUnlocked ? emoji : <Lock size={22} color="#78716C" />}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {badge.title}
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                  {badge.description}
                </p>

                {badge.isUnlocked ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#15803D',
                    }}
                  >
                    <CheckCircle2 size={12} /> Terbuka
                  </span>
                ) : (
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#A8A29E' }}>
                    +{badge.bonusXp} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
