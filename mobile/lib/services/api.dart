import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/transaction.dart';

const String baseUrl = 'http://localhost:8000';

// Ambil token dari storage
Future<String?> getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}

// Simpan token ke storage
Future<void> saveToken(String token, String nama) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('token', token);
  await prefs.setString('nama', nama);
}

// Hapus token (logout)
Future<void> clearToken() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.remove('token');
  await prefs.remove('nama');
}

// Register
Future<bool> register(String nama, String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'nama': nama, 'email': email, 'password': password}),
  );
  return response.statusCode == 200;
}

// Login
Future<bool> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    await saveToken(data['access_token'], data['nama']);
    return true;
  }
  return false;
}

// Ambil semua transaksi
Future<List<Transaction>> getTransactions() async {
  final token = await getToken();
  final response = await http.get(
    Uri.parse('$baseUrl/transactions/'),
    headers: {'Authorization': 'Bearer $token'},
  );
  if (response.statusCode == 200) {
    final List data = jsonDecode(response.body);
    return data.map((t) => Transaction.fromJson(t)).toList();
  }
  return [];
}

// Tambah transaksi
Future<bool> createTransaction(Map<String, dynamic> data) async {
  final token = await getToken();
  final response = await http.post(
    Uri.parse('$baseUrl/transactions/'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json'
    },
    body: jsonEncode(data),
  );
  return response.statusCode == 200;
}

// Hapus transaksi
Future<bool> deleteTransaction(int id) async {
  final token = await getToken();
  final response = await http.delete(
    Uri.parse('$baseUrl/transactions/$id'),
    headers: {'Authorization': 'Bearer $token'},
  );
  return response.statusCode == 200;
}