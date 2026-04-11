import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getTransactions } from '../services/api'
import Layout from '../components/Layout'

export default function Dashboard() {
  const navigate = useNavigate()
  const nama = localStorage.getItem('nama')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const totalPemasukan = transactions.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.nominal, 0)
  const totalPengeluaran = transactions.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
  const saldo = totalPemasukan - totalPengeluaran

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(num)

  const barData = transactions.reduce((acc, t) => {
    const bulan = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short' })
    const ex = acc.find(i => i.bulan === bulan)
    if (ex) {
      if (t.tipe === 'pemasukan') ex.pemasukan += t.nominal
      else ex.pengeluaran += t.nominal
    } else {
      acc.push({
        bulan,
        pemasukan: t.tipe === 'pemasukan' ? t.nominal : 0,
        pengeluaran: t.tipe === 'pengeluaran' ? t.nominal : 0
      })
    }
    return acc
  }, [])

  const recentTransactions = [...transactions].reverse().slice(0, 5)

  const cards = [
    { label: 'Total Saldo', value: saldo, color: saldo >= 0 ? '#10b981' : '#f87171', icon: '💳', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Pemasukan', value: totalPemasukan, color: '#10b981', icon: '📈', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Pengeluaran', value: totalPengeluaran, color: '#f87171', icon: '📉', bg: 'rgba(248,113,113,0.1)' },
    { label: 'Total Transaksi', value: transactions.length, color: '#6366f1', icon: '📋', bg: 'rgba(99,102,241,0.1)', isCount: true },
  ]

  return (
    <Layout>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Selamat datang, {nama}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 15 }}>
          Berikut ringkasan keuangan kamu hari ini.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: '20px 24px',
              boxShadow: 'var(--shadow)'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 12
            }}>
              {card.icon}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{card.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: card.color, letterSpacing: '-0.5px' }}>
              {card.isCount ? card.value : formatRupiah(card.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
            boxShadow: 'var(--shadow)'
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
            📊 Pemasukan vs Pengeluaran
          </h3>
          {barData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p>Belum ada data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="bulan" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={v => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, fontSize: 13
                  }}
                  formatter={v => formatRupiah(v)}
                />
                <Bar dataKey="pemasukan" fill="#10b981" radius={[6,6,0,0]} />
                <Bar dataKey="pengeluaran" fill="#f87171" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
            boxShadow: 'var(--shadow)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              🕐 Transaksi Terbaru
            </h3>
            <motion.button
              onClick={() => navigate('/transaksi')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                fontSize: 12, color: 'var(--accent)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 500
              }}
            >
              Lihat semua →
            </motion.button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentTransactions.map((t, i) => (
                <motion.div
                  key={t.id}
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
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.kategori}</p>
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
    </Layout>
  )
}