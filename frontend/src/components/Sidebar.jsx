import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'transaksi', label: 'Transaksi', icon: '💳', path: '/transaksi' },
  { id: 'grafik', label: 'Grafik', icon: '📈', path: '/grafik' },
  { id: 'ai', label: 'AI Insight', icon: '🤖', path: '/ai' },
  { id: 'budget', label: 'Budget', icon: '🎯', path: '/budget' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const active = window.location.pathname

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nama')
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: 240, minHeight: '100vh',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed',
        top: 0, left: 0, zIndex: 100
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 32 }}>
        <span style={{ fontSize: 28 }}>💰</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          MoneyLog
        </span>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.path)}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12, border: 'none',
              cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
              background: active === item.path
                ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.1))'
                : 'transparent',
              color: active === item.path ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: active === item.path ? '3px solid var(--accent)' : '3px solid transparent'
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <motion.button
          onClick={toggleTheme} whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12, border: 'none',
            cursor: 'pointer', background: 'var(--bg-glass-dark)',
            color: 'var(--text-secondary)', fontSize: 14
          }}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </motion.button>

        <motion.button
          onClick={handleLogout} whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12, border: 'none',
            cursor: 'pointer',
            background: 'rgba(248,113,113,0.1)',
            color: '#f87171', fontSize: 14
          }}
        >
          <span>🚪</span> Logout
        </motion.button>
      </div>
    </motion.aside>
  )
}