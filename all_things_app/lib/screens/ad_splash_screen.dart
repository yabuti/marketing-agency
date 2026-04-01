import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/ad_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class AdSplashScreen extends StatefulWidget {
  const AdSplashScreen({super.key});

  @override
  State<AdSplashScreen> createState() => _AdSplashScreenState();
}

class _AdSplashScreenState extends State<AdSplashScreen> {
  List<AdModel> _ads = [];
  int _currentAdIndex = 0;
  int _countdown = 5;
  bool _loading = true;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _loadAds();
  }

  Future<void> _loadAds() async {
    final ads = await ApiService.getActiveAds();
    if (!mounted) return;

    if (ads.isEmpty) {
      _goToApp();
      return;
    }

    setState(() {
      _ads = ads;
      _countdown = 5; // 5s per banner, 3 banners = 15s total
      _loading = false;
    });

    _startCountdown();
    if (ads.length > 1) _startRotation();
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
  void _startCountdown() {
    _countdownTimer?.cancel();
    setState(() {
      _countdown = 5; // always 5 seconds per banner
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) { timer.cancel(); return; }
      setState(() {
        _countdown--;
        if (_countdown <= 0) {
          timer.cancel();
          // Move to next banner or finish
          final nextIndex = _currentAdIndex + 1;
          if (nextIndex >= _ads.length) {
            _goToApp();
          } else {
            _currentAdIndex = nextIndex;
            _startCountdown();
          }
        }
      });
    });
  }

  void _startRotation() {
    // Rotation is now handled inside _startCountdown — no separate timer needed
  }

  void _goToApp() {
    _countdownTimer?.cancel();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  Future<void> _openLink(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: AppColors.black,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final ad = _ads[_currentAdIndex];
    final progress = _countdown / ad.durationSec;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Full-screen ad image
          GestureDetector(
            onTap: () => _openLink(ad.linkUrl),
            child: ad.imageUrl != null
                ? Image.network(
                    ad.imageUrl!,
                    fit: BoxFit.cover,
                    loadingBuilder: (ctx, child, progress) {
                      if (progress == null) return child;
                      return Container(
                        color: AppColors.black,
                        child: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                      );
                    },
                    errorBuilder: (_, __, ___) => _buildFallbackAd(ad),
                  )
                : _buildFallbackAd(ad),
          ),

          // Dark gradient overlay at top and bottom
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xCC000000),
                  Colors.transparent,
                  Colors.transparent,
                  Color(0xDD000000),
                ],
                stops: [0.0, 0.2, 0.7, 1.0],
              ),
            ),
          ),

          // Top bar: branding + ad indicator dots
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Row(
                  children: [
                    // Logo
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                        children: [
                          TextSpan(text: 'All ', style: TextStyle(color: Colors.white)),
                          TextSpan(text: 'Things', style: TextStyle(color: AppColors.primary)),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Ad dots (rotation indicator)
                    if (_ads.length > 1)
                      Row(
                        children: List.generate(_ads.length, (i) => Container(
                          width: i == _currentAdIndex ? 20 : 6,
                          height: 6,
                          margin: const EdgeInsets.only(left: 4),
                          decoration: BoxDecoration(
                            color: i < _currentAdIndex
                                ? const Color(0xFF22C55E)   // completed = green
                                : i == _currentAdIndex
                                    ? AppColors.primary     // current = orange
                                    : Colors.white24,       // upcoming = dim
                            borderRadius: BorderRadius.circular(3),
                          ),
                        )),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom bar: ad info + countdown (no skip)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // "Ad X of 3" badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.primary.withOpacity(0.5)),
                      ),
                      child: Text(
                        '📢 Ad ${_currentAdIndex + 1} of ${_ads.length}',
                        style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // "Please watch" message + countdown
                    Row(
                      children: [
                        // Circular countdown
                        SizedBox(
                          width: 52,
                          height: 52,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CircularProgressIndicator(
                                value: _countdown / 5,
                                backgroundColor: Colors.white12,
                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                                strokeWidth: 4,
                              ),
                              Center(
                                child: Text(
                                  '$_countdown',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Please watch the ad to continue', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                              SizedBox(height: 2),
                              Text('15 seconds total · no skip', style: TextStyle(color: Colors.white54, fontSize: 12)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    // Overall progress bar (0 → 15s)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: ((_currentAdIndex * 5) + (5 - _countdown)) / 15,
                        backgroundColor: Colors.white12,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                        minHeight: 5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${((_currentAdIndex * 5) + (5 - _countdown)).clamp(0, 15)}s of 15s',
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackAd(AdModel ad) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.black, _adTypeColor(ad.type).withOpacity(0.3), AppColors.black],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_adTypeEmoji(ad.type), style: const TextStyle(fontSize: 80)),
            const SizedBox(height: 24),
            Text(
              ad.title,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
            ),
            if (ad.holidayName != null) ...[
              const SizedBox(height: 12),
              Text(ad.holidayName!, style: TextStyle(color: _adTypeColor(ad.type), fontSize: 18)),
            ],
          ],
        ),
      ),
    );
  }

  Color _adTypeColor(String type) {
    switch (type) {
      case 'holiday': return const Color(0xFF22C55E);
      case 'company': return const Color(0xFF3B82F6);
      default: return AppColors.primary;
    }
  }

  String _adTypeLabel(AdModel ad) {
    switch (ad.type) {
      case 'holiday': return '🎄 ${ad.holidayName ?? 'Holiday Special'}';
      case 'company': return '🏢 Sponsored';
      default: return '🎉 Promotion';
    }
  }

  String _adTypeEmoji(String type) {
    switch (type) {
      case 'holiday': return '🎄';
      case 'company': return '🏢';
      default: return '🎉';
    }
  }
}
