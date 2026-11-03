import { SocialPlatform, SocialSharePayload } from '../types';

export const BADGE_EMOJI_MAP: Record<string, string> = {
  droplet: '💧',
  sprout: '🌱',
  leaves_five: '🌿',
  tree_roots: '🌳',
  lotus_crystal: '🪷',
  pots_trio: '🪴',
  flower_harvest: '🌸',
  sun_rise: '🌅',
  moon_stars: '🌙',
};

export interface GeneratedShareCopy {
  headline: string;
  congratsTitle: string;
  motivationalMessage: string;
  posterQuote: string;
  defaultCaption: string;
  filename: string;
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 42) || 'pencapaian'
  );
}

/**
 * Menghasilkan ucapan selamat, semangat motivasi untuk terus Tumbuh,
 * dan caption siap pakai untuk Instagram, Facebook, serta TikTok.
 */
export function buildShareContent(payload: SocialSharePayload): GeneratedShareCopy {
  const gardenerName = payload.userName || 'Pekebun Tumbuh';

  if (payload.type === 'MAHKOTA_MEGAH' && payload.habit) {
    const habit = payload.habit;
    const completions = habit.totalCompletions || 38;
    const longestStreak = Math.max(habit.longestStreak || 0, habit.currentStreak || 0);

    const congratsTitle = 'Selamat! Puncak Mahkota Megah (5/5 🌸) Terwujud!';
    const motivationalMessage =
      `Selamat atas dedikasi luar biasamu, ${gardenerName}! Dari sebutir benih kecil yang disiram penuh kesabaran, ` +
      `kini "${habit.title}" tumbuh menjadi pohon rindang bermahkota 5 bunga keemasan (${completions}x siram). ` +
      `Jangan berhenti di puncak ini—jadikan ketekunanmu sebagai energi positif untuk terus Tumbuh setiap hari!`;

    const posterQuote =
      '“Dari sebutir benih kecil hingga mekar 5 bunga keemasan. Bukti bahwa langkah kecil yang konsisten membawa perubahan besar. Semangat untuk terus Tumbuh!”';

    const defaultCaption = [
      `🌸👑 Alhamdulillah & Selamat! Tanaman kebiasaanku "${habit.title}" resmi menyelesaikan puncak MAHKOTA MEGAH (5/5 Bunga Mekar Sempurna) di Tumbuh! 🌳✨`,
      '',
      `📊 Total Dedikasi: ${completions}x Siram • 🔥 Rekor Streak: ${longestStreak} Hari • 🏷️ Kategori: ${habit.category}`,
      '',
      `Dari sebutir benih kecil hingga mekar penuh lima bunga keemasan—bukti nyata bahwa kebiasaan kecil yang dirawat dengan sabar setiap hari mampu bertumbuh luar biasa. Jangan pernah lelah berproses, mari jaga semangat positif dan terus Tumbuh menjadi versi terbaik diri kita! 🌱💪✨`,
      '',
      `🌿 Start small. Water daily. Grow consistently.`,
      `#Tumbuh #TerusTumbuh #MahkotaMegah #HabitTracker #Konsistensi #KebiasaanPositif #BertumbuhSetiapHari`,
    ].join('\n');

    return {
      headline: `Mahkota Megah (5/5) — ${habit.title}`,
      congratsTitle,
      motivationalMessage,
      posterQuote,
      defaultCaption,
      filename: `tumbuh-mahkota-megah-${slugify(habit.title)}.png`,
    };
  }

  // Default: Lencana Baru (BADGE)
  const badge = payload.badge || {
    id: 'achievement',
    title: 'Lencana Kebiasaan',
    description: 'Konsisten merawat kebiasaan baik setiap hari.',
    bonusXp: 25,
    iconSvgName: 'sprout',
  };
  const emoji = BADGE_EMOJI_MAP[badge.iconSvgName] || '🏆';

  let customMotivation =
    `Selamat atas pencapaian barumu, ${gardenerName}! Setiap tetes konsistensi yang kamu siram hari demi hari kini berbuah prestasi. ` +
    `Pertahankan langkah positif ini dan semangat untuk terus Tumbuh menjadi versi terbaik dirimu!`;

  if (badge.id === 'first_water') {
    customMotivation =
      `Selamat atas tetesan pertamamu, ${gardenerName}! Satu langkah kecil hari ini adalah awal dari taman kebaikan yang rimbun di masa depan. ` +
      `Jaga antusiasmemu dan semangat untuk terus Tumbuh setiap hari!`;
  } else if (badge.id.startsWith('streak_')) {
    customMotivation =
      `Selamat atas konsistensi beruntunmu, ${gardenerName}! Disiplin merawat kebiasaan hari demi hari sedang membentuk akar karakter yang kokoh. ` +
      `Jangan kasih kendor, tetap semangat untuk terus Tumbuh!`;
  } else if (badge.id === 'first_bloom') {
    customMotivation =
      `Selamat atas mekarnya bunga perdanamu, ${gardenerName}! Kesabaranmu menyiram kebiasaan kini membuahkan keindahan nyata. ` +
      `Teruskan perjalanan hebatmu menuju Mahkota Megah dan terus Tumbuh!`;
  } else if (badge.id === 'habit_trio') {
    customMotivation =
      `Selamat telah merawat kebun yang asri dan beragam, ${gardenerName}! Keseimbangan kebiasaan positifmu adalah fondasi hidup yang bermakna. ` +
      `Rawat terus kebunmu dan semangat untuk terus Tumbuh!`;
  }

  const congratsTitle = `Selamat! Lencana "${badge.title}" Berhasil Diraih! 🎉`;
  const posterQuote =
    '“Setiap tetes konsistensi kecil yang dirawat hari ini adalah akar perubahan besar di masa depan. Semangat untuk terus Tumbuh setiap hari!”';

  const bonusLabel = badge.bonusXp > 0 ? ` (+${badge.bonusXp} Bonus XP)` : '';
  const defaultCaption = [
    `🏆✨ Selamat & Syukur! Aku baru saja membuka lencana baru "${badge.title}" ${emoji}${bonusLabel} di Tumbuh! 🌱`,
    '',
    `"${badge.description}"`,
    '',
    `Setiap langkah kecil yang dijaga dengan sabar hari demi hari pasti akan berbuah manis. Jangan pernah berhenti merawat kebiasaan baik—yuk jaga semangat konsistensi dan terus Tumbuh bersama setiap hari! 🌿💪✨`,
    '',
    `🌱 Start small. Water daily. Grow consistently.`,
    `#Tumbuh #TerusTumbuh #LencanaTumbuh #HabitTracker #Konsistensi #KebiasaanBaik #BertumbuhSetiapHari`,
  ].join('\n');

  return {
    headline: `Lencana Baru: ${badge.title}`,
    congratsTitle,
    motivationalMessage: customMotivation,
    posterQuote,
    defaultCaption,
    filename: `tumbuh-lencana-${slugify(badge.title)}.png`,
  };
}

// ---------------------------------------------------------------------------
// CANVAS HELPERS UNTUK MENGGAMBAR KARTU POSTER SOSIAL MEDIA (1080 x 1350 PX)
// ---------------------------------------------------------------------------

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx + size * 0.22, cy - size * 0.22, cx + size, cy);
  ctx.quadraticCurveTo(cx + size * 0.22, cy + size * 0.22, cx, cy + size);
  ctx.quadraticCurveTo(cx - size * 0.22, cy + size * 0.22, cx - size, cy);
  ctx.quadraticCurveTo(cx - size * 0.22, cy - size * 0.22, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRotatedEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number,
  fill: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFivePetalFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  accentColor: string = '#F43F5E',
  petalColor: string = '#FB7185'
) {
  const r = 13.5 * scale;
  const centerR = 11.5 * scale;
  const d = 19 * scale;

  ctx.save();
  // Soft Golden Aura
  ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.25, 0, Math.PI * 2);
  ctx.fill();

  // 5 Petals
  const petals = [
    { x: cx, y: cy - d, c: accentColor },
    { x: cx + d * 0.95, y: cy - d * 0.31, c: petalColor },
    { x: cx + d * 0.59, y: cy + d * 0.81, c: accentColor },
    { x: cx - d * 0.59, y: cy + d * 0.81, c: petalColor },
    { x: cx - d * 0.95, y: cy - d * 0.31, c: accentColor },
  ];
  for (const p of petals) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Center
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF9C3';
  ctx.beginPath();
  ctx.arc(cx - 2.6 * scale, cy - 2.6 * scale, centerR * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Menggambar Pohon Rindang Mahkota Megah (5/5 Bunga) resolusi tinggi di Canvas
 */
function drawMahkotaMegahTreeIllustration(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
) {
  ctx.save();
  // Circular Halo Stage
  const haloGrad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 175);
  haloGrad.addColorStop(0, '#FEFCE8');
  haloGrad.addColorStop(0.7, '#ECFDF5');
  haloGrad.addColorStop(1, '#DCFCE7');

  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 172, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 181, 0, Math.PI * 2);
  ctx.stroke();

  // Offset coordinate mapping from SVG (80, 95) -> (centerX, centerY + 10)
  const scale = 2.05;
  const mapX = (svgX: number) => centerX + (svgX - 80) * scale;
  const mapY = (svgY: number) => centerY + (svgY - 94) * scale;

  // Canopy Background Clouds
  const clouds = [
    { x: 80, y: 52, r: 28, c: 'rgba(20, 83, 45, 0.28)' },
    { x: 58, y: 62, r: 22, c: 'rgba(22, 101, 52, 0.36)' },
    { x: 102, y: 62, r: 22, c: 'rgba(22, 101, 52, 0.36)' },
    { x: 80, y: 38, r: 20, c: 'rgba(21, 128, 61, 0.42)' },
  ];
  for (const cl of clouds) {
    ctx.fillStyle = cl.c;
    ctx.beginPath();
    ctx.arc(mapX(cl.x), mapY(cl.y), cl.r * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pot Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(mapX(80), mapY(164), 42 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main Trunk
  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = 7.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(mapX(80), mapY(115));
  ctx.quadraticCurveTo(mapX(78), mapY(80), mapX(80), mapY(42));
  ctx.stroke();

  // Base Leaves
  drawRotatedEllipse(ctx, mapX(64), mapY(94), 13 * scale, 7.5 * scale, -25, '#15803D');
  drawRotatedEllipse(ctx, mapX(96), mapY(94), 13 * scale, 7.5 * scale, 25, '#16A34A');

  // Branch 1: Left Lower
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 4.8 * scale;
  ctx.beginPath();
  ctx.moveTo(mapX(78), mapY(86));
  ctx.quadraticCurveTo(mapX(58), mapY(80), mapX(38), mapY(66));
  ctx.stroke();
  drawRotatedEllipse(ctx, mapX(56), mapY(80), 13 * scale, 7.5 * scale, -30, '#16A34A');
  drawRotatedEllipse(ctx, mapX(42), mapY(72), 12 * scale, 7 * scale, -40, '#22C55E');
  drawRotatedEllipse(ctx, mapX(48), mapY(64), 10 * scale, 6 * scale, -20, '#4ADE80');

  // Branch 2: Right Lower
  ctx.beginPath();
  ctx.moveTo(mapX(82), mapY(86));
  ctx.quadraticCurveTo(mapX(102), mapY(80), mapX(122), mapY(66));
  ctx.stroke();
  drawRotatedEllipse(ctx, mapX(104), mapY(80), 13 * scale, 7.5 * scale, 30, '#15803D');
  drawRotatedEllipse(ctx, mapX(118), mapY(72), 12 * scale, 7 * scale, 40, '#16A34A');
  drawRotatedEllipse(ctx, mapX(112), mapY(64), 10 * scale, 6 * scale, 20, '#22C55E');

  // Branch 3: Top Left
  ctx.lineWidth = 4.2 * scale;
  ctx.beginPath();
  ctx.moveTo(mapX(79), mapY(60));
  ctx.quadraticCurveTo(mapX(65), mapY(48), mapX(52), mapY(38));
  ctx.stroke();
  drawRotatedEllipse(ctx, mapX(64), mapY(52), 11 * scale, 6.5 * scale, -35, '#22C55E');
  drawRotatedEllipse(ctx, mapX(54), mapY(44), 10 * scale, 6 * scale, -45, '#4ADE80');

  // Branch 4: Top Right
  ctx.beginPath();
  ctx.moveTo(mapX(81), mapY(60));
  ctx.quadraticCurveTo(mapX(95), mapY(48), mapX(108), mapY(38));
  ctx.stroke();
  drawRotatedEllipse(ctx, mapX(96), mapY(52), 11 * scale, 6.5 * scale, 35, '#22C55E');
  drawRotatedEllipse(ctx, mapX(106), mapY(44), 10 * scale, 6 * scale, 45, '#4ADE80');

  // Crown Center Leaves
  drawRotatedEllipse(ctx, mapX(68), mapY(48), 14 * scale, 8 * scale, -30, '#22C55E');
  drawRotatedEllipse(ctx, mapX(92), mapY(48), 14 * scale, 8 * scale, 30, '#4ADE80');
  drawRotatedEllipse(ctx, mapX(80), mapY(40), 13 * scale, 7.5 * scale, 0, '#86EFAC');

  // Terracotta Pot
  const potGrad = ctx.createLinearGradient(mapX(46), 0, mapX(114), 0);
  potGrad.addColorStop(0, '#C86A41');
  potGrad.addColorStop(0.5, '#E78A61');
  potGrad.addColorStop(1, '#D9774E');

  ctx.fillStyle = potGrad;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.4 * scale;
  ctx.beginPath();
  ctx.moveTo(mapX(46), mapY(118));
  ctx.lineTo(mapX(55), mapY(159));
  ctx.bezierCurveTo(mapX(55), mapY(164), mapX(105), mapY(164), mapX(105), mapY(159));
  ctx.lineTo(mapX(114), mapY(118));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Soil & Rim
  drawRotatedEllipse(ctx, mapX(80), mapY(118), 34 * scale, 7 * scale, 0, '#6A4E3A');
  drawRotatedEllipse(ctx, mapX(80), mapY(116), 29 * scale, 5.5 * scale, 0, '#452B1F');
  drawRotatedEllipse(ctx, mapX(58), mapY(117), 4.5 * scale, 2 * scale, 0, '#84CC16');
  drawRotatedEllipse(ctx, mapX(101), mapY(117), 3.5 * scale, 1.8 * scale, 0, '#84CC16');

  // 5 Blooming Flowers (Mahkota Megah 5/5)
  drawFivePetalFlower(ctx, mapX(80), mapY(24), 1.0, '#F43F5E', '#FB7185');
  drawFivePetalFlower(ctx, mapX(36), mapY(62), 0.9, '#F43F5E', '#FB7185');
  drawFivePetalFlower(ctx, mapX(124), mapY(62), 0.9, '#E11D48', '#F43F5E');
  drawFivePetalFlower(ctx, mapX(50), mapY(36), 0.88, '#FB7185', '#FDA4AF');
  drawFivePetalFlower(ctx, mapX(110), mapY(36), 0.88, '#F43F5E', '#FB7185');

  // Golden Sparkles
  drawFourPointStar(ctx, mapX(63), mapY(13), 12, '#FACC15');
  drawFourPointStar(ctx, mapX(98), mapY(15), 10, '#F59E0B');
  drawFourPointStar(ctx, mapX(22), mapY(46), 11, '#FACC15');
  drawFourPointStar(ctx, mapX(138), mapY(46), 11, '#F59E0B');

  ctx.restore();
}

/**
 * Menggambar Medali Emas Lencana Baru di Canvas
 */
function drawBadgeMedallionIllustration(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  emoji: string,
  bonusXp: number
) {
  ctx.save();

  // Outer Radial Glow
  const glow = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 175);
  glow.addColorStop(0, '#FEF3C7');
  glow.addColorStop(0.65, '#FDE68A');
  glow.addColorStop(1, 'rgba(251, 191, 36, 0.15)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 165, 0, Math.PI * 2);
  ctx.fill();

  // Inner Medal Disc
  const medalGrad = ctx.createLinearGradient(centerX - 120, centerY - 120, centerX + 120, centerY + 120);
  medalGrad.addColorStop(0, '#FFFBEB');
  medalGrad.addColorStop(0.5, '#FEF3C7');
  medalGrad.addColorStop(1, '#FDE68A');

  ctx.fillStyle = medalGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 132, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.strokeStyle = '#D97706';
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 114, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Emoji Centerpiece
  ctx.font = '112px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, centerX, centerY + 6);

  // Decorative Sparkles
  drawFourPointStar(ctx, centerX - 135, centerY - 88, 16, '#F59E0B');
  drawFourPointStar(ctx, centerX + 138, centerY - 75, 14, '#FACC15');
  drawFourPointStar(ctx, centerX - 125, centerY + 92, 12, '#10B981');
  drawFourPointStar(ctx, centerX + 130, centerY + 86, 15, '#F59E0B');

  // Bonus XP Pill at bottom of medallion
  if (bonusXp > 0) {
    const pillText = `🎁 +${bonusXp} BONUS XP`;
    ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
    const textW = ctx.measureText(pillText).width;
    const pillW = textW + 52;
    const pillH = 48;
    const pillX = centerX - pillW / 2;
    const pillY = centerY + 112;

    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 24);
    ctx.fillStyle = '#059669';
    ctx.fill();
    ctx.strokeStyle = '#A7F3D0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, centerX, pillY + pillH / 2 + 1);
  }

  ctx.restore();
}

/**
 * Menghasilkan Data URL PNG (1080x1350 Portrait) untuk dibagikan ke Instagram, Facebook, & TikTok.
 */
export function generateSharePosterDataUrl(payload: SocialSharePayload): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const copy = buildShareContent(payload);
  const isMahkota = payload.type === 'MAHKOTA_MEGAH';

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (isMahkota) {
    bgGrad.addColorStop(0, '#064E3B');
    bgGrad.addColorStop(0.5, '#14532D');
    bgGrad.addColorStop(1, '#166534');
  } else {
    bgGrad.addColorStop(0, '#14532D');
    bgGrad.addColorStop(0.55, '#15803D');
    bgGrad.addColorStop(1, '#065F46');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Soft Golden Top Glow
  const topGlow = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 560);
  topGlow.addColorStop(0, 'rgba(250, 204, 21, 0.26)');
  topGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // Corner Sparkles
  drawFourPointStar(ctx, 96, 86, 18, 'rgba(253, 224, 71, 0.7)');
  drawFourPointStar(ctx, 984, 96, 15, 'rgba(253, 224, 71, 0.65)');
  drawFourPointStar(ctx, 88, 1265, 15, 'rgba(134, 239, 172, 0.6)');
  drawFourPointStar(ctx, 992, 1255, 18, 'rgba(253, 224, 71, 0.7)');

  // 2. Main White-Cream Botanical Card
  const cardX = 64;
  const cardY = 68;
  const cardW = W - 128;
  const cardH = H - 136;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fillStyle = '#FFFDF9';
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.strokeStyle = isMahkota ? '#FACC15' : '#FCD34D';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 3. Top App Brand Header Pill
  const brandText = '🌱 TUMBUH  •  GAMIFIED HABIT TRACKER';
  ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif';
  const brandW = ctx.measureText(brandText).width + 56;
  drawRoundedRect(ctx, W / 2 - brandW / 2, 112, brandW, 48, 24);
  ctx.fillStyle = '#ECFDF5';
  ctx.fill();
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(brandText, W / 2, 136);

  // 4. Milestone Ribbon Pill
  const ribbonText = isMahkota
    ? '👑 PENCAPAIAN PUNCAK • MAHKOTA MEGAH (5/5 🌸)'
    : '✨ LENCANA BARU TERBUKA! ✨';
  ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
  const ribbonW = ctx.measureText(ribbonText).width + 64;
  drawRoundedRect(ctx, W / 2 - ribbonW / 2, 178, ribbonW, 52, 26);
  ctx.fillStyle = '#FEF3C7';
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.fillText(ribbonText, W / 2, 205);

  // 5. Visual Centerpiece (Y = 438)
  if (isMahkota) {
    drawMahkotaMegahTreeIllustration(ctx, W / 2, 438);
  } else {
    const badge = payload.badge;
    const emoji = badge ? BADGE_EMOJI_MAP[badge.iconSvgName] || '🏆' : '🏆';
    drawBadgeMedallionIllustration(ctx, W / 2, 428, emoji, badge?.bonusXp || 0);
  }

  // 6. Main Achievement Title & Subtitle
  const mainTitle = isMahkota
    ? payload.habit?.title || 'Kebiasaan Positif'
    : payload.badge?.title || 'Lencana Prestasi';

  ctx.fillStyle = '#1C1917';
  ctx.font = '800 48px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  const titleLines = wrapTextLines(ctx, mainTitle, cardW - 140).slice(0, 2);
  let cursorY = 668;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, cursorY);
    cursorY += 56;
  }

  // Stats or Badge Description
  if (isMahkota && payload.habit) {
    const h = payload.habit;
    const longest = Math.max(h.longestStreak || 0, h.currentStreak || 0);
    const statsLabel = `💧 ${h.totalCompletions}x Siram   •   🔥 Rekor ${longest} Hari   •   🌸 5/5 Bunga Mekar`;
    ctx.font = '700 25px "Plus Jakarta Sans", system-ui, sans-serif';
    const statW = Math.min(cardW - 100, ctx.measureText(statsLabel).width + 56);
    drawRoundedRect(ctx, W / 2 - statW / 2, cursorY - 12, statW, 52, 26);
    ctx.fillStyle = '#FEFCE8';
    ctx.fill();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#854D0E';
    ctx.fillText(statsLabel, W / 2, cursorY + 14);
    cursorY += 74;
  } else if (payload.badge) {
    ctx.fillStyle = '#57534E';
    ctx.font = '600 27px "Plus Jakarta Sans", system-ui, sans-serif';
    const descLines = wrapTextLines(ctx, payload.badge.description, cardW - 160).slice(0, 2);
    for (const line of descLines) {
      ctx.fillText(line, W / 2, cursorY);
      cursorY += 38;
    }
    cursorY += 18;
  }

  // 7. Congratulatory & Motivational Box ("Ucapan Selamat & Semangat Terus Tumbuh")
  const boxX = cardX + 54;
  const boxY = Math.max(cursorY + 6, 845);
  const boxW = cardW - 108;
  const boxH = 260;

  const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
  boxGrad.addColorStop(0, '#F0FDF4');
  boxGrad.addColorStop(1, '#FEFCE8');

  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 28);
  ctx.fillStyle = boxGrad;
  ctx.fill();
  ctx.strokeStyle = '#86EFAC';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.font = '800 23px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('🎉 SELAMAT & SEMANGAT TERUS TUMBUH! 🌱', W / 2, boxY + 46);

  ctx.fillStyle = '#1C1917';
  ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
  const quoteLines = wrapTextLines(ctx, copy.posterQuote, boxW - 76).slice(0, 4);
  let quoteY = boxY + 96;
  for (const qLine of quoteLines) {
    ctx.fillText(qLine, W / 2, quoteY);
    quoteY += 36;
  }

  // 8. Footer Gardener Identity & Tagline
  const footerY = cardY + cardH - 82;
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxX, footerY - 28);
  ctx.lineTo(boxX + boxW, footerY - 28);
  ctx.stroke();

  const gardenerName = payload.userName || 'Pekebun Tumbuh';
  const levelStr = payload.userLevel ? `Level ${payload.userLevel}` : 'Level 1';
  const titleStr = payload.userTitle ? ` • ${payload.userTitle}` : '';
  ctx.fillStyle = '#14532D';
  ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`👤 ${gardenerName}  (${levelStr}${titleStr})`, W / 2, footerY + 2);

  ctx.fillStyle = '#78716C';
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Start small. Water daily. Grow consistently. • tumbuh.towingkediri.com', W / 2, footerY + 38);

  return canvas.toDataURL('image/png');
}

export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new File([array], filename, { type: mime });
  } catch {
    return null;
  }
}

/**
 * Menyalin teks ke clipboard dengan aman di HTTPS, localhost, maupun LAN IP (HTTP).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // lanjut ke fallback textarea
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function downloadPosterDataUrl(dataUrl: string, filename: string): boolean {
  if (!dataUrl || typeof document === 'undefined') return false;
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mengembalikan URL publik aplikasi untuk parameter sharer (agar Facebook Sharer
 * tidak gagal ketika diakses dari localhost atau IP lokal 192.168.x.x).
 */
export function getPublicAppShareUrl(): string {
  if (typeof window === 'undefined') return 'https://tumbuh.towingkediri.com';
  const host = window.location.hostname;
  const isPrivateOrLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.');
  return isPrivateOrLocal ? 'https://tumbuh.towingkediri.com' : window.location.origin;
}

export function isMobileTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const iPadDesktopMode =
    navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  return uaMobile || iPadDesktopMode;
}

export interface PlatformShareOutcome {
  platform: SocialPlatform;
  copied: boolean;
  downloaded: boolean;
  usedNativeShare: boolean;
  openedUrl?: string;
  feedbackMessage: string;
}

/**
 * Menjalankan aksi share ke Instagram, Facebook, atau TikTok:
 * - Otomatis menyalin ucapan selamat & motivasi "Terus Tumbuh" ke clipboard.
 * - Pada perangkat mobile yang mendukung Web Share File API (IG/TikTok), membuka
 *   native Share Sheet dengan file gambar poster PNG terlampir.
 * - Pada desktop / browser standar, otomatis mengunduh poster PNG resolusi tinggi
 *   dan membuka halaman platform tujuan secara sinkron (bebas blokir popup).
 */
export async function shareToSocialPlatform(
  platform: SocialPlatform,
  payload: SocialSharePayload,
  captionText?: string,
  existingPosterDataUrl?: string
): Promise<PlatformShareOutcome> {
  const copy = buildShareContent(payload);
  const finalCaption = (captionText && captionText.trim()) || copy.defaultCaption;
  const posterUrl = existingPosterDataUrl || generateSharePosterDataUrl(payload);
  const publicUrl = getPublicAppShareUrl();

  // 1. WhatsApp: Langsung buka wa.me / api.whatsapp.com
  if (platform === 'whatsapp') {
    const waText = `${finalCaption}\n\n🔗 ${publicUrl}`;
    const isMobile = isMobileTouchDevice();
    const waUrl = isMobile
      ? `whatsapp://send?text=${encodeURIComponent(waText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    if (typeof window !== 'undefined') {
      if (isMobile) {
        window.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    }
    const downloaded = downloadPosterDataUrl(posterUrl, copy.filename);
    const copied = await copyTextToClipboard(finalCaption);

    return {
      platform: 'whatsapp',
      copied,
      downloaded,
      usedNativeShare: false,
      openedUrl: waUrl,
      feedbackMessage:
        'WhatsApp telah dibuka! Gambar poster tersimpan di perangkat & ucapan motivasi sudah siap dibagikan.',
    };
  }

  // 2. Facebook: Buka Facebook Web Sharer
  if (platform === 'facebook') {
    const fbSharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      publicUrl
    )}&quote=${encodeURIComponent(finalCaption)}`;
    if (typeof window !== 'undefined') {
      window.open(fbSharerUrl, '_blank', 'noopener,noreferrer');
    }
    const downloaded = downloadPosterDataUrl(posterUrl, copy.filename);
    const copied = await copyTextToClipboard(finalCaption);

    return {
      platform: 'facebook',
      copied,
      downloaded,
      usedNativeShare: false,
      openedUrl: fbSharerUrl,
      feedbackMessage:
        'Facebook telah dibuka! Kartu poster PNG otomatis diunduh & ucapan motivasi sudah disalin.',
    };
  }

  return {
    platform,
    copied: false,
    downloaded: false,
    usedNativeShare: false,
    feedbackMessage: '',
  };
}
