import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Share2,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { SocialPlatform, SocialSharePayload } from '../types';
import {
  buildShareContent,
  copyTextToClipboard,
  dataUrlToFile,
  downloadPosterDataUrl,
  generateSharePosterDataUrl,
  getPublicAppShareUrl,
  shareToSocialPlatform,
} from '../utils/socialShare';

// ---------------------------------------------------------------------------
// IKON RESMI MEDIA SOSIAL (WHATSAPP & FACEBOOK)
// ---------------------------------------------------------------------------

export const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.61L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.96 7.38C8.76 7.38 8.44 7.45 8.16 7.75C7.89 8.06 7.12 8.79 7.12 10.27C7.12 11.75 8.2 13.18 8.35 13.38C8.5 13.58 10.45 16.6 13.47 17.9C14.19 18.21 14.75 18.4 15.19 18.54C15.91 18.77 16.57 18.74 17.09 18.66C17.67 18.57 18.87 17.93 19.12 17.23C19.37 16.53 19.37 15.93 19.29 15.81C19.22 15.69 19.02 15.62 18.72 15.47C18.42 15.32 16.94 14.59 16.66 14.49C16.39 14.39 16.19 14.34 15.99 14.64C15.79 14.94 15.22 15.62 15.04 15.82C14.87 16.02 14.7 16.05 14.4 15.9C14.1 15.75 13.13 15.43 11.98 14.41C11.09 13.61 10.49 12.63 10.31 12.33C10.14 12.03 10.29 11.87 10.44 11.72C10.58 11.58 10.75 11.36 10.9 11.18C11.05 11.01 11.1 10.88 11.2 10.68C11.3 10.48 11.25 10.31 11.17 10.16C11.1 10.01 10.5 8.53 10.25 7.93C10.01 7.34 9.76 7.42 9.58 7.41C9.41 7.4 9.21 7.38 8.96 7.38Z" />
  </svg>
);

export const FacebookIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.6 21v-8.2h2.76l.41-3.2H13.6V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14A22.9 22.9 0 0 0 14.42 3c-2.45 0-4.12 1.49-4.12 4.24v2.36H7.53v3.2h2.77V21h3.3Z" />
  </svg>
);

// ---------------------------------------------------------------------------
// 1. KOMPONEN RINGKAS UNTUK DI DALAM BADGE MODAL & MAHKOTA MEGAH MODAL
// ---------------------------------------------------------------------------

interface QuickSocialShareSectionProps {
  payload: SocialSharePayload;
  onOpenStudio?: (payload: SocialSharePayload) => void;
}

export const QuickSocialShareSection: React.FC<QuickSocialShareSectionProps> = ({
  payload,
  onOpenStudio,
}) => {
  const copyData = useMemo(() => buildShareContent(payload), [payload]);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedOnly, setCopiedOnly] = useState(false);

  useEffect(() => {
    const generated = generateSharePosterDataUrl(payload);
    setPosterUrl(generated);
  }, [payload]);

  const handlePlatformClick = async (platform: SocialPlatform) => {
    const result = await shareToSocialPlatform(
      platform,
      payload,
      copyData.defaultCaption,
      posterUrl
    );
    setFeedback(result.feedbackMessage);
  };

  const handleCopyMotivation = async () => {
    const ok = await copyTextToClipboard(copyData.defaultCaption);
    if (ok) {
      setCopiedOnly(true);
      setFeedback('Ucapan selamat & motivasi "Terus Tumbuh" berhasil disalin ke clipboard! ✨');
      setTimeout(() => setCopiedOnly(false), 2500);
    }
  };

  return (
    <div className="quick-social-share-section" style={{ textAlign: 'left', marginBottom: '1.15rem' }}>
      {/* Kotak Ucapan Selamat & Semangat Motivasi Terus Tumbuh */}
      <div
        className="motivational-congrats-box"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FEFCE8 100%)',
          border: '1.5px solid #86EFAC',
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          marginBottom: '0.95rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#15803D',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            marginBottom: '0.3rem',
          }}
        >
          <Sparkles size={14} />
          <span>Selamat & Semangat Terus Tumbuh!</span>
        </div>
        <p
          style={{
            fontSize: '0.84rem',
            color: '#1C1917',
            lineHeight: 1.48,
            margin: 0,
            fontWeight: 500,
          }}
        >
          {copyData.motivationalMessage}
        </p>
      </div>

      {/* Label Share Media Sosial */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.55rem',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#57534E',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Share2 size={13} color="#16A34A" />
          <span>Bagikan ke Media Sosial:</span>
        </span>

        {onOpenStudio && (
          <button
            type="button"
            className="open-share-studio-link"
            onClick={() => onOpenStudio(payload)}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#15803D',
              background: '#DCFCE7',
              padding: '3px 9px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              border: '1px solid #86EFAC',
            }}
          >
            <ImageIcon size={12} />
            <span>Pratinjau Poster & Caption</span>
          </button>
        )}
      </div>

      {/* Tombol Utama: Facebook & WhatsApp */}
      <div className="social-platform-grid">
        <button
          type="button"
          className="social-share-btn facebook"
          onClick={() => handlePlatformClick('facebook')}
          title="Bagikan ke Facebook"
        >
          <FacebookIcon size={16} />
          <span>Facebook</span>
        </button>

        <button
          type="button"
          className="social-share-btn whatsapp"
          onClick={() => handlePlatformClick('whatsapp')}
          title="Bagikan ke WhatsApp"
        >
          <WhatsAppIcon size={16} />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* Tombol Salin Cepat Ucapan */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.55rem' }}>
        <button
          type="button"
          onClick={handleCopyMotivation}
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: copiedOnly ? '#15803D' : '#78716C',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          {copiedOnly ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
          <span>{copiedOnly ? 'Ucapan & Hashtag Tersalin!' : 'Salin teks ucapan motivasi saja'}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className="social-share-feedback"
          style={{
            marginTop: '0.6rem',
            padding: '0.6rem 0.75rem',
            borderRadius: '10px',
            background: '#ECFDF5',
            border: '1px solid #6EE7B7',
            color: '#065F46',
            fontSize: '0.76rem',
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          ✅ {feedback}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. MODAL STUDIO SHARE LENGKAP (PRATINJAU POSTER PNG + EDIT CAPTION + SHARE)
// ---------------------------------------------------------------------------

interface SocialShareModalProps {
  payload: SocialSharePayload;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ payload, onClose }) => {
  const copyData = useMemo(() => buildShareContent(payload), [payload]);
  const [caption, setCaption] = useState<string>(copyData.defaultCaption);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const supportsWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    setCaption(copyData.defaultCaption);
    const dataUrl = generateSharePosterDataUrl(payload);
    setPosterUrl(dataUrl);
  }, [payload, copyData.defaultCaption]);

  const handleCopyCaption = async () => {
    const ok = await copyTextToClipboard(caption);
    if (ok) {
      setCopied(true);
      setFeedback('Caption ucapan selamat & semangat motivasi berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadPoster = () => {
    const ok = downloadPosterDataUrl(posterUrl, copyData.filename);
    if (ok) {
      setDownloaded(true);
      setFeedback(`Kartu poster "${copyData.filename}" berhasil diunduh! Siap diunggah ke IG, FB, atau TikTok.`);
      setTimeout(() => setDownloaded(false), 2500);
    }
  };

  const handleSharePlatform = async (platform: SocialPlatform) => {
    const outcome = await shareToSocialPlatform(platform, payload, caption, posterUrl);
    setFeedback(outcome.feedbackMessage);
  };

  const handleNativeDeviceShare = async () => {
    if (!supportsWebShare) return;
    await copyTextToClipboard(caption);
    const posterFile = dataUrlToFile(posterUrl, copyData.filename);
    try {
      if (posterFile && navigator.canShare && navigator.canShare({ files: [posterFile] })) {
        await navigator.share({
          title: copyData.headline,
          text: caption,
          files: [posterFile],
        });
      } else {
        await navigator.share({
          title: copyData.headline,
          text: caption,
          url: getPublicAppShareUrl(),
        });
      }
      setFeedback('Berhasil membuka menu bagikan perangkat! Caption juga sudah disalin ke clipboard.');
    } catch (err: any) {
      if (!err || err.name !== 'AbortError') {
        setFeedback('Caption telah disalin ke clipboard. Silakan unduh poster PNG untuk dibagikan.');
      }
    }
  };

  return (
    <div
      id="social-share-studio-modal"
      className="modal-overlay"
      style={{ zIndex: 130 }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: 560,
          textAlign: 'left',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#15803D',
                background: '#DCFCE7',
                padding: '3px 10px',
                borderRadius: '999px',
                marginBottom: '0.35rem',
              }}
            >
              <Share2 size={13} />
              <span>BAGIKAN SEMANGAT TERUS TUMBUH</span>
            </div>
            <h2 style={{ fontSize: '1.28rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
              {copyData.congratsTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Tutup Studio Share"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#F5F5F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Pratinjau Kartu Poster PNG */}
        <div
          style={{
            background: 'linear-gradient(145deg, #14532D 0%, #064E3B 100%)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {posterUrl ? (
            <img
              id="social-share-poster-preview"
              src={posterUrl}
              alt={copyData.headline}
              style={{
                width: '100%',
                maxWidth: '270px',
                borderRadius: '12px',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ color: '#FFFFFF', padding: '2rem', fontSize: '0.85rem' }}>
              Menyiapkan kartu pencapaian...
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              id="download-poster-png-btn"
              type="button"
              onClick={handleDownloadPoster}
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #F59E0B',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              {downloaded ? <Check size={14} color="#15803D" /> : <Download size={14} />}
              <span>{downloaded ? 'Poster Terunduh!' : 'Unduh Kartu Gambar (PNG)'}</span>
            </button>
          </div>
        </div>

        {/* Editor Ucapan Selamat & Semangat Motivasi */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <label
              htmlFor="social-share-caption-input"
              style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}
            >
              Ucapan Selamat & Caption Motivasi:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCaption(copyData.defaultCaption)}
                title="Kembalikan ke pesan bawaan"
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#78716C',
                  background: '#F5F5F4',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              <button
                id="copy-share-caption-btn"
                type="button"
                onClick={handleCopyCaption}
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: copied ? '#FFFFFF' : '#15803D',
                  background: copied ? '#16A34A' : '#DCFCE7',
                  border: '1px solid #86EFAC',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin!' : 'Salin Ucapan'}</span>
              </button>
            </div>
          </div>

          <textarea
            id="social-share-caption-input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '12px',
              border: '1.5px solid #D6D3D1',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              lineHeight: 1.45,
              color: 'var(--text-main)',
              background: '#FAFAF9',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Tombol Share ke Instagram, Facebook, dan TikTok */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#57534E',
              marginBottom: '0.5rem',
            }}
          >
            Pilih Platform Tujuan (Otomatis Unduh Poster & Salin Caption):
          </div>

          <div className="social-platform-grid">
            <button
              id="studio-share-facebook"
              type="button"
              className="social-share-btn facebook large"
              onClick={() => handleSharePlatform('facebook')}
            >
              <FacebookIcon size={18} />
              <span>Facebook</span>
            </button>

            <button
              id="studio-share-whatsapp"
              type="button"
              className="social-share-btn whatsapp large"
              onClick={() => handleSharePlatform('whatsapp')}
            >
              <WhatsAppIcon size={18} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Native Share Sheet Option (bila didukung browser seperti Safari macOS / iOS / Android) */}
        {supportsWebShare && (
          <button
            type="button"
            onClick={handleNativeDeviceShare}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: '#F5F5F4',
              border: '1px solid #E7E5E4',
              color: '#44403C',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '0.65rem',
            }}
          >
            <Share2 size={15} />
            <span>Bagikan Cepat via Menu Share Perangkat</span>
          </button>
        )}

        {/* Feedback Box */}
        {feedback && (
          <div
            id="studio-share-feedback"
            style={{
              marginTop: '0.5rem',
              padding: '0.7rem 0.9rem',
              borderRadius: '12px',
              background: '#ECFDF5',
              border: '1.5px solid #6EE7B7',
              color: '#065F46',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              fontWeight: 600,
            }}
          >
            ✅ {feedback}
          </div>
        )}
      </div>
    </div>
  );
};
export default SocialShareModal;
