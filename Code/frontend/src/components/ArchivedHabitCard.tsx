import React, { useState } from 'react';
import { Habit, GrowthSettings } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { RotateCcw, Trash2 } from 'lucide-react';

interface ArchivedHabitCardProps {
  habit: Habit;
  onRestore: (id: string) => Promise<void>;
  onPermanentDelete: (id: string, title: string) => Promise<void>;
  growthSettings?: GrowthSettings;
}

export const ArchivedHabitCard: React.FC<ArchivedHabitCardProps> = ({
  habit,
  onRestore,
  onPermanentDelete,
  growthSettings,
}) => {
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await onRestore(habit.id);
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onPermanentDelete(habit.id, habit.title);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="habit-card archived-card"
      style={{
        border: '1px solid #E7E5E4',
        background: '#FAFAF9',
        opacity: 0.95,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.4rem',
        }}
      >
        <span className="habit-category-pill">{habit.category}</span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#78716C',
            background: '#E7E5E4',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          📦 Diarsipkan
        </span>
      </div>

      {/* Plant Stage Illustration */}
      <div className="plant-view-container" style={{ filter: 'grayscale(25%)' }}>
        <PlantIllustration
          stage={habit.plantStage}
          totalCompletions={habit.totalCompletions}
          isWatering={false}
          growthSettings={growthSettings}
        />
      </div>

      {/* Info */}
      <div className="habit-info">
        <h3 className="habit-title" style={{ color: '#44403C' }}>{habit.title}</h3>
        <span className="stage-pill" style={{ color: '#78716C', background: '#F5F5F4' }}>
          Tahap: {habit.plantStage}
        </span>
      </div>

      {/* Stats summary */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: '#F5F5F4',
          padding: '0.6rem 0.5rem',
          borderRadius: '10px',
          marginBottom: '1rem',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ color: '#78716C' }}>Streak Rekor</div>
          <div style={{ fontWeight: 700, color: '#B45309' }}>🔥 {habit.longestStreak} Hari</div>
        </div>
        <div>
          <div style={{ color: '#78716C' }}>Total Disiram</div>
          <div style={{ fontWeight: 700, color: '#15803D' }}>💧 {habit.totalCompletions} Kali</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <button
          onClick={handleRestore}
          disabled={restoring}
          className="restore-habit-btn"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.6rem 0.75rem',
            background: 'var(--primary-700)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: restoring ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          title="Pulihkan tanaman ke kebun aktif"
        >
          <RotateCcw size={14} className={restoring ? 'animate-spin' : ''} />
          <span>{restoring ? 'Memulihkan...' : 'Pulihkan'}</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="permanent-delete-btn"
          style={{
            padding: '0.6rem 0.75rem',
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          title="Hapus permanen dari database"
        >
          <Trash2 size={14} />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
};
