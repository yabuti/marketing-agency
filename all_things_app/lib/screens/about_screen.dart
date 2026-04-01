import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'About Us',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.white),
            ),
            const SizedBox(height: 8),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontSize: 16, color: AppColors.gray, height: 1.6),
                children: [
                  TextSpan(text: 'We are '),
                  TextSpan(text: 'All Things', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  TextSpan(text: ' Marketing Agency'),
                ],
              ),
            ),
            const SizedBox(height: 30),
            // Vision & Mission Cards
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary.withOpacity(0.15), AppColors.primary.withOpacity(0.05)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: Column(
                children: [
                  const Text('🎯', style: TextStyle(fontSize: 50)),
                  const SizedBox(height: 16),
                  const Text(
                    'Vision',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'To become Ethiopia\'s leading digital marketing and advertising company dedicated to empowering ESMEs.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.gray, height: 1.6, fontSize: 15),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary.withOpacity(0.15), AppColors.primary.withOpacity(0.05)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: Column(
                children: [
                  const Text('🚀', style: TextStyle(fontSize: 50)),
                  const SizedBox(height: 16),
                  const Text(
                    'Mission',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'To deliver innovative, affordable and measurable marketing and advertising solutions that help Ethiopian ESMEs grow sustainably.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.gray, height: 1.6, fontSize: 15),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            // Strategic Objectives
            const Text(
              'Strategic Objectives',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.white),
            ),
            const SizedBox(height: 16),
            _buildObjectiveCard('🌍', 'Nationwide Access', 'Provide nationwide access to professional marketing services'),
            _buildObjectiveCard('📈', 'ESME Growth', 'Support ESME growth through digital visibility and branding'),
            _buildObjectiveCard('💻', 'Technology Utilization', 'Utilize technology (website, mobile app, and social media) for service delivery'),
            _buildObjectiveCard('🤝', 'Long-term Partnerships', 'Build long-term partnerships with ESMEs and institutions'),
            _buildObjectiveCard('👥', 'Employment Creation', 'Create employment opportunities for skilled youth'),
            const SizedBox(height: 24),
            // Core Values
            const Text(
              'Core Values',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.white),
            ),
            const SizedBox(height: 16),
            _buildValueCard2('💡', 'Innovation and Creativity', 'We embrace new ideas and creative solutions'),
            _buildValueCard2('🎯', 'Customer-Centered Service', 'Our clients\' success is at the heart of everything we do'),
            _buildValueCard2('🛡️', 'Integrity and Transparency', 'We operate with honesty and openness'),
            _buildValueCard2('💻', 'Technology Adoption', 'We leverage the latest digital tools'),
            _buildValueCard2('📊', 'Results-Oriented Performance', 'We focus on measurable outcomes'),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildObjectiveCard(String icon, String title, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 32)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(color: AppColors.gray, fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildValueCard2(String icon, String title, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.black,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary, width: 2),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 32)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(color: AppColors.gray, fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReasonCard(String number, String icon, String title, String desc) {
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
            width: 30,
            height: 30,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(number, style: const TextStyle(color: AppColors.black, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 14),
          Text(icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(color: AppColors.gray, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
