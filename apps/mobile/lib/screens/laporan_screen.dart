import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../utils/format.dart';
import '../widgets/bottom_nav.dart';

class LaporanScreen extends StatefulWidget {
  const LaporanScreen({super.key});

  @override
  State<LaporanScreen> createState() => _LaporanScreenState();
}

class _LaporanScreenState extends State<LaporanScreen> {
  final int _currentIndex = 4;
  final ApiService _api = ApiService();
  bool _loading = true;
  List<dynamic> _history = [];
  Map<String, dynamic>? _currentReport;
  
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final history = await _api.getLaporanSemuaBulan();
      final current = await _api.getLaporanBulanan(_selectedMonth, _selectedYear);
      setState(() {
        _history = history;
        _currentReport = current;
      });
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  void _onNavTap(int index) {
    if (index == _currentIndex) return;
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 1: Navigator.pushReplacementNamed(context, '/transaksi'); break;
      case 2: Navigator.pushReplacementNamed(context, '/budget'); break;
      case 3: Navigator.pushReplacementNamed(context, '/ai'); break;
      case 5: Navigator.pushReplacementNamed(context, '/savings'); break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan Keuangan', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMonthSelector(),
                    const SizedBox(height: 24),
                    _buildSummaryCards(),
                    const SizedBox(height: 32),
                    const Text('Distribusi Pengeluaran', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _buildPieChart(),
                    const SizedBox(height: 32),
                    const Text('Tren 6 Bulan Terakhir', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _buildBarChart(),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: MoneyLogBottomNav(currentIndex: _currentIndex, onTap: _onNavTap),
    );
  }

  Widget _buildMonthSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () {
              setState(() {
                if (_selectedMonth == 1) {
                  _selectedMonth = 12;
                  _selectedYear--;
                } else {
                  _selectedMonth--;
                }
              });
              _fetchData();
            },
            icon: const Icon(Icons.chevron_left),
          ),
          Text(
            '${AppFormat.monthName(_selectedMonth)} $_selectedYear',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          IconButton(
            onPressed: () {
              setState(() {
                if (_selectedMonth == 12) {
                  _selectedMonth = 1;
                  _selectedYear++;
                } else {
                  _selectedMonth++;
                }
              });
              _fetchData();
            },
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    final income = _currentReport?['total_pemasukan'] ?? 0.0;
    final expense = _currentReport?['total_pengeluaran'] ?? 0.0;

    return Row(
      children: [
        Expanded(
          child: _summaryBox(
            'Pemasukan',
            AppFormat.rupiah(income),
            AppTheme.success,
            Icons.arrow_upward,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _summaryBox(
            'Pengeluaran',
            AppFormat.rupiah(expense),
            AppTheme.danger,
            Icons.arrow_downward,
          ),
        ),
      ],
    );
  }

  Widget _summaryBox(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 12),
          Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
          const SizedBox(height: 4),
          FittedBox(
            child: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildPieChart() {
    final categories = _currentReport?['kategori_pengeluaran'] as Map<String, dynamic>? ?? {};
    if (categories.isEmpty) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(32.0),
        child: Text('Tidak ada data pengeluaran bulan ini'),
      ));
    }

    final List<PieChartSectionData> sections = [];
    int i = 0;
    final colors = [AppTheme.primary, AppTheme.accent, Colors.orange, Colors.teal, Colors.pink];

    categories.forEach((key, value) {
      sections.add(PieChartSectionData(
        value: double.parse(value.toString()),
        title: '',
        color: colors[i % colors.length],
        radius: 40,
      ));
      i++;
    });

    return Container(
      height: 240,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sections: sections,
                centerSpaceRadius: 40,
                sectionsSpace: 2,
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: categories.entries.map((e) {
                  final index = categories.keys.toList().indexOf(e.key);
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Container(width: 10, height: 10, decoration: BoxDecoration(color: colors[index % colors.length], shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Expanded(child: Text(e.key, style: const TextStyle(fontSize: 11), overflow: TextOverflow.ellipsis)),
                        Text(AppFormat.rupiah(e.value), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBarChart() {
    if (_history.isEmpty) return const SizedBox();

    // Take last 6 months
    final data = _history.reversed.take(6).toList().reversed.toList();
    
    return Container(
      height: 240,
      padding: const EdgeInsets.only(top: 32, right: 20, left: 10, bottom: 10),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.border),
      ),
      child: BarChart(
        BarChartData(
          gridData: const FlGridData(show: false),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  if (value.toInt() >= 0 && value.toInt() < data.length) {
                    final month = data[value.toInt()]['bulan'];
                    return Text(AppFormat.monthName(month).substring(0, 3), style: const TextStyle(fontSize: 10));
                  }
                  return const SizedBox();
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          barGroups: List.generate(data.length, (i) {
            final expense = double.parse(data[i]['total_pengeluaran'].toString());
            return BarChartGroupData(
              x: i,
              barRods: [
                BarChartRodData(
                  toY: expense,
                  color: AppTheme.primary,
                  width: 14,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
