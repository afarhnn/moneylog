import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  Future<String?> _getToken() async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    return _token;
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['access_token']);
      await prefs.setString('nama', data['nama']);
      _token = data['access_token'];
      return data;
    } else {
      throw Exception(data['detail'] ?? 'Login gagal');
    }
  }

  Future<void> register(String nama, String email, String password) async {
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nama': nama, 'email': email, 'password': password}),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['detail'] ?? 'Registrasi gagal');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('nama');
    _token = null;
  }

  // Transactions
  Future<List<dynamic>> getTransactions() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/transactions/'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat transaksi');
    }
  }

  Future<void> createTransaction(Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/transactions/'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal menambah transaksi');
    }
  }

  Future<void> updateTransaction(int id, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('${AppConfig.baseUrl}/transactions/$id'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal memperbarui transaksi');
    }
  }

  Future<void> deleteTransaction(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('${AppConfig.baseUrl}/transactions/$id'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal menghapus transaksi');
    }
  }

  // Budgets
  Future<List<dynamic>> getBudgets() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/budgets/'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat budget');
    }
  }

  Future<void> createBudget(String kategori, double limit) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/budgets/'),
      headers: headers,
      body: jsonEncode({'kategori': kategori, 'limit_nominal': limit}),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal membuat budget');
    }
  }

  Future<void> deleteBudget(int id) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('${AppConfig.baseUrl}/budgets/$id'),
      headers: headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal menghapus budget');
    }
  }

  // AI
  Future<String> getAIInsight() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/ai/insight'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['insight'] ?? 'Tidak ada insight';
    } else {
      throw Exception('Gagal memuat AI insight');
    }
  }

  // Laporan
  Future<List<dynamic>> getLaporanSemuaBulan() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/laporan/semua-bulan'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat data laporan');
    }
  }

  Future<Map<String, dynamic>> getLaporanBulanan(int bulan, int tahun) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/laporan/bulanan?bulan=$bulan&tahun=$tahun'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat laporan bulanan');
    }
  }

  // Savings
  Future<List<dynamic>> getSavingsWallets() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/savings/wallets'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat data tabungan');
    }
  }

  Future<void> createSavingsWallet(String name) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/savings/wallets'),
      headers: headers,
      body: jsonEncode({'name': name}),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal membuat dompet tabungan');
    }
  }

  Future<void> createSavingsGoal(Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/savings/goals'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal membuat target impian');
    }
  }

  Future<void> addContribution(int goalId, double amount, String? note) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${AppConfig.baseUrl}/savings/contributions'),
      headers: headers,
      body: jsonEncode({
        'goal_id': goalId,
        'amount': amount,
        'note': note,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal menambah tabungan');
    }
  }
}
