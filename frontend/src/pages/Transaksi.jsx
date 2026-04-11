import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/api'
import Layout from '../components/Layout'


export default function Transaksi() {
  const [filterDariTanggal, setFilterDariTanggal] = useState('')
  const [filterSampaiTanggal, setFilterSampaiTanggal] = useState('')
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterTipe, setFilterTipe] = useState('semua')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCari, setFilterCari] = useState('')
  const [form, setForm] = useState({
    judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: ''
  })

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch { navigate('/login') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) await updateTransaction(editId, {...form, nominal: parseFloat(form.nominal)})
      else await createTransaction({...form, nominal: parseFloat(form.nominal)})
      setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' })
      setShowForm(false)
      setEditId(null)
      fetchTransactions()
    } catch { alert('Gagal simpan transaksi') }
  }

  const handleEdit = (t) => {
    setEditId(t.id)
    setForm({ judul: t.judul, nominal: t.nominal, tipe: t.tipe, kategori: t.kategori, catatan: t.catatan || '' })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return
    try { await deleteTransaction(id); fetchTransactions() }
    catch { alert('Gagal hapus') }
  }

  const filteredTransactions = transactions
  .filter(t => filterTipe === 'semua' || t.tipe === filterTipe)
  .filter(t => filterKategori === '' || t.kategori.toLowerCase().includes(filterKategori.toLowerCase()))
  .filter(t => filterCari === '' || t.judul.toLowerCase().includes(filterCari.toLowerCase()))
  .filter(t => filterDariTanggal === '' || new Date(t.tanggal) >= new Date(filterDariTanggal))
  .filter(t => filterSampaiTanggal === '' || new Date(t.tanggal) <= new Date(filterSampaiTanggal + 'T23:59:59'))
  const kategoriList = [...new Set(transactions.map(t => t.kategori))]

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(num)

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'var(--bg-glass-dark)',
    border: '1px solid var(--border)',
    borderRadius: 12, fontSize: 14,
    color: 'var(--text-primary)'
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
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' }) }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px 24px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
          }}
        >
          {showForm && !editId ? '✕ Batal' : '+ Tambah Transaksi'}
        </motion.button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ ...glassCard, padding: 24, marginBottom: 20, overflow: 'hidden' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
              {editId ? '✏️ Edit Transaksi' : '➕ Transaksi Baru'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[
                  { label: 'Judul', key: 'judul', type: 'text', placeholder: 'Contoh: Beli makan' },
                  { label: 'Nominal (Rp)', key: 'nominal', type: 'number', placeholder: '25000' },
                  { label: 'Kategori', key: 'kategori', type: 'text', placeholder: 'Contoh: makanan' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type} placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                      style={inputStyle} required
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Tipe</label>
                  <select value={form.tipe} onChange={(e) => setForm({...form, tipe: e.target.value})} style={inputStyle}>
                    <option value="pengeluaran">Pengeluaran</option>
                    <option value="pemasukan">Pemasukan</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Catatan (opsional)
                </label>
                <input type="text" placeholder="Catatan tambahan..." value={form.catatan}
                  onChange={(e) => setForm({...form, catatan: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    color: 'white', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                  }}>
                  {editId ? '✓ Update' : '✓ Simpan'}
                </motion.button>
                <motion.button type="button" whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowForm(false); setEditId(null) }}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-glass-dark)',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}>
                  Batal
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  style={{ ...glassCard, padding: '16px 20px', marginBottom: 16 }}
>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>🔍 Cari Judul</label>
      <input placeholder="Cari transaksi..." value={filterCari}
        onChange={(e) => setFilterCari(e.target.value)}
        style={{...inputStyle, padding: '10px 14px', fontSize: 13}} />
    </div>
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📂 Tipe</label>
      <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}
        style={{...inputStyle, padding: '10px 14px', fontSize: 13}}>
        <option value="semua">Semua</option>
        <option value="pemasukan">Pemasukan</option>
        <option value="pengeluaran">Pengeluaran</option>
      </select>
    </div>
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>🏷️ Kategori</label>
      <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}
        style={{...inputStyle, padding: '10px 14px', fontSize: 13}}>
        <option value="">Semua Kategori</option>
        {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
      </select>
    </div>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📅 Dari Tanggal</label>
      <input type="date" value={filterDariTanggal}
        onChange={(e) => setFilterDariTanggal(e.target.value)}
        style={{...inputStyle, padding: '10px 14px', fontSize: 13}} />
    </div>
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>📅 Sampai Tanggal</label>
      <input type="date" value={filterSampaiTanggal}
        onChange={(e) => setFilterSampaiTanggal(e.target.value)}
        style={{...inputStyle, padding: '10px 14px', fontSize: 13}} />
    </div>
    <motion.button
      onClick={() => { setFilterTipe('semua'); setFilterKategori(''); setFilterCari(''); setFilterDariTanggal(''); setFilterSampaiTanggal('') }}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '10px 16px', borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--bg-glass-dark)',
        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
        whiteSpace: 'nowrap'
      }}
    >
      🔄 Reset
    </motion.button>
  </div>
</motion.div>

      {/* Info filter */}
      {(filterTipe !== 'semua' || filterKategori || filterCari) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
          </p>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setFilterTipe('semua'); setFilterKategori(''); setFilterCari('') }}
            style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Reset Filter
          </motion.button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ fontSize: 36, display: 'inline-block' }}>⏳</motion.div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
          <p>{transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada yang sesuai filter'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTransactions.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
              style={{ ...glassCard, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: t.tipe === 'pemasukan' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>
                  {t.tipe === 'pemasukan' ? '📈' : '📉'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{t.judul}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                    {t.kategori} • {new Date(t.tanggal).toLocaleDateString('id-ID')}
                  </p>
                  {t.catatan && <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>{t.catatan}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: t.tipe === 'pemasukan' ? '#10b981' : '#f87171' }}>
                  {t.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(t.nominal)}
                </span>
                <motion.button onClick={() => handleEdit(t)} whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8, width: 34, height: 34,
                    cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>✏️</motion.button>
                <motion.button onClick={() => handleDelete(t.id)} whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 8, width: 34, height: 34,
                    cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>🗑️</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  )
}