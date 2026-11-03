import React from 'react';
import { Award, X, Lock, CheckCircle2, Share2 } from 'lucide-react';
import { Badge } from '../types';
import { BADGE_EMOJI_MAP } from '../utils/socialShare';

interface TrophyRoomModalProps {
  badges: Badge[];
  onClose: () => void;
  onShareBadge?: (badge: Badge) => void;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  badges,
  onClose,
  onShareBadge,
}) => {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 660, textAlign: 'left', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (First button must remain the close button) */}
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
            title="Tutup Lemari Trofi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Badge Grid */}
        <div className="trophy-grid">
          {badges.map((badge) => {
            const emoji = BADGE_EMOJI_MAP[badge.iconSvgName] || '🏆';
            return (
              <div key={badge.id} className={`badge-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon-box">
                  {badge.isUnlocked ? emoji : <Lock size={22} color="#78716C" />}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {badge.title}
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, marginBottom: '0.45rem', flex: 1 }}>
                  {badge.description}
                </p>

                {badge.isUnlocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
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
                    {onShareBadge && (
                      <button
                        type="button"
                        className="trophy-badge-share-btn"
                        onClick={() => onShareBadge(badge)}
                        title={`Bagikan lencana ${badge.title} ke Instagram, Facebook & TikTok`}
                      >
                        <Share2 size={11} />
                        <span>Bagikan</span>
                      </button>
                    )}
                  </div>
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
