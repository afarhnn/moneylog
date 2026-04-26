class Budget {
  final int id;
  final int userId;
  final String kategori;
  final double limitNominal;
  final double terpakai;

  Budget({
    required this.id,
    required this.userId,
    required this.kategori,
    required this.limitNominal,
    required this.terpakai,
  });

  factory Budget.fromJson(Map<String, dynamic> json) {
    return Budget(
      id: json['id'],
      userId: json['user_id'],
      kategori: json['kategori'],
      limitNominal: (json['limit_nominal'] as num).toDouble(),
      terpakai: (json['terpakai'] as num).toDouble(),
    );
  }

  double get persentase => limitNominal > 0 ? (terpakai / limitNominal) : 0;
}
