import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/transaksi', label: 'Transaksi', icon: 'receipt_long' },
  { path: '/grafik', label: 'Grafik', icon: 'insights' },
  { path: '/ai', label: 'AI Insight', icon: 'psychology' },
  { path: '/budget', label: 'Budget', icon: 'account_balance_wallet' },
  { path: '/laporan', label: 'Laporan', icon: 'description' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const nama = localStorage.getItem('nama')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nama')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <motion.nav
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-sidebar"
        style={{
          width: 280, minHeight: '100vh',
          position: 'fixed', top: 0, left: 0,
          display: 'flex', flexDirection: 'column',
          padding: '24px 16px', zIndex: 100
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px 32px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99,102,241,0.5)'
          }}>
            <span className="material-symbols-outlined filled" style={{ color: 'white', fontSize: 20 }}>
              account_balance
            </span>
          </div>
          <div>
            <h1 className="text-gradient" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
              MoneyLog
            </h1>
            <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Premium Finance</p>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12, border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 14, fontWeight: 500,
                  fontFamily: 'Manrope, sans-serif',
                  background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: isActive ? '#c0c1ff' : 'var(--on-surface-variant)',
                  boxShadow: isActive ? '0 0 15px rgba(99,102,241,0.3), inset 0 0 0 1px rgba(99,102,241,0.5)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}
                  style={{ fontSize: 20, color: isActive ? '#c0c1ff' : 'var(--on-surface-variant)' }}>
                  {item.icon}
                </span>
                {item.label}
              </motion.button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={toggleTheme}
            className="btn-glass"
            style={{ padding: '10px 16px', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px', borderRadius: 12, border: 'none',
              background: 'rgba(248,113,113,0.1)',
              color: '#f87171', cursor: 'pointer', fontSize: 13,
              fontFamily: 'Manrope, sans-serif',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            Logout
          </button>
        </div>
      </motion.nav>

      {/* Main */}
      <main style={{ marginLeft: 280, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div className="glass-panel" style={{
          padding: '16px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            padding: '8px 16px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700,
              boxShadow: '0 0 10px rgba(99,102,241,0.4)'
            }}>
              {nama?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 14, color: 'var(--on-surface)', fontWeight: 500 }}>{nama}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}