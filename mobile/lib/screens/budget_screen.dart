import 'package:flutter/material.dart';
import '../services/api.dart';
import '../widgets/bottom_nav.dart';

class BudgetScreen extends StatefulWidget {
  const BudgetScreen({super.key});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  List<Map<String, dynamic>> budgets = [];
  bool loading = true;
  bool showForm = false;
  int _currentIndex = 2;

  final kategoriController = TextEditingController();
  final limitController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void loadData() async {
    final data = await getBudgets();
    setState(() { budgets = data; loading = false; });
  }

  void handleSave() async {
    if (kategoriController.text.isEmpty || limitController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua field wajib diisi!'), backgroundColor: Colors.redAccent));
      return;
    }
    final success = await createBudget(
      kategoriController.text,
      double.parse(limitController.text),
    );
    if (success) {
      kategoriController.clear();
      limitController.clear();
      setState(() => showForm = false);
      loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Budget berhasil disimpan'), backgroundColor: Colors.green));
    }
  }

  void handleDelete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1C1C2E),
        title: const Text('Hapus Budget?', style: TextStyle(color: Colors.white)),
        content: const Text('Yakin mau hapus budget ini?', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: Colors.white54))),
          TextButton(onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
    if (confirm == true) {
      await deleteBudget(id);
      loadData();
    }
  }

  void _onNavTap(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 2: break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
    }
  }

  String formatRupiah(dynamic nominal) {
    final num = double.tryParse(nominal.toString()) ?? 0;
    return 'Rp${num.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  Color getStatusColor(String status) {
    if (status == 'danger') return Colors.redAccent;
    if (status == 'warning') return Colors.orangeAccent;
    return Colors.greenAccent;
  }

  String getStatusLabel(String status) {
    if (status == 'danger') return '🚨 Melebihi!';
    if (status == 'warning') return '⚠️ Hampir Habis';
    return '✅ Aman';
  }

  @override
  Widget build(BuildContext context) {
    final totalBudget = budgets.fold(0.0, (s, b) => s + (double.tryParse(b['limit_nominal'].toString()) ?? 0));
    final totalTerpakai = budgets.fold(0.0, (s, b) => s + (double.tryParse(b['terpakai'].toString()) ?? 0));

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C1C2E),
        title: const Text('🎯 Budget Planner',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () => setState(() => showForm = !showForm),
            icon: Icon(showForm ? Icons.close : Icons.add, color: const Color(0xFF6366F1)),
          )
        ],
        elevation: 0,
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary
                  if (budgets.isNotEmpty) ...[
                    Row(
                      children: [
                        Expanded(child: _summaryCard('Total Budget', formatRupiah(totalBudget), const Color(0xFF6366F1))),
                        const SizedBox(width: 12),
                        Expanded(child: _summaryCard('Terpakai', formatRupiah(totalTerpakai), Colors.redAccent)),
                        const SizedBox(width: 12),
                        Expanded(child: _summaryCard('Sisa', formatRupiah(totalBudget - totalTerpakai),
                          totalBudget >= totalTerpakai ? Colors.greenAccent : Colors.redAccent)),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Form
                  if (showForm) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1C1C2E),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🎯 Set Budget Baru',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                          const SizedBox(height: 12),
                          _input(kategoriController, 'Kategori (contoh: makanan)'),
                          const SizedBox(height: 8),
                          _input(limitController, 'Limit Budget (Rp)', isNumber: true),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: handleSave,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6366F1),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Simpan Budget',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Budget List
                  if (budgets.isEmpty && !showForm)
                    Center(
                      child: Column(
                        children: [
                          const SizedBox(height: 60),
                          const Text('🎯', style: TextStyle(fontSize: 56)),
                          const SizedBox(height: 16),
                          const Text('Belum Ada Budget',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          Text('Set budget per kategori untuk mulai tracking',
                            style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                            textAlign: TextAlign.center),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: () => setState(() => showForm = true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('+ Set Budget Pertama',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    )
                  else
                    ...budgets.map((b) {
                      final persen = double.tryParse(b['persen'].toString()) ?? 0;
                      final status = b['status'] ?? 'aman';
                      final statusColor = getStatusColor(status);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1C1C2E),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.06)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(b['kategori'] ?? '',
                                      style: const TextStyle(color: Colors.white,
                                        fontWeight: FontWeight.w600, fontSize: 15)),
                                    const SizedBox(height: 4),
                                    Text('${formatRupiah(b['terpakai'])} dari ${formatRupiah(b['limit_nominal'])}',
                                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: statusColor.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(getStatusLabel(status),
                                        style: TextStyle(color: statusColor, fontSize: 11)),
                                    ),
                                    const SizedBox(width: 8),
                                    GestureDetector(
                                      onTap: () => handleDelete(b['id']),
                                      child: Icon(Icons.delete_outline,
                                        color: Colors.redAccent.withOpacity(0.6), size: 20),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(100),
                              child: LinearProgressIndicator(
                                value: persen / 100,
                                backgroundColor: Colors.white.withOpacity(0.08),
                                valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                                minHeight: 8,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${persen.toStringAsFixed(0)}% terpakai',
                                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
                                Text('Sisa: ${formatRupiah(b['sisa'])}',
                                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _summaryCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C2E),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
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