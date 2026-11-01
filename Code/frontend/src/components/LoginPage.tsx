import React, { useState } from 'react';
import { Sprout, User, Lock, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthUser } from '../types';

/**
 * ============================================================================
 * KOMPONEN HALAMAN LOGIN & DAFTAR (SIGN UP) TUMBUH V2
 * ============================================================================
 * Komponen ini dibuat dengan struktur yang sangat sederhana dan mudah dipahami:
 * 1. Tombol tab menu di atas untuk berganti antara "Masuk (Login)" dan "Daftar (Sign Up)".
 * 2. Form input sederhana yang hanya meminta:
 *    - Username (User)
 *    - Password
 * 3. Validasi langsung ke backend Express & database PostgreSQL tanpa token/session.
 * 4. Jika login/daftar cocok dan berhasil, callback onLoginSuccess(user) dipanggil
 *    dan user langsung diarahkan masuk ke halaman "Kebun Saya".
 * ============================================================================
 */

interface LoginPageProps {
  // Callback function ketika user berhasil login atau daftar
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // State untuk menentukan mode aktif: 'login' atau 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // State untuk form input
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State untuk status loading dan pesan notifikasi (error / sukses)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fungsi untuk membersihkan notifikasi pesan
  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Fungsi ganti tab menu (Login <-> Sign Up)
  const handleSwitchTab = (newMode: 'login' | 'signup') => {
    clearMessages();
    setMode(newMode);
  };

  // Fungsi submit form untuk Login atau Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 1. Validasi sederhana di sisi client
    if (!username.trim()) {
      setErrorMessage('Silakan isi kolom Username terlebih dahulu!');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan isi kolom Password terlebih dahulu!');
      return;
    }

    setLoading(true);

    try {
      // 2. Tentukan endpoint API sesuai mode (login atau signup)
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Tampilkan pesan error dari backend jika validasi gagal
        setErrorMessage(data.message || 'Terjadi kesalahan saat memproses data.');
        setLoading(false);
        return;
      }

      // 3. Jika berhasil, tampilkan pesan sukses
      setSuccessMessage(data.message || (mode === 'login' ? 'Login berhasil!' : 'Pendaftaran berhasil!'));

      // Berikan jeda singkat 400ms agar animasi feedback terasa nyaman
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      console.error('Error saat submit login/signup:', err);
      setErrorMessage('Gagal menghubungi server. Pastikan koneksi internet stabil.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi pembantu shortcut untuk pengujian cepat dengan akun demo
  const handleQuickDemoLogin = async () => {
    clearMessages();
    setUsername('demo');
    setPassword('password123');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'demo',
          password: 'password123',
        }),
      });

      const data = await response.json();
      if (data.success && data.user) {
        setSuccessMessage('Login sebagai Akun Demo berhasil! Membuka Kebun Saya...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 350);
      } else {
        setErrorMessage(data.message || 'Gagal login dengan akun demo.');
      }
    } catch (err) {
      setErrorMessage('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Header Kartu: Logo & Judul Aplikasi */}
        <div className="login-header">
          <div className="login-logo-circle">
            <Sprout size={36} color="#16A34A" />
          </div>
          <h1 className="login-app-title">Tumbuh Kebiasaan</h1>
          <p className="login-app-subtitle">
            Rawat kebiasaan baikmu layaknya merawat taman yang asri dan bertumbuh setiap hari 🌱
          </p>
        </div>

        {/* Tab Menu Sederhana: Masuk vs Daftar */}
        <div className="auth-tab-bar" role="tablist">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('login')}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('signup')}
          >
            Daftar (Sign Up)
          </button>
        </div>

        {/* Alert Error jika ada */}
        {errorMessage && (
          <div className="auth-alert error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Alert Sukses jika berhasil */}
        {successMessage && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Input Sederhana: User & Password */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Kolom 1: User / Username */}
          <div className="auth-input-group">
            <label htmlFor="auth-username">User (Username)</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: pekebun_rajin"
                disabled={loading}
                required
              />
            </div>
            <span className="input-hint">Gunakan huruf, angka, atau garis bawah</span>
          </div>

          {/* Kolom 2: Password */}
          <div className="auth-input-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akunmu"
                disabled={loading}
                required
              />
            </div>
            {mode === 'signup' && (
              <span className="input-hint">Ketikkan kata sandi yang mudah kamu ingat</span>
            )}
          </div>

          {/* Tombol Utama: Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Memproses...</span>
            ) : mode === 'login' ? (
              <>
                <span>Masuk ke Kebun Saya</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Daftar & Mulai Menanam</span>
                <Sparkles size={18} />
              </>
            )}
          </button>
        </form>

        {/* Kotak Pengujian Cepat: Shortcut Akun Demo */}
        <div className="demo-helper-box">
          <div className="demo-helper-title">
            <Sparkles size={15} color="#F59E0B" />
            <span>Ingin langsung menguji tanpa mengetik?</span>
          </div>
          <p className="demo-helper-desc">
            Klik tombol di bawah untuk langsung masuk menggunakan akun default (
            <code>demo / password123</code>).
          </p>
          <button
            type="button"
            className="demo-quick-btn"
            onClick={handleQuickDemoLogin}
            disabled={loading}
          >
            Masuk Cepat dengan Akun Demo 🌾
          </button>
        </div>
      </div>
    </div>
  );
};
