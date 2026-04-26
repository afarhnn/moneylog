import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { formatRupiah } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { nama } = useAuth()
  const { transactions = [], loading, error } = useTransactions()

  const data = Array.isArray(transactions) ? transactions : []

  const totalPemasukan = data
    .filter((t) => t.tipe === 'pemasukan')
    .reduce((s, t) => s + t.nominal, 0)
  const totalPengeluaran = data
    .filter((t) => t.tipe === 'pengeluaran')
    .reduce((s, t) => s + t.nominal, 0)
  const saldo = totalPemasukan - totalPengeluaran
  const recent = [...data].reverse().slice(0, 5)

  // Bar chart data aggregation
  const barData = data.reduce((acc, t) => {
    const bulan = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    const ex = acc.find((i) => i.bulan === bulan)
    if (ex) {
      if (t.tipe === 'pemasukan') ex.pemasukan += t.nominal
      else ex.pengeluaran += t.nominal
    } else {
      acc.push({
        bulan,
        pemasukan: t.tipe === 'pemasukan' ? t.nominal : 0,
        pengeluaran: t.tipe === 'pengeluaran' ? t.nominal : 0,
      })
    }
    return acc
  }, [])

  const maxVal = Math.max(...barData.map((d) => Math.max(d.pemasukan, d.pengeluaran)), 1)

  const getCategoryIcon = (kategori) => {
    const icons = {
      makanan: 'restaurant', food: 'restaurant', makan: 'restaurant',
      transport: 'directions_car', transportasi: 'directions_car',
      belanja: 'shopping_bag', shopping: 'shopping_bag',
      gaji: 'work', salary: 'work', income: 'work',
      hiburan: 'movie', entertainment: 'movie',
      kesehatan: 'medical_services', health: 'medical_services',
      pendidikan: 'school', education: 'school',
    }
    const key = Object.keys(icons).find((k) => kategori?.toLowerCase().includes(k))
    return icons[key] || 'payments'
  }

  const getCategoryColor = (kategori, tipe) => {
    if (tipe === 'pemasukan')
      return { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#10b981' }
    const colors = {
      makanan: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', text: '#f97316' },
      transport: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
      belanja: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', text: '#a855f7' },
    }
    const key = Object.keys(colors).find((k) => kategori?.toLowerCase().includes(k))
    return (
      colors[key] || { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: '#6366f1' }
    )
  }

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 32,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--on-surface)',
              letterSpacing: '-0.5px',
              marginBottom: 4,
            }}
          >
            Dashboard
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
            Selamat datang kembali, <span style={{ color: '#c0c1ff', fontWeight: 600 }}>{nama}</span>!
          </p>
        </div>
        <button
          onClick={() => navigate('/transaksi')}
          className="btn-primary"
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
          Transaksi Baru
        </button>
      </motion.div>

      {error && (
        <div style={{ marginBottom: 20 }}>
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Memuat dashboard..." />
      ) : (
        <>
          {/* Bento Grid - Top Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Hero Saldo Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card"
              style={{ borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden' }}
            >
              {/* Glow effect */}
              <div
                style={{
                  position: 'absolute',
                  right: -80,
                  top: -80,
                  width: 256,
                  height: 256,
                  background: 'rgba(99,102,241,0.15)',
                  borderRadius: '50%',
                  filter: 'blur(80px)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08), transparent)',
                  pointerEvents: 'none',
                  borderRadius: 24,
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        className="material-symbols-outlined filled"
                        style={{ fontSize: 16, color: '#c0c1ff' }}
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>
                      Total Saldo
                    </span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(192,193,255,0.15)',
                      color: '#c0c1ff',
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {saldo >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {saldo >= 0 ? 'Positif' : 'Defisit'}
                  </div>
                </div>

                <h3
                  className="text-glow"
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    letterSpacing: '-1px',
                    color: saldo >= 0 ? 'white' : '#f87171',
                    marginBottom: 8,
                  }}
                >
                  {formatRupiah(saldo)}
                </h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
                  {transactions.length} total transaksi tercatat
                </p>
              </div>
            </motion.div>

            {/* Pemasukan & Pengeluaran */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
                style={{
                  borderRadius: 24,
                  padding: 24,
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    bottom: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(16,185,129,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#10b981', fontSize: 20 }}
                  >
                    arrow_downward
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                    Total Pemasukan
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: 4,
                  }}
                >
                  {formatRupiah(totalPemasukan)}
                </h4>
                <p
                  style={{
                    fontSize: 12,
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    check_circle
                  </span>
                  On track
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
                style={{
                  borderRadius: 24,
                  padding: 24,
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    bottom: -20,
                    width: 80,
                    height: 80,
                    background: 'rgba(248,113,113,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#f87171', fontSize: 20 }}
                  >
                    arrow_upward
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                    Total Pengeluaran
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: 4,
                  }}
                >
                  {formatRupiah(totalPengeluaran)}
                </h4>
                <p
                  style={{
                    fontSize: 12,
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {totalPengeluaran > totalPemasukan ? 'warning' : 'check_circle'}
                  </span>
                  {totalPengeluaran > totalPemasukan ? 'High spending' : 'Under control'}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Chart + Recent */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
              style={{ borderRadius: 24, padding: 32, height: 380 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>
                  Cash Flow
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: 12,
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}
                    />
                    Pemasukan
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }}
                    />
                    Pengeluaran
                  </span>
                </div>
              </div>

              {barData.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80%',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }}
                  >
                    bar_chart
                  </span>
                  <p>Belum ada data</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    height: '80%',
                    gap: 8,
                    paddingBottom: 32,
                    position: 'relative',
                  }}
                >
                  {/* Y axis */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    <span>{(maxVal / 1000000).toFixed(0)}M</span>
                    <span>{(maxVal / 2000000).toFixed(1)}M</span>
                    <span>0</span>
                  </div>

                  {barData.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        flex: 1,
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 4,
                          height: '100%',
                          width: '100%',
                          justifyContent: 'center',
                        }}
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.pemasukan / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{
                            width: 16,
                            borderRadius: '4px 4px 0 0',
                            background:
                              'linear-gradient(to top, rgba(16,185,129,0.2), rgba(52,211,153,0.8))',
                            borderTop: '1px solid rgba(52,211,153,0.5)',
                            minHeight: 4,
                          }}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.pengeluaran / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 + 0.1 }}
                          style={{
                            width: 16,
                            borderRadius: '4px 4px 0 0',
                            background:
                              'linear-gradient(to top, rgba(248,113,113,0.2), rgba(248,113,113,0.8))',
                            borderTop: '1px solid rgba(248,113,113,0.5)',
                            minHeight: 4,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--on-surface-variant)',
                          marginTop: 4,
                        }}
                      >
                        {d.bulan}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card"
              style={{
                borderRadius: 24,
                padding: 24,
                height: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>
                  Recent
                </h3>
                <button
                  onClick={() => navigate('/transaksi')}
                  style={{
                    fontSize: 13,
                    color: '#c0c1ff',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  View All
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {recent.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}
                    >
                      receipt_long
                    </span>
                    <p style={{ fontSize: 13 }}>Belum ada transaksi</p>
                  </div>
                ) : (
                  recent.map((t, i) => {
                    const color = getCategoryColor(t.kategori, t.tipe)
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          paddingBottom: 12,
                          borderBottom:
                            i < recent.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18, color: color.text }}
                          >
                            {getCategoryIcon(t.kategori)}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--on-surface)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {t.judul}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                            {t.kategori}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: t.tipe === 'pemasukan' ? '#10b981' : '#f87171',
                            }}
                          >
                            {t.tipe === 'pemasukan' ? '+' : '-'}
                            {formatRupiah(t.nominal)}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                            {new Date(t.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </Layout>
  )
}