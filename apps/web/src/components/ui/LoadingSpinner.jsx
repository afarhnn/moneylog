/**
 * Reusable LoadingSpinner component.
 */
import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 36, text = 'Memuat...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: size, height: size,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
        }}
      />
      {text && <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{text}</p>}
    </div>
  )
}
