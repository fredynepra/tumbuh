import React from 'react';
import { PlantStage, GrowthSettings } from '../types';

export interface PlantIllustrationProps {
  stage: PlantStage;
  totalCompletions?: number;
  isWatering?: boolean;
  growthSettings?: GrowthSettings;
}

/**
 * Menghitung jumlah bunga mekar berdasarkan tahap dan total penyiraman.
 * Mendukung ambang batas dinamis dari Pengaturan Administrator (GrowthSettings).
 * Sesuai aturan bawaan (default):
 * - 30 siram: 1 Bunga utama mekar (🌸 1/5)
 * - 31 siram: Cabang kiri tumbuh dengan daun baru
 * - 32-33 siram: 2 Bunga mekar (🌸 2/5)
 * - 34-35 siram: 3 Bunga mekar (🌸 3/5)
 * - 36-37 siram: 4 Bunga mekar (🌸 4/5)
 * - >= 38 siram: 5 Bunga mekar maksimal (🌸 5/5)
 */
export function getBloomFlowerCount(
  stage: PlantStage,
  completions: number = 30,
  settings?: GrowthSettings
): number {
  if (stage !== 'BLOOM') return 0;
  const s38 = settings?.mahkotaMegahMin ?? 38;
  const s36 = settings?.harmoniMahkotaMin ?? 36;
  const s34 = settings?.rindangBerbungaMin ?? 34;
  const s32 = settings?.bloomBercabangMin ?? 32;

  if (completions >= s38) return 5;
  if (completions >= s36) return 4;
  if (completions >= s34) return 3;
  if (completions >= s32) return 2;
  return 1;
}

export function getBloomStageDetails(
  stage: PlantStage,
  completions: number = 30,
  settings?: GrowthSettings
) {
  if (stage !== 'BLOOM') {
    const defaultLabels: Record<PlantStage, { label: string; desc: string }> = {
      SEED: {
        label: 'Bibit (Seed)',
        desc: 'Biji kecil yang baru ditanam di tanah terakota lembab. Siram setiap hari untuk mulai bertunas!',
      },
      SPROUT: {
        label: 'Tunas (Sprout)',
        desc: 'Dua helai daun kotiledon hijau muda mulai menyembul riang menyambut sinar mentari.',
      },
      GROWING: {
        label: 'Rindang (Growing)',
        desc: 'Batang semakin kokoh dengan dedaunan rimbun berlapis dan kuncup bunga yang bersiap mekar.',
      },
      BLOOM: {
        label: 'Mekar Sempurna',
        desc: 'Bunga mekar indah memancarkan dedikasi konsistensimu.',
      },
    };
    return defaultLabels[stage];
  }

  const flowerCount = getBloomFlowerCount('BLOOM', completions, settings);
  switch (flowerCount) {
    case 1:
      return {
        label: 'Mekar Perdana (1 Bunga) 🌸',
        desc: 'Bunga utama mekar di puncak pohon dengan dahan dasar kokoh! Siram lagi untuk menumbuhkan tunas cabang baru.',
      };
    case 2:
      return {
        label: 'Mekar Bercabang (2 Bunga) 🌸🌸',
        desc: 'Cabang kiri bawah tumbuh memanjang dan bunga ke-2 mekar semerbak di dahan kiri bawah!',
      };
    case 3:
      return {
        label: 'Rindang Berbunga (3 Bunga) 🌸🌸🌸',
        desc: 'Cabang kanan bawah tumbuh lebat dan bunga ke-3 mekar merekah mempesona!',
      };
    case 4:
      return {
        label: 'Harmoni Mahkota (4 Bunga) 🌸🌸🌸🌸',
        desc: 'Cabang kiri atas tumbuh subur dan memekarkan bunga ke-4 anggun!',
      };
    case 5:
    default:
      return {
        label: 'Mahkota Megah (Maksimal 5 Bunga) 🌸✨',
        desc: 'Paripurna! 5 bunga mekar penuh membentuk mahkota setengah lingkaran, kanopi rimbun multi-layer, serta partikel kilau keemasan!',
      };
  }
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  stage,
  totalCompletions = 30,
  isWatering = false,
  growthSettings,
}) => {
  const flowerCount = getBloomFlowerCount(stage, totalCompletions, growthSettings);
  const completions = totalCompletions;

  const t31 = growthSettings?.tunasCabangMin ?? 31;
  const t33 = growthSettings?.rindangBerbungaMin ? Math.max(1, growthSettings.rindangBerbungaMin - 1) : 33;
  const t35 = growthSettings?.harmoniMahkotaMin ? Math.max(1, growthSettings.harmoniMahkotaMin - 1) : 35;
  const t37 = growthSettings?.mahkotaMegahMin ? Math.max(1, growthSettings.mahkotaMegahMin - 1) : 37;

  // Status progres cabang dan bunga untuk tahap BLOOM
  const hasLeftBranch = stage === 'BLOOM' && completions >= t31;
  const hasLeftFlower = stage === 'BLOOM' && flowerCount >= 2;
  const hasRightBranch = stage === 'BLOOM' && completions >= t33;
  const hasRightFlower = stage === 'BLOOM' && flowerCount >= 3;
  const hasTopLeftBranch = stage === 'BLOOM' && completions >= t35;
  const hasTopLeftFlower = stage === 'BLOOM' && flowerCount >= 4;
  const hasTopRightBranch = stage === 'BLOOM' && completions >= t37;
  const hasTopRightFlower = stage === 'BLOOM' && flowerCount >= 5;

  // Helper untuk merender kuntum bunga 5 kelopak
  const renderFlower = (
    cx: number,
    cy: number,
    scale: number = 1,
    key: string = 'flower',
    accentColor: string = '#F43F5E',
    petalColor: string = '#FB7185'
  ) => {
    const r = 5.8 * scale;
    const centerR = 5 * scale;
    const d = 8.2 * scale;
    return (
      <g key={key} className="flower-blossom" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {/* Soft Golden Aura */}
        <circle cx={cx} cy={cy} r={r * 2.3} fill="#FEF08A" opacity="0.4" />
        {/* 5 Kelopak Bunga Berputar */}
        <circle cx={cx} cy={cy - d} r={r} fill={accentColor} />
        <circle cx={cx + d * 0.95} cy={cy - d * 0.31} r={r} fill={petalColor} />
        <circle cx={cx + d * 0.59} cy={cy + d * 0.81} r={r} fill={accentColor} />
        <circle cx={cx - d * 0.59} cy={cy + d * 0.81} r={r} fill={petalColor} />
        <circle cx={cx - d * 0.95} cy={cy - d * 0.31} r={r} fill={accentColor} />
        {/* Putik Bunga Kuning Keemasan */}
        <circle cx={cx} cy={cy} r={centerR} fill="#FACC15" stroke="#EAB308" strokeWidth="0.8" />
        <circle cx={cx - 1.2 * scale} cy={cy - 1.2 * scale} r={centerR * 0.45} fill="#FEF9C3" />
      </g>
    );
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 140,
        height: 145,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 160 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        aria-label={`Ilustrasi tanaman tahap ${stage}`}
      >
        <defs>
          <linearGradient id="trunkGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#14532D" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C86A41" />
            <stop offset="50%" stopColor="#E78A61" />
            <stop offset="100%" stopColor="#D9774E" />
          </linearGradient>
        </defs>

        {/* Layer 1: Pot Terakota dan Gundukan Tanah */}
        <ellipse cx="80" cy="166" rx="44" ry="7" fill="rgba(0, 0, 0, 0.08)" />
        <path
          d="M46 118 L55 161 C55 165 65 167 80 167 C95 167 105 165 105 161 L114 118 Z"
          fill="url(#potGrad)"
          stroke="#B45309"
          strokeWidth="2.5"
        />
        {/* Bibir Pot Terakota */}
        <ellipse cx="80" cy="118" rx="34" ry="7" fill="#6A4E3A" />
        <ellipse cx="80" cy="116" rx="29" ry="5.5" fill="#452B1F" />
        {/* Aksen Lumut Halus di Pinggir Tanah */}
        <ellipse cx="58" cy="117" rx="4.5" ry="2" fill="#84CC16" opacity="0.65" />
        <ellipse cx="101" cy="117" rx="3.5" ry="1.8" fill="#84CC16" opacity="0.5" />

        {/* Layer 2: Tetesan Air Animasi Saat Disiram */}
        {isWatering && (
          <g>
            <circle cx="74" cy="45" r="3.5" fill="#38BDF8">
              <animate attributeName="cy" from="25" to="110" dur="0.45s" repeatCount="1" />
              <animate attributeName="opacity" values="0;1;1;0" dur="0.45s" repeatCount="1" />
            </circle>
            <circle cx="86" cy="40" r="3" fill="#0284C7">
              <animate attributeName="cy" from="18" to="110" dur="0.5s" begin="0.08s" repeatCount="1" />
              <animate attributeName="opacity" values="0;1;1;0" dur="0.5s" begin="0.08s" repeatCount="1" />
            </circle>
            <circle cx="80" cy="50" r="2.5" fill="#38BDF8">
              <animate attributeName="cy" from="30" to="112" dur="0.42s" begin="0.12s" repeatCount="1" />
              <animate attributeName="opacity" values="0;1;1;0" dur="0.42s" begin="0.12s" repeatCount="1" />
            </circle>
          </g>
        )}

        {/* Grup Tanaman Reaktif */}
        <g
          style={{
            transformOrigin: '80px 114px',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isWatering ? 'scale(1.1, 0.9)' : 'scale(1, 1)',
          }}
        >
          {/* ======================================================== */}
          {/* TAHAP 1: SEED (0-2 Hari) */}
          {/* ======================================================== */}
          {stage === 'SEED' && (
            <g>
              <ellipse cx="80" cy="114" rx="8" ry="5" fill="#78350F" />
              <path d="M80 114 Q83 104 88 102" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="88" cy="101" rx="4.5" ry="3" transform="rotate(25 88 101)" fill="#4ADE80" />
            </g>
          )}

          {/* ======================================================== */}
          {/* TAHAP 2: SPROUT (3-6 Hari) */}
          {/* ======================================================== */}
          {stage === 'SPROUT' && (
            <g>
              <path d="M80 114 Q78 94 80 74" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" />
              {/* Daun Kotiledon Kiri */}
              <path
                d="M80 82 C68 76 62 60 76 64 C80 72 80 79 80 82 Z"
                fill="#4ADE80"
              />
              {/* Daun Kotiledon Kanan */}
              <path
                d="M80 77 C92 70 98 56 84 59 C80 66 80 74 80 77 Z"
                fill="#86EFAC"
              />
              {/* Pucuk Daun Muda di Tengah */}
              <ellipse cx="80" cy="72" rx="4.5" ry="7" fill="#22C55E" />
            </g>
          )}

          {/* ======================================================== */}
          {/* TAHAP 3: GROWING (7-29 Hari) — Dibuat Lebih Rindang & Lebat */}
          {/* ======================================================== */}
          {stage === 'GROWING' && (
            <g>
              {/* Bayangan Rimbun di Belakang */}
              <ellipse cx="66" cy="65" rx="18" ry="14" fill="#14532D" opacity="0.35" />
              <ellipse cx="94" cy="65" rx="18" ry="14" fill="#14532D" opacity="0.35" />
              <ellipse cx="80" cy="50" rx="16" ry="14" fill="#14532D" opacity="0.35" />

              {/* Batang Utama Kokoh */}
              <path d="M80 114 Q80 76 80 44" stroke="url(#trunkGrad)" strokeWidth="6.5" strokeLinecap="round" />

              {/* Cabang Tingkat 1 (Bawah) */}
              <path d="M79 88 Q62 82 50 85" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="48" cy="85" rx="13" ry="7.5" transform="rotate(-15 48 85)" fill="#22C55E" />
              <ellipse cx="64" cy="83" rx="10" ry="6" transform="rotate(-25 64 83)" fill="#4ADE80" />

              <path d="M81 83 Q98 77 110 80" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="112" cy="80" rx="13" ry="7.5" transform="rotate(15 112 80)" fill="#16A34A" />
              <ellipse cx="96" cy="78" rx="10" ry="6" transform="rotate(25 96 78)" fill="#22C55E" />

              {/* Cabang Tingkat 2 (Tengah) */}
              <path d="M79 68 Q64 58 54 62" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="52" cy="62" rx="12" ry="7" transform="rotate(-20 52 62)" fill="#4ADE80" />
              <ellipse cx="66" cy="60" rx="9" ry="5.5" transform="rotate(-30 66 60)" fill="#86EFAC" />

              <path d="M81 63 Q96 54 106 58" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="108" cy="58" rx="12" ry="7" transform="rotate(20 108 58)" fill="#22C55E" />
              <ellipse cx="94" cy="56" rx="9" ry="5.5" transform="rotate(30 94 56)" fill="#4ADE80" />

              {/* Mahkota Daun Puncak (Lush Apex) */}
              <ellipse cx="73" cy="44" rx="12" ry="7" transform="rotate(-35 73 44)" fill="#4ADE80" />
              <ellipse cx="87" cy="44" rx="12" ry="7" transform="rotate(35 87 44)" fill="#22C55E" />
              <ellipse cx="80" cy="38" rx="10" ry="6.5" fill="#86EFAC" />

              {/* Kuncup Bunga Kecil Siap Mekar */}
              <ellipse cx="80" cy="31" rx="4.5" ry="6" fill="#F43F5E" />
              <ellipse cx="80" cy="31" rx="2.5" ry="4" fill="#FB7185" />
            </g>
          )}

          {/* ======================================================== */}
          {/* TAHAP 4: BLOOM (>= 30 Hari) — Pohon Sangat Rindang + 1 s.d. 5 Bunga */}
          {/* ======================================================== */}
          {stage === 'BLOOM' && (
            <g>
              {/* Latar Belakang Mahkota Rimbun (Deep Lush Canopy Clouds) */}
              <g className="canopy-background">
                {/* Awan Daun Belakang */}
                <circle cx="80" cy="52" r="28" fill="#14532D" opacity="0.3" />
                <circle cx="58" cy="62" r="22" fill="#166534" opacity="0.4" />
                <circle cx="102" cy="62" r="22" fill="#166534" opacity="0.4" />
                <circle cx="80" cy="38" r="20" fill="#15803D" opacity="0.45" />
              </g>

              {/* Batang Pohon Utama (Tebal & Kokoh Berkayu) */}
              <path
                d="M80 114 Q78 80 80 42"
                stroke="url(#trunkGrad)"
                strokeWidth="7.5"
                strokeLinecap="round"
              />

              {/* Daun Rindang di Sekitar Batang Bawah */}
              <ellipse cx="64" cy="94" rx="13" ry="7.5" transform="rotate(-25 64 94)" fill="#15803D" />
              <ellipse cx="96" cy="94" rx="13" ry="7.5" transform="rotate(25 96 94)" fill="#16A34A" />

              {/* ---------------------------------------------------- */}
              {/* CABANG 1 (KIRI BAWAH) & DAUN BARU (Aktif jika siram >= 31) */}
              {/* ---------------------------------------------------- */}
              {hasLeftBranch && (
                <g className="branch-left-lower">
                  {/* Garis Cabang Baru Organik */}
                  <path
                    d="M78 86 Q58 80 38 66"
                    stroke="#15803D"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                  />
                  {/* Dedaunan Baru di Cabang Kiri */}
                  <ellipse cx="56" cy="80" rx="13" ry="7.5" transform="rotate(-30 56 80)" fill="#16A34A" />
                  <ellipse cx="42" cy="72" rx="12" ry="7" transform="rotate(-40 42 72)" fill="#22C55E" />
                  <ellipse cx="48" cy="64" rx="10" ry="6" transform="rotate(-20 48 64)" fill="#4ADE80" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* CABANG 2 (KANAN BAWAH) & DAUN BARU (Aktif jika siram >= 33) */}
              {/* ---------------------------------------------------- */}
              {hasRightBranch && (
                <g className="branch-right-lower">
                  {/* Garis Cabang Baru Organik */}
                  <path
                    d="M82 86 Q102 80 122 66"
                    stroke="#15803D"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                  />
                  {/* Dedaunan Baru di Cabang Kanan */}
                  <ellipse cx="104" cy="80" rx="13" ry="7.5" transform="rotate(30 104 80)" fill="#15803D" />
                  <ellipse cx="118" cy="72" rx="12" ry="7" transform="rotate(40 118 72)" fill="#16A34A" />
                  <ellipse cx="112" cy="64" rx="10" ry="6" transform="rotate(20 112 64)" fill="#22C55E" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* CABANG 3 (KIRI ATAS) & DAUN BARU (Aktif jika siram >= 35) */}
              {/* ---------------------------------------------------- */}
              {hasTopLeftBranch && (
                <g className="branch-left-upper">
                  <path
                    d="M79 60 Q65 48 52 38"
                    stroke="#15803D"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <ellipse cx="64" cy="52" rx="11" ry="6.5" transform="rotate(-35 64 52)" fill="#22C55E" />
                  <ellipse cx="54" cy="44" rx="10" ry="6" transform="rotate(-45 54 44)" fill="#4ADE80" />
                </g>
              )}

              {/* ---------------------------------------------------- */}
              {/* CABANG 4 (KANAN ATAS) & DAUN BARU (Aktif jika siram >= 37) */}
              {/* ---------------------------------------------------- */}
              {hasTopRightBranch && (
                <g className="branch-right-upper">
                  <path
                    d="M81 60 Q95 48 108 38"
                    stroke="#15803D"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <ellipse cx="96" cy="52" rx="11" ry="6.5" transform="rotate(35 96 52)" fill="#22C55E" />
                  <ellipse cx="106" cy="44" rx="10" ry="6" transform="rotate(45 106 44)" fill="#4ADE80" />
                </g>
              )}

              {/* Dedaunan Rindang di Mahkota Tengah */}
              <ellipse cx="68" cy="48" rx="14" ry="8" transform="rotate(-30 68 48)" fill="#22C55E" />
              <ellipse cx="92" cy="48" rx="14" ry="8" transform="rotate(30 92 48)" fill="#4ADE80" />
              <ellipse cx="80" cy="40" rx="13" ry="7.5" fill="#86EFAC" />

              {/* ---------------------------------------------------- */}
              {/* KUNTUM BUNGA BERTAHAP (1 s.d. 5 Bunga) */}
              {/* ---------------------------------------------------- */}
              {/* BUNGA 1 (UTAMA DI PUNCAK) — Selalu mekar saat BLOOM (>= 30 siram) */}
              {renderFlower(80, 24, 1.05, 'flower-center')}

              {/* BUNGA 2 (CABANG KIRI BAWAH) — Mekar saat >= 32 siram */}
              {hasLeftFlower && renderFlower(36, 62, 0.95, 'flower-left-lower', '#F43F5E', '#FB7185')}

              {/* BUNGA 3 (CABANG KANAN BAWAH) — Mekar saat >= 34 siram */}
              {hasRightFlower && renderFlower(124, 62, 0.95, 'flower-right-lower', '#E11D48', '#F43F5E')}

              {/* BUNGA 4 (CABANG KIRI ATAS) — Mekar saat >= 36 siram */}
              {hasTopLeftFlower && renderFlower(50, 36, 0.92, 'flower-left-upper', '#FB7185', '#FDA4AF')}

              {/* BUNGA 5 (CABANG KANAN ATAS) — Mekar saat >= 38 siram (MAKSIMAL 5 BUNGA) */}
              {hasTopRightFlower && renderFlower(110, 36, 0.92, 'flower-right-upper', '#F43F5E', '#FB7185')}

              {/* Efek Kilau Partikel Emas Saat 5 Bunga Terbuka Penuh */}
              {flowerCount === 5 && (
                <g className="golden-sparkles">
                  <path d="M70 12 Q72 15 75 15 Q72 15 70 18 Q68 15 65 15 Q68 15 70 12 Z" fill="#FACC15">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
                  </path>
                  <path d="M96 16 Q98 18 100 18 Q98 18 96 20 Q94 18 92 18 Q94 18 96 16 Z" fill="#FDE047">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2.1s" begin="0.4s" repeatCount="indefinite" />
                  </path>
                  <path d="M24 50 Q26 53 28 53 Q26 53 24 56 Q22 53 20 53 Q22 53 24 50 Z" fill="#FACC15">
                    <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="0.8s" repeatCount="indefinite" />
                  </path>
                  <path d="M136 50 Q138 52 140 52 Q138 52 136 54 Q134 52 132 52 Q134 52 136 50 Z" fill="#FDE047">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.7s" begin="0.2s" repeatCount="indefinite" />
                  </path>
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
