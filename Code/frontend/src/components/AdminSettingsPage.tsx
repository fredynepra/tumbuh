import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Zap, Clock, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GrowthSettings } from '../types';

interface AdminSettingsPageProps {
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onSettingsSaved?: (newSettings: GrowthSettings) => void;
}

// Konfigurasi Standar Default (PRD Spesifikasi Standar)
const DEFAULT_STANDARD_SETTINGS: GrowthSettings = {
  seedMax: 2,                 // Seed: 0-2 completed days
  sproutMin: 3,               // Sprout: 3-6 completed days
  growingMin: 7,              // Growing: 7-29 completed days
  bloomPerdanaMin: 30,        // Bloom: 30+ completed days (🌸 1/5)
  tunasCabangMin: 31,         // 31x Siram: Tunas Cabang Baru
  bloomBercabangMin: 32,      // 32-33x Siram: Mekar Bercabang (🌸 2/5)
  rindangBerbungaMin: 34,     // 34-35x Siram: Rindang Berbunga (🌸 3/5)
  harmoniMahkotaMin: 36,      // 36-37x Siram: Harmoni Mahkota (🌸 4/5)
  mahkotaMegahMin: 38,        // >= 38x Siram: Mahkota Megah (🌸 5/5)
  wateringIntervalMode: 'DAILY',
  wateringIntervalMinutes: 1,
  maxWateringPerInterval: 1,
};

// Konfigurasi Mode Cepat Demo (Interval 1 Menit & Tahap Cepat 1-8x Siram)
const QUICK_DEMO_SETTINGS: GrowthSettings = {
  seedMax: 0,
  sproutMin: 1,
  growingMin: 2,
  bloomPerdanaMin: 3,
  tunasCabangMin: 4,
  bloomBercabangMin: 5,
  rindangBerbungaMin: 6,
  harmoniMahkotaMin: 7,
  mahkotaMegahMin: 8,
  wateringIntervalMode: 'MINUTES',
  wateringIntervalMinutes: 1,
  maxWateringPerInterval: 1,
};

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  authFetch,
  onSettingsSaved,
}) => {
  const [settings, setSettings] = useState<GrowthSettings>({ ...DEFAULT_STANDARD_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Memuat pengaturan terkini dari backend API saat halaman dibuka
  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      console.error('Gagal memuat pengaturan:', err);
      setFeedback({
        type: 'error',
        message: 'Gagal menghubungi server untuk memuat pengaturan admin.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Handler perubahan nilai input
  const handleChange = (field: keyof GrowthSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler memilih Mode Standar Harian (Otomatis mengisi data standar harian)
  const handleSelectDailyMode = () => {
    setSettings({
      ...DEFAULT_STANDARD_SETTINGS,
      wateringIntervalMode: 'DAILY',
    });
    setFeedback({
      type: 'success',
      message: 'Mode Standar Harian dipilih: Data disesuaikan ke standar (Seed 0-2 hari, Sprout 3-6 hari, Growing 7-29 hari, Bloom 30-38+ hari). Klik "Simpan Pengaturan" di bawah untuk mengaktifkannya di database.',
    });
  };

  // Handler memilih Mode Demo Menit (Otomatis mengisi data demo cepat)
  const handleSelectDemoMode = () => {
    setSettings({
      ...QUICK_DEMO_SETTINGS,
      wateringIntervalMode: 'MINUTES',
    });
    setFeedback({
      type: 'success',
      message: 'Mode Demo Menit dipilih: Data disesuaikan ke jeda 1 menit & ambang batas cepat (1-8x siram) untuk kemudahan demo. Klik "Simpan Pengaturan" di bawah untuk mengaktifkannya di database.',
    });
  };

  // Handler simpan pengaturan ke database
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);

      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: data.message || 'Pengaturan pertumbuhan & durasi demo berhasil disimpan! 🌱✨',
        });
        if (onSettingsSaved) onSettingsSaved(data.settings);
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Gagal menyimpan pengaturan.',
        });
      }
    } catch (err: any) {
      console.error('Error menyimpan pengaturan:', err);
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan teknis saat menyimpan pengaturan.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handler reset ke default standar (Seed 0-2, Sprout 3-6, Growing 7-29, Bloom 30x dst.)
  const handleReset = async () => {
    if (!window.confirm('Kembalikan semua pengaturan ke Standar Awal (30x, 31x, 32x, dst.)?')) {
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const res = await authFetch('/api/admin/settings/reset', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setFeedback({
          type: 'success',
          message: 'Pengaturan berhasil dikembalikan ke Standar Awal (Seed 0-2, Sprout 3-6, Growing 7-29, Bloom 30-38+)! 🌾',
        });
        if (onSettingsSaved) onSettingsSaved(data.settings);
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Gagal mereset pengaturan.',
        });
      }
    } catch (err: any) {
      console.error('Error mereset pengaturan:', err);
      setFeedback({
        type: 'error',
        message: 'Terjadi kesalahan saat mereset pengaturan.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p>Memuat Pengaturan Administrator...</p>
      </div>
    );
  }

  const isDaily = settings.wateringIntervalMode === 'DAILY';

  return (
    <div className="admin-settings-container" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Admin Settings */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#F8FAFC',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Settings size={28} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Pengaturan Pertumbuhan Tanaman
              </h2>
              <span
                style={{
                  background: '#047857',
                  color: '#D1FAE5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Khusus Admin
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: 14 }}>
              Kelola ambang batas X kali siram setiap tahapan morfologi tanaman dan atur durasi siram per menit untuk kemudahan demo.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={18} color="#34D399" />
          <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 600 }}>
            Login sebagai: <strong style={{ color: '#F1F5F9' }}>admin</strong>
          </span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 14,
            fontWeight: 500,
            background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: feedback.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
            color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={20} color="#059669" />
          ) : (
            <AlertTriangle size={20} color="#DC2626" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Preset Cepat Toolbar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 24,
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="#F59E0B" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
            Shortcut Mode Konfigurasi Cepat:
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSelectDailyMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isDaily ? '#F0F9FF' : '#F8FAFC',
              color: isDaily ? '#0284C7' : '#475569',
              border: isDaily ? '2px solid #0284C7' : '1px solid #CBD5E1',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Terapkan data standar (Seed 0-2, Sprout 3-6, Growing 7-29, Bloom 30-38+ hari)"
          >
            <RotateCcw size={15} />
            <span>Terapkan Standar Harian (30–38x)</span>
          </button>

          <button
            type="button"
            onClick={handleSelectDemoMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: !isDaily ? '#ECFDF5' : '#F0FDF4',
              color: !isDaily ? '#047857' : '#15803D',
              border: !isDaily ? '2px solid #10B981' : '1px solid #BBF7D0',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Terapkan mode demo cepat (1-8x siram, jeda 1 menit)"
          >
            <Clock size={15} />
            <span>Preset Demo Cepat (1 Menit & 1–8x Siram)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* BAGIAN 1: DURASI PENYIRAMAN & JEDA DEMO */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '22px 24px',
            marginBottom: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Clock size={20} color="#0284C7" />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
              1. Pengaturan Durasi & Interval Siram Berikutnya
            </h3>
          </div>
          <p style={{ margin: '0 0 18px', color: '#64748B', fontSize: 14 }}>
            Pilih metode jeda waktu penyiraman. Klik tombol di bawah untuk langsung mengaktifkan mode dan memuat datanya.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {/* Mode Switcher */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Pilihan Mode Interval Penyiraman:
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleSelectDailyMode}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: isDaily ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    background: isDaily ? '#F0F9FF' : '#FFFFFF',
                    color: isDaily ? '#0369A1' : '#64748B',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: isDaily ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📅 Standar Harian (1x / Hari)
                </button>
                <button
                  type="button"
                  onClick={handleSelectDemoMode}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: !isDaily ? '2px solid #10B981' : '1px solid #CBD5E1',
                    background: !isDaily ? '#ECFDF5' : '#FFFFFF',
                    color: !isDaily ? '#047857' : '#64748B',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: !isDaily ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ⏱️ Mode Demo (Interval Menit)
                </button>
              </div>
            </div>

            {/* Durasi Interval dalam Menit */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Durasi Siram Berikutnya (Satuan Menit):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.wateringIntervalMinutes}
                  onChange={(e) => handleChange('wateringIntervalMinutes', Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 14,
                    color: '#0F172A',
                    fontWeight: 700,
                    background: !isDaily ? '#FFFFFF' : '#F8FAFC',
                  }}
                />
                <span style={{ position: 'absolute', right: 14, top: 10, fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                  Menit
                </span>
              </div>
              <span style={{ display: 'block', fontSize: 12, color: '#64748B', marginTop: 4 }}>
                {!isDaily
                  ? `Mode Demo aktif: Pekebun dapat menyiram setiap ${settings.wateringIntervalMinutes} menit sekali.`
                  : 'Mode Standar Harian: Penyiraman dibatasi 1x per hari kalender.'}
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: TAHAPAN PERTUMBUHAN X KALI SIRAM */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '22px 24px',
            marginBottom: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color="#E11D48" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                2. Pengaturan Ambang Batas Tahapan Pertumbuhan Tanaman (x Kali Siram)
              </h3>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isDaily ? '#0369A1' : '#047857',
                background: isDaily ? '#E0F2FE' : '#D1FAE5',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              {isDaily ? 'Mode Aktif: Standar Harian' : 'Mode Aktif: Demo Menit'}
            </span>
          </div>
          <p style={{ margin: '0 0 18px', color: '#64748B', fontSize: 14 }}>
            Konfigurasikan jumlah penyiraman kumulatif untuk memicu perubahan morfologi tanaman mulai dari tahap dasar hingga mekarnya 1–5 kuntum bunga.
          </p>

          {/* SUB-BAGIAN A: TAHAP DASAR AWAL (SEED, SPROUT, GROWING) */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
              🌱 Tahap Dasar Awal:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {/* Seed (0-2 Completed Days) */}
              <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '14px 16px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>
                    🌱 Seed (Bibit)
                  </span>
                  <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 0–2 Hari' : 'Batas Seed'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="0"
                    value={settings.seedMax}
                    onChange={(e) => handleChange('seedMax', Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FCD34D',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#78350F',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#78350F', whiteSpace: 'nowrap', fontWeight: 600 }}>Maks Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#92400E' }}>
                  0–{settings.seedMax} kali siram: Biji kecil di tanah terakota lembab.
                </p>
              </div>

              {/* Sprout (3-6 Completed Days) */}
              <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                    🌿 Sprout (Tunas)
                  </span>
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 3–6 Hari' : 'Mulai Sprout'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.sproutMin}
                    onChange={(e) => handleChange('sproutMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #86EFAC',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#166534',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#166534', whiteSpace: 'nowrap', fontWeight: 600 }}>Min Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#166534' }}>
                  {settings.sproutMin}–{settings.growingMin - 1} kali siram: Dua helai daun kotiledon hijau muda menyembul.
                </p>
              </div>

              {/* Growing (7-29 Completed Days) */}
              <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                    🌳 Growing (Rindang)
                  </span>
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 7–29 Hari' : 'Mulai Growing'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.growingMin}
                    onChange={(e) => handleChange('growingMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #86EFAC',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#166534',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#166534', whiteSpace: 'nowrap', fontWeight: 600 }}>Min Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#166534' }}>
                  {settings.growingMin}–{settings.bloomPerdanaMin - 1} kali siram: Batang kokoh dan dedaunan lebat.
                </p>
              </div>
            </div>
          </div>

          {/* SUB-BAGIAN B: TAHAP PEMEKARAN BUNGA (BLOOM 30+ HARI) */}
          <div>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
              🌸 Tahap Pemekaran Bunga & Cabang (Bloom 30+ Hari / Siram):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* 1. Mekar Perdana (1/5) */}
              <div style={{ background: '#FFF1F2', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECDD3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BE123C' }}>
                    🌸 Mekar Perdana (1/5)
                  </span>
                  <span style={{ fontSize: 12, color: '#881337', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 30x Siram' : 'Default: 30x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.bloomPerdanaMin}
                    onChange={(e) => handleChange('bloomPerdanaMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FDA4AF',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#9F1239',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#9F1239', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9F1239' }}>
                  1 Bunga utama mekar di puncak pohon dengan dahan dasar kokoh.
                </p>
              </div>

              {/* 2. Tunas Cabang Baru */}
              <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 16px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                    🌿 Tunas Cabang Baru
                  </span>
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 31x Siram' : 'Default: 31x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.tunasCabangMin}
                    onChange={(e) => handleChange('tunasCabangMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #86EFAC',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#166534',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#166534', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#166534' }}>
                  Cabang kiri bawah mulai tumbuh memanjang dengan dedaunan hijau segar.
                </p>
              </div>

              {/* 3. Mekar Bercabang (2/5) */}
              <div style={{ background: '#FFF1F2', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECDD3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BE123C' }}>
                    🌸 Mekar Bercabang (2/5)
                  </span>
                  <span style={{ fontSize: 12, color: '#881337', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 32x Siram' : 'Default: 32x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.bloomBercabangMin}
                    onChange={(e) => handleChange('bloomBercabangMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FDA4AF',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#9F1239',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#9F1239', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9F1239' }}>
                  Bunga ke-2 mekar semerbak di dahan kiri bawah.
                </p>
              </div>

              {/* 4. Rindang Berbunga (3/5) */}
              <div style={{ background: '#FFF1F2', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECDD3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BE123C' }}>
                    🌸 Rindang Berbunga (3/5)
                  </span>
                  <span style={{ fontSize: 12, color: '#881337', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 34x Siram' : 'Default: 34x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.rindangBerbungaMin}
                    onChange={(e) => handleChange('rindangBerbungaMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FDA4AF',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#9F1239',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#9F1239', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9F1239' }}>
                  Cabang kanan bawah tumbuh lebat dan bunga ke-3 mekar merekah.
                </p>
              </div>

              {/* 5. Harmoni Mahkota (4/5) */}
              <div style={{ background: '#FFF1F2', borderRadius: 10, padding: '14px 16px', border: '1px solid #FECDD3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#BE123C' }}>
                    🌸 Harmoni Mahkota (4/5)
                  </span>
                  <span style={{ fontSize: 12, color: '#881337', fontWeight: 600 }}>
                    {isDaily ? 'Standar: 36x Siram' : 'Default: 36x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.harmoniMahkotaMin}
                    onChange={(e) => handleChange('harmoniMahkotaMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FDA4AF',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#9F1239',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#9F1239', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9F1239' }}>
                  Cabang kiri atas tumbuh dan memekarkan bunga ke-4.
                </p>
              </div>

              {/* 6. Mahkota Megah (5/5) */}
              <div style={{ background: '#FEFCE8', borderRadius: 10, padding: '14px 16px', border: '1px solid #FEF08A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#A16207' }}>
                    👑 Mahkota Megah (5/5)
                  </span>
                  <span style={{ fontSize: 12, color: '#854D0E', fontWeight: 600 }}>
                    {isDaily ? 'Standar: ≥ 38x Siram' : 'Default: ≥ 38x'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={settings.mahkotaMegahMin}
                    onChange={(e) => handleChange('mahkotaMegahMin', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #FDE047',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#854D0E',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#854D0E', whiteSpace: 'nowrap', fontWeight: 600 }}>x Siram</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#854D0E' }}>
                  5 bunga mekar penuh mahkota setengah lingkaran & kilau partikel emas!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL REFERENSI STANDAR */}
        <div
          style={{
            background: '#1E293B',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 24,
            color: '#F8FAFC',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
              📋 Visual Preview: Matriks Pertumbuhan Tanaman Terapan
            </h4>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              Mode Aktif: <strong>{isDaily ? 'Standar Harian' : 'Demo Menit'}</strong>
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #475569', color: '#94A3B8' }}>
                  <th style={{ padding: '8px 12px' }}>Tahap (Stage)</th>
                  <th style={{ padding: '8px 12px' }}>Total Siram Kumulatif (Hari)</th>
                  <th style={{ padding: '8px 12px' }}>Morfologi Visual Tanaman (Cabang, Daun, Bunga)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FCD34D' }}>🌱 Seed (Bibit)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>0 – {settings.seedMax} completed days</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Biji kecil yang baru ditanam di tanah terakota lembab.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#86EFAC' }}>🌿 Sprout (Tunas)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.sproutMin} – {settings.growingMin - 1} completed days</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Dua helai daun kotiledon hijau muda mulai menyembul riang menyambut sinar mentari.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#4ADE80' }}>🌳 Growing (Rindang)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.growingMin} – {settings.bloomPerdanaMin - 1} completed days</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Batang kokoh dengan dedaunan rimbun berlapis dan kuncup bunga yang bersiap mekar.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FDA4AF' }}>🌸 Mekar Perdana (1/5)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.bloomPerdanaMin}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>1 Bunga utama mekar di puncak pohon dengan dahan dasar kokoh.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#86EFAC' }}>🌿 Tunas Cabang Baru</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.tunasCabangMin}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Cabang kiri bawah mulai tumbuh memanjang dengan dedaunan hijau segar.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FDA4AF' }}>🌸 Mekar Bercabang (2/5)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.bloomBercabangMin}–{settings.rindangBerbungaMin - 1}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Bunga ke-2 mekar semerbak di dahan kiri bawah.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FDA4AF' }}>🌸 Rindang Berbunga (3/5)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.rindangBerbungaMin}–{settings.harmoniMahkotaMin - 1}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Cabang kanan bawah tumbuh lebat dan bunga ke-3 mekar merekah.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FDA4AF' }}>🌸 Harmoni Mahkota (4/5)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{settings.harmoniMahkotaMin}–{settings.mahkotaMegahMin - 1}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>Cabang kiri atas tumbuh dan memekarkan bunga ke-4.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#FDE047' }}>👑 Mahkota Megah (5/5)</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>&ge; {settings.mahkotaMegahMin}x Siram</td>
                  <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>
                    Cabang kanan atas tumbuh paripurna, <strong>5 bunga mekar penuh</strong> membentuk mahkota setengah lingkaran, kanopi rimbun multi-layer, serta partikel kilau keemasan (golden sparkles).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TOMBOL AKSI SIMPAN & RESET */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 10,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={16} />
            <span>Reset Standar</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
