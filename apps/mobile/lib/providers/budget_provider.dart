import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../models/budget.dart';

class BudgetProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Budget> _budgets = [];
  bool _isLoading = false;
  String? _error;

  List<Budget> get budgets => _budgets;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchBudgets() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await _api.getBudgets();
      _budgets = data.map((item) => Budget.fromJson(item)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addBudget(String kategori, double limit) async {
    await _api.createBudget(kategori, limit);
    await fetchBudgets();
  }

  Future<void> deleteBudget(int id) async {
    await _api.deleteBudget(id);
    await fetchBudgets();
  }
}
