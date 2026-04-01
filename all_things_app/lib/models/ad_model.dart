class AdModel {
  final int id;
  final String title;
  final String type; // 'general', 'holiday', 'company'
  final String? holidayName;
  final String? imageUrl;
  final String? linkUrl;
  final int durationSec;
  final String? companyName;

  AdModel({
    required this.id,
    required this.title,
    required this.type,
    this.holidayName,
    this.imageUrl,
    this.linkUrl,
    required this.durationSec,
    this.companyName,
  });

  factory AdModel.fromJson(Map<String, dynamic> json) {
    return AdModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      type: json['type'] ?? 'general',
      holidayName: json['holiday_name'],
      imageUrl: json['image_url'],
      linkUrl: json['link_url'],
      durationSec: json['duration_sec'] ?? 15,
      companyName: json['company_name'],
    );
  }
}
