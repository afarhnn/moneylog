import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Layout from '../components/Layout'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTransactions } from '../hooks/useTransactions'
import { formatRupiah } from '../utils/format'

const COLORS = [
  'var(--primary)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
]

export default function Grafik() {
  const { transactions, loading, error } = useTransactions()

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      fontSize: 13,
      boxShadow: 'var(--shadow)',
    },
    itemStyle: {
      color: 'var(--text-primary)',
    },
  }

  // Data processing
  const pieData = transactions
    .filter((t) => t.tipe === 'pengeluaran')
    .reduce((acc, t) => {
      const ex = acc.find((i) => i.name === t.kategori)
      if (ex) ex.value += t.nominal
      else acc.push({ name: t.kategori, value: t.nominal })
      return acc
    }, [])
    .sort((a, b) => b.value - a.value)

  const barData = transactions
    .reduce((acc, t) => {
      const date = new Date(t.tanggal)
      const bulan = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      const ex = acc.find((i) => i.bulan === bulan)
      if (ex) {
        if (t.tipe === 'pemasukan') ex.pemasukan += t.nominal
        else ex.pengeluaran += t.nominal
      } else {
        acc.push({
          bulan,
          pemasukan: t.tipe === 'pemasukan' ? t.nominal : 0,
          pengeluaran: t.tipe === 'pengeluaran' ? t.nominal : 0,
          timestamp: date.getTime(),
        })
      }
      return acc
    }, [])
    .sort((a, b) => a.timestamp - b.timestamp)

  let saldoKumulatif = 0
  const lineData = [...transactions]
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    .map((t) => {
      saldoKumulatif += t.tipe === 'pemasukan' ? t.nominal : -t.nominal
      return {
        tanggal: new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        saldo: saldoKumulatif,
      }
    })

  const totalPemasukan = transactions
    .filter((t) => t.tipe === 'pemasukan')
    .reduce((s, t) => s + t.nominal, 0)
  const totalPengeluaran = transactions
    .filter((t) => t.tipe === 'pengeluaran')
    .reduce((s, t) => s + t.nominal, 0)
  const kategoriTerbesar = pieData[0]

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          📊 Analisis & Grafik
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          Visualisasi mendalam data finansial Anda
        </p>
      </motion.div>

      <ErrorBanner message={error} />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            label: 'Rasio Tabungan',
            value: totalPemasukan > 0 ? `${(((totalPemasukan - totalPengeluaran) / totalPemasukan) * 100).toFixed(1)}%` : '0%',
            icon: '💰',
            color: 'var(--success)',
          },
          { label: 'Pengeluaran Terbesar', value: kategoriTerbesar?.name || '-', icon: '🛍️', color: 'var(--danger)' },
          { label: 'Volume Transaksi', value: transactions.length, icon: '📋', color: 'var(--primary)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
            style={{ padding: '20px 24px' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Menghitung statistik..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
            style={{ padding: 24 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
              📊 Arus Kas Per Bulan
            </h3>
            {barData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                <p>Belum ada data arus kas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="bulan" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip {...tooltipStyle} formatter={(v) => formatRupiah(v)} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="pemasukan" fill="var(--success)" radius={[6, 6, 0, 0]} name="Pemasukan" barSize={32} />
                  <Bar dataKey="pengeluaran" fill="var(--danger)" radius={[6, 6, 0, 0]} name="Pengeluaran" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Pie + Line Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                🥧 Distribusi Pengeluaran
              </h3>
              {pieData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                  <p>Belum ada data pengeluaran</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(v) => formatRupiah(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    {pieData.slice(0, 6).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{formatRupiah(item.value)}</span>
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
              className="glass-card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                📈 Progres Saldo Kumulatif
              </h3>
              {lineData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                  <p>Belum ada data saldo</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={lineData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="tanggal" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip {...tooltipStyle} formatter={(v) => formatRupiah(v)} />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
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