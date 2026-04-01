import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/logo_widget.dart';
import '../providers/lang_provider.dart';
import 'clients_screen.dart';
import 'about_screen.dart';
import 'contact_screen.dart';
import 'news_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeContent(),
    const ClientsScreen(),
    const NewsScreen(),
    const AboutScreen(),
    const ContactScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.blackLight,
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.business_outlined), activeIcon: Icon(Icons.business), label: 'Clients'),
            BottomNavigationBarItem(icon: Icon(Icons.article_outlined), activeIcon: Icon(Icons.article), label: 'News'),
            BottomNavigationBarItem(icon: Icon(Icons.info_outline), activeIcon: Icon(Icons.info), label: 'About'),
            BottomNavigationBarItem(icon: Icon(Icons.mail_outline), activeIcon: Icon(Icons.mail), label: 'Contact'),
          ],
        ),
      ),
      // Global language switcher as floating action button area
      floatingActionButton: _buildLangSwitcher(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.miniEndTop,
    );
  }

  Widget _buildLangSwitcher(BuildContext context) {
    final provider = context.watch<LangProvider>();
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(color: AppColors.blackLight, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.1))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final l in [('en', 'EN'), ('am', 'አማ'), ('or', 'OR')])
            GestureDetector(
              onTap: () => provider.setLang(l.$1),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: provider.lang == l.$1 ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(l.$2, style: TextStyle(
                  color: provider.lang == l.$1 ? Colors.black : AppColors.gray,
                  fontSize: 11, fontWeight: FontWeight.bold,
                )),
              ),
            ),
        ],
      ),
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const LogoWidget(fontSize: 28),
            const SizedBox(height: 40),
            // Hero Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.accent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: AppColors.accent.withOpacity(0.3)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified, color: AppColors.accent, size: 18),
                  SizedBox(width: 8),
                  Text('Licensed Businesses Only', style: TextStyle(color: AppColors.accent, fontSize: 13, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, height: 1.2),
                children: [
                  TextSpan(text: 'Social Media\nMarketing for ', style: TextStyle(color: AppColors.white)),
                  TextSpan(text: 'Licensed\nBusinesses', style: TextStyle(color: AppColors.primary)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'We exclusively partner with verified, licensed businesses to create authentic social media presence.',
              style: TextStyle(color: AppColors.gray, fontSize: 16, height: 1.6),
            ),
            const SizedBox(height: 24),
            // Social Media Links
            Row(
              children: [
                _buildSocialButton(
                  '📸',
                  'Instagram',
                  'https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr',
                ),
                const SizedBox(width: 12),
                _buildSocialButton(
                  '🎵',
                  'TikTok',
                  'https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc',
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Stats
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.blackLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem('50+', 'Clients'),
                  _buildStatItem('100%', 'Licensed'),
                  _buildStatItem('200%', 'Avg Growth'),
                ],
              ),
            ),
            const SizedBox(height: 40),
            // Services
            const Text('Our Services', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.white)),
            const SizedBox(height: 20),
            _buildServiceCard('📱', 'Social Media Management', 'Complete management of your social accounts'),
            _buildServiceCard('🎨', 'Content Creation', 'Professional photos, videos & graphics'),
            _buildServiceCard('📈', 'Growth Strategy', 'Data-driven strategies for growth'),
            _buildServiceCard('💰', 'Paid Advertising', 'Targeted ads on all platforms'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppColors.gray, fontSize: 14)),
      ],
    );
  }

  Widget _buildSocialButton(String icon, String label, String url) {
    return Expanded(
      child: InkWell(
        onTap: () => _launchURL(url),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          decoration: BoxDecoration(
            color: AppColors.blackLighter,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.1), width: 2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(icon, style: const TextStyle(fontSize: 22)),
              const SizedBox(width: 8),
              Text(label, style: const TextStyle(color: AppColors.white, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchURL(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      // Handle error silently or show a snackbar
      debugPrint('Could not launch $urlString');
    }
  }

  Widget _buildServiceCard(String icon, String title, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.blackLighter,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(child: Text(icon, style: const TextStyle(fontSize: 24))),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.white)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(fontSize: 13, color: AppColors.gray)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
