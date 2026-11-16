<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method  = getMethod();
$uri     = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts   = explode('/', $uri);
$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

$seg2 = $parts[2] ?? null; // 'active', 'reorder', or numeric id
$seg3 = $parts[3] ?? null; // 'image' or 'batch'
$id   = is_numeric($seg2) ? (int)$seg2 : null;

function formatAd(array $ad, string $baseUrl): array {
    $ad['image_url'] = $ad['image_path'] ? "$baseUrl/{$ad['image_path']}" : null;
    return $ad;
}

function holidayWindow(string $date): array {
    $holiday = new DateTime($date);
    $from    = (clone $holiday)->modify('-7 days')->format('Y-m-d');
    $until   = (clone $holiday)->modify('+3 days')->format('Y-m-d');
    return ['show_from' => $from, 'show_until' => $until];
}

// GET /api/ads/active (public)
if ($method === 'GET' && $seg2 === 'active') {
    $today = date('Y-m-d');
    $stmt  = $pdo->prepare('SELECT * FROM ads WHERE is_active = 1 AND show_from <= ? AND show_until >= ? ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$today, $today]);
    jsonResponse(array_map(fn($a) => formatAd($a, $baseUrl), $stmt->fetchAll()));
}

// GET /api/ads (admin all)
if ($method === 'GET' && !$id) {
    requireAdminAuth();
    $rows = $pdo->query('SELECT * FROM ads ORDER BY sort_order ASC, id DESC')->fetchAll();
    jsonResponse(array_map(fn($a) => formatAd($a, $baseUrl), $rows));
}

// POST /api/ads (admin create)
if ($method === 'POST' && !$id && $seg2 !== 'reorder') {
    requireAdminAuth();
    $body = getBody();
    $title = trim($body['title'] ?? '');
    if (!$title) jsonResponse(['message' => 'Title is required.'], 400);

    $type         = $body['type'] ?? 'general';
    $holiday_date = $body['holiday_date'] ?? null;
    $show_from    = $body['show_from'] ?? null;
    $show_until   = $body['show_until'] ?? null;

    if ($type === 'holiday' && $holiday_date) {
        $w = holidayWindow($holiday_date);
        $show_from  = $w['show_from'];
        $show_until = $w['show_until'];
    }
    if (!$show_from || !$show_until) jsonResponse(['message' => 'show_from and show_until are required.'], 400);

    $stmt = $pdo->prepare('INSERT INTO ads (title, type, holiday_name, holiday_date, show_from, show_until, link_url, duration_sec, sort_order, is_active, company_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$title, $type, $body['holiday_name'] ?? null, $holiday_date, $show_from, $show_until, $body['link_url'] ?? null, $body['duration_sec'] ?? 15, $body['sort_order'] ?? 0, $body['is_active'] ?? 1, $body['company_name'] ?? null]);
    $ad = $pdo->prepare('SELECT * FROM ads WHERE id = ?');
    $ad->execute([(int)$pdo->lastInsertId()]);
    jsonResponse(formatAd($ad->fetch(), $baseUrl), 201);
}

// PUT /api/ads/reorder/batch (admin)
if ($method === 'PUT' && $seg2 === 'reorder' && $seg3 === 'batch') {
    requireAdminAuth();
    $body = getBody();
    foreach ($body['items'] ?? [] as $item) {
        $pdo->prepare('UPDATE ads SET sort_order = ? WHERE id = ?')->execute([$item['sort_order'], $item['id']]);
    }
    jsonResponse(['message' => 'Order updated.']);
}

// PUT /api/ads/:id (admin update)
if (($method === 'PUT' || $method === 'POST') && $id && $seg3 !== 'image') {
    requireAdminAuth();
    $body = getBody();

    // Partial update: fall back to stored values so an is_active toggle can
    // never wipe the title, schedule or image reference.
    $curStmt = $pdo->prepare('SELECT * FROM ads WHERE id = ?');
    $curStmt->execute([$id]);
    $cur = $curStmt->fetch();
    if (!$cur) jsonResponse(['message' => 'Ad not found.'], 404);

    $val = function (string $key, $default = null) use ($body, $cur) {
        return array_key_exists($key, $body) ? $body[$key] : ($cur[$key] ?? $default);
    };

    $type         = $val('type', 'general');
    $holiday_date = $val('holiday_date');
    $show_from    = $val('show_from');
    $show_until   = $val('show_until');
    if ($type === 'holiday' && $holiday_date) {
        $w = holidayWindow($holiday_date);
        $show_from  = $w['show_from'];
        $show_until = $w['show_until'];
    }
    $pdo->prepare('UPDATE ads SET title=?, type=?, holiday_name=?, holiday_date=?, show_from=?, show_until=?, link_url=?, duration_sec=?, sort_order=?, is_active=?, company_name=? WHERE id=?')
        ->execute([
            $val('title'),
            $type,
            $val('holiday_name'),
            $holiday_date,
            $show_from,
            $show_until,
            $val('link_url'),
            (int) $val('duration_sec', 15),
            (int) $val('sort_order', 0),
            (int) $val('is_active', 1),
            $val('company_name'),
            $id,
        ]);
    $ad = $pdo->prepare('SELECT * FROM ads WHERE id = ?');
    $ad->execute([$id]);
    jsonResponse(formatAd($ad->fetch(), $baseUrl));
}

// POST /api/ads/:id/image (admin upload)
if ($method === 'POST' && $id && $seg3 === 'image') {
    requireAdminAuth();
    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);
    $existing = $pdo->prepare('SELECT image_path FROM ads WHERE id = ?');
    $existing->execute([$id]);
    $old = $existing->fetch();
    if ($old['image_path'] && file_exists(dirname(__DIR__) . '/' . $old['image_path'])) unlink(dirname(__DIR__) . '/' . $old['image_path']);
    $ext      = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $filePath = 'uploads/ads/' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/ads', 0755, true);
    move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath);
    $pdo->prepare('UPDATE ads SET image_path = ? WHERE id = ?')->execute([$filePath, $id]);
    jsonResponse(['image_url' => "$baseUrl/$filePath"]);
}

// DELETE /api/ads/:id/image (admin remove image only)
// Must be checked before the whole-row delete below.
if ($method === 'DELETE' && $id && $seg3 === 'image') {
    requireAdminAuth();
    $existing = $pdo->prepare('SELECT image_path FROM ads WHERE id = ?');
    $existing->execute([$id]);
    $row = $existing->fetch();
    if (!$row) jsonResponse(['message' => 'Ad not found.'], 404);
    if ($row['image_path'] && file_exists(dirname(__DIR__) . '/' . $row['image_path'])) {
        unlink(dirname(__DIR__) . '/' . $row['image_path']);
    }
    $pdo->prepare('UPDATE ads SET image_path = NULL WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Ad image removed.']);
}

// DELETE /api/ads/:id (admin)
if ($method === 'DELETE' && $id && !$seg3) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT image_path FROM ads WHERE id = ?');
    $stmt->execute([$id]);
    $ad = $stmt->fetch();
    if ($ad['image_path'] && file_exists(dirname(__DIR__) . '/' . $ad['image_path'])) unlink(dirname(__DIR__) . '/' . $ad['image_path']);
    $pdo->prepare('DELETE FROM ads WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Ad deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
