import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class LogoWidget extends StatelessWidget {
  final double fontSize;
  final bool showImage;
  
  const LogoWidget({super.key, this.fontSize = 24, this.showImage = true});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showImage) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(fontSize * 0.5),
            child: Image.asset(
              'assets/logo.jpg',
              width: fontSize * 1.2,
              height: fontSize * 1.2,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: fontSize * 1.2,
                  height: fontSize * 1.2,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(fontSize * 0.5),
                  ),
                  child: Center(
                    child: Text(
                      'AT',
                      style: TextStyle(
                        color: AppColors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: fontSize * 0.4,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          SizedBox(width: fontSize * 0.4),
        ],
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: fontSize,
            ),
            children: const [
              TextSpan(text: 'All ', style: TextStyle(color: AppColors.white)),
              TextSpan(text: 'Things', style: TextStyle(color: AppColors.primary)),
            ],
          ),
        ),
      ],
    );
  }
}
