import React from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ReminderTimePickerProps {
  value: string; // format "HH:MM" (24 jam) atau '' jika kosong
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/**
 * Pemilih jam pengingat lintas browser (Safari, Chrome, Firefox, iOS, Android).
 * Menggantikan <input type="time"> native yang tidak konsisten di Safari desktop
 * (segmen jam tidak dapat diedit / tidak ada picker). Nilai tetap "HH:MM" 24 jam.
 */
export const ReminderTimePicker: React.FC<ReminderTimePickerProps> = ({ value, onChange }) => {
  const [hour, minute] = value && value.includes(':') ? value.split(':') : ['', ''];

  const handleHourChange = (h: string) => {
    if (!h) return onChange('');
    onChange(`${h}:${minute || '00'}`);
  };

  const handleMinuteChange = (m: string) => {
    if (!m) return onChange('');
    onChange(`${hour || '00'}:${m}`);
  };

  const selectWrapStyle: React.CSSProperties = { position: 'relative', flex: 1 };
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 2rem 0.65rem 0.9rem',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid #E7E5E4',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    background: '#FFFFFF',
    color: 'var(--text-main)',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
  };
  const chevronStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0.7rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: 'var(--text-muted)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={selectWrapStyle}>
        <select
          aria-label="Jam pengingat"
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Jam --</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <ChevronDown size={16} style={chevronStyle} />
      </div>
      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>:</span>
      <div style={selectWrapStyle}>
        <select
          aria-label="Menit pengingat"
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Menit --</option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDown size={16} style={chevronStyle} />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Hapus jam pengingat"
          aria-label="Hapus jam pengingat"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: '50%',
            background: '#F5F5F4',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
