import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api.dart';
import '../widgets/bottom_nav.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Map<String, dynamic>> transactions = [];
  bool loading = true;
  String nama = '';
  int _currentIndex = 0;

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

  void _onNavTap(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0: break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
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
    final totalPemasukan = transactions
        .where((t) => t['tipe'] == 'pemasukan')
        .fold(0.0, (sum, t) => sum + (double.tryParse(t['nominal'].toString()) ?? 0));
    final totalPengeluaran = transactions
        .where((t) => t['tipe'] == 'pengeluaran')
        .fold(0.0, (sum, t) => sum + (double.tryParse(t['nominal'].toString()) ?? 0));
    final saldo = totalPemasukan - totalPengeluaran;
    final recent = transactions.reversed.take(5).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C1C2E),
        title: Row(
          children: [
            const Text('💰', style: TextStyle(fontSize: 22)),
            const SizedBox(width: 8),
            const Text('MoneyLog',
              style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 18)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: handleLogout,
            child: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontSize: 13)),
          )
        ],
        elevation: 0,
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
          : RefreshIndicator(
              onRefresh: () async => loadData(),
              color: const Color(0xFF6366F1),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Greeting
                    Text('Halo, $nama! 👋',
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Berikut ringkasan keuangan kamu',
                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    const SizedBox(height: 20),

                    // Saldo Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF6366F1).withOpacity(0.3),
                            blurRadius: 20, offset: const Offset(0, 8),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Total Saldo',
                            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                          const SizedBox(height: 8),
                          Text(formatRupiah(saldo),
                            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(child: _miniCard('📈 Pemasukan', formatRupiah(totalPemasukan), Colors.greenAccent)),
                              const SizedBox(width: 12),
                              Expanded(child: _miniCard('📉 Pengeluaran', formatRupiah(totalPengeluaran), Colors.redAccent)),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Recent Transactions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Transaksi Terbaru',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                        TextButton(
                          onPressed: () => Navigator.pushReplacementNamed(context, '/transaksi'),
                          child: const Text('Lihat semua →',
                            style: TextStyle(color: Color(0xFF6366F1), fontSize: 12)),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),

                    recent.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(32),
                              child: Column(
                                children: [
                                  const Text('📭', style: TextStyle(fontSize: 48)),
                                  const SizedBox(height: 8),
                                  Text('Belum ada transaksi',
                                    style: TextStyle(color: Colors.white.withOpacity(0.4))),
                                ],
                              ),
                            ),
                          )
                        : Column(
                            children: recent.map((t) => _transactionTile(t)).toList(),
                          ),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: MoneyLogBottomNav(
        currentIndex: _currentIndex,
        onTap: _onNavTap,
      ),
    );
  }

  Widget _miniCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 11)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _transactionTile(Map<String, dynamic> t) {
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
            child: Center(
              child: Text(isPemasukan ? '📈' : '📉',
                style: const TextStyle(fontSize: 18)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t['judul'] ?? '',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                Text('${t['kategori']} • ${t['tanggal']?.toString().substring(0, 10) ?? ''}',
                  style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
              ],
            ),
          ),
          Text(
            '${isPemasukan ? '+' : '-'}${formatRupiah(t['nominal'])}',
            style: TextStyle(
              color: isPemasukan ? Colors.greenAccent : Colors.redAccent,
              fontWeight: FontWeight.w700, fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}