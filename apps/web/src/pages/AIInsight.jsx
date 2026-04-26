import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { getAIInsight } from '../api/ai.api'
import Layout from '../components/Layout'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function AIInsight() {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInsight = async () => {
    setLoading(true)
    setError(null)
    setInsight('')
    try {
      const res = await getAIInsight()
      setInsight(res.data.insight)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memuat insight. AI mungkin sedang sibuk, coba beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          🤖 AI Financial Insight
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          Analisis keuangan cerdas didukung oleh AI untuk membantu Anda berhemat.
        </p>
      </motion.div>

      <ErrorBanner message={error} onRetry={fetchInsight} />

      {/* Hero Card */}
      {!insight && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: '48px 40px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.05))',
            marginBottom: 24,
            textAlign: 'center',
            borderWidth: '2px',
            borderColor: 'rgba(99,102,241,0.2)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Pahami Pola Keuangan Anda
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
            AI akan menganalisis data transaksi Anda untuk menemukan pola pengeluaran, memberikan saran penghematan konkret, dan tips budget yang dipersonalisasi.
          </p>
          <button
            onClick={fetchInsight}
            className="btn-primary"
            style={{ padding: '16px 40px', borderRadius: 16, fontSize: 16 }}
          >
            ✨ Generate AI Insight
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{ padding: 60, textAlign: 'center' }}
          >
            <LoadingSpinner text="AI sedang menganalisis pola keuangan Anda..." />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
              Proses ini biasanya membutuhkan waktu 5-15 detik.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {!loading && insight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: 32 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                  }}
                >
                  🤖
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>AI Financial Advisor</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Dianalisis pada {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchInsight}
                className="btn-glass"
                style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                Analisis Ulang
              </button>
            </div>

            <div
              style={{
                background: 'var(--bg-glass-dark)',
                borderRadius: 20,
                padding: 28,
                border: '1px solid var(--border)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  color: 'var(--text-primary)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  fontSize: 15,
                }}
              >
                {insight}
              </div>
            </div>

            <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px dashed var(--primary)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                💡 Insight ini dihasilkan oleh AI berdasarkan data transaksi Anda. Harap tinjau kembali untuk keputusan finansial yang penting.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Cards */}
      {!loading && !insight && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '📊', title: 'Analisis Tren', desc: 'AI mendeteksi pola pengeluaran unik Anda dari waktu ke waktu.' },
            { icon: '💡', title: 'Rekomendasi Cerdas', desc: 'Saran penghematan yang disesuaikan dengan gaya hidup Anda.' },
            { icon: '🎯', title: 'Target Budget', desc: 'Tips alokasi dana agar target finansial Anda lebih cepat tercapai.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card"
              style={{ padding: 24, textAlign: 'center' }}
            >
              <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}