import React, { useState, useEffect } from 'react';
import { ReengagementResponse, ReengagementSituation } from '../types';

interface ReengagementBannerProps {
  data: ReengagementResponse | null;
  onActionClick: (situation: ReengagementSituation, targetHabitId?: string) => void;
  onRefresh: (simMode?: string) => void;
}

export const ReengagementBanner: React.FC<ReengagementBannerProps> = ({
  data,
  onActionClick,
  onRefresh,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('unsupported');
    }
  }, []);

  const requestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationMsg('Browser ini belum mendukung Web Notification API.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        new Notification('Tumbuh — Pengingat Kebun', {
          body: data?.copy || 'Pengingat lembut telah aktif untuk merawat kebiasaanmu! 🌱',
          icon: '/favicon.ico',
        });
        setNotificationMsg('Notifikasi browser aktif! Kamu akan diingatkan dengan penuh kehangatan.');
      } else {
        setNotificationMsg('Izin notifikasi belum diaktifkan.');
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  if (!data || isDismissed) {
    return null;
  }

  // Visual theming based on situation
  const getTheme = () => {
    switch (data.situation) {
      case 'SEVERAL_MISSED_DAYS':
        return {
          bg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(253, 230, 138, 0.95))',
          border: '#F59E0B',
          iconBg: '#FDE68A',
          badgeText: 'Kangen Kamu',
          accentColor: '#D97706',
          emoji: '🌿',
        };
      case 'USER_RETURNS':
        return {
          bg: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(224, 231, 255, 0.95))',
          border: '#6366F1',
          iconBg: '#E0E7FF',
          badgeText: 'Kembali Tumbuh',
          accentColor: '#4F46E5',
          emoji: '✨',
        };
      case 'HABIT_INCOMPLETE_TODAY':
        return {
          bg: 'linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(209, 250, 229, 0.95))',
          border: '#10B981',
          iconBg: '#A7F3D0',
          badgeText: 'Siap Disiram',
          accentColor: '#059669',
          emoji: '🌱',
        };
      case 'ALL_WATERED':
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95), rgba(220, 252, 231, 0.95))',
          border: '#22C55E',
          iconBg: '#BBF7D0',
          badgeText: 'Kebun Mekar',
          accentColor: '#16A34A',
          emoji: '🌸',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      id="reengagement-banner"
      style={{
        background: theme.bg,
        border: `1.5px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: theme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {theme.emoji}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                id="reengagement-title"
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#1F2937',
                }}
              >
                {data.title}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme.accentColor,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.accentColor}40`,
                }}
              >
                {theme.badgeText}
              </span>
            </div>
            <p
              id="reengagement-copy"
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#4B5563',
                lineHeight: 1.4,
              }}
            >
              {data.copy}
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '18px',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
          title="Tutup banner"
        >
          ✕
        </button>
      </div>

      {notificationMsg && (
        <div
          style={{
            fontSize: '12px',
            color: '#065F46',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #A7F3D0',
          }}
        >
          🔔 {notificationMsg}
        </div>
      )}

      {/* Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="reengagement-action-btn"
            onClick={() => onActionClick(data.situation, data.targetHabitId)}
            style={{
              backgroundColor: theme.accentColor,
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease',
            }}
          >
            <span>{theme.emoji}</span>
            <span>{data.actionText}</span>
          </button>

          {notificationStatus !== 'granted' && (
            <button
              id="reengagement-notify-btn"
              onClick={requestBrowserNotification}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#374151',
                fontWeight: 500,
                fontSize: '12px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔔</span>
              <span>Aktifkan Notifikasi Web</span>
            </button>
          )}

          {notificationStatus === 'granted' && (
            <span
              style={{
                fontSize: '11px',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <span>✓</span> Notifikasi Aktif
            </span>
          )}
        </div>

        {/* Quick Simulator Switcher for Evaluation Testing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
          <span>Simulasi:</span>
          <button
            onClick={() => onRefresh('incomplete')}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #D1D5DB',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            Belum Siram
          </button>
          <button
            onClick={() => onRefresh('several_missed')}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #D1D5DB',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            Kangen (2+ Hari)
          </button>
          <button
            onClick={() => onRefresh('user_returns')}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #D1D5DB',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            User Kembali
          </button>
          <button
            onClick={() => onRefresh()}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #D1D5DB',
              background: '#FFF',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            Otomatis (DB)
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReengagementBanner;
