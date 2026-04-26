import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getLaporanBulanan, getSemuaBulan } from '../api/laporan.api'
import Layout from '../components/Layout'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatRupiah, formatTanggalPendek } from '../utils/format'

export default function Laporan() {
  const [laporan, setLaporan] = useState(null)
  const [semuaBulan, setSemuaBulan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const now = new Date()
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1)
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear())

  useEffect(() => {
    const init = async () => {
      try {
        const resBulan = await getSemuaBulan()
        setSemuaBulan(resBulan.data)
        // Auto-select latest month if available
        if (resBulan.data.length > 0) {
          const latest = resBulan.data[0]
          setSelectedBulan(latest.bulan)
          setSelectedTahun(latest.tahun)
          fetchLaporan(latest.bulan, latest.tahun)
        } else {
          fetchLaporan(selectedBulan, selectedTahun)
        }
      } catch (err) {
        setError('Gagal memuat daftar bulan')
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchLaporan = async (bulan, tahun) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLaporanBulanan(bulan, tahun)
      setLaporan(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleBulanChange = (e) => {
    const [tahun, bulan] = e.target.value.split('-')
    const b = parseInt(bulan)
    const t = parseInt(tahun)
    setSelectedBulan(b)
    setSelectedTahun(t)
    fetchLaporan(b, t)
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
            Ringkasan keuangan bulanan Anda
          </p>
        </div>
        <select
          onChange={handleBulanChange}
          value={`${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`}
          className="btn-glass"
          style={{ padding: '10px 16px', fontSize: 14, cursor: 'pointer', outline: 'none' }}
        >
          {semuaBulan.length === 0 && (
            <option value={`${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`}>
              Bulan Ini
            </option>
          )}
          {semuaBulan.map((b, i) => (
            <option key={i} value={`${b.tahun}-${String(b.bulan).padStart(2, '0')}`}>
              {b.nama_bulan}
            </option>
          ))}
        </select>
      </motion.div>

      <ErrorBanner message={error} onRetry={() => fetchLaporan(selectedBulan, selectedTahun)} />

      {loading ? (
        <LoadingSpinner text="Menganalisis laporan..." />
      ) : laporan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Total Pemasukan', value: formatRupiah(laporan.total_pemasukan), color: 'var(--success)', icon: '📈' },
              { label: 'Total Pengeluaran', value: formatRupiah(laporan.total_pengeluaran), color: 'var(--danger)', icon: '📉' },
              { label: 'Saldo Bulan Ini', value: formatRupiah(laporan.saldo), color: laporan.saldo >= 0 ? 'var(--success)' : 'var(--danger)', icon: '💳' },
              { label: 'Rasio Tabungan', value: `${laporan.rasio_tabungan.toFixed(1)}%`, color: 'var(--primary)', icon: '🎯' },
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
                <p style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                📉 Pengeluaran per Kategori
              </h3>
              {laporan.kategori_pengeluaran.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <p>Tidak ada data pengeluaran</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {laporan.kategori_pengeluaran.map((k, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize', fontWeight: 500 }}>
                          {k.kategori}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
                          {formatRupiah(k.nominal)}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-glass-dark)', borderRadius: 100, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${k.persen}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '100%', borderRadius: 100, background: 'var(--danger)' }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {k.persen.toFixed(1)}% dari total pengeluaran
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Largest Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                🏆 Transaksi Terbesar
              </h3>
              {laporan.transaksi_terbesar.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <p>Tidak ada data transaksi</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {laporan.transaksi_terbesar.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 12,
                        borderBottom: i < laporan.transaksi_terbesar.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: t.tipe === 'pemasukan' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                          }}
                        >
                          {t.tipe === 'pemasukan' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.judul}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatTanggalPendek(t.tanggal)}</p>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: t.tipe === 'pemasukan' ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {t.tipe === 'pemasukan' ? '+' : '-'}
                        {formatRupiah(t.nominal)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Data laporan belum tersedia.</p>
        </div>
      )}
    </Layout>
  )
}