import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../models/transaction.dart';

class TransactionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Transaction> _transactions = [];
  bool _isLoading = false;
  String? _error;

  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get totalPemasukan => _transactions
      .filter((t) => t.tipe == 'pemasukan')
      .fold(0.0, (sum, item) => sum + item.nominal);

  double get totalPengeluaran => _transactions
      .filter((t) => t.tipe == 'pengeluaran')
      .fold(0.0, (sum, item) => sum + item.nominal);

  double get saldo => totalPemasukan - totalPengeluaran;

  Future<void> fetchTransactions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await _api.getTransactions();
      _transactions = data.map((item) => Transaction.fromJson(item)).toList();
      _transactions.sort((a, b) => b.tanggal.compareTo(a.tanggal));
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addTransaction(Map<String, dynamic> data) async {
    await _api.createTransaction(data);
    await fetchTransactions();
  }

  Future<void> updateTransaction(int id, Map<String, dynamic> data) async {
    await _api.updateTransaction(id, data);
    await fetchTransactions();
  }

  Future<void> deleteTransaction(int id) async {
    await _api.deleteTransaction(id);
    await fetchTransactions();
  }
}

extension ListFilter<T> on List<T> {
  Iterable<T> filter(bool Function(T) test) => where(test);
}
