import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF6366F1);
  static const Color accent = Color(0xFF818CF8);
  static const Color success = Color(0xFF10B981);
  static const Color danger = Color(0xFFF87171);
  static const Color warning = Color(0xFFF59E0B);
  
  static const Color background = Color(0xFF0A0A0F);
  static const Color surface = Color(0xFF16161F);
  static const Color border = Color(0xFF2D2D3A);
  
  static const Color textPrimary = Colors.white;
  static final Color textSecondary = Colors.white.withOpacity(0.6);

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: accent,
      surface: surface,
      onSurface: textPrimary,
      error: danger,
    ),
    scaffoldBackgroundColor: background,
    cardTheme: CardThemeData(
      color: surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        elevation: 0,
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
    ),
  );
}
