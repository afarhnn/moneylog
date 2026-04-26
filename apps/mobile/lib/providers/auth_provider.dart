import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  String? _nama;
  bool _isLoading = false;

  String? get nama => _nama;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _nama != null;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    _nama = prefs.getString('nama');
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.login(email, password);
      _nama = data['nama'];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String nama, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _api.register(nama, email, password);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _api.logout();
    _nama = null;
    notifyListeners();
  }
}
