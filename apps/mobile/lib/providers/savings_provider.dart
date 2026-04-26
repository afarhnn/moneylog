import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../models/savings.dart';

class SavingsProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  List<SavingsWallet> _wallets = [];
  bool _isLoading = false;

  List<SavingsWallet> get wallets => _wallets;
  bool get isLoading => _isLoading;

  double get totalSavings => _wallets.fold(0, (sum, wallet) => sum + wallet.balance);

  Future<void> fetchWallets() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getSavingsWallets();
      _wallets = data.map((json) => SavingsWallet.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error fetching wallets: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addWallet(String name) async {
    try {
      await _api.createSavingsWallet(name);
      await fetchWallets();
    } catch (e) {
      debugPrint('Error adding wallet: $e');
      rethrow;
    }
  }

  Future<void> addGoal(int walletId, String title, double targetAmount, {String? imageUrl, DateTime? deadline}) async {
    try {
      await _api.createSavingsGoal({
        'wallet_id': walletId,
        'title': title,
        'target_amount': targetAmount,
        'image_url': imageUrl,
        'deadline': deadline?.toIso8601String(),
      });
      await fetchWallets();
    } catch (e) {
      debugPrint('Error adding goal: $e');
      rethrow;
    }
  }

  Future<void> addContribution(int goalId, double amount, String? note) async {
    try {
      await _api.addContribution(goalId, amount, note);
      await fetchWallets();
    } catch (e) {
      debugPrint('Error adding contribution: $e');
      rethrow;
    }
  }
}
