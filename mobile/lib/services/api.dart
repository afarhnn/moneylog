import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Ganti dengan IP lo kalau test di HP fisik
const String baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:8000');

// ============ AUTH ============
Future<String?> getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}

Future<String?> getNama() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('nama');
}

Future<void> saveToken(String token, String nama) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('token', token);
  await prefs.setString('nama', nama);
}

Future<void> clearToken() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.remove('token');
  await prefs.remove('nama');
}

Future<Map<String, String>> getHeaders() async {
  final token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token'
  };
}

Future<bool> register(String nama, String email, String password) async {
  final res = await http.post(
    Uri.parse('$baseUrl/auth/register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'nama': nama, 'email': email, 'password': password}),
  );
  return res.statusCode == 200;
}

Future<bool> login(String email, String password) async {
  final res = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    await saveToken(data['access_token'], data['nama']);
    return true;
  }
  return false;
}

// ============ TRANSAKSI ============
Future<List<Map<String, dynamic>>> getTransactions() async {
  final headers = await getHeaders();
  final res = await http.get(Uri.parse('$baseUrl/transactions/'), headers: headers);
  if (res.statusCode == 200) {
    final List data = jsonDecode(res.body);
    return data.cast<Map<String, dynamic>>();
  }
  return [];
}

Future<bool> createTransaction(Map<String, dynamic> data) async {
  final headers = await getHeaders();
  final res = await http.post(
    Uri.parse('$baseUrl/transactions/'),
    headers: headers,
    body: jsonEncode(data),
  );
  return res.statusCode == 200;
}

Future<bool> deleteTransaction(int id) async {
  final headers = await getHeaders();
  final res = await http.delete(Uri.parse('$baseUrl/transactions/$id'), headers: headers);
  return res.statusCode == 200;
}

// ============ BUDGET ============
Future<List<Map<String, dynamic>>> getBudgets() async {
  final headers = await getHeaders();
  final res = await http.get(Uri.parse('$baseUrl/budgets/'), headers: headers);
  if (res.statusCode == 200) {
    final List data = jsonDecode(res.body);
    return data.cast<Map<String, dynamic>>();
  }
  return [];
}

Future<bool> createBudget(String kategori, double limit) async {
  final headers = await getHeaders();
  final res = await http.post(
    Uri.parse('$baseUrl/budgets/'),
    headers: headers,
    body: jsonEncode({'kategori': kategori, 'limit_nominal': limit}),
  );
  return res.statusCode == 200;
}

Future<bool> deleteBudget(int id) async {
  final headers = await getHeaders();
  final res = await http.delete(Uri.parse('$baseUrl/budgets/$id'), headers: headers);
  return res.statusCode == 200;
}

// ============ AI INSIGHT ============
Future<String> getAIInsight() async {
  final headers = await getHeaders();
  final res = await http.get(Uri.parse('$baseUrl/ai/insight'), headers: headers);
  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    return data['insight'] ?? 'Tidak ada insight';
  }
  return 'Gagal memuat insight';
}

// ============ LAPORAN ============
Future<Map<String, dynamic>> getLaporan(int bulan, int tahun) async {
  final headers = await getHeaders();
  final res = await http.get(
    Uri.parse('$baseUrl/laporan/bulanan?bulan=$bulan&tahun=$tahun'),
    headers: headers,
  );
  if (res.statusCode == 200) return jsonDecode(res.body);
  return {};
}