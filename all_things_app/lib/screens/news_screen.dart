import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../models/news_model.dart';
import '../services/api_service.dart';
import '../providers/lang_provider.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  List<NewsModel> news = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNews();
  }

  Future<void> _loadNews() async {
    try {
      final newsData = await ApiService.getNews();
      setState(() { news = newsData; isLoading = false; });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  String _title(NewsModel n, String lang) {
    if (lang == 'am' && n.titleAm.isNotEmpty) return n.titleAm;
    if (lang == 'or' && n.titleOr.isNotEmpty) return n.titleOr;
    return n.title;
  }

  String _content(NewsModel n, String lang) {
    if (lang == 'am' && n.contentAm.isNotEmpty) return n.contentAm;
    if (lang == 'or' && n.contentOr.isNotEmpty) return n.contentOr;
    return n.content;
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LangProvider>().lang;

    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.black,
        elevation: 0,
        title: Text(
          lang == 'am' ? 'ዜና' : lang == 'or' ? 'Oduu' : 'News',
          style: const TextStyle(color: AppColors.white, fontSize: 20, fontWeight: FontWeight.bold),
        ),
        // Language switcher in app bar
        actions: [
          _LangSwitcher(),
          const SizedBox(width: 8),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : news.isEmpty
              ? Center(child: Text(lang == 'am' ? 'ዜና የለም' : lang == 'or' ? 'Oduu hin jiru' : 'No news yet.', style: const TextStyle(color: AppColors.gray)))
              : RefreshIndicator(
                  onRefresh: _loadNews,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: news.length,
                    itemBuilder: (context, index) => _buildCard(news[index], lang),
                  ),
                ),
    );
  }

  Widget _buildCard(NewsModel n, String lang) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.blackLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (n.images.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: _AutoSlider(images: n.images.map((e) => e.url).toList()),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                      child: Text(n.category, style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                    Text(_formatDate(n.date), style: const TextStyle(color: AppColors.gray, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(_title(n, lang), style: const TextStyle(color: AppColors.white, fontSize: 17, fontWeight: FontWeight.bold, height: 1.3)),
                const SizedBox(height: 8),
                Text(
                  _content(n, lang).length > 120 ? '${_content(n, lang).substring(0, 120)}...' : _content(n, lang),
                  style: const TextStyle(color: AppColors.gray, fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () => _showDetail(n, lang),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                    child: Text(lang == 'am' ? 'ተጨማሪ ያንብቡ →' : lang == 'or' ? 'Dabalata Dubbisi →' : 'Read More →',
                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showDetail(NewsModel n, String lang) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.9, maxChildSize: 0.95, minChildSize: 0.5,
        builder: (_, scrollController) => Container(
          decoration: const BoxDecoration(color: AppColors.black, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              Container(margin: const EdgeInsets.symmetric(vertical: 12), width: 40, height: 4,
                decoration: BoxDecoration(color: AppColors.gray, borderRadius: BorderRadius.circular(2))),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                        child: Text(n.category, style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(height: 14),
                      Text(_title(n, lang), style: const TextStyle(color: AppColors.white, fontSize: 22, fontWeight: FontWeight.bold, height: 1.3)),
                      const SizedBox(height: 6),
                      Text(_formatDate(n.date), style: const TextStyle(color: AppColors.gray, fontSize: 13)),
                      const SizedBox(height: 16),
                      if (n.images.isNotEmpty)
                        SizedBox(
                          height: 180,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: n.images.length,
                            itemBuilder: (_, i) => Container(
                              width: 280, margin: const EdgeInsets.only(right: 10),
                              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12),
                                image: DecorationImage(image: NetworkImage(n.images[i].url), fit: BoxFit.cover)),
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                      Text(_content(n, lang), style: const TextStyle(color: AppColors.white, fontSize: 15, height: 1.7)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) { return dateStr; }
  }
}

class _LangSwitcher extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<LangProvider>();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final l in [('en', 'EN'), ('am', 'አማ'), ('or', 'OR')])
          GestureDetector(
            onTap: () => provider.setLang(l.$1),
            child: Container(
              margin: const EdgeInsets.only(left: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: provider.lang == l.$1 ? AppColors.primary : AppColors.blackLighter,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(l.$2, style: TextStyle(
                color: provider.lang == l.$1 ? Colors.black : AppColors.gray,
                fontSize: 11, fontWeight: FontWeight.bold,
              )),
            ),
          ),
      ],
    );
  }
}

// ── Auto-sliding image widget ─────────────────────────────────────
class _AutoSlider extends StatefulWidget {
  final List<String> images;
  const _AutoSlider({required this.images});

  @override
  State<_AutoSlider> createState() => _AutoSliderState();
}

class _AutoSliderState extends State<_AutoSlider> {
  int _idx = 0;

  @override
  void initState() {
    super.initState();
    if (widget.images.length > 1) {
      Future.doWhile(() async {
        await Future.delayed(const Duration(seconds: 3));
        if (!mounted) return false;
        setState(() => _idx = (_idx + 1) % widget.images.length);
        return true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ...widget.images.asMap().entries.map((e) => AnimatedOpacity(
            opacity: e.key == _idx ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 600),
            child: Image.network(e.value, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(color: AppColors.blackLighter)),
          )),
          // Dot indicators
          if (widget.images.length > 1)
            Positioned(
              bottom: 8, left: 0, right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: widget.images.asMap().entries.map((e) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: e.key == _idx ? 18 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: e.key == _idx ? AppColors.primary : Colors.white54,
                    borderRadius: BorderRadius.circular(3),
                  ),
                )).toList(),
              ),
            ),
        ],
      ),
    );
  }
}
