import 'package:flutter/material.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../widgets/bottom_nav.dart';

class AIScreen extends StatefulWidget {
  const AIScreen({super.key});

  @override
  State<AIScreen> createState() => _AIScreenState();
}

class _AIScreenState extends State<AIScreen> with SingleTickerProviderStateMixin {
  final int _currentIndex = 3;
  final ApiService _api = ApiService();
  String _insight = '';
  bool _loading = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _onNavTap(int index) {
    if (index == _currentIndex) return;
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 4: Navigator.pushReplacementNamed(context, '/laporan'); break;
      case 5: Navigator.pushReplacementNamed(context, '/savings'); break;
    }
  }

  Future<void> _fetchInsight() async {
    setState(() {
      _loading = true;
      _insight = '';
    });
    try {
      final result = await _api.getAIInsight();
      setState(() => _insight = result);
    } catch (e) {
      setState(() => _insight = 'Gagal memuat insight. Silakan coba lagi nanti.');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Financial Insight', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Hero
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  AnimatedBuilder(
                    animation: _pulseAnim,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _loading ? _pulseAnim.value : 1.0,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.accent]),
                            boxShadow: [
                              BoxShadow(color: AppTheme.primary.withOpacity(0.4), blurRadius: 20, spreadRadius: 2),
                            ],
                          ),
                          child: const Center(child: Text('🤖', style: TextStyle(fontSize: 40))),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'AI Advisor',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Menganalisis pola transaksi Anda untuk memberikan saran finansial terbaik.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _loading ? null : _fetchInsight,
                    child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Analisis Keuangan Saya ✨'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            if (_loading)
              Container(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    Text('AI sedang memproses data Anda...', style: TextStyle(color: AppTheme.textSecondary)),
                  ],
                ),
              )
            else if (_insight.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.auto_awesome, color: AppTheme.primary, size: 20),
                        const SizedBox(width: 10),
                        const Text('Insight Hari Ini', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _insight,
                      style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 15, height: 1.6),
                    ),
                  ],
                ),
              )
            else
              Row(
                children: [
                  Expanded(child: _featureSmallCard('📊', 'Analisis Pola')),
                  const SizedBox(width: 12),
                  Expanded(child: _featureSmallCard('💡', 'Tips Hemat')),
                  const SizedBox(width: 12),
                  Expanded(child: _featureSmallCard('🎯', 'Saran Budget')),
                ],
              ),
          ],
        ),
      ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _featureSmallCard(String icon, String label) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}