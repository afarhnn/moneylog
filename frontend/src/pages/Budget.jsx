import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getBudgets, createBudget, deleteBudget } from '../services/api'
import Layout from '../components/Layout'

export default function Budget() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kategori: '', limit_nominal: '' })

  useEffect(() => { fetchBudgets() }, [])

  const fetchBudgets = async () => {
    try {
      const res = await getBudgets()
      setBudgets(res.data)
    } catch { navigate('/login') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createBudget({ kategori: form.kategori, limit_nominal: parseFloat(form.limit_nominal) })
      setForm({ kategori: '', limit_nominal: '' })
      setShowForm(false)
      fetchBudgets()
    } catch { alert('Gagal simpan budget') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus budget ini?')) return
    try { await deleteBudget(id); fetchBudgets() }
    catch { alert('Gagal hapus budget') }
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(num)

  const getStatusColor = (status) => {
    if (status === 'danger') return '#f87171'
    if (status === 'warning') return '#f59e0b'
    return '#10b981'
  }

  const getStatusLabel = (status) => {
    if (status === 'danger') return '🚨 Melebihi Budget!'
    if (status === 'warning') return '⚠️ Hampir Habis'
    return '✅ Aman'
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit_nominal, 0)
  const totalTerpakai = budgets.reduce((s, b) => s + b.terpakai, 0)
  const totalSisa = totalBudget - totalTerpakai

  const glassCard = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    boxShadow: 'var(--shadow)'
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'var(--bg-glass-dark)',
    border: '1px solid var(--border)',
    borderRadius: 12, fontSize: 14,
    color: 'var(--text-primary)'
  }

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            🎯 Budget Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Set dan tracking budget pengeluaran kamu
          </p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 24px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
          }}
        >
          {showForm ? '✕ Batal' : '+ Set Budget'}
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Budget', value: totalBudget, color: '#6366f1', icon: '🎯' },
            { label: 'Total Terpakai', value: totalTerpakai, color: '#f87171', icon: '💸' },
            { label: 'Sisa Budget', value: totalSisa, color: totalSisa >= 0 ? '#10b981' : '#f87171', icon: '💰' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ ...glassCard, padding: '20px 24px' }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{formatRupiah(card.value)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ ...glassCard, padding: 24, marginBottom: 20, overflow: 'hidden' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              🎯 Set Budget Baru
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Kategori
                  </label>
                  <input
                    type="text" placeholder="Contoh: makanan"
                    value={form.kategori}
                    onChange={(e) => setForm({...form, kategori: e.target.value})}
                    style={inputStyle} required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Limit Budget (Rp)
                  </label>
                  <input
                    type="number" placeholder="500000"
                    value={form.limit_nominal}
                    onChange={(e) => setForm({...form, limit_nominal: e.target.value})}
                    style={inputStyle} required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                  }}
                >✓ Simpan Budget</motion.button>
                <motion.button
                  type="button" whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-glass-dark)',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}
                >Batal</motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ fontSize: 36, display: 'inline-block' }}>⏳</motion.div>
        </div>
      ) : budgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...glassCard, padding: 60, textAlign: 'center' }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Belum Ada Budget
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Set budget per kategori untuk mulai tracking pengeluaran kamu
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 28px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
            }}
          >+ Set Budget Pertama</motion.button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {budgets.map((budget, i) => {
            const statusColor = getStatusColor(budget.status)
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.005 }}
                style={{ ...glassCard, padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {budget.kategori}
                      </h3>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 100,
                        background: budget.status === 'danger' ? 'rgba(248,113,113,0.15)' : budget.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: statusColor, fontWeight: 500
                      }}>
                        {getStatusLabel(budget.status)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {formatRupiah(budget.terpakai)} dari {formatRupiah(budget.limit_nominal)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: statusColor }}>
                      {budget.persen.toFixed(0)}%
                    </span>
                    <motion.button
                      onClick={() => handleDelete(budget.id)}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 8, width: 32, height: 32,
                        cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >🗑️</motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: 8, background: 'var(--bg-glass-dark)', borderRadius: 100, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budget.persen}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                    style={{
                      height: '100%', borderRadius: 100,
                      background: budget.status === 'danger'
                        ? 'linear-gradient(90deg, #f87171, #ef4444)'
                        : budget.status === 'warning'
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Terpakai</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Sisa: {formatRupiah(budget.sisa)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}