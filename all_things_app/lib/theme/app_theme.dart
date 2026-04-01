import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFFF97316);
  static const primaryLight = Color(0xFFFB923C);
  static const black = Color(0xFF0A0A0A);
  static const blackLight = Color(0xFF171717);
  static const blackLighter = Color(0xFF262626);
  static const white = Color(0xFFFFFFFF);
  static const gray = Color(0xFFA3A3A3);
  static const accent = Color(0xFF22C55E);
  static const red = Color(0xFFEF4444);

  // Aliases used in news_screen
  static const background = black;
  static const textPrimary = white;
  static const cardBackground = blackLight;
  static const border = blackLighter;
  static const primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
}

class AppTheme {
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.black,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.accent,
      surface: AppColors.blackLight,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontFamily: 'SpaceGrotesk',
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: AppColors.white,
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.blackLight,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.gray,
      type: BottomNavigationBarType.fixed,
    ),
    cardTheme: CardThemeData(
      color: AppColors.blackLight,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.black,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
    ),
  );
}
