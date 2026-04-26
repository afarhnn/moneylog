import 'package:intl/intl.dart';

class AppFormat {
  static String rupiah(dynamic amount) {
    final val = double.tryParse(amount.toString()) ?? 0;
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    ).format(val);
  }

  static String date(DateTime date) {
    return DateFormat('dd MMM yyyy', 'id_ID').format(date);
  }

  static String monthYear(DateTime date) {
    return DateFormat('MMMM yyyy', 'id_ID').format(date);
  }

  static String monthName(int month) {
    final date = DateTime(2024, month);
    return DateFormat('MMMM', 'id_ID').format(date);
  }
}
