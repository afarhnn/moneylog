import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/budget_provider.dart';
import '../utils/format.dart';
import '../core/theme.dart';
import '../widgets/bottom_nav.dart';
import '../models/budget.dart';

class BudgetScreen extends StatefulWidget {
  const BudgetScreen({super.key});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  final int _currentIndex = 2;
  final kategoriController = TextEditingController();
  final limitController = TextEditingController();
  bool showForm = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BudgetProvider>().fetchBudgets();
    });
  }

  void _onNavTap(int index) {
    if (index == _currentIndex) return;
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
      case 4: Navigator.pushReplacementNamed(context, '/laporan'); break;
      case 5: Navigator.pushReplacementNamed(context, '/savings'); break;
    }
  }

  void _handleSave() async {
    if (kategoriController.text.isEmpty || limitController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi semua field!')));
      return;
    }
    await context.read<BudgetProvider>().addBudget(
      kategoriController.text,
      double.parse(limitController.text),
    );
    kategoriController.clear();
    limitController.clear();
    setState(() => showForm = false);
  }

  @override
  Widget build(BuildContext context) {
    final budgetProvider = context.watch<BudgetProvider>();
    final budgets = budgetProvider.budgets;
    
    final totalBudget = budgets.fold(0.0, (s, b) => s + b.limitNominal);
    final totalTerpakai = budgets.fold(0.0, (s, b) => s + b.terpakai);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budget Planner', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            onPressed: () => setState(() => showForm = !showForm),
            icon: Icon(showForm ? Icons.close : Icons.add_circle_outline, color: AppTheme.primary, size: 28),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => budgetProvider.fetchBudgets(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary Row
              if (budgets.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Row(
                    children: [
                      _summaryItem('Total', AppFormat.rupiah(totalBudget), AppTheme.primary),
                      _summaryItem('Sisa', AppFormat.rupiah(totalBudget - totalTerpakai), AppTheme.success),
                    ],
                  ),
                ),
              
              const SizedBox(height: 24),

              if (showForm) ...[
                const Text('Set Budget Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextField(controller: kategoriController, decoration: const InputDecoration(hintText: 'Kategori')),
                const SizedBox(height: 12),
                TextField(controller: limitController, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Limit Nominal')),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: _handleSave, child: const Text('Simpan Budget')),
                const SizedBox(height: 32),
              ],

              if (budgetProvider.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (budgets.isEmpty)
                Center(
                  child: Column(
                    children: [
                      const SizedBox(height: 60),
                      const Text('🎯', style: TextStyle(fontSize: 56)),
                      const SizedBox(height: 16),
                      Text('Belum ada budget', style: TextStyle(color: AppTheme.textSecondary)),
                    ],
                  ),
                )
              else
                ...budgets.map((b) => _budgetCard(b)),
            ],
          ),
        ),
      ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _summaryItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _budgetCard(Budget b) {
    final statusColor = b.persentase > 1.0 ? AppTheme.danger : (b.persentase > 0.8 ? AppTheme.warning : AppTheme.success);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(b.kategori, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              IconButton(
                onPressed: () => context.read<BudgetProvider>().deleteBudget(b.id),
                icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${AppFormat.rupiah(b.terpakai)} terpakai', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              Text('Limit: ${AppFormat.rupiah(b.limitNominal)}', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: b.persentase > 1.0 ? 1.0 : b.persentase,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              minHeight: 10,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${(b.persentase * 100).toStringAsFixed(0)}% dari budget terpakai',
            style: TextStyle(color: statusColor.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}