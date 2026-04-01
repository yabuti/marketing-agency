import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'screens/ad_splash_screen.dart';
import 'providers/lang_provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => LangProvider(),
      child: const AllThingsApp(),
    ),
  );
}

class AllThingsApp extends StatelessWidget {
  const AllThingsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'All Things',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AdSplashScreen(),
    );
  }
}
