import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/transaction_provider.dart';
import '../utils/format.dart';
import '../core/theme.dart';
import '../widgets/bottom_nav.dart';
import '../models/transaction.dart';

class TransaksiScreen extends StatefulWidget {
  const TransaksiScreen({super.key});

  @override
  State<TransaksiScreen> createState() => _TransaksiScreenState();
}

class _TransaksiScreenState extends State<TransaksiScreen> {
  final int _currentIndex = 1;
  String _searchQuery = '';
  String _filterType = 'semua';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionProvider>().fetchTransactions();
    });
  }

  void _onNavTap(int index) {
    if (index == _currentIndex) return;
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
      case 4: Navigator.pushReplacementNamed(context, '/laporan'); break;
      case 5: Navigator.pushReplacementNamed(context, '/savings'); break;
    }
  }

  void _showTransactionForm([Transaction? transaction]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => TransactionForm(transaction: transaction),
    );
  }

  @override
  Widget build(BuildContext context) {
    final txProvider = context.watch<TransactionProvider>();
    final filtered = txProvider.transactions.where((t) {
      final matchType = _filterType == 'semua' || t.tipe == _filterType;
      final matchSearch = t.judul.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t.kategori.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchType && matchSearch;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaksi', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () => _showTransactionForm(),
            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary, size: 28),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Cari transaksi...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _filterChip('Semua', 'semua'),
                    const SizedBox(width: 8),
                    _filterChip('Pemasukan', 'pemasukan'),
                    const SizedBox(width: 8),
                    _filterChip('Pengeluaran', 'pengeluaran'),
                  ],
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: txProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => txProvider.fetchTransactions(),
                    child: filtered.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                              const Center(child: Text('📭', style: TextStyle(fontSize: 48))),
                              const SizedBox(height: 16),
                              Center(
                                child: Text(
                                  'Tidak ada transaksi ditemukan',
                                  style: TextStyle(color: AppTheme.textSecondary),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) => _transactionTile(filtered[index]),
                          ),
                  ),
          ),
        ],
      ),
      bottomNavigationBar: MoneyLogBottomNav(
        currentIndex: _currentIndex,
        onTap: _onNavTap,
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final isSelected = _filterType == value;
    return GestureDetector(
      onTap: () => setState(() => _filterType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppTheme.textSecondary,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _transactionTile(Transaction t) {
    final isPemasukan = t.tipe == 'pemasukan';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.border),
      ),
      child: ListTile(
        onTap: () => _showTransactionForm(t),
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: (isPemasukan ? AppTheme.success : AppTheme.danger).withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Center(
            child: Text(isPemasukan ? '📈' : '📉', style: const TextStyle(fontSize: 18)),
          ),
        ),
        title: Text(t.judul, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        subtitle: Text(
          '${t.kategori} • ${AppFormat.date(t.tanggal)}',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${isPemasukan ? '+' : '-'}${AppFormat.rupiah(t.nominal)}',
              style: TextStyle(
                color: isPemasukan ? AppTheme.success : AppTheme.danger,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Icon(Icons.chevron_right, size: 16, color: AppTheme.textSecondary.withOpacity(0.3)),
          ],
        ),
      ),
    );
  }
}

class TransactionForm extends StatefulWidget {
  final Transaction? transaction;
  const TransactionForm({super.key, this.transaction});

  @override
  State<TransactionForm> createState() => _TransactionFormState();
}

class _TransactionFormState extends State<TransactionForm> {
  late TextEditingController judulController;
  late TextEditingController nominalController;
  late TextEditingController kategoriController;
  late TextEditingController catatanController;
  late String tipe;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    judulController = TextEditingController(text: widget.transaction?.judul);
    nominalController = TextEditingController(text: widget.transaction?.nominal.toStringAsFixed(0));
    kategoriController = TextEditingController(text: widget.transaction?.kategori);
    catatanController = TextEditingController(text: widget.transaction?.catatan);
    tipe = widget.transaction?.tipe ?? 'pengeluaran';
  }

  void handleSubmit() async {
    if (judulController.text.isEmpty || nominalController.text.isEmpty || kategoriController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mohon isi semua field wajib')));
      return;
    }

    setState(() => loading = true);
    try {
      final txProvider = context.read<TransactionProvider>();
      final data = {
        'judul': judulController.text,
        'nominal': double.parse(nominalController.text),
        'tipe': tipe,
        'kategori': kategoriController.text,
        'catatan': catatanController.text,
        'tanggal': (widget.transaction?.tanggal ?? DateTime.now()).toIso8601String(),
      };

      if (widget.transaction == null) {
        await txProvider.addTransaction(data);
      } else {
        await txProvider.updateTransaction(widget.transaction!.id, data);
      }

      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => loading = false);
    }
  }

  void handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Transaksi?'),
        content: const Text('Tindakan ini tidak dapat dibatalkan.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus', style: TextStyle(color: AppTheme.danger)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => loading = true);
      try {
        await context.read<TransactionProvider>().deleteTransaction(widget.transaction!.id);
        if (mounted) Navigator.pop(context);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      } finally {
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        top: 24,
        left: 24,
        right: 24,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.transaction == null ? 'Tambah Transaksi' : 'Edit Transaksi',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                if (widget.transaction != null)
                  IconButton(
                    onPressed: loading ? null : handleDelete,
                    icon: const Icon(Icons.delete_outline, color: AppTheme.danger),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Tipe Selector
            Row(
              children: [
                _tipeButton('Pengeluaran', 'pengeluaran'),
                const SizedBox(width: 12),
                _tipeButton('Pemasukan', 'pemasukan'),
              ],
            ),
            const SizedBox(height: 24),

            _label('Judul'),
            TextField(controller: judulController, decoration: const InputDecoration(hintText: 'Misal: Makan Siang')),
            const SizedBox(height: 20),

            _label('Nominal (Rp)'),
            TextField(
              controller: nominalController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: '0'),
            ),
            const SizedBox(height: 20),

            _label('Kategori'),
            TextField(controller: kategoriController, decoration: const InputDecoration(hintText: 'Misal: Makanan')),
            const SizedBox(height: 20),

            _label('Catatan (Opsional)'),
            TextField(controller: catatanController, decoration: const InputDecoration(hintText: 'Tambahkan detail...')),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: loading ? null : handleSubmit,
              child: loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8.0, left: 4),
        child: Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      );

  Widget _tipeButton(String label, String value) {
    final isSelected = tipe == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => tipe = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? (value == 'pemasukan' ? AppTheme.success : AppTheme.danger) : AppTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isSelected ? Colors.transparent : AppTheme.border),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}