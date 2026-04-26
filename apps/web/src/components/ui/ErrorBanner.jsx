/**
 * Reusable ErrorBanner component.
 */
import { motion } from 'framer-motion'

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(248,113,113,0.1)',
        border: '1px solid rgba(248,113,113,0.3)',
        borderRadius: 12, padding: '12px 16px',
        color: '#f87171', marginBottom: 20,
        fontSize: 14, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, fontFamily: 'Manrope, sans-serif' }}
        >
          Coba lagi
        </button>
      )}
    </motion.div>
  )
}
