import React from 'react';
import { X, Flame, Droplet, Check, Calendar, HeartHandshake, Edit3, Crown, Share2 } from 'lucide-react';
import { Habit, GrowthSettings } from '../types';
import { PlantIllustration, getBloomStageDetails, getBloomFlowerCount } from './PlantIllustration';

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
  onWater: (habitId: string) => Promise<void>;
  onOpenEdit: (habit: Habit) => void;
  onShareMahkota?: (habit: Habit) => void;
  growthSettings?: GrowthSettings;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  onClose,
  onWater,
  onOpenEdit,
  onShareMahkota,
  growthSettings,
}) => {
  const stageInfo = getBloomStageDetails(habit.plantStage, habit.totalCompletions, growthSettings);
  const flowerCount = getBloomFlowerCount(habit.plantStage, habit.totalCompletions, growthSettings);
  const isMahkotaMegah = habit.plantStage === 'BLOOM' && flowerCount === 5;

  const handleWater = async () => {
    await onWater(habit.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 480, textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}
              >
                {habit.category}
              </span>
              {habit.reminderTime && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    padding: '3px 8px',
                    borderRadius: '12px',
                  }}
                >
                  ⏰ {habit.reminderTime}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: '4px 0 0 0' }}>
              {habit.title}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => onOpenEdit(habit)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#F5F5F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Edit Kebiasaan"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onClose}
              className="modal-close-btn"
              title="Tutup Detail"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#F5F5F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Visual Tanaman Centerpiece */}
        <div
          style={{
            backgroundColor: '#F8FAF9',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1.25rem',
            border: '1px solid #E5E7EB',
          }}
        >
          <div style={{ width: '130px', height: '130px', marginBottom: '10px' }}>
            <PlantIllustration
              stage={habit.plantStage}
              totalCompletions={habit.totalCompletions}
              isWatering={false}
              growthSettings={growthSettings}
            />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A', marginBottom: '4px' }}>
            Tahap: {stageInfo.label}
          </span>
          <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', margin: 0, maxWidth: '320px', lineHeight: 1.4 }}>
            {stageInfo.desc}
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Streak</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              <Flame size={16} />
              <span>{habit.currentStreak} Hari</span>
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Total Siram</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
              {habit.totalCompletions}x
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Rekor Streak</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>
              {habit.longestStreak} Hari
            </div>
          </div>
        </div>

        {/* Banner Selebrasi & Share Mahkota Megah (5/5) */}
        {isMahkotaMegah && (
          <div
            id="mahkota-megah-detail-banner"
            style={{
              background: 'linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%)',
              border: '1.5px solid #F59E0B',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Crown size={16} />
              </div>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#92400E' }}>
                Selamat! Mahkota Megah (5/5 🌸) Berhasil Diselesaikan!
              </h4>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#78350F', lineHeight: 1.45 }}>
              Luar biasa! Konsistensimu merawat kebiasaan ini hingga mekar sempurna 5 bunga adalah bukti nyata ketekunanmu. Bagikan semangat positif ini agar semakin termotivasi untuk terus Tumbuh! 🌱✨
            </p>
            {onShareMahkota && (
              <button
                id="detail-share-mahkota-btn"
                type="button"
                onClick={() => onShareMahkota(habit)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                }}
              >
                <Share2 size={14} />
                <span>Bagikan ke WhatsApp & Facebook</span>
              </button>
            )}
          </div>
        )}

        {/* Supportive Recovery Section (Point 9) */}
        <div
          id="recovery-section"
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartHandshake size={18} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>
              Pemulihan Tanpa Beban (Supportive Recovery)
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#3B82F6', lineHeight: 1.45 }}>
              Di Tumbuh, tanamanmu tidak pernah layu atau mati meskipun terlewat beberapa hari. Konsistensi dibangun selangkah demi selangkah. Setiap tetesan air hari ini menyambung kembali pertumbuhan kebunmu!
            </p>
          </div>
        </div>

        {/* Weekly History Grid (Point 7) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={15} />
              <span>Riwayat 7 Hari Terakhir</span>
            </span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              {habit.weeklyHistory?.filter((h) => h.isWatered).length || 0}/7 Hari Disiram
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '12px 10px',
            }}
          >
            {habit.weeklyHistory?.map((day, idx) => (
              <div
                key={day.date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: day.isToday ? '#15803D' : '#6B7280' }}>
                  {day.dayLabel}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: day.isWatered ? '#16A34A' : day.isToday ? '#FEF3C7' : '#F3F4F6',
                    color: day.isWatered ? '#FFFFFF' : day.isToday ? '#B45309' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: day.isToday ? '2px solid #16A34A' : '1px solid transparent',
                  }}
                  title={`${day.date}: ${day.isWatered ? 'Disiram' : 'Belum disiram'}`}
                >
                  {day.isWatered ? '✓' : day.isToday ? '💧' : '·'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleWater}
          disabled={habit.isWateredToday}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: habit.isWateredToday
              ? '#F3F4F6'
              : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: habit.isWateredToday ? '#6B7280' : '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            border: 'none',
            cursor: habit.isWateredToday ? 'default' : 'pointer',
            boxShadow: habit.isWateredToday ? 'none' : '0 4px 14px rgba(22, 163, 74, 0.25)',
          }}
        >
          {habit.isWateredToday ? (
            <>
              <Check size={18} color="#16A34A" />
              <span>Sudah Disiram & Tumbuh Hari Ini</span>
            </>
          ) : (
            <>
              <Droplet size={18} />
              <span>Siram untuk Memulihkan (+10 XP)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default HabitDetailModal;
