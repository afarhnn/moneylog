import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth.api'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({ nama: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan masuk.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mendaftar. Pastikan email belum terdaftar.')
    } finally {
      setLoading(false)
    }
  }

  const background = theme === 'dark'
    ? 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)'
    : 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 50%, #f0f0f5 100%)'

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--bg-glass-dark)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    fontSize: 15,
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.9 }}
        className="glass-card"
        style={{
          position: 'fixed', top: 24, right: 24,
          width: 44, height: 44, padding: 0,
          cursor: 'pointer', fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card"
        style={{ borderRadius: 28, padding: '48px 40px', width: '100%', maxWidth: 420 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }}>💰</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Buat Akun
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 15 }}>
            Mulai kelola keuangan Anda dengan MoneyLog
          </p>
        </motion.div>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block', marginLeft: 4 }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block', marginLeft: 4 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="email@contoh.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block', marginLeft: 4 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 700, marginTop: 12 }}
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sudah punya akun?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}