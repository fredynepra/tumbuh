import React, { useState } from 'react';
import { Plus, X, Sprout } from 'lucide-react';
import { ReminderTimePicker } from './ReminderTimePicker';

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (title: string, category: string, reminderTime?: string) => Promise<void>;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kesehatan');
  const [reminderTime, setReminderTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Kesehatan', 'Belajar', 'Kebugaran', 'Mindful', 'Produktivitas', 'Umum'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title.trim(), category, reminderTime || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 420, textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803D',
              }}
            >
              <Sprout size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Tanam Kebiasaan Baru</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mulai dari langkah kecil setiap hari</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F5F5F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Nama Kebiasaan
            </label>
            <input
              type="text"
              placeholder="Contoh: Baca Buku 10 Menit, Meditasi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid #E7E5E4',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary-600)')}
              onBlur={(e) => (e.target.style.borderColor = '#E7E5E4')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Kategori
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: category === cat ? 'var(--primary-700)' : '#F5F5F4',
                    color: category === cat ? '#FFFFFF' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                ⏰ Waktu Pengingat Harian (Opsional)
              </label>
              {typeof window !== 'undefined' && 'Notification' in window && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: Notification.permission === 'granted' ? '#16A34A' : '#D97706',
                    cursor: Notification.permission === 'default' ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (Notification.permission === 'default') {
                      Notification.requestPermission();
                    }
                  }}
                  title={Notification.permission === 'default' ? 'Klik untuk izinkan notifikasi browser' : ''}
                >
                  {Notification.permission === 'granted'
                    ? '✓ Notifikasi Aktif'
                    : Notification.permission === 'denied'
                    ? '⚠️ Notifikasi Diblokir'
                    : '🔔 Aktifkan Izin'}
                </span>
              )}
            </div>
            <ReminderTimePicker
              value={reminderTime}
              onChange={(val) => {
                setReminderTime(val);
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                  Notification.requestPermission();
                }
              }}
            />
            <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {reminderTime
                ? `Pengingat akan otomatis berbunyi dan memunculkan notifikasi jam ${reminderTime} setiap hari.`
                : 'Setel jam agar kamu diingatkan untuk menyiram tanaman ini tepat waktu.'}
            </span>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              opacity: !title.trim() || isSubmitting ? 0.6 : 1,
            }}
          >
            <Plus size={18} />
            <span>{isSubmitting ? 'Menanam...' : 'Tanam Sekarang'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
