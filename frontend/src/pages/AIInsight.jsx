import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAIInsight } from '../services/api'
import Layout from '../components/Layout'

export default function AIInsight() {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchInsight = async () => {
    setLoading(true)
    try {
      const res = await getAIInsight()
      setInsight(res.data.insight)
    } catch {
      setInsight('Gagal memuat insight. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

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
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          🤖 AI Financial Insight
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          Analisis keuangan cerdas powered by AI
        </p>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          ...glassCard, padding: 40,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.05))',
          marginBottom: 24, textAlign: 'center'
        }}
      >
        <motion.div
          animate={{ rotate: loading ? 360 : 0, scale: loading ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: loading ? Infinity : 0, duration: 2, ease: 'linear' }}
          style={{ fontSize: 64, marginBottom: 16, display: 'inline-block' }}
        >
          🤖
        </motion.div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Analisis Keuangan Personal
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
          AI akan menganalisis semua transaksi kamu dan memberikan insight mendalam tentang pola keuangan, kebiasaan belanja, dan saran penghematan.
        </p>
        <motion.button
          onClick={fetchInsight}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: 'white', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 8px 30px rgba(99,102,241,0.4)'
          }}
        >
          {loading ? '⏳ Menganalisis...' : '✨ Generate AI Insight'}
        </motion.button>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...glassCard, padding: 40, textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: '#6366f1'
                  }}
                />
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              AI sedang menganalisis pola keuangan kamu...
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
              Biasanya membutuhkan 5-15 detik
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {!loading && insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ ...glassCard, padding: 32 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>🤖</div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>AI Insight</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div style={{
              background: 'var(--bg-glass-dark)',
              borderRadius: 16, padding: 24,
              border: '1px solid var(--border)'
            }}>
              <p style={{
                color: 'var(--text-primary)', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', fontSize: 14
              }}>{insight}</p>
            </div>
            <motion.button
              onClick={fetchInsight}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                marginTop: 16, padding: '10px 20px', borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--bg-glass-dark)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13
              }}
            >
              🔄 Generate Ulang
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && !insight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
        >
          {[
            { icon: '📊', title: 'Analisis Pola', desc: 'AI menganalisis kebiasaan belanja dan tren keuangan kamu' },
            { icon: '💡', title: 'Saran Hemat', desc: 'Dapatkan saran konkret untuk menghemat lebih banyak' },
            { icon: '🎯', title: 'Budget Tips', desc: 'Rekomendasi alokasi budget yang optimal untuk kamu' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              style={{ ...glassCard, padding: 24, textAlign: 'center' }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Layout>
  )
}