import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  title: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, title, onClose }) => {
  useEffect(() => {
    // Trigger lightweight canvas confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#16A34A', '#F59E0B', '#38BDF8', '#E78A61'],
      });
    } catch {
      // fallback if canvas not available
    }
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '3px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Trophy size={36} color="#B45309" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#16A34A' }}>
          <Sparkles size={18} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Level Up!
          </span>
          <Sparkles size={18} />
        </div>

        <h2 style={{ fontSize: '1.8rem', margin: '0.4rem 0', color: 'var(--text-main)' }}>
          Level {level}
        </h2>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EA580C', marginBottom: '0.8rem' }}>
          "{title}"
        </p>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Luar biasa! Konsistensi Anda dalam menyiram tanaman kebiasaan telah membuahkan hasil. Tingkatkan terus dedikasi kebun Anda!
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
          }}
        >
          Lanjutkan Merawat Kebun
        </button>
      </div>
    </div>
  );
};
