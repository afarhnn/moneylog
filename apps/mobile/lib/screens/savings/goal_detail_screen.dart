import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/savings_provider.dart';
import '../../utils/format.dart';
import '../../core/theme.dart';
import '../../models/savings.dart';

class GoalDetailScreen extends StatefulWidget {
  final SavingsGoal goal;
  const GoalDetailScreen({super.key, required this.goal});

  @override
  State<GoalDetailScreen> createState() => _GoalDetailScreenState();
}

class _GoalDetailScreenState extends State<GoalDetailScreen> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();

  void _showAddContributionSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom + 24, top: 24, left: 24, right: 24),
        decoration: const BoxDecoration(color: AppTheme.background, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🪙 Tambah Tabungan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            const Text('Nominal (Rp)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            TextField(controller: _amountController, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: '0')),
            const SizedBox(height: 16),
            const Text('Catatan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            TextField(controller: _noteController, decoration: const InputDecoration(hintText: 'Misal: Sisa uang jajan')),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () async {
                if (_amountController.text.isNotEmpty) {
                  await context.read<SavingsProvider>().addContribution(
                    widget.goal.id,
                    double.parse(_amountController.text),
                    _noteController.text,
                  );
                  if (mounted) {
                    Navigator.pop(context);
                    _amountController.clear();
                    _noteController.clear();
                  }
                }
              },
              child: const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Re-fetch goal data from provider to get updates
    final wallet = context.watch<SavingsProvider>().wallets.firstWhere((w) => w.id == widget.goal.walletId);
    final goal = wallet.goals.firstWhere((g) => g.id == widget.goal.id);

    return Scaffold(
      appBar: AppBar(title: Text(goal.title)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildGoalHeader(goal),
            const SizedBox(height: 32),
            const Text('Riwayat Menabung', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (goal.contributions.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Belum ada riwayat menabung')))
            else
              ...goal.contributions.reversed.map((c) => _buildContributionItem(c)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddContributionSheet,
        label: const Text('Menabung', style: TextStyle(color: Colors.white)),
        icon: const Icon(Icons.add, color: Colors.white),
        backgroundColor: AppTheme.primary,
      ),
    );
  }

  Widget _buildGoalHeader(SavingsGoal goal) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          if (goal.achieved)
            const Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Text('🎉 Target Tercapai!', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold, fontSize: 18)),
            ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _headerInfo('Terkumpul', AppFormat.rupiah(goal.currentAmount)),
              _headerInfo('Target', AppFormat.rupiah(goal.targetAmount)),
            ],
          ),
          const SizedBox(height: 24),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: goal.progress,
              minHeight: 12,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: AlwaysStoppedAnimation<Color>(goal.achieved ? AppTheme.success : AppTheme.primary),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${(goal.progress * 100).toStringAsFixed(1)}% Terpenuhi',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (!goal.achieved)
            Text(
              'Butuh ${AppFormat.rupiah(goal.targetAmount - goal.currentAmount)} lagi',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
            ),
        ],
      ),
    );
  }

  Widget _headerInfo(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildContributionItem(Contribution contribution) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(Icons.add, color: AppTheme.primary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppFormat.rupiah(contribution.amount), style: const TextStyle(fontWeight: FontWeight.bold)),
                if (contribution.note != null && contribution.note!.isNotEmpty)
                  Text(contribution.note!, style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          Text(AppFormat.date(contribution.createdAt), style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
        ],
      ),
    );
  }
}
