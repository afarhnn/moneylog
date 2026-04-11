import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';
import '../models/transaction.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Transaction> transactions = [];
  bool loading = true;
  String nama = '';
  bool showForm = false;

  final judulController = TextEditingController();
  final nominalController = TextEditingController();
  final kategoriController = TextEditingController();
  final catatanController = TextEditingController();
  String tipe = 'pengeluaran';

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final namaUser = prefs.getString('nama') ?? '';
    final data = await getTransactions();
    setState(() {
      nama = namaUser;
      transactions = data;
      loading = false;
    });
  }

  void handleLogout() async {
    await clearToken();
    Navigator.pushReplacementNamed(context, '/login');
  }

  void handleTambah() async {
    if (judulController.text.isEmpty || nominalController.text.isEmpty || kategoriController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Judul, nominal, dan kategori wajib diisi!')));
      return;
    }
    final success = await createTransaction({
      'judul': judulController.text,
      'nominal': double.parse(nominalController.text),
      'tipe': tipe,
      'kategori': kategoriController.text,
      'catatan': catatanController.text,
    });
    if (success) {
      judulController.clear();
      nominalController.clear();
      kategoriController.clear();
      catatanController.clear();
      setState(() { showForm = false; });
      loadData();
    }
  }

  void handleDelete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1F2937),
        title: const Text('Hapus Transaksi', style: TextStyle(color: Colors.white)),
        content: const Text('Yakin mau hapus transaksi ini?', style: TextStyle(color: Colors.grey)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: Colors.grey))),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      await deleteTransaction(id);
      loadData();
    }
  }

  String formatRupiah(double nominal) {
    return 'Rp${nominal.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  @override
  Widget build(BuildContext context) {
    final totalPemasukan = transactions
      .where((t) => t.tipe == 'pemasukan')
      .fold(0.0, (sum, t) => sum + t.nominal);
    final totalPengeluaran = transactions
      .where((t) => t.tipe == 'pengeluaran')
      .fold(0.0, (sum, t) => sum + t.nominal);
    final saldo = totalPemasukan - totalPengeluaran;

    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1F2937),
        title: const Text('MoneyLog 💰',
          style: TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.bold)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton(
              onPressed: handleLogout,
              child: const Text('Logout', style: TextStyle(color: Colors.red)),
            ),
          )
        ],
      ),
      body: loading
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF7C3AED)))
        : RefreshIndicator(
            onRefresh: () async => loadData(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Greeting
                  Text('Halo, $nama! 👋',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),

                  // Summary Cards
                  Row(children: [
                    Expanded(child: _summaryCard('Saldo', saldo, saldo >= 0 ? Colors.green : Colors.red)),
                    const SizedBox(width: 8),
                    Expanded(child: _summaryCard('Pemasukan', totalPemasukan, Colors.green)),
                  ]),
                  const SizedBox(height: 8),
                  _summaryCard('Pengeluaran', totalPengeluaran, Colors.red),
                  const SizedBox(height: 20),

                  // Tombol tambah
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Transaksi',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      ElevatedButton(
                        onPressed: () => setState(() => showForm = !showForm),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF7C3AED),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        child: Text(showForm ? 'Batal' : '+ Tambah',
                          style: const TextStyle(color: Colors.white)),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Form tambah
                  if (showForm) _buildForm(),

                  // List transaksi
                  if (transactions.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('Belum ada transaksi',
                          style: TextStyle(color: Colors.grey)),
                      ),
                    )
                  else
                    ...transactions.map((t) => _transactionCard(t)),
                ],
              ),
            ),
          ),
    );
  }

  Widget _summaryCard(String label, double value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1F2937),
        borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 4),
          Text(formatRupiah(value),
            style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1F2937),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.3))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Transaksi Baru',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _inputField(judulController, 'Judul', 'Contoh: Beli makan'),
          const SizedBox(height: 10),
          _inputField(nominalController, 'Nominal', '25000', isNumber: true),
          const SizedBox(height: 10),
          // Tipe dropdown
          DropdownButtonFormField<String>(
            initialValue: tipe,
            dropdownColor: const Color(0xFF1F2937),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Tipe',
              labelStyle: const TextStyle(color: Colors.grey),
              filled: true,
              fillColor: const Color(0xFF111827),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none)),
            items: ['pengeluaran', 'pemasukan'].map((t) =>
              DropdownMenuItem(value: t, child: Text(t))).toList(),
            onChanged: (val) => setState(() => tipe = val!),
          ),
          const SizedBox(height: 10),
          _inputField(kategoriController, 'Kategori', 'Contoh: makanan'),
          const SizedBox(height: 10),
          _inputField(catatanController, 'Catatan (opsional)', 'Catatan tambahan...'),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: handleTambah,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: const Text('Simpan', style: TextStyle(color: Colors.white)),
            ),
          )
        ],
      ),
    );
  }

  Widget _inputField(TextEditingController controller, String label, String hint, {bool isNumber = false}) {
    return TextField(
      controller: controller,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: const Color(0xFF111827),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none)),
    );
  }

  Widget _transactionCard(Transaction t) {
    final ispemasukan = t.tipe == 'pemasukan';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1F2937),
        borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: ispemasukan ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8)),
            child: Icon(
              ispemasukan ? Icons.arrow_downward : Icons.arrow_upward,
              color: ispemasukan ? Colors.green : Colors.red, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.judul,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text('${t.kategori} • ${t.tanggal.day}/${t.tanggal.month}/${t.tanggal.year}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${ispemasukan ? '+' : '-'}${formatRupiah(t.nominal)}',
                style: TextStyle(
                  color: ispemasukan ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold)),
              GestureDetector(
                onTap: () => handleDelete(t.id),
                child: const Text('hapus',
                  style: TextStyle(color: Colors.grey, fontSize: 11))),
            ],
          )
        ],
      ),
    );
  }
}