import 'package:flutter/material.dart';
import '../services/api.dart';
import '../widgets/bottom_nav.dart';

class TransaksiScreen extends StatefulWidget {
  const TransaksiScreen({super.key});

  @override
  State<TransaksiScreen> createState() => _TransaksiScreenState();
}

class _TransaksiScreenState extends State<TransaksiScreen> {
  List<Map<String, dynamic>> transactions = [];
  bool loading = true;
  bool showForm = false;
  int _currentIndex = 1;

  final judulController = TextEditingController();
  final nominalController = TextEditingController();
  final kategoriController = TextEditingController();
  final catatanController = TextEditingController();
  String tipe = 'pengeluaran';

  String filterTipe = 'semua';
  String filterCari = '';

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void loadData() async {
    final data = await getTransactions();
    setState(() { transactions = data; loading = false; });
  }

  void handleTambah() async {
    if (judulController.text.isEmpty || nominalController.text.isEmpty || kategoriController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua field wajib diisi!'), backgroundColor: Colors.redAccent));
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
      judulController.clear(); nominalController.clear();
      kategoriController.clear(); catatanController.clear();
      setState(() { showForm = false; tipe = 'pengeluaran'; });
      loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Transaksi berhasil ditambah'), backgroundColor: Colors.green));
    }
  }

  void handleDelete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1C1C2E),
        title: const Text('Hapus?', style: TextStyle(color: Colors.white)),
        content: const Text('Yakin mau hapus transaksi ini?', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: Colors.white54))),
          TextButton(onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
    if (confirm == true) {
      await deleteTransaction(id);
      loadData();
    }
  }

  void _onNavTap(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
    }
  }

  String formatRupiah(dynamic nominal) {
    final num = double.tryParse(nominal.toString()) ?? 0;
    return 'Rp${num.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  @override
  Widget build(BuildContext context) {
    final filtered = transactions
        .where((t) => filterTipe == 'semua' || t['tipe'] == filterTipe)
        .where((t) => filterCari.isEmpty || t['judul'].toString().toLowerCase().contains(filterCari.toLowerCase()))
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C1C2E),
        title: const Text('💳 Transaksi',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () => setState(() => showForm = !showForm),
            icon: Icon(showForm ? Icons.close : Icons.add,
              color: const Color(0xFF6366F1)),
          )
        ],
        elevation: 0,
      ),
      body: Column(
        children: [
          // Form tambah
          if (showForm) _buildForm(),

          // Filter
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF1C1C2E),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => filterCari = v),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: '🔍 Cari transaksi...',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: filterTipe,
                  dropdownColor: const Color(0xFF1C1C2E),
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  underline: const SizedBox(),
                  items: ['semua', 'pemasukan', 'pengeluaran']
                      .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                      .toList(),
                  onChanged: (v) => setState(() => filterTipe = v!),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('📭', style: TextStyle(fontSize: 52)),
                            const SizedBox(height: 8),
                            Text('Belum ada transaksi',
                              style: TextStyle(color: Colors.white.withOpacity(0.4))),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () async => loadData(),
                        color: const Color(0xFF6366F1),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, i) {
                            final t = filtered[i];
                            final isPemasukan = t['tipe'] == 'pemasukan';
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1C1C2E),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: Colors.white.withOpacity(0.06)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 40, height: 40,
                                    decoration: BoxDecoration(
                                      color: isPemasukan
                                          ? Colors.greenAccent.withOpacity(0.15)
                                          : Colors.redAccent.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Center(child: Text(isPemasukan ? '📈' : '📉',
                                      style: const TextStyle(fontSize: 18))),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(t['judul'] ?? '',
                                          style: const TextStyle(color: Colors.white,
                                            fontWeight: FontWeight.w600, fontSize: 14)),
                                        Text('${t['kategori']} • ${t['tanggal']?.toString().substring(0, 10) ?? ''}',
                                          style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
                                        if (t['catatan'] != null && t['catatan'].toString().isNotEmpty)
                                          Text(t['catatan'],
                                            style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 10)),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '${isPemasukan ? '+' : '-'}${formatRupiah(t['nominal'])}',
                                        style: TextStyle(
                                          color: isPemasukan ? Colors.greenAccent : Colors.redAccent,
                                          fontWeight: FontWeight.w700, fontSize: 12),
                                      ),
                                      const SizedBox(height: 4),
                                      GestureDetector(
                                        onTap: () => handleDelete(t['id']),
                                        child: Text('hapus',
                                          style: TextStyle(color: Colors.redAccent.withOpacity(0.6),
                                            fontSize: 10)),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _buildForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: const Color(0xFF1C1C2E),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('➕ Transaksi Baru',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _input(judulController, 'Judul')),
              const SizedBox(width: 8),
              Expanded(child: _input(nominalController, 'Nominal', isNumber: true)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _input(kategoriController, 'Kategori')),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0F),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButton<String>(
                    value: tipe,
                    isExpanded: true,
                    dropdownColor: const Color(0xFF1C1C2E),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    underline: const SizedBox(),
                    items: ['pengeluaran', 'pemasukan']
                        .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                        .toList(),
                    onChanged: (v) => setState(() => tipe = v!),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _input(catatanController, 'Catatan (opsional)'),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: handleTambah,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _input(TextEditingController controller, String hint, {bool isNumber = false}) {
    return TextField(
      controller: controller,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF0A0A0F),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }
}