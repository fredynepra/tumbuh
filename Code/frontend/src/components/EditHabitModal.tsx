import React, { useState } from 'react';
import { Edit3, X, Trash2, Check, Clock } from 'lucide-react';
import { Habit } from '../types';
import { ReminderTimePicker } from './ReminderTimePicker';

interface EditHabitModalProps {
  habit: Habit;
  onClose: () => void;
  onSave: (id: string, data: { title: string; category: string; reminderTime?: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  habit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(habit.title);
  const [category, setCategory] = useState(habit.category);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const categories = ['Kesehatan', 'Belajar', 'Kebugaran', 'Mindful', 'Produktivitas', 'Umum'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(habit.id, {
        title: title.trim(),
        category,
        reminderTime: reminderTime ? reminderTime.trim() : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDelete(habit.id);
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
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B45309',
              }}
            >
              <Edit3 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>Kelola Kebiasaan</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ubah nama, kategori, atau jadwal pengingat</span>
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
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Delete Confirmation Box */}
        {showConfirmDelete ? (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '1rem',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', color: '#991B1B', fontSize: '14px', fontWeight: 700 }}>
              Konfirmasi Penghapusan
            </h4>
            <p style={{ margin: '0 0 12px 0', color: '#7F1D1D', fontSize: '13px', lineHeight: 1.4 }}>
              Apakah kamu yakin ingin mengarsipkan tanaman <strong>"{habit.title}"</strong>? Progres historismu tetap aman.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus/Arsipkan'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Nama Kebiasaan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid #E7E5E4',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
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
                    border: 'none',
                    cursor: 'pointer',
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
                ? `Pengingat akan otomatis berbunyi dan memunculkan notifikasi jam ${reminderTime} setiap hari (hanya jika tanaman belum disiram).`
                : 'Kosongkan jika tidak ingin pengingat terjadwal.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                opacity: !title.trim() || isSubmitting ? 0.6 : 1,
              }}
            >
              <Check size={18} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>

            {!showConfirmDelete && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Hapus / Arsipkan Kebiasaan"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditHabitModal;
