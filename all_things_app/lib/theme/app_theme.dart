import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFFFF7A00);
  static const primaryDark = Color(0xFFE66E00);
  static const primaryLight = Color(0xFFFF9533);
  static const secondary = Color(0xFF1E293B);
  static const bgMain = Color(0xFFFFFFFF);
  static const bgSubtle = Color(0xFFF8FAFC);
  static const textMain = Color(0xFF0F172A);
  static const textMuted = Color(0xFF4B5563);
  static const textLight = Color(0xFF94A3B8);
  static const black = Color(0xFF0A0A0A);
  static const blackLight = Color(0xFF171717);
  static const blackLighter = Color(0xFF262626);
  static const white = Color(0xFFFFFFFF);
  static const accent = Color(0xFF22C55E);
  static const gray = Color(0xFF94A3B8);
  static const red = Color(0xFFEF4444);

  static const primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const heroGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0x0DFF7A00),
      Colors.transparent,
    ],
  );
}

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    fontFamily: 'Times New Roman',
    brightness: Brightness.light,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.bgMain,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: AppColors.secondary,
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.white,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textLight,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    cardTheme: CardThemeData(
      color: AppColors.white,
      shadowColor: Colors.black.withOpacity(0.06),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
        textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
        elevation: 6,
        shadowColor: AppColors.primary.withOpacity(0.2),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.secondary,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
        side: const BorderSide(color: AppColors.secondary, width: 2),
        textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
      ),
    ),
  );
}
