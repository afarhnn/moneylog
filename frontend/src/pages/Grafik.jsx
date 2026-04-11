import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts'
import { getTransactions } from '../services/api'
import Layout from '../components/Layout'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f87171', '#06b6d4', '#ec4899', '#8b5cf6']

export default function Grafik() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch { navigate('/login') }
    finally { setLoading(false) }
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

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 12, fontSize: 13
    }
  }

  // Pie data — pengeluaran per kategori
  const pieData = transactions
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((acc, t) => {
      const ex = acc.find(i => i.name === t.kategori)
      if (ex) ex.value += t.nominal
      else acc.push({ name: t.kategori, value: t.nominal })
      return acc
    }, [])

  // Bar data — pemasukan vs pengeluaran per bulan
  const barData = transactions.reduce((acc, t) => {
    const bulan = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
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

  // Line data — saldo kumulatif
  let saldoKumulatif = 0
  const lineData = [...transactions]
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    .map(t => {
      saldoKumulatif += t.tipe === 'pemasukan' ? t.nominal : -t.nominal
      return {
        tanggal: new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        saldo: saldoKumulatif
      }
    })

  // Stats
  const totalPemasukan = transactions.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.nominal, 0)
  const totalPengeluaran = transactions.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
  const kategoriTerbesar = pieData.sort((a, b) => b.value - a.value)[0]

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          📊 Grafik & Analisis
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          Visualisasi data keuangan kamu
        </p>
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Rasio Tabungan', value: totalPemasukan > 0 ? `${(((totalPemasukan - totalPengeluaran) / totalPemasukan) * 100).toFixed(1)}%` : '0%', icon: '💰', color: '#10b981' },
          { label: 'Kategori Terboros', value: kategoriTerbesar?.name || '-', icon: '📊', color: '#f87171' },
          { label: 'Total Transaksi', value: transactions.length, icon: '📋', color: '#6366f1' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ ...glassCard, padding: '20px 24px' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ fontSize: 36, display: 'inline-block' }}>⏳</motion.div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ ...glassCard, padding: 24 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
              📊 Pemasukan vs Pengeluaran per Bulan
            </h3>
            {barData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <p>Belum ada data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <XAxis dataKey="bulan" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip {...tooltipStyle} formatter={v => formatRupiah(v)} />
                  <Legend />
                  <Bar dataKey="pemasukan" fill="#10b981" radius={[6,6,0,0]} name="Pemasukan" />
                  <Bar dataKey="pengeluaran" fill="#f87171" radius={[6,6,0,0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Pie + Line */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ ...glassCard, padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                🥧 Pengeluaran per Kategori
              </h3>
              {pieData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                  <p>Belum ada pengeluaran</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                        innerRadius={40} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={v => formatRupiah(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {pieData.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatRupiah(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ ...glassCard, padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                📈 Tren Saldo
              </h3>
              {lineData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                  <p>Belum ada data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="tanggal" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip {...tooltipStyle} formatter={v => formatRupiah(v)} />
                    <Line
                      type="monotone" dataKey="saldo"
                      stroke="#6366f1" strokeWidth={2.5}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Saldo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </Layout>
  )
}