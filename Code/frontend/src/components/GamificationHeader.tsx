import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { Profile, AuthUser } from '../types';

interface GamificationHeaderProps {
  profile: Profile | null;
  currentUser?: AuthUser | null;
  onOpenTrophyRoom: () => void;
  isXpBoosting?: boolean;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({
  profile,
  currentUser,
  onOpenTrophyRoom,
  isXpBoosting = false,
}) => {
  if (!profile) {
    return (
      <header className="header-shell">
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memuat profil kebun...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="header-shell">
      <div className="header-row">
        {/* Profil & Level */}
        <div className="profile-summary">
          <div className="avatar-badge" title="Pekebun Aktif">
            🌱
          </div>
          <div className="profile-meta">
            <h2>{profile.displayName || currentUser?.username}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="level-tag">
                <Sparkles size={12} /> Lvl {profile.level}
              </span>
              <span className="title-tag">{profile.title}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="xp-section">
          <div className="xp-label-row">
            <span>XP Progres</span>
            <span>
              {profile.isMaxLevel || profile.level >= 10
                ? `${profile.currentXp.toLocaleString('id-ID')} XP (MAX LEVEL)`
                : `${profile.currentXp} / ${profile.nextLevelXp} XP`}
            </span>
          </div>
          <div className="xp-track">
            <div
              className={`xp-fill ${isXpBoosting ? 'boost' : ''}`}
              style={{ width: `${profile.isMaxLevel || profile.level >= 10 ? 100 : profile.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tombol Lemari Trofi */}
        <div className="header-actions">
          <button className="trophy-btn" onClick={onOpenTrophyRoom} title="Buka Koleksi Lencana">
            <Award size={18} />
            <span>Lencana</span>
          </button>
        </div>
      </div>
    </header>
  );
};


