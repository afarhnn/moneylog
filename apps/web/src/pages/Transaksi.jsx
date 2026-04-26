import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Layout from '../components/Layout'
import ConfirmModal from '../components/ui/ConfirmModal'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTransactions } from '../hooks/useTransactions'
import { formatRupiah, formatTanggal } from '../utils/format'
import { validateNominal, validateRequired } from '../utils/validators'

export default function Transaksi() {
  const { transactions, loading, error, create, update, remove } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(null)
  const [formError, setFormError] = useState(null)

  const [filterTipe, setFilterTipe] = useState('semua')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCari, setFilterCari] = useState('')
  const [filterDariTanggal, setFilterDariTanggal] = useState('')
  const [filterSampaiTanggal, setFilterSampaiTanggal] = useState('')

  const [form, setForm] = useState({
    judul: '',
    nominal: '',
    tipe: 'pengeluaran',
    kategori: '',
    catatan: '',
  })

  const resetForm = () => {
    setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' })
    setEditId(null)
    setFormError(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    const errJudul = validateRequired(form.judul, 'Judul')
    const errNominal = validateNominal(form.nominal)
    const errKategori = validateRequired(form.kategori, 'Kategori')

    if (errJudul || errNominal || errKategori) {
      setFormError(errJudul || errNominal || errKategori)
      return
    }

    try {
      const data = { ...form, nominal: parseFloat(form.nominal) }
      if (editId) {
        await update(editId, data)
      } else {
        await create(data)
      }
      resetForm()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Gagal menyimpan transaksi')
    }
  }

  const handleEdit = (t) => {
    setEditId(t.id)
    setForm({
      judul: t.judul,
      nominal: t.nominal.toString(),
      tipe: t.tipe,
      kategori: t.kategori,
      catatan: t.catatan || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredTransactions = transactions
    .filter((t) => filterTipe === 'semua' || t.tipe === filterTipe)
    .filter(
      (t) =>
        filterKategori === '' || t.kategori.toLowerCase().includes(filterKategori.toLowerCase())
    )
    .filter((t) => filterCari === '' || t.judul.toLowerCase().includes(filterCari.toLowerCase()))
    .filter((t) => filterDariTanggal === '' || new Date(t.tanggal) >= new Date(filterDariTanggal))
    .filter(
      (t) =>
        filterSampaiTanggal === '' ||
        new Date(t.tanggal) <= new Date(filterSampaiTanggal + 'T23:59:59')
    )

  const kategoriList = [...new Set(transactions.map((t) => t.kategori))]

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-glass-dark)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <Layout>
      <ConfirmModal
        isOpen={!!isDeleting}
        title="Hapus Transaksi"
        message="Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={async () => {
          await remove(isDeleting)
          setIsDeleting(null)
        }}
        onCancel={() => setIsDeleting(null)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            💳 Transaksi
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            {transactions.length} total transaksi
          </p>
        </div>
        <motion.button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className={showForm && !editId ? 'btn-glass' : 'btn-primary'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 600 }}
        >
          {showForm && !editId ? '✕ Batal' : '+ Tambah Transaksi'}
        </motion.button>
      </motion.div>

      <ErrorBanner message={error} />

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card"
            style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
              {editId ? '✏️ Edit Transaksi' : '➕ Transaksi Baru'}
            </h3>
            <ErrorBanner message={formError} />
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Judul</label>
                  <input
                    type="text"
                    placeholder="Beli makan siang"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={form.nominal}
                    onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Kategori</label>
                  <input
                    type="text"
                    placeholder="Makanan"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Tipe</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="pengeluaran">Pengeluaran</option>
                    <option value="pemasukan">Pemasukan</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Catatan (opsional)</label>
                <input
                  type="text"
                  placeholder="Di warung Pak Slamet"
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '13px' }}>
                  {editId ? '✓ Update Transaksi' : '✓ Simpan Transaksi'}
                </button>
                <button type="button" onClick={resetForm} className="btn-glass" style={{ flex: 1, padding: '13px' }}>
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '16px 20px', marginBottom: 16 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>🔍 Cari Judul</label>
            <input
              placeholder="Cari..."
              value={filterCari}
              onChange={(e) => setFilterCari(e.target.value)}
              style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📂 Tipe</label>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            >
              <option value="semua">Semua</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>🏷️ Kategori</label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📅 Dari Tanggal</label>
            <input
              type="date"
              value={filterDariTanggal}
              onChange={(e) => setFilterDariTanggal(e.target.value)}
              style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📅 Sampai Tanggal</label>
            <input
              type="date"
              value={filterSampaiTanggal}
              onChange={(e) => setFilterSampaiTanggal(e.target.value)}
              style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
            />
          </div>
          <button
            onClick={() => {
              setFilterTipe('semua')
              setFilterKategori('')
              setFilterCari('')
              setFilterDariTanggal('')
              setFilterSampaiTanggal('')
            }}
            className="btn-glass"
            style={{ padding: '10px 16px', fontSize: 13 }}
          >
            🔄 Reset
          </button>
        </div>
      </motion.div>

      {/* Transactions List */}
      {loading ? (
        <LoadingSpinner text="Memuat transaksi..." />
      ) : filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
          <p>{transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil yang sesuai filter'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTransactions.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card"
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: t.tipe === 'pemasukan' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {t.tipe === 'pemasukan' ? '📈' : '📉'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{t.judul}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                    {t.kategori} • {formatTanggal(t.tanggal)}
                  </p>
                  {t.catatan && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>{t.catatan}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: t.tipe === 'pemasukan' ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {t.tipe === 'pemasukan' ? '+' : '-'}
                  {formatRupiah(t.nominal)}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleEdit(t)}
                    className="btn-glass"
                    style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button
                    onClick={() => setIsDeleting(t.id)}
                    className="btn-glass"
                    style={{
                      width: 34, height: 34, padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.2)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}