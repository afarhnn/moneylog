import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/savings_provider.dart';
import '../../utils/format.dart';
import '../../core/theme.dart';
import '../../widgets/bottom_nav.dart';
import '../../models/savings.dart';
import 'goal_detail_screen.dart';

class SavingsScreen extends StatefulWidget {
  const SavingsScreen({super.key});

  @override
  State<SavingsScreen> createState() => _SavingsScreenState();
}

class _SavingsScreenState extends State<SavingsScreen> {
  final int _currentIndex = 5; // New index for Savings

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SavingsProvider>().fetchWallets();
    });
  }

  void _onNavTap(int index) {
    if (index == _currentIndex) return;
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
      case 4: Navigator.pushReplacementNamed(context, '/laporan'); break;
    }
  }

  void _showAddWalletDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tambah Dompet Tabungan'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Misal: Tabungan Masa Depan'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              if (controller.text.isNotEmpty) {
                await context.read<SavingsProvider>().addWallet(controller.text);
                if (mounted) Navigator.pop(context);
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final savings = context.watch<SavingsProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Savings & Goals', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: _showAddWalletDialog,
            icon: const Icon(Icons.add_business_outlined, color: AppTheme.primary),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => savings.fetchWallets(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryHeader(savings),
              const SizedBox(height: 32),
              const Text('Dompet Tabungan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (savings.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (savings.wallets.isEmpty)
                _buildEmptyState()
              else
                ...savings.wallets.map((wallet) => _buildWalletCard(wallet)),
            ],
          ),
        ),
      ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddGoalSheet(context),
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.stars, color: Colors.white),
      ),
    );
  }

  Widget _buildSummaryHeader(SavingsProvider savings) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.accent]),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Total Semua Tabungan', style: TextStyle(color: Colors.white70, fontSize: 14)),
          const SizedBox(height: 8),
          Text(
            AppFormat.rupiah(savings.totalSavings),
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _summarySmallItem('Aktif', '${savings.wallets.length} Dompet'),
              const SizedBox(width: 24),
              _summarySmallItem('Target', '${savings.wallets.fold(0, (sum, w) => sum + w.goals.length)} Goals'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summarySmallItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildWalletCard(SavingsWallet wallet) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(wallet.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Text(AppFormat.rupiah(wallet.balance), style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 12),
          if (wallet.goals.isEmpty)
            _buildNoGoalsForWallet()
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: wallet.goals.map((goal) => _buildGoalCard(goal)).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildGoalCard(SavingsGoal goal) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => GoalDetailScreen(goal: goal)),
      ),
      child: Container(
        width: 200,
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(goal.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: goal.progress,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: AlwaysStoppedAnimation<Color>(goal.achieved ? AppTheme.success : AppTheme.primary),
              minHeight: 6,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${(goal.progress * 100).toStringAsFixed(0)}%', style: const TextStyle(fontSize: 11)),
                Text(AppFormat.rupiah(goal.targetAmount), style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Text('🪙', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 16),
          Text('Belum ada tabungan', style: TextStyle(color: AppTheme.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildNoGoalsForWallet() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border.withOpacity(0.5), style: BorderStyle.solid),
      ),
      child: const Center(child: Text('Belum ada target impian di dompet ini', style: TextStyle(fontSize: 12, color: Colors.grey))),
    );
  }

  void _showAddGoalSheet(BuildContext context) {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    int? selectedWalletId;
    final wallets = context.read<SavingsProvider>().wallets;

    if (wallets.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Buat dompet tabungan dulu!')));
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom + 24, top: 24, left: 24, right: 24),
          decoration: const BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🎯 Buat Target Impian', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              const Text('Pilih Dompet', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              DropdownButton<int>(
                value: selectedWalletId,
                isExpanded: true,
                hint: const Text('Pilih Dompet'),
                items: wallets.map((w) => DropdownMenuItem(value: w.id, child: Text(w.name))).toList(),
                onChanged: (v) => setModalState(() => selectedWalletId = v),
              ),
              const SizedBox(height: 16),
              const Text('Nama Target', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              TextField(controller: titleController, decoration: const InputDecoration(hintText: 'Misal: Beli Motor')),
              const SizedBox(height: 16),
              const Text('Nominal Target (Rp)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              TextField(controller: amountController, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: '0')),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (titleController.text.isNotEmpty && amountController.text.isNotEmpty && selectedWalletId != null) {
                    await context.read<SavingsProvider>().addGoal(selectedWalletId!, titleController.text, double.parse(amountController.text));
                    if (mounted) Navigator.pop(context);
                  }
                },
                child: const Text('Simpan Target'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
