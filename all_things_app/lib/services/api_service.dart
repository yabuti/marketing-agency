import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/client_model.dart';
import '../models/news_model.dart';
import '../models/ad_model.dart';

class ApiService {
  // Change this to your computer's local IP when testing on a real device
  // e.g. 'http://192.168.1.100:5000/api'
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:5000/api'; // iOS simulator

  // ─── Clients ──────────────────────────────────────────────────

  static Future<List<ClientModel>> getClients() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/clients'))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => ClientModel.fromJson(json)).toList();
      }
      throw Exception('Failed to load clients');
    } catch (e) {
      return [];
    }
  }

  static Future<ClientModel?> getClient(String id) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/clients/$id'))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return ClientModel.fromJson(json.decode(response.body));
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ─── News ─────────────────────────────────────────────────────

  static Future<List<NewsModel>> getNews() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/news'))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => NewsModel.fromJson(json)).toList();
      }
      throw Exception('Failed to load news');
    } catch (e) {
      return [];
    }
  }

  // ─── Ads ──────────────────────────────────────────────────────

  static Future<List<AdModel>> getActiveAds() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/ads/active'))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => AdModel.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<bool> submitContact(Map<String, dynamic> contactData) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/contact'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(contactData),
          )
          .timeout(const Duration(seconds: 10));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
