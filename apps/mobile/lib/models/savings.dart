class SavingsWallet {
  final int id;
  final String name;
  final double balance;
  final DateTime createdAt;
  final List<SavingsGoal> goals;

  SavingsWallet({
    required this.id,
    required this.name,
    required this.balance,
    required this.createdAt,
    this.goals = const [],
  });

  factory SavingsWallet.fromJson(Map<String, dynamic> json) {
    return SavingsWallet(
      id: json['id'],
      name: json['name'],
      balance: (json['balance'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      goals: (json['goals'] as List?)
              ?.map((e) => SavingsGoal.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class SavingsGoal {
  final int id;
  final int walletId;
  final String title;
  final double targetAmount;
  final double currentAmount;
  final String? imageUrl;
  final DateTime? deadline;
  final int isAchieved;
  final DateTime createdAt;
  final List<Contribution> contributions;

  SavingsGoal({
    required this.id,
    required this.walletId,
    required this.title,
    required this.targetAmount,
    required this.currentAmount,
    this.imageUrl,
    this.deadline,
    required this.isAchieved,
    required this.createdAt,
    this.contributions = const [],
  });

  double get progress => targetAmount > 0 ? currentAmount / targetAmount : 0;
  bool get achieved => isAchieved == 1 || currentAmount >= targetAmount;

  factory SavingsGoal.fromJson(Map<String, dynamic> json) {
    return SavingsGoal(
      id: json['id'],
      walletId: json['wallet_id'],
      title: json['title'],
      targetAmount: (json['target_amount'] as num).toDouble(),
      currentAmount: (json['current_amount'] as num).toDouble(),
      imageUrl: json['image_url'],
      deadline: json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      isAchieved: json['is_achieved'],
      createdAt: DateTime.parse(json['created_at']),
      contributions: (json['contributions'] as List?)
              ?.map((e) => Contribution.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Contribution {
  final int id;
  final int goalId;
  final double amount;
  final String? note;
  final DateTime createdAt;

  Contribution({
    required this.id,
    required this.goalId,
    required this.amount,
    this.note,
    required this.createdAt,
  });

  factory Contribution.fromJson(Map<String, dynamic> json) {
    return Contribution(
      id: json['id'],
      goalId: json['goal_id'],
      amount: (json['amount'] as num).toDouble(),
      note: json['note'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
