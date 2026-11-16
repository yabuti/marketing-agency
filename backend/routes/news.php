<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/translator.php';

$method = getMethod();
// Support _method override for forms or environments tunneling PUT
$bodyRaw = getBody();
if ($method === 'POST' && isset($bodyRaw['_method']) && strtoupper($bodyRaw['_method']) === 'PUT') {
    $method = 'PUT';
}

$uri    = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts  = explode('/', $uri);
$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

// Parse segments: /api/news, /api/news/admin/all, /api/news/:id, /api/news/:id/images, /api/news/:id/images/:imgId
$seg2 = $parts[2] ?? null; // 'admin' or numeric id or 'retranslate' or 'translate' or null
$seg3 = $parts[3] ?? null; // 'all' or 'images'
$seg4 = $parts[4] ?? null; // image id

$newsId  = is_numeric($seg2) ? (int)$seg2 : null;
$imageId = is_numeric($seg4) ? (int)$seg4 : null;

function getNewsFull(PDO $pdo, int $id, string $baseUrl): ?array {
    $stmt = $pdo->prepare('SELECT * FROM news WHERE id = ?');
    $stmt->execute([$id]);
    $news = $stmt->fetch();
    if (!$news) return null;
    $imgs = $pdo->prepare('SELECT * FROM news_images WHERE news_id = ? ORDER BY sort_order ASC, id ASC');
    $imgs->execute([$id]);
    $news['images'] = array_map(fn($i) => [
        'id'          => (int)$i['id'],
        'url'         => "$baseUrl/{$i['file_path']}",
        'description' => $i['description'] ?? '',
        'sort_order'  => (int)($i['sort_order'] ?? 0)
    ], $imgs->fetchAll());
    
    // Parse source_urls JSON array with fallback to legacy source_url
    $urls = !empty($news['source_urls']) ? json_decode($news['source_urls'], true) : [];
    if (!is_array($urls)) $urls = [];
    if (empty($urls) && !empty($news['source_url'])) {
        $urls = [$news['source_url']];
    }
    $news['source_urls'] = $urls;
    return $news;
}

// POST /api/news/translate (translate title & content on the fly)
if ($method === 'POST' && $seg2 === 'translate') {
    requireAdminAuth();
    $body = getBody();
    $title = trim($body['title'] ?? '');
    $content = trim($body['content'] ?? '');
    if (!$title && !$content) {
        jsonResponse(['message' => 'Please provide title or content to translate.'], 400);
    }
    $tr = translateNews($title, $content);
    jsonResponse($tr);
}

// POST /api/news/retranslate (admin — re-translate all missing)
if ($method === 'POST' && $seg2 === 'retranslate') {
    requireAdminAuth();
    $rows = $pdo->query("SELECT id, title, content FROM news WHERE title_am = '' OR title_am IS NULL")->fetchAll();
    foreach ($rows as $row) {
        $tr = translateNews($row['title'], $row['content']);
        $pdo->prepare('UPDATE news SET title_am=?, title_or=?, content_am=?, content_or=? WHERE id=?')
            ->execute([$tr['title_am'], $tr['title_or'], $tr['content_am'], $tr['content_or'], $row['id']]);
    }
    jsonResponse(['message' => 'Retranslated ' . count($rows) . ' articles.']);
}

// GET /api/news (public)
if ($method === 'GET' && !$newsId && $seg2 !== 'admin') {
    $rows = $pdo->query('SELECT * FROM news WHERE is_published = 1 ORDER BY created_at DESC')->fetchAll();
    jsonResponse(array_map(fn($n) => getNewsFull($pdo, $n['id'], $baseUrl), $rows));
}

// GET /api/news/admin/all (admin)
if ($method === 'GET' && $seg2 === 'admin' && $seg3 === 'all') {
    requireAdminAuth();
    $rows = $pdo->query('SELECT * FROM news ORDER BY created_at DESC')->fetchAll();
    jsonResponse(array_map(fn($n) => getNewsFull($pdo, $n['id'], $baseUrl), $rows));
}

// GET /api/news/:id (public / admin load single)
if ($method === 'GET' && $newsId && !$seg3) {
    $news = getNewsFull($pdo, $newsId, $baseUrl);
    if (!$news) jsonResponse(['message' => 'News not found.'], 404);
    jsonResponse($news);
}

// POST /api/news (admin create)
if ($method === 'POST' && !$newsId && !$seg2) {
    requireAdminAuth();
    $body = getBody();
    $title_en   = trim($body['title'] ?? '');
    $title_am   = trim($body['title_am'] ?? '');
    $title_or   = trim($body['title_or'] ?? '');
    $content_en = trim($body['content'] ?? '');
    $content_am = trim($body['content_am'] ?? '');
    $content_or = trim($body['content_or'] ?? '');

    $primaryTitle = $title_en ?: $title_am ?: $title_or ?: 'Untitled Article';
    $primaryContent = $content_en ?: $content_am ?: $content_or ?: '';
    if (!$title_en) $title_en = $primaryTitle;
    if (!$content_en) $content_en = $primaryContent;

    $category     = trim($body['category'] ?? 'News') ?: 'News';
    $is_published = (int)($body['is_published'] ?? 1);
    
    // Process source links
    $rawSources = (array)($body['source_urls'] ?? []);
    $cleanSources = array_values(array_filter(array_map('trim', $rawSources)));
    $sourceUrl = !empty($cleanSources) ? $cleanSources[0] : ($body['source_url'] ?? null);
    $sourceUrlsJson = json_encode($cleanSources);

    $stmt = $pdo->prepare('INSERT INTO news (title, title_am, title_or, content, content_am, content_or, category, is_published, source_url, source_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $title_en,
        $title_am,
        $title_or,
        $content_en,
        $content_am,
        $content_or,
        $category,
        $is_published,
        $sourceUrl,
        $sourceUrlsJson
    ]);
    $id = (int)$pdo->lastInsertId();
    jsonResponse(getNewsFull($pdo, $id, $baseUrl), 201);
}

// PUT /api/news/:id or POST /api/news/:id (admin update)
if (($method === 'PUT' || ($method === 'POST' && $newsId)) && $newsId && !$seg3) {
    requireAdminAuth();
    $body = getBody();

    $curStmt = $pdo->prepare('SELECT * FROM news WHERE id = ?');
    $curStmt->execute([$newsId]);
    $cur = $curStmt->fetch();
    if (!$cur) jsonResponse(['message' => 'Article not found.'], 404);

    $val = function (string $key, $default = null) use ($body, $cur) {
        return array_key_exists($key, $body) ? $body[$key] : ($cur[$key] ?? $default);
    };

    $title_en   = trim((string)$val('title', ''));
    $title_am   = trim((string)$val('title_am', ''));
    $title_or   = trim((string)$val('title_or', ''));
    $content_en = trim((string)$val('content', ''));
    $content_am = trim((string)$val('content_am', ''));
    $content_or = trim((string)$val('content_or', ''));

    // If English is empty but another language is filled, don't break the record
    $fallbackTitle   = $title_en ?: $title_am ?: $title_or ?: ($cur['title'] ?? 'Untitled Article');
    $fallbackContent = $content_en ?: $content_am ?: $content_or ?: ($cur['content'] ?? '');
    if (!$title_en) $title_en = $fallbackTitle;
    if (!$content_en) $content_en = $fallbackContent;

    $category     = trim((string)$val('category', $cur['category'] ?? 'News')) ?: 'News';
    $is_published = (int)$val('is_published', $cur['is_published'] ?? 1);

    if (array_key_exists('source_urls', $body)) {
        $cleanSources = array_values(array_filter(array_map('trim', (array)$body['source_urls'])));
        $sourceUrlsJson = json_encode($cleanSources);
        $sourceUrl = !empty($cleanSources) ? $cleanSources[0] : null;
    } else {
        $sourceUrlsJson = $cur['source_urls'] ?? '[]';
        $sourceUrl = $cur['source_url'] ?? null;
    }

    $pdo->prepare('UPDATE news SET title=?, title_am=?, title_or=?, content=?, content_am=?, content_or=?, category=?, is_published=?, source_url=?, source_urls=? WHERE id=?')
        ->execute([
            $title_en,
            $title_am,
            $title_or,
            $content_en,
            $content_am,
            $content_or,
            $category,
            $is_published,
            $sourceUrl,
            $sourceUrlsJson,
            $newsId,
        ]);
    jsonResponse(getNewsFull($pdo, $newsId, $baseUrl));
}

// DELETE /api/news/:id (admin delete article)
if ($method === 'DELETE' && $newsId && !$seg3) {
    requireAdminAuth();
    $imgs = $pdo->prepare('SELECT file_path FROM news_images WHERE news_id = ?');
    $imgs->execute([$newsId]);
    foreach ($imgs->fetchAll() as $img) {
        $filePath = dirname(__DIR__) . '/' . $img['file_path'];
        if (file_exists($filePath)) @unlink($filePath);
    }
    $pdo->prepare('DELETE FROM news_images WHERE news_id = ?')->execute([$newsId]);
    $pdo->prepare('DELETE FROM news WHERE id = ?')->execute([$newsId]);
    jsonResponse(['message' => 'Article deleted successfully.']);
}

// POST /api/news/:id/images (admin upload image)
if ($method === 'POST' && $newsId && $seg3 === 'images') {
    requireAdminAuth();
    if (empty($_FILES['file']['tmp_name'])) {
        jsonResponse(['message' => 'No image file uploaded.'], 400);
    }
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowed, true)) {
        jsonResponse(['message' => 'Invalid image format. Supported formats: JPG, PNG, WEBP, GIF.'], 400);
    }

    $uploadDir = dirname(__DIR__) . '/uploads/news';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }

    $fileName = uniqid('news_' . $newsId . '_', true) . '.' . $ext;
    $filePath = 'uploads/news/' . $fileName;
    $targetPath = dirname(__DIR__) . '/' . $filePath;

    if (!move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        if (!copy($_FILES['file']['tmp_name'], $targetPath)) {
            jsonResponse(['message' => 'Failed to write image file to disk. Check uploads folder permissions.'], 500);
        }
    }

    $desc = trim($_POST['description'] ?? '');
    $sort = (int)($_POST['sort_order'] ?? 0);
    $stmt = $pdo->prepare('INSERT INTO news_images (news_id, file_path, description, sort_order) VALUES (?, ?, ?, ?)');
    $stmt->execute([$newsId, $filePath, $desc, $sort]);
    $imgId = (int)$pdo->lastInsertId();

    jsonResponse([
        'id'          => $imgId,
        'url'         => "$baseUrl/$filePath",
        'description' => $desc,
        'sort_order'  => $sort
    ], 201);
}

// DELETE /api/news/:id/images/:imageId (admin delete image)
if ($method === 'DELETE' && $newsId && $seg3 === 'images' && $imageId) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT * FROM news_images WHERE id = ? AND news_id = ?');
    $stmt->execute([$imageId, $newsId]);
    $img = $stmt->fetch();
    if (!$img) jsonResponse(['message' => 'Image not found.'], 404);
    $filePath = dirname(__DIR__) . '/' . $img['file_path'];
    if (file_exists($filePath)) @unlink($filePath);
    $pdo->prepare('DELETE FROM news_images WHERE id = ?')->execute([$imageId]);
    jsonResponse(['message' => 'Image deleted successfully.']);
}

jsonResponse(['message' => 'Not found.'], 404);
