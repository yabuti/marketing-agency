class NewsImageItem {
  final int id;
  final String url;
  final String description;

  NewsImageItem({required this.id, required this.url, required this.description});

  factory NewsImageItem.fromJson(Map<String, dynamic> json) {
    return NewsImageItem(
      id: json['id'] ?? 0,
      url: json['url'] ?? '',
      description: json['description'] ?? '',
    );
  }
}

class NewsModel {
  final int id;
  final String title;
  final String titleAm;
  final String titleOr;
  final String content;
  final String contentAm;
  final String contentOr;
  final String category;
  final String date;
  final List<NewsImageItem> images;

  NewsModel({
    required this.id,
    required this.title,
    required this.titleAm,
    required this.titleOr,
    required this.content,
    required this.contentAm,
    required this.contentOr,
    required this.category,
    required this.date,
    required this.images,
  });

  factory NewsModel.fromJson(Map<String, dynamic> json) {
    return NewsModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      titleAm: json['title_am'] ?? '',
      titleOr: json['title_or'] ?? '',
      content: json['content'] ?? '',
      contentAm: json['content_am'] ?? '',
      contentOr: json['content_or'] ?? '',
      category: json['category'] ?? '',
      date: json['created_at'] ?? json['date'] ?? '',
      images: (json['images'] as List<dynamic>? ?? [])
          .map((e) => NewsImageItem.fromJson(e))
          .toList(),
    );
  }
}
