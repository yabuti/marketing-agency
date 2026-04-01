import 'package:flutter/material.dart';

class LangProvider extends ChangeNotifier {
  String _lang = 'en'; // 'en', 'am', 'or'

  String get lang => _lang;

  void setLang(String lang) {
    _lang = lang;
    notifyListeners();
  }
}
