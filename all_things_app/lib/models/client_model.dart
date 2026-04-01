class ClientMediaItem {
  final int id;
  final String url;
  final String description;

  ClientMediaItem({required this.id, required this.url, required this.description});

  factory ClientMediaItem.fromJson(Map<String, dynamic> json) {
    return ClientMediaItem(
      id: json['id'] ?? 0,
      url: json['url'] ?? '',
      description: json['description'] ?? '',
    );
  }
}

class PromotionPath {
  final int id;
  final String title;
  final String? pathDate;
  final List<ClientMediaItem> images;
  final List<ClientMediaItem> videos;

  PromotionPath({
    required this.id,
    required this.title,
    this.pathDate,
    required this.images,
    required this.videos,
  });

  factory PromotionPath.fromJson(Map<String, dynamic> json) {
    return PromotionPath(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      pathDate: json['path_date'],
      images: (json['images'] as List<dynamic>? ?? [])
          .map((e) => ClientMediaItem.fromJson(e))
          .toList(),
      videos: (json['videos'] as List<dynamic>? ?? [])
          .map((e) => ClientMediaItem.fromJson(e))
          .toList(),
    );
  }
}

class ClientModel {
  final int id;
  final String name;
  final String category;
  final String businessType;
  final String icon;
  final String description;
  final String fullDescription;
  final String established;
  final String location;
  final String licenseNumber;
  final String phone;
  final String? tinNumber;
  final String? businessLicenseNumber;
  final String? website;
  final String? facebook;
  final String? instagram;
  final String? tiktok;
  final String? telegram;
  final String followers;
  final String growth;
  final String engagement;
  final bool isActive;
  final List<ClientMediaItem> images;
  final List<ClientMediaItem> videos;
  final List<PromotionPath> promotionPaths;

  ClientModel({
    required this.id,
    required this.name,
    required this.category,
    required this.businessType,
    required this.icon,
    required this.description,
    required this.fullDescription,
    required this.established,
    required this.location,
    required this.licenseNumber,
    required this.phone,
    this.tinNumber,
    this.businessLicenseNumber,
    this.website,
    this.facebook,
    this.instagram,
    this.tiktok,
    this.telegram,
    required this.followers,
    required this.growth,
    required this.engagement,
    required this.isActive,
    required this.images,
    required this.videos,
    required this.promotionPaths,
  });

  factory ClientModel.fromJson(Map<String, dynamic> json) {
    return ClientModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      businessType: json['business_type'] ?? '',
      icon: json['icon'] ?? '🏢',
      description: json['description'] ?? '',
      fullDescription: json['full_description'] ?? '',
      established: json['established'] ?? '',
      location: json['location'] ?? '',
      licenseNumber: json['license_number'] ?? '',
      phone: json['phone'] ?? '',
      tinNumber: json['tin_number'],
      businessLicenseNumber: json['business_license_number'],
      website: json['website'],
      facebook: json['facebook'],
      instagram: json['instagram'],
      tiktok: json['tiktok'],
      telegram: json['telegram'],
      followers: json['followers'] ?? '0',
      growth: json['growth'] ?? '0%',
      engagement: json['engagement'] ?? '0%',
      isActive: (json['is_active'] ?? 1) == 1,
      images: (json['images'] as List<dynamic>? ?? [])
          .map((e) => ClientMediaItem.fromJson(e))
          .toList(),
      videos: (json['videos'] as List<dynamic>? ?? [])
          .map((e) => ClientMediaItem.fromJson(e))
          .toList(),
      promotionPaths: (json['promotionPaths'] as List<dynamic>? ?? [])
          .map((e) => PromotionPath.fromJson(e))
          .toList(),
    );
  }
}
