import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Layout from '../components/Layout'
import ConfirmModal from '../components/ui/ConfirmModal'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useBudget } from '../hooks/useBudget'
import { formatRupiah } from '../utils/format'
import { validateNominal, validateRequired } from '../utils/validators'

export default function Budget() {
  const { budgets, loading, error, create, remove } = useBudget()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kategori: '', limit_nominal: '' })
  const [isDeleting, setIsDeleting] = useState(null)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const errKategori = validateRequired(form.kategori, 'Kategori')
    const errLimit = validateNominal(form.limit_nominal)

    if (errKategori || errLimit) {
      setFormError(errKategori || errLimit)
      return
    }

    try {
      await create({
        kategori: form.kategori,
        limit_nominal: parseFloat(form.limit_nominal),
      })
      setForm({ kategori: '', limit_nominal: '' })
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Gagal menyimpan budget')
    }
  }

  const getStatusColor = (status) => {
    if (status === 'danger') return 'var(--danger)'
    if (status === 'warning') return 'var(--warning)'
    return 'var(--success)'
  }

  const getStatusLabel = (status) => {
    if (status === 'danger') return '🚨 Melebihi Budget!'
    if (status === 'warning') return '⚠️ Hampir Habis'
    return '✅ Aman'
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit_nominal, 0)
  const totalTerpakai = budgets.reduce((s, b) => s + b.terpakai, 0)
  const totalSisa = totalBudget - totalTerpakai

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-glass-dark)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <Layout>
      <ConfirmModal
        isOpen={!!isDeleting}
        title="Hapus Budget"
        message="Yakin ingin menghapus budget untuk kategori ini?"
        onConfirm={async () => {
          await remove(isDeleting)
          setIsDeleting(null)
        }}
        onCancel={() => setIsDeleting(null)}
      />

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
          className={showForm ? 'btn-glass' : 'btn-primary'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 600 }}
        >
          {showForm ? '✕ Batal' : '+ Set Budget'}
        </motion.button>
      </motion.div>

      <ErrorBanner message={error} />

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Budget', value: totalBudget, color: 'var(--primary)', icon: '🎯' },
            { label: 'Total Terpakai', value: totalTerpakai, color: 'var(--danger)', icon: '💸' },
            { label: 'Sisa Budget', value: totalSisa, color: totalSisa >= 0 ? 'var(--success)' : 'var(--danger)', icon: '💰' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: '20px 24px' }}
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
            className="glass-card"
            style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              🎯 Set Budget Baru
            </h3>
            <ErrorBanner message={formError} />
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Makanan"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    Limit Budget (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={form.limit_nominal}
                    onChange={(e) => setForm({ ...form, limit_nominal: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '13px' }}>
                  ✓ Simpan Budget
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-glass" style={{ flex: 1, padding: '13px' }}>
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget List */}
      {loading ? (
        <LoadingSpinner text="Memuat budget..." />
      ) : budgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{ padding: 60, textAlign: 'center' }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Belum Ada Budget
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Set budget per kategori untuk mulai tracking pengeluaran kamu
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '12px 28px' }}>
            + Set Budget Pertama
          </button>
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
                className="glass-card"
                style={{ padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {budget.kategori}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: `${statusColor}1A`, // 10% opacity
                          color: statusColor,
                          fontWeight: 600,
                        }}
                      >
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
                    <button
                      onClick={() => setIsDeleting(budget.id)}
                      className="btn-glass"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        color: 'var(--danger)',
                        borderColor: 'rgba(248,113,113,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: 8, background: 'var(--bg-glass-dark)', borderRadius: 100, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budget.persen, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                    style={{
                      height: '100%',
                      borderRadius: 100,
                      background: statusColor,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Terpakai</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
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