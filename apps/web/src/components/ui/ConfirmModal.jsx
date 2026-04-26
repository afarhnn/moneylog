/**
 * Reusable delete confirmation modal.
 * Replaces all window.confirm() calls.
 */
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{ borderRadius: 20, padding: 32, maxWidth: 400, width: '100%' }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 12 }}>
              {title || 'Konfirmasi'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 24 }}>
              {message || 'Yakin ingin melanjutkan?'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: 'rgba(248,113,113,0.2)',
                  color: '#f87171', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif', fontSize: 14,
                }}
              >
                Ya, Hapus
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                className="btn-glass"
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14 }}
              >
                Batal
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
