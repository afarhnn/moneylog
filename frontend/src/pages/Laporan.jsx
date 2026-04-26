import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLaporanBulanan, getSemuaBulan } from '../services/api'
import Layout from '../components/Layout'

export default function Laporan() {
  const navigate = useNavigate()
  const [laporan, setLaporan] = useState(null)
  const [semuaBulan, setSemuaBulan] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1)
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear())

  useEffect(() => {
    fetchSemuaBulan()
    fetchLaporan(selectedBulan, selectedTahun)
  }, [])

  const fetchSemuaBulan = async () => {
    try {
      const res = await getSemuaBulan()
      setSemuaBulan(res.data)
    } catch { navigate('/login') }
  }

  const fetchLaporan = async (bulan, tahun) => {
    setLoading(true)
    try {
      const res = await getLaporanBulanan(bulan, tahun)
      setLaporan(res.data)
    } catch { navigate('/login') }
    finally { setLoading(false) }
  }

  const handleBulanChange = (e) => {
    const [tahun, bulan] = e.target.value.split('-')
    setSelectedBulan(parseInt(bulan))
    setSelectedTahun(parseInt(tahun))
    fetchLaporan(parseInt(bulan), parseInt(tahun))
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(num)

  const glassCard = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    boxShadow: 'var(--shadow)'
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
            📅 Laporan Bulanan
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Summary keuangan per bulan
          </p>
        </div>
        <select
          onChange={handleBulanChange}
          defaultValue={`${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`}
          style={{
            padding: '10px 16px', borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            fontSize: 14, cursor: 'pointer'
          }}
        >
          {semuaBulan.map((b, i) => (
            <option key={i} value={`${b.tahun}-${String(b.bulan).padStart(2, '0')}`}>
              {b.nama_bulan}
            </option>
          ))}
        </select>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ fontSize: 36, display: 'inline-block' }}>⏳</motion.div>
        </div>
      ) : laporan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Total Pemasukan', value: formatRupiah(laporan.total_pemasukan), color: '#10b981', icon: '📈' },
              { label: 'Total Pengeluaran', value: formatRupiah(laporan.total_pengeluaran), color: '#f87171', icon: '📉' },
              { label: 'Saldo Bulan Ini', value: formatRupiah(laporan.saldo), color: laporan.saldo >= 0 ? '#10b981' : '#f87171', icon: '💳' },
              { label: 'Rasio Tabungan', value: `${laporan.rasio_tabungan}%`, color: '#6366f1', icon: '🎯' },
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
                <p style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Kategori + Transaksi Terbesar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Pengeluaran per Kategori */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ ...glassCard, padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                📉 Pengeluaran per Kategori
              </h3>
              {laporan.kategori_pengeluaran.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Tidak ada pengeluaran</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {laporan.kategori_pengeluaran.map((k, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{k.kategori}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>{formatRupiah(k.nominal)}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-glass-dark)', borderRadius: 100, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${k.persen}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #f87171, #ef4444)' }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{k.persen}% dari total pengeluaran</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Transaksi Terbesar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ ...glassCard, padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
                🏆 Transaksi Terbesar
              </h3>
              {laporan.transaksi_terbesar.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Tidak ada transaksi</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {laporan.transaksi_terbesar.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: t.tipe === 'pemasukan' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                        }}>
                          {t.tipe === 'pemasukan' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{t.judul}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.tanggal}</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: t.tipe === 'pemasukan' ? '#10b981' : '#f87171'
                      }}>
                        {t.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(t.nominal)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </Layout>
  )
}