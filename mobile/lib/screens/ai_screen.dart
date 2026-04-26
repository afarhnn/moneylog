import 'package:flutter/material.dart';
import '../services/api.dart';
import '../widgets/bottom_nav.dart';

class AIScreen extends StatefulWidget {
  const AIScreen({super.key});

  @override
  State<AIScreen> createState() => _AIScreenState();
}

class _AIScreenState extends State<AIScreen> with SingleTickerProviderStateMixin {
  String insight = '';
  bool loading = false;
  int _currentIndex = 3;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void fetchInsight() async {
    setState(() { loading = true; insight = ''; });
    final result = await getAIInsight();
    setState(() { insight = result; loading = false; });
  }

  void _onNavTap(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 3: break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C1C2E),
        title: const Text('🤖 AI Insight',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF6366F1).withOpacity(0.2),
                    const Color(0xFF818CF8).withOpacity(0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  // AI Icon dengan animasi
                  AnimatedBuilder(
                    animation: _pulseAnim,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: loading ? _pulseAnim.value : 1.0,
                        child: Container(
                          width: 80, height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6366F1).withOpacity(0.4),
                                blurRadius: 20, spreadRadius: 2,
                              )
                            ],
                          ),
                          child: const Center(
                            child: Text('🤖', style: TextStyle(fontSize: 36)),
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text('AI Financial Insight',
                    style: TextStyle(color: Colors.white, fontSize: 20,
                      fontWeight: FontWeight.w700, letterSpacing: -0.5)),
                  const SizedBox(height: 8),
                  Text(
                    'AI akan menganalisis semua transaksi kamu dan memberikan insight mendalam',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: loading ? null : fetchInsight,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        disabledBackgroundColor: const Color(0xFF6366F1).withOpacity(0.5),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                        elevation: 8,
                        shadowColor: const Color(0xFF6366F1).withOpacity(0.4),
                      ),
                      child: Text(
                        loading ? '⏳ Menganalisis...' : '✨ Generate AI Insight',
                        style: const TextStyle(color: Colors.white,
                          fontWeight: FontWeight.w600, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Loading
            if (loading) ...[
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF1C1C2E),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(3, (i) =>
                        TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0.0, end: 1.0),
                          duration: Duration(milliseconds: 600 + (i * 200)),
                          builder: (ctx, val, _) {
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: 10, height: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF6366F1).withOpacity(val),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text('AI sedang menganalisis keuangan kamu...',
                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    Text('Biasanya 5-15 detik',
                      style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
                  ],
                ),
              ),
            ],

            // Result
            if (!loading && insight.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1C1C2E),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
                            ),
                          ),
                          child: const Center(child: Text('🤖', style: TextStyle(fontSize: 18))),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('AI Insight',
                              style: TextStyle(color: Colors.white,
                                fontWeight: FontWeight.w600, fontSize: 14)),
                            Text(
                              DateTime.now().toLocal().toString().substring(0, 10),
                              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        insight,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.85),
                          fontSize: 13, height: 1.7,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextButton.icon(
                      onPressed: fetchInsight,
                      icon: const Icon(Icons.refresh, size: 16, color: Color(0xFF6366F1)),
                      label: const Text('Generate Ulang',
                        style: TextStyle(color: Color(0xFF6366F1), fontSize: 13)),
                    ),
                  ],
                ),
              ),
            ],

            // Empty state
            if (!loading && insight.isEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: _featureCard('📊', 'Analisis Pola', 'AI analisis kebiasaan belanja kamu')),
                  const SizedBox(width: 12),
                  Expanded(child: _featureCard('💡', 'Saran Hemat', 'Saran konkret untuk hemat lebih')),
                ],
              ),
              const SizedBox(height: 12),
              _featureCard('🎯', 'Budget Tips', 'Rekomendasi alokasi budget optimal'),
            ],
          ],
        ),
      ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _featureCard(String icon, String title, String desc) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.white,
            fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 4),
          Text(desc, style: TextStyle(color: Colors.white.withOpacity(0.4),
            fontSize: 11, height: 1.4)),
        ],
      ),
    );
  }
}