import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _companyController = TextEditingController();
  final _tinController = TextEditingController();
  final _elmisController = TextEditingController();
  final _licenseController = TextEditingController();
  final _messageController = TextEditingController();
  String? _selectedBusiness;
  bool _submitted = false;

  final List<String> _businessTypes = [
    // Startups and Entrepreneurs
    'Tech startups (apps, software, IT services)',
    'E-commerce businesses',
    'Digital service startups',
    'Creative startups (design, media, photography)',
    // Retail and Wholesale Businesses
    'Shops and minimarkets',
    'Clothing and fashion stores',
    'Shoe and accessories shops',
    'Electronics and mobile phone shops',
    'Cosmetics and beauty product shops',
    'Bookshops and stationery shops',
    'Furniture and home appliance shops',
    'Food and beverage wholesalers',
    'Construction material suppliers',
    'Agricultural input suppliers',
    'Textile and garment wholesalers',
    // Hospitality and Tourism Sector
    'Restaurants and cafes',
    'Traditional food houses',
    'Event and conference venues',
    'Car rental services',
    // Educational Institutions
    'Private schools (KG–Grade 12)',
    'Training centers',
    'Language schools',
    'Computer and IT training centers',
    'Tutorial and exam preparation centers',
    'Online learning platforms',
    'Educational consultancy services',
    // Service Providers
    'Advertising and marketing agencies',
    'Printing and publishing services',
    'Graphic design and branding services',
    'Accounting and auditing firms',
    'Legal and consultancy services',
    'Cleaning and maintenance services',
    'Security service providers',
    'Repair services (electronics, machinery, vehicles)',
    'Beauty salons and barber shops',
    'Transportation and logistics services',
    // Manufacturers
    'Food and beverage processing enterprises',
    'Garment and textile manufacturers',
    'Shoe and leather product manufacturers',
    'Plastic product manufacturers',
    'Metal and wood furniture manufacturers',
    'Building material manufacturers (cement blocks, tiles)',
    'Packaging and labeling manufacturers',
    'Soap, detergent, and cosmetic producers',
    'Agro-processing plants',
  ];

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final uri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendEmail(String email) async {
    final uri = Uri(scheme: 'mailto', path: email);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Contact Us',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Ready to grow your business?',
              style: TextStyle(fontSize: 16, color: AppColors.gray),
            ),
            const SizedBox(height: 24),
            // Contact Info Cards
            _buildInfoCard(Icons.email, 'Email Us', 'allthingsethiopia2026@gmail.com', 
              onTap: () => _sendEmail('allthingsethiopia2026@gmail.com')),
            _buildPhoneCard(),
            _buildInfoCard(Icons.location_on, 'Visit Us', 'Addis Ababa, Ethiopia'),
            _buildInfoCard(Icons.access_time, 'Working Hours', 'Mon - Fri: 9AM - 6PM'),
            _buildTelegramCard(),
            _buildSocialMediaCard('Instagram', '@all63527', 'https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr', '📸', const Color(0xFFE1306C)),
            _buildSocialMediaCard('TikTok', '@allthings2026', 'https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc', '🎵', const Color(0xFF00f2ea)),
            const SizedBox(height: 24),
            // Form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.blackLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: _submitted ? _buildSuccessMessage() : _buildForm(),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String value, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.black, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(value, style: const TextStyle(color: AppColors.gray, fontSize: 14)),
                ],
              ),
            ),
            if (onTap != null) const Icon(Icons.arrow_forward_ios, color: AppColors.gray, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoneCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 45,
                height: 45,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.phone, color: AppColors.black, size: 22),
              ),
              const SizedBox(width: 14),
              const Text('Call Us', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          _buildPhoneNumber('+251 911 031 884'),
          _buildPhoneNumber('+251 905 841 982'),
          _buildPhoneNumber('+251 915 840 037'),
        ],
      ),
    );
  }

  Widget _buildPhoneNumber(String number) {
    return GestureDetector(
      onTap: () => _makePhoneCall(number),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            const SizedBox(width: 59),
            Text(number, style: const TextStyle(color: AppColors.gray, fontSize: 14)),
            const Spacer(),
            const Icon(Icons.call, color: AppColors.primary, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildTelegramCard() {
    return GestureDetector(
      onTap: () => _launchUrl('https://t.me/Allthings2026'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0088CC).withOpacity(0.15),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF0088CC).withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: const Color(0xFF0088CC),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.telegram, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Telegram', style: TextStyle(color: AppColors.white, fontWeight: FontWeight.w600)),
                  SizedBox(height: 2),
                  Text('@Allthings2026', style: TextStyle(color: Color(0xFF0088CC), fontSize: 14)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Color(0xFF0088CC), size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialMediaCard(String platform, String handle, String url, String emoji, Color color) {
    return GestureDetector(
      onTap: () => _launchUrl(url),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(child: Text(emoji, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(platform, style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(handle, style: TextStyle(color: color, fontSize: 14)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: color, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Send Us a Message',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.white),
          ),
          const SizedBox(height: 20),
          _buildTextField('Full Name', _nameController, Icons.person),
          _buildTextField('Email Address', _emailController, Icons.email, keyboardType: TextInputType.emailAddress),
          _buildTextField('Phone Number', _phoneController, Icons.phone, keyboardType: TextInputType.phone),
          // Business Type Dropdown
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.black,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedBusiness,
                hint: const Text('Select Business Type', style: TextStyle(color: AppColors.gray)),
                isExpanded: true,
                dropdownColor: AppColors.blackLight,
                items: _businessTypes.map((type) => DropdownMenuItem(
                  value: type,
                  child: Text(type, style: const TextStyle(color: AppColors.white)),
                )).toList(),
                onChanged: (value) => setState(() => _selectedBusiness = value),
              ),
            ),
          ),
          _buildTextField('Company / Business Name', _companyController, Icons.business),
          _buildTextField('TIN Number', _tinController, Icons.numbers),
          _buildTextField('E-LMIS Registration', _elmisController, Icons.app_registration),
          _buildTextField('Business License Number', _licenseController, Icons.badge),
          _buildTextField('Tell us about your business', _messageController, Icons.message, maxLines: 4),
          // License Notice
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Text('📋', style: TextStyle(fontSize: 20)),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Important: We only work with licensed businesses.',
                    style: TextStyle(color: AppColors.gray, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitForm,
              child: const Text('Submit Application →'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {int maxLines = 1, TextInputType? keyboardType}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        style: const TextStyle(color: AppColors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: AppColors.gray),
          prefixIcon: maxLines == 1 ? Icon(icon, color: AppColors.gray) : null,
          filled: true,
          fillColor: AppColors.black,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessMessage() {
    return Column(
      children: [
        const Icon(Icons.check_circle, color: AppColors.accent, size: 60),
        const SizedBox(height: 16),
        const Text(
          'Message Sent!',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.white),
        ),
        const SizedBox(height: 8),
        const Text(
          'Thank you! We will contact you soon.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.gray),
        ),
        const SizedBox(height: 20),
        TextButton(
          onPressed: () => setState(() => _submitted = false),
          child: const Text('Send Another Message'),
        ),
      ],
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      ApiService.submitContact({
        'full_name': _nameController.text,
        'email': _emailController.text,
        'phone': _phoneController.text,
        'business_type': _selectedBusiness,
        'company_name': _companyController.text,
        'tin_number': _tinController.text,
        'elmis_registration': _elmisController.text,
        'business_license': _licenseController.text,
        'message': _messageController.text,
      });
      setState(() => _submitted = true);
      _nameController.clear();
      _emailController.clear();
      _phoneController.clear();
      _companyController.clear();
      _tinController.clear();
      _elmisController.clear();
      _licenseController.clear();
      _messageController.clear();
      _selectedBusiness = null;
    }
  }
}
