import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/client_model.dart';

class ClientDetailScreen extends StatelessWidget {
  final ClientModel client;

  const ClientDetailScreen({super.key, required this.client});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.blackLight,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppColors.black.withOpacity(0.5), shape: BoxShape.circle),
                child: const Icon(Icons.arrow_back, color: AppColors.white),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [AppColors.primary, AppColors.primaryLight], begin: Alignment.topLeft, end: Alignment.bottomRight),
                ),
                child: Center(child: Text(client.icon, style: const TextStyle(fontSize: 80))),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(client.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.white)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(50),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Text(client.category, style: const TextStyle(color: AppColors.primary, fontSize: 13)),
                  ),
                  const SizedBox(height: 24),
                  Text(client.fullDescription, style: const TextStyle(color: AppColors.gray, fontSize: 15, height: 1.7)),
                  const SizedBox(height: 24),
                  _buildInfoGrid(),
                  const SizedBox(height: 24),
                  _buildLicenseCard(),
                  const SizedBox(height: 24),
                  // Images
                  if (client.images.isNotEmpty) ...[
                    const Text('Our Marketing Work', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.white)),
                    const SizedBox(height: 4),
                    const Text('Social media content we created for this client', style: TextStyle(color: AppColors.gray, fontSize: 14)),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 280,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: client.images.length,
                        itemBuilder: (context, index) {
                          final img = client.images[index];
                          return GestureDetector(
                            onTap: () => _showImageViewer(context, index),
                            child: Container(
                              width: 220,
                              margin: const EdgeInsets.only(right: 12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        image: DecorationImage(image: NetworkImage(img.url), fit: BoxFit.cover),
                                      ),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(16),
                                          gradient: LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                                          ),
                                        ),
                                        alignment: Alignment.bottomLeft,
                                        padding: const EdgeInsets.all(12),
                                        child: const Row(
                                          children: [
                                            Icon(Icons.touch_app, color: Colors.white70, size: 16),
                                            SizedBox(width: 4),
                                            Text('Tap to view', style: TextStyle(color: Colors.white70, fontSize: 12)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(img.description, style: const TextStyle(color: AppColors.white, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 2, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  // Videos
                  if (client.videos.isNotEmpty) ...[
                    const Text('Video Content', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.white)),
                    const SizedBox(height: 4),
                    Text('${client.videos.length} promotional videos we created', style: const TextStyle(color: AppColors.gray, fontSize: 14)),
                    const SizedBox(height: 16),
                    ...client.videos.asMap().entries.map((entry) {
                      final video = entry.value;
                      return GestureDetector(
                        onTap: () => _playVideo(context, video.url, entry.key + 1, video.description),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.blackLighter,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 80, height: 80,
                                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                                child: const Icon(Icons.play_arrow, size: 40, color: AppColors.primary),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Video ${entry.key + 1}', style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text(video.description, style: const TextStyle(color: AppColors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                                    const SizedBox(height: 4),
                                    const Text('Tap to play', style: TextStyle(color: AppColors.gray, fontSize: 12)),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios, color: AppColors.gray, size: 16),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                  const SizedBox(height: 24),
                  // Promotion Paths
                  if (client.promotionPaths.isNotEmpty) ...[
                    const Text('🛣️ Promotion Paths', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.white)),
                    const SizedBox(height: 4),
                    Text('${client.promotionPaths.length} campaign${client.promotionPaths.length != 1 ? 's' : ''}', style: const TextStyle(color: AppColors.gray, fontSize: 14)),
                    const SizedBox(height: 16),
                    ...client.promotionPaths.map((path) => _buildPromotionPath(context, path)),
                  ],
                  const SizedBox(height: 24),
                  _buildContactCard(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.blackLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.08))),
      child: Column(
        children: [
          Row(children: [
            Expanded(child: _buildInfoItem('📅', 'Established', client.established)),
            Expanded(child: _buildInfoItem('📍', 'Location', client.location)),
          ]),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: _buildInfoItem('👥', 'Followers', client.followers)),
            Expanded(child: _buildInfoItem('📈', 'Growth', client.growth)),
          ]),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String icon, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$icon $label', style: const TextStyle(color: AppColors.gray, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value.isNotEmpty ? value : '—', style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600, fontSize: 14)),
      ],
    );
  }

  Widget _buildLicenseCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.accent.withOpacity(0.3), width: 2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(width: 50, height: 50, decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle), child: const Icon(Icons.verified, color: Colors.white, size: 28)),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Verified Licensed Business', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('All documents verified', style: TextStyle(color: AppColors.gray, fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildLicenseRow('📄 License Number', client.licenseNumber),
          _buildLicenseRow('✅ Status', 'Active & Verified', isActive: true),
        ],
      ),
    );
  }

  Widget _buildLicenseRow(String label, String value, {bool isActive = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.gray, fontSize: 14)),
          Text(value, style: TextStyle(color: isActive ? AppColors.accent : AppColors.white, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildContactCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: AppColors.blackLight, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.08))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('📞 Business Contact', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          if (client.location.isNotEmpty) _buildContactRow(Icons.location_on, client.location),
          if (client.phone.isNotEmpty) _buildContactRow(Icons.phone, client.phone),
          if (client.website != null && client.website!.isNotEmpty) _buildContactRow(Icons.language, client.website!),
        ],
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: const TextStyle(color: AppColors.gray, fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildPromotionPath(BuildContext context, PromotionPath path) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(path.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
                if (path.pathDate != null && path.pathDate!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text('📅 ${path.pathDate}', style: const TextStyle(color: AppColors.gray, fontSize: 13)),
                  ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _pathBadge('🖼️ ${path.images.length}/5 images'),
                    const SizedBox(width: 8),
                    _pathBadge('🎬 ${path.videos.length}/5 videos'),
                  ],
                ),
              ],
            ),
          ),
          // Path images
          if (path.images.isNotEmpty) ...[
            SizedBox(
              height: 160,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                itemCount: path.images.length,
                itemBuilder: (context, i) {
                  final img = path.images[i];
                  return GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => ImageViewerScreen(images: path.images.map((e) => e.url).toList(), initialIndex: i),
                    )),
                    child: Container(
                      width: 140,
                      margin: const EdgeInsets.only(right: 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        image: DecorationImage(image: NetworkImage(img.url), fit: BoxFit.cover),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
          // Path videos
          if (path.videos.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
              child: Column(
                children: path.videos.asMap().entries.map((entry) {
                  final video = entry.value;
                  return GestureDetector(
                    onTap: () => _playVideo(context, video.url, entry.key + 1, video.description),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.blackLighter,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withOpacity(0.06)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.play_arrow, color: AppColors.primary, size: 24),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(video.description.isNotEmpty ? video.description : 'Video ${entry.key + 1}',
                            style: const TextStyle(color: AppColors.white, fontSize: 13))),
                          const Icon(Icons.arrow_forward_ios, color: AppColors.gray, size: 14),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _pathBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Text(text, style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  void _showImageViewer(BuildContext context, int initialIndex) {
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => ImageViewerScreen(images: client.images.map((e) => e.url).toList(), initialIndex: initialIndex),
    ));
  }

  void _playVideo(BuildContext context, String videoUrl, int videoNumber, String description) {
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => VideoPlayerScreen(videoUrl: videoUrl, videoNumber: videoNumber, description: description),
    ));
  }
}

class ImageViewerScreen extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const ImageViewerScreen({super.key, required this.images, required this.initialIndex});

  @override
  State<ImageViewerScreen> createState() => _ImageViewerScreenState();
}

class _ImageViewerScreenState extends State<ImageViewerScreen> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text('${_currentIndex + 1} / ${widget.images.length}'),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: widget.images.length,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        itemBuilder: (context, index) => InteractiveViewer(
          child: Center(child: Image.network(widget.images[index], fit: BoxFit.contain)),
        ),
      ),
    );
  }
}

class VideoPlayerScreen extends StatelessWidget {
  final String videoUrl;
  final int videoNumber;
  final String description;

  const VideoPlayerScreen({super.key, required this.videoUrl, required this.videoNumber, required this.description});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.transparent, title: Text('Video $videoNumber'), centerTitle: true),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: double.infinity, height: 250,
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.blackLighter, borderRadius: BorderRadius.circular(16)),
              child: const Center(child: Icon(Icons.play_circle_fill, size: 80, color: AppColors.primary)),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(description, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.white)),
            ),
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text('Video playback requires a video player plugin in production.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.gray)),
            ),
          ],
        ),
      ),
    );
  }
}
