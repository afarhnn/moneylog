class Transaction {
  final int id;
  final int userId;
  final String judul;
  final double nominal;
  final String tipe;
  final String kategori;
  final String? catatan;
  final DateTime tanggal;

  Transaction({
    required this.id,
    required this.userId,
    required this.judul,
    required this.nominal,
    required this.tipe,
    required this.kategori,
    this.catatan,
    required this.tanggal,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      userId: json['user_id'],
      judul: json['judul'],
      nominal: json['nominal'].toDouble(),
      tipe: json['tipe'],
      kategori: json['kategori'],
      catatan: json['catatan'],
      tanggal: DateTime.parse(json['tanggal']),
    );
  }
}