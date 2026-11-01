import React, { useState } from 'react';
import { Droplet, Check, Flame, Edit2, Info, Clock } from 'lucide-react';
import { Habit, GrowthSettings } from '../types';
import { PlantIllustration, getBloomFlowerCount } from './PlantIllustration';

interface HabitCardProps {
  habit: Habit;
  onWater: (habitId: string) => Promise<void>;
  onEdit?: (habit: Habit) => void;
  onViewDetail?: (habit: Habit) => void;
  growthSettings?: GrowthSettings;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onWater,
  onEdit,
  onViewDetail,
  growthSettings,
}) => {
  const [isWateringAnim, setIsWateringAnim] = useState(false);
  const [showFloatingXp, setShowFloatingXp] = useState(false);
  const [floatingText, setFloatingText] = useState('+10 XP');

  const handleWaterClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (habit.isWateredToday || isWateringAnim) return;

    setIsWateringAnim(true);
    setShowFloatingXp(true);
    setFloatingText('+10 XP');

    try {
      await onWater(habit.id);
    } finally {
      setTimeout(() => {
        setIsWateringAnim(false);
      }, 750);
      setTimeout(() => {
        setShowFloatingXp(false);
      }, 1000);
    }
  };

  const stageLabels: Record<string, string> = {
    SEED: 'Bibit (Seed)',
    SPROUT: 'Tunas (Sprout)',
    GROWING: 'Rindang (Growing)',
    BLOOM: 'Mekar (Bloom)',
  };

  return (
    <div id={`habit-card-${habit.id}`} className="habit-card">
      {/* Top Header Row with Category & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="habit-category-pill">{habit.category}</span>
          {habit.reminderTime && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#B45309',
                backgroundColor: '#FEF3C7',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title={`Pengingat harian: ${habit.reminderTime}`}
            >
              <Clock size={11} />
              {habit.reminderTime}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Streak Badge */}
          <span
            className={`habit-streak-badge ${habit.currentStreak >= 5 ? 'gold' : ''}`}
            title={`Streak saat ini: ${habit.currentStreak} hari`}
            style={{ margin: 0 }}
          >
            <Flame size={13} />
            {habit.currentStreak} Hari
          </span>

          {/* Edit Button (Point 10) */}
          {onEdit && (
            <button
              className="habit-edit-btn"
              onClick={() => onEdit(habit)}
              style={{
                background: '#F5F5F4',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#78716C',
                transition: 'all 0.15s ease',
              }}
              title="Edit atau Hapus Habit"
            >
              <Edit2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Visual Tanaman 2D */}
      <div
        className="plant-view-container"
        onClick={() => onViewDetail && onViewDetail(habit)}
        style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
        title="Klik untuk melihat detail & riwayat pemulihan"
      >
        <PlantIllustration
          stage={habit.plantStage}
          totalCompletions={habit.totalCompletions}
          isWatering={isWateringAnim}
          growthSettings={growthSettings}
        />
        {showFloatingXp && <div className="floating-xp">{floatingText}</div>}
      </div>

      {/* Informasi Habit */}
      <div className="habit-info">
        <h3
          className="habit-title"
          onClick={() => onViewDetail && onViewDetail(habit)}
          style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
        >
          {habit.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <span className="stage-pill">
            {habit.plantStage === 'BLOOM'
              ? `BLOOM (${getBloomFlowerCount(habit.plantStage, habit.totalCompletions, growthSettings)}/5 🌸)`
              : stageLabels[habit.plantStage] || habit.plantStage}
          </span>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(habit)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '11px',
                color: '#15803D',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 4px',
                fontWeight: 600,
              }}
            >
              <Info size={12} />
              <span>Detail</span>
            </button>
          )}
        </div>
      </div>

      {/* Weekly History Strip (Point 7) */}
      {habit.weeklyHistory && habit.weeklyHistory.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAF9',
            border: '1px solid #F0EDED',
            borderRadius: '10px',
            padding: '6px 8px',
            margin: '4px 0 10px 0',
            width: '100%',
          }}
          title="Riwayat penyiraman 7 hari terakhir"
        >
          {habit.weeklyHistory.map((day) => (
            <div
              key={day.date}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: day.isToday ? '#15803D' : '#A8A29E',
                }}
              >
                {day.dayLabel}
              </span>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: day.isWatered ? '#16A34A' : day.isToday ? '#FEF3C7' : '#E7E5E4',
                  color: day.isWatered ? '#FFFFFF' : day.isToday ? '#B45309' : '#A8A29E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  border: day.isToday ? '1.5px solid #16A34A' : 'none',
                }}
              >
                {day.isWatered ? '✓' : day.isToday ? '💧' : '·'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tombol Siram / Check-in */}
      <button
        className={`water-btn ${habit.isWateredToday ? 'done' : 'ready'}`}
        onClick={handleWaterClick}
        disabled={habit.isWateredToday || isWateringAnim}
      >
        {habit.isWateredToday ? (
          <>
            <Check size={18} />
            <span>
              {growthSettings?.wateringIntervalMode === 'MINUTES'
                ? habit.cooldownRemainingSeconds && habit.cooldownRemainingSeconds > 0
                  ? `Sudah Disiram (${habit.cooldownRemainingSeconds}s)`
                  : `Sudah Disiram (${growthSettings.wateringIntervalMinutes}m)`
                : 'Sudah Disiram Hari Ini'}
            </span>
          </>
        ) : (
          <>
            <Droplet size={18} />
            <span>Siram Tanaman (+10 XP)</span>
          </>
        )}
      </button>
    </div>
  );
};
export default HabitCard;
