import 'package:flutter/material.dart';

class MoneyLogBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MoneyLogBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C2E),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.transparent,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: Colors.white38,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Text('📊', style: TextStyle(fontSize: 22)), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Text('💳', style: TextStyle(fontSize: 22)), label: 'Transaksi'),
          BottomNavigationBarItem(icon: Text('🎯', style: TextStyle(fontSize: 22)), label: 'Budget'),
          BottomNavigationBarItem(icon: Text('🤖', style: TextStyle(fontSize: 22)), label: 'AI'),
        ],
      ),
    );
  }
}