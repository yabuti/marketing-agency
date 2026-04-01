import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/client_model.dart';
import '../services/api_service.dart';
import '../widgets/client_card.dart';
import 'client_detail_screen.dart';

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({super.key});

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  List<ClientModel> clients = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => isLoading = true);
    final data = await ApiService.getClients();
    setState(() {
      clients = data;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Our Clients',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.white),
              ),
              const SizedBox(height: 8),
              const Text(
                'Businesses we promote',
                style: TextStyle(fontSize: 16, color: AppColors.gray),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 45,
                      height: 45,
                      decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle),
                      child: const Icon(Icons.check, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('100% Verified Businesses', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 15)),
                          SizedBox(height: 4),
                          Text('All clients have valid trade licenses', style: TextStyle(color: AppColors.gray, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              if (isLoading)
                const Center(child: CircularProgressIndicator(color: AppColors.primary))
              else if (clients.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Text('No clients yet.', style: TextStyle(color: AppColors.gray)),
                  ),
                )
              else
                ...clients.map((client) => ClientCard(
                  client: client,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ClientDetailScreen(client: client)),
                  ),
                )),
            ],
          ),
        ),
      ),
    );
  }
}
