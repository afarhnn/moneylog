import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getAIInsight } from '../services/api'
const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export default function Dashboard() {
  const navigate = useNavigate()
  const nama = localStorage.getItem('nama')
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('transaksi')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: ''
  })

  // State filter
  const [filterTipe, setFilterTipe] = useState('semua')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterCari, setFilterCari] = useState('')
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await updateTransaction(editId, {...form, nominal: parseFloat(form.nominal)})
      } else {
        await createTransaction({...form, nominal: parseFloat(form.nominal)})
      }
      setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' })
      setShowForm(false)
      setEditId(null)
      fetchTransactions()
    } catch {
      alert('Gagal simpan transaksi')
    }
  }

  const handleEdit = (t) => {
    setEditId(t.id)
    setForm({
      judul: t.judul,
      nominal: t.nominal,
      tipe: t.tipe,
      kategori: t.kategori,
      catatan: t.catatan || ''
    })
    setShowForm(true)
    setActiveTab('transaksi')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return
    try {
      await deleteTransaction(id)
      fetchTransactions()
    } catch {
      alert('Gagal hapus transaksi')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nama')
    navigate('/login')
  }

  const handleBatalEdit = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' })
  }

  const fetchAIInsight = async () => {
  setAiLoading(true)
  try {
    const res = await getAIInsight()
    setAiInsight(res.data.insight)
  } catch {
    setAiInsight('Gagal memuat insight. Coba lagi.')
  } finally {
    setAiLoading(false)
  }
}

  // Logic filter
  const filteredTransactions = transactions
    .filter(t => filterTipe === 'semua' || t.tipe === filterTipe)
    .filter(t => filterKategori === '' || t.kategori.toLowerCase().includes(filterKategori.toLowerCase()))
    .filter(t => filterCari === '' || t.judul.toLowerCase().includes(filterCari.toLowerCase()))

  // Daftar kategori unik buat dropdown
  const kategoriList = [...new Set(transactions.map(t => t.kategori))]

  const totalPemasukan = transactions
    .filter(t => t.tipe === 'pemasukan')
    .reduce((sum, t) => sum + t.nominal, 0)

  const totalPengeluaran = transactions
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((sum, t) => sum + t.nominal, 0)

  const saldo = totalPemasukan - totalPengeluaran

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)

  const pieData = transactions
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.kategori)
      if (existing) existing.value += t.nominal
      else acc.push({ name: t.kategori, value: t.nominal })
      return acc
    }, [])

  const barData = transactions.reduce((acc, t) => {
    const bulan = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    const existing = acc.find(item => item.bulan === bulan)
    if (existing) {
      if (t.tipe === 'pemasukan') existing.pemasukan += t.nominal
      else existing.pengeluaran += t.nominal
    } else {
      acc.push({
        bulan,
        pemasukan: t.tipe === 'pemasukan' ? t.nominal : 0,
        pengeluaran: t.tipe === 'pengeluaran' ? t.nominal : 0
      })
    }
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-400">MoneyLog 💰</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Halo, {nama}!</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Total Saldo</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatRupiah(saldo)}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-400">{formatRupiah(totalPemasukan)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-400">{formatRupiah(totalPengeluaran)}</p>
          </div>
        </div>

       {/* Tabs */}
<div className="flex gap-2 mb-6">
  <button
    onClick={() => setActiveTab('transaksi')}
    className={`px-4 py-2 rounded-lg transition ${activeTab === 'transaksi' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
  >
    📋 Transaksi
  </button>
  <button
    onClick={() => setActiveTab('grafik')}
    className={`px-4 py-2 rounded-lg transition ${activeTab === 'grafik' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
  >
    📊 Grafik
  </button>
  <button
    onClick={() => setActiveTab('ai')}
    className={`px-4 py-2 rounded-lg transition ${activeTab === 'ai' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
  >
    🤖 AI Insight
  </button>
</div>

        {/* Tab Transaksi */}
        {activeTab === 'transaksi' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Riwayat Transaksi</h2>
              <button
                onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ judul: '', nominal: '', tipe: 'pengeluaran', kategori: '', catatan: '' }) }}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
              >
                {showForm && !editId ? 'Batal' : '+ Tambah Transaksi'}
              </button>
            </div>

            {/* Form Tambah/Edit */}
            {showForm && (
              <div className="bg-gray-800 p-6 rounded-2xl mb-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold mb-4">
                  {editId ? '✏️ Edit Transaksi' : '➕ Transaksi Baru'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Judul</label>
                    <input
                      type="text"
                      placeholder="Contoh: Beli makan"
                      value={form.judul}
                      onChange={(e) => setForm({...form, judul: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Nominal (Rp)</label>
                    <input
                      type="number"
                      placeholder="25000"
                      value={form.nominal}
                      onChange={(e) => setForm({...form, nominal: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Tipe</label>
                    <select
                      value={form.tipe}
                      onChange={(e) => setForm({...form, tipe: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pengeluaran">Pengeluaran</option>
                      <option value="pemasukan">Pemasukan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: makanan"
                      value={form.kategori}
                      onChange={(e) => setForm({...form, kategori: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-sm mb-1 block">Catatan (opsional)</label>
                    <input
                      type="text"
                      placeholder="Catatan tambahan..."
                      value={form.catatan}
                      onChange={(e) => setForm({...form, catatan: e.target.value})}
                      className="w-full bg-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="col-span-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
                    >
                      {editId ? 'Update Transaksi' : 'Simpan Transaksi'}
                    </button>
                    <button
                      type="button"
                      onClick={handleBatalEdit}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter Bar */}
            <div className="bg-gray-800 p-4 rounded-2xl mb-4 grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">🔍 Cari Judul</label>
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={filterCari}
                  onChange={(e) => setFilterCari(e.target.value)}
                  className="w-full bg-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">📂 Tipe</label>
                <select
                  value={filterTipe}
                  onChange={(e) => setFilterTipe(e.target.value)}
                  className="w-full bg-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="semua">Semua</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">🏷️ Kategori</label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full bg-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info hasil filter */}
            {(filterTipe !== 'semua' || filterKategori || filterCari) && (
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-400 text-sm">
                  Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                </p>
                <button
                  onClick={() => { setFilterTipe('semua'); setFilterKategori(''); setFilterCari('') }}
                  className="text-purple-400 text-sm hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* List Transaksi */}
            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {transactions.length === 0 ? 'Belum ada transaksi. Tambah sekarang!' : 'Tidak ada transaksi yang sesuai filter.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="bg-gray-800 px-6 py-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{t.judul}</p>
                      <p className="text-gray-400 text-sm">{t.kategori} • {new Date(t.tanggal).toLocaleDateString('id-ID')}</p>
                      {t.catatan && <p className="text-gray-500 text-xs mt-1">{t.catatan}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${t.tipe === 'pemasukan' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(t.nominal)}
                      </span>
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-gray-500 hover:text-yellow-400 transition text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-500 hover:text-red-400 transition text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab Grafik */}
        {activeTab === 'grafik' && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">📊 Pemasukan vs Pengeluaran</h3>
              {barData.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Belum ada data</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="bulan" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Legend />
                    <Bar dataKey="pemasukan" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="pengeluaran" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4">🥧 Pengeluaran per Kategori</h3>
              {pieData.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Belum ada data pengeluaran</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Tab AI */}
{activeTab === 'ai' && (
  <div className="bg-gray-800 p-6 rounded-2xl">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-lg font-semibold">🤖 AI Financial Insight</h3>
        <p className="text-gray-400 text-sm mt-1">Analisis keuangan lo oleh AI</p>
      </div>
      <button
        onClick={fetchAIInsight}
        disabled={aiLoading}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
      >
        {aiLoading ? '⏳ Menganalisis...' : '✨ Generate Insight'}
      </button>
    </div>

    {aiLoading && (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🤔</div>
        <p className="text-gray-400">AI lagi analisis keuangan lo...</p>
        <p className="text-gray-500 text-sm mt-1">Biasanya 5-10 detik</p>
      </div>
    )}

    {!aiLoading && aiInsight && (
      <div className="bg-gray-700 p-6 rounded-xl">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{aiInsight}</p>
      </div>
    )}

    {!aiLoading && !aiInsight && (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">💡</div>
        <p className="text-gray-400">Klik "Generate Insight" buat dapet analisis keuangan lo dari AI!</p>
      </div>
    )}
  </div>
)}
    </div>
  )
}