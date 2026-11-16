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

// URL segments: /api/bazaar/<resource>[/<id>[/<sub>[/<sub_id>]]]
// Examples:
//   /api/bazaar/products
//   /api/bazaar/products/42
//   /api/bazaar/products/admin/all
//   /api/bazaar/products/admin/7
//   /api/bazaar/products/42/photos
//   /api/bazaar/products/42/photos/3
//   /api/bazaar/categories
//   /api/bazaar/orders
//   /api/bazaar/orders/5/confirm
//   /api/bazaar/orders/5/reject
//   /api/bazaar/orders/admin/all
//   /api/bazaar/sellers/10/banks
//   /api/bazaar/delivery

$seg2 = $parts[2] ?? null; // 'products', 'orders', 'sellers', 'delivery', 'settings', 'categories'
$seg3 = $parts[3] ?? null; // numeric id OR 'admin'
$seg4 = $parts[4] ?? null; // 'photos', 'confirm', 'reject', 'all', 'banks', numeric photo_id

// ─── Helper: attach photos to a list of products in ONE query (avoids N+1) ──
function hasBazaarColumn(PDO $pdo, string $column): bool {
    static $cache = [];
    if (!isset($cache[$column])) {
        try {
            $cache[$column] = (bool)$pdo->query("SHOW COLUMNS FROM bazaar_products LIKE '" . str_replace("'", "''", $column) . "'")->fetch();
        } catch (PDOException $e) {
            $cache[$column] = false;
        }
    }
    return $cache[$column];
}
function attachPhotos(PDO $pdo, array $products, string $baseUrl): array {
    if (!$products) return [];
    $ids = array_column($products, 'id');
    $in  = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT id, product_id, file_path, sort_order
         FROM bazaar_product_photos
         WHERE product_id IN ($in)
         ORDER BY sort_order ASC, id ASC"
    );
    $stmt->execute($ids);
    $photos = [];
    foreach ($stmt->fetchAll() as $ph) {
        $photos[$ph['product_id']][] = [
            'id'         => (int)$ph['id'],
            'url'        => "$baseUrl/{$ph['file_path']}",
            'sort_order' => (int)$ph['sort_order'],
        ];
    }
    foreach ($products as &$product) {
        $product['photos'] = $photos[$product['id']] ?? [];
    }
    unset($product);
    return $products;
}

// ─── Helpers: bazaar open/close schedule ──────────────────────
// bazaar_settings key-values:
//   schedule_enabled '1'/'0'  -> use the weekly schedule (open_day/open_time/close_day/close_time)
//   is_open '1'/'0'           -> manual mode toggle (used when schedule_enabled != '1')
//   open_date / close_date    -> manual mode one-off datetimes for countdown targets
//   open_day (0=Sun..6=Sat), open_time 'HH:MM', close_day, close_time -> weekly schedule
function getBazaarSettings(PDO $pdo): array {
    $rows = $pdo->query("SELECT key_name, value FROM bazaar_settings")->fetchAll();
    $settings = [];
    foreach ($rows as $r) $settings[$r['key_name']] = $r['value'];
    return $settings;
}

function bazaarNow(): DateTime {
    return new DateTime('now', new DateTimeZone('Africa/Addis_Ababa'));
}

// Parse a stored 'YYYY-MM-DD HH:MM[:SS]' value as Addis wall-clock time.
function parseAddisDate(string $value, DateTimeZone $tz): ?DateTime {
    $value = trim($value);
    if ($value === '') return null;
    foreach (['Y-m-d H:i:s', 'Y-m-d H:i', 'Y-m-d\TH:i:s', 'Y-m-d\TH:i'] as $fmt) {
        $dt = DateTime::createFromFormat($fmt, $value, $tz);
        if ($dt instanceof DateTime) return $dt;
    }
    try { return new DateTime($value, $tz); } catch (\Exception $e) { return null; }
}

function minuteOfWeek(DateTime $dt): int {
    return ((int)$dt->format('w')) * 1440 + ((int)$dt->format('G')) * 60 + (int)$dt->format('i');
}

// Returns ['open' => bool, 'next_open' => ?DateTime, 'next_close' => ?DateTime]
function scheduleBoundaries(PDO $pdo, ?DateTime $now = null): array {
    $now = $now ?: bazaarNow();
    $s = getBazaarSettings($pdo);

    // Manual mode: admin toggles is_open + optional one-off open_date/close_date.
    // Dates are wall-clock times in the business timezone (Africa/Addis_Ababa),
    // exactly as typed in the admin panel.
    if (($s['schedule_enabled'] ?? '0') !== '1') {
        $isOpen = ($s['is_open'] ?? '0') === '1';
        $adbTz  = new DateTimeZone('Africa/Addis_Ababa');
        $nextOpen = null;
        $nextClose = null;
        if (!empty($s['open_date'])) {
            $d = parseAddisDate($s['open_date'], $adbTz);
            // Only advertise a future open time as a countdown target.
            if ($d && $d > $now) $nextOpen = $d;
        }
        if ($isOpen && !empty($s['close_date'])) {
            $nextClose = parseAddisDate($s['close_date'], $adbTz);
            // The one-off close time has passed -> the bazaar closes automatically.
            if ($nextClose && $now >= $nextClose) {
                return ['open' => false, 'next_open' => $nextOpen, 'next_close' => null];
            }
        }
        return ['open' => $isOpen, 'next_open' => $nextOpen, 'next_close' => $nextClose];
    }

    // Scheduled mode: weekly recurring window, days 0=Sunday..6=Saturday
    $openDay   = (int)($s['open_day'] ?? 0);
    $closeDay  = (int)($s['close_day'] ?? 0);
    $openParts = array_pad(explode(':', $s['open_time'] ?? '09:00'), 2, '00');
    $closeParts = array_pad(explode(':', $s['close_time'] ?? '17:00'), 2, '00');
    $openH   = (int)$openParts[0];
    $openM   = (int)$openParts[1];
    $closeH  = (int)$closeParts[0];
    $closeM  = (int)$closeParts[1];
    $openMOW   = $openDay * 1440 + $openH * 60 + $openM;
    $closeMOW  = $closeDay * 1440 + $closeH * 60 + $closeM;

    $nowMOW    = minuteOfWeek($now);
    $weekStart = (clone $now)->modify('-' . $nowMOW . ' minutes');

    // ── User rules for 00:00 ──────────────────────────────────────────────
    // If the CLOSE time is exactly midnight, the bazaar is CLOSED (never "open all week").
    // If the OPEN  time is exactly midnight, the bazaar OPENS from that moment.
    // (When both are midnight, "close" wins → closed.)
    $openIsMidnight  = ($openH === 0 && $openM === 0);
    $closeIsMidnight = ($closeH === 0 && $closeM === 0);

    if ($closeIsMidnight && !$openIsMidnight) {
        // Close at midnight → treat as closed now; next open is the next open boundary.
        $nextOpen = (clone $weekStart)->modify('+' . (($nowMOW >= $openMOW ? 0 : -1) * 10080 + $openMOW + 10080) . ' minutes');
        return ['open' => false, 'next_open' => $nextOpen, 'next_close' => null];
    }
    if ($openIsMidnight && !$closeIsMidnight) {
        // Open at midnight → treat as open now; next close is the next close boundary.
        while ($closeMOW <= $openMOW + 1) $closeMOW += 10080;
        $k = $nowMOW >= $openMOW ? intdiv($nowMOW - $openMOW, 10080) : -1;
        $closeK = $closeMOW + $k * 10080;
        if ($nowMOW < $closeK) {
            $nextClose = (clone $weekStart)->modify('+' . $closeK . ' minutes');
            return ['open' => true, 'next_open' => null, 'next_close' => $nextClose];
        }
        $nextOpen = (clone $weekStart)->modify('+' . ($openMOW + 10080) . ' minutes');
        return ['open' => false, 'next_open' => $nextOpen, 'next_close' => null];
    }

    // ── Normal overnight window maths ─────────────────────────────────────
    if ($closeMOW <= $openMOW) $closeMOW += 10080; // window spans week boundary

    $k         = $nowMOW >= $openMOW ? intdiv($nowMOW - $openMOW, 10080) : -1;
    $openK     = $openMOW + $k * 10080;
    $closeK    = $closeMOW + $k * 10080;

    if ($nowMOW < $closeK) {
        $nextClose = (clone $weekStart)->modify('+' . $closeK . ' minutes');
        return ['open' => true, 'next_open' => null, 'next_close' => $nextClose];
    }
    $nextOpen = (clone $weekStart)->modify('+' . ($openK + 10080) . ' minutes');
    return ['open' => false, 'next_open' => $nextOpen, 'next_close' => null];
}

function isBazaarOpen(PDO $pdo): bool {
    return scheduleBoundaries($pdo)['open'];
}

// ─── Helpers: canonical categories ────────────────────────────
// Exactly 8 canonical categories. Legacy/alt names are mapped onto them
// so a "9th card" never appears on the shop-by-category grid.
function normalizeCategory(?string $name): string {
    $name = trim((string)$name);
    if ($name === '') return '';
    $canonical = [
        'Handmade Crafts', 'Fashion', 'Food & Beverage', 'Beauty & Health',
        'Home & Living', 'Sports & Outdoors', 'Books & Media', 'Services',
    ];
    if (in_array($name, $canonical, true)) return $name;
    $map = [
        'agriculture & farm'       => 'Food & Beverage',
        'agriculture'              => 'Food & Beverage',
        'art & crafts'             => 'Handmade Crafts',
        'automotive'               => 'Services',
        'beauty & personal care'   => 'Beauty & Health',
        'beauty'                   => 'Beauty & Health',
        'books & stationery'       => 'Books & Media',
        'books'                    => 'Books & Media',
        'clothing & fashion'       => 'Fashion',
        'clothing'                 => 'Fashion',
        'construction & hardware'  => 'Home & Living',
        'construction'             => 'Home & Living',
        'craft'                    => 'Handmade Crafts',
        'crafts'                   => 'Handmade Crafts',
        'food & beverages'         => 'Food & Beverage',
        'food'                     => 'Food & Beverage',
        'furniture & home'         => 'Home & Living',
        'furniture'                => 'Home & Living',
        'handcraft'                => 'Handmade Crafts',
        'handmade crafts'          => 'Handmade Crafts',
        'handicrafts'              => 'Handmade Crafts',
        'health & wellness'        => 'Beauty & Health',
        'health'                   => 'Beauty & Health',
        'home'                     => 'Home & Living',
        'kids'                     => 'Home & Living',
        'other'                    => 'Services',
        'sports & fitness'         => 'Sports & Outdoors',
        'sports'                   => 'Sports & Outdoors',
        'toys & kids'              => 'Home & Living',
        'toys'                     => 'Home & Living',
    ];
    return $map[strtolower($name)] ?? $name;
}

// ─── GET /api/bazaar/settings (public) ────────────────────────
// Returns all settings plus computed is_open, next_open, next_close (ISO 8601).
if ($method === 'GET' && $seg2 === 'settings') {
    $settings = getBazaarSettings($pdo);
    $now = bazaarNow();
    $b = scheduleBoundaries($pdo, $now);
    $settings['is_open']    = $b['open'] ? '1' : '0';
    $settings['next_open']  = $b['next_open']  ? $b['next_open']->format('c')  : null;
    $settings['next_close'] = $b['next_close'] ? $b['next_close']->format('c') : null;
    $settings['now']        = $now->format('c');
    jsonResponse($settings);
}

// ─── PUT /api/bazaar/settings (admin) ─────────────────────────
if ($method === 'PUT' && $seg2 === 'settings') {
    requireAdminAuth();
    $body = getBody();
    foreach ($body as $key => $value) {
        if ($key === '_method') continue; // tunnelled-through-POST marker, not a setting
        $pdo->prepare("INSERT INTO bazaar_settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)")
            ->execute([$key, $value]);
    }
    $rows = $pdo->query("SELECT key_name, value FROM bazaar_settings")->fetchAll();
    $settings = [];
    foreach ($rows as $r) $settings[$r['key_name']] = $r['value'];
    jsonResponse($settings);
}

// ─── GET /api/bazaar/site-images (public) ─────────────────────
// Overrides for the website's hardcoded /images/* files (page headers,
// logos, banners) so the admin can replace them via upload instead of FTP.
if ($method === 'GET' && $seg2 === 'site-images') {
    $settings = getBazaarSettings($pdo);
    $out = [];
    foreach ($settings as $k => $v) {
        if (strpos((string)$k, 'img_') === 0 && (string)$v !== '') $out[$k] = $v;
    }
    jsonResponse($out);
}

// ─── POST /api/bazaar/site-images/upload (admin) ──────────────
// Multipart: key (whitelisted img_* name) + file. Stores the file in
// uploads/site/, saves the URL as a bazaar_settings override, and
// deletes the previously uploaded file for the same key.
if ($method === 'POST' && $seg2 === 'site-images' && $seg3 === 'upload') {
    requireAdminAuth();
    $allowed = [
        'img_market_hero', 'img_bazaar_hero', 'img_blog_hero', 'img_home_banner',
        'img_about_banner', 'img_faq_hero', 'img_logo', 'img_footer_logo',
    ];
    $key = (string)($_POST['key'] ?? '');
    if (!in_array($key, $allowed, true)) jsonResponse(['message' => 'Invalid image key.'], 400);
    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);
    $ext = strtolower(pathinfo($_FILES['file']['name'] ?? '', PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
        jsonResponse(['message' => 'Only JPG, PNG, WEBP or GIF files are allowed.'], 400);
    }
    $dir = dirname(__DIR__) . '/uploads/site';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $filePath = 'uploads/site/' . uniqid() . '.' . $ext;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath)) {
        jsonResponse(['message' => 'Failed to save the uploaded file.'], 500);
    }
    $stmt = $pdo->prepare('SELECT value FROM bazaar_settings WHERE key_name = ?');
    $stmt->execute([$key]);
    $old = (string)$stmt->fetchColumn();
    $prefix = '/api/uploads/site/';
    if (strpos($old, $prefix) === 0) {
        @unlink($dir . '/' . basename(substr($old, strlen($prefix))));
    }
    $url = $prefix . basename($filePath);
    $pdo->prepare('INSERT INTO bazaar_settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)')
        ->execute([$key, $url]);
    jsonResponse(['key' => $key, 'url' => $url]);
}

// ─── POST /api/bazaar/site-images/remove (admin) ──────────────
// Body: { key } — clears the override so the site falls back to its
// default image, and deletes the uploaded file.
if ($method === 'POST' && $seg2 === 'site-images' && $seg3 === 'remove') {
    requireAdminAuth();
    $body = getBody();
    $key = (string)($body['key'] ?? '');
    $allowed = [
        'img_market_hero', 'img_bazaar_hero', 'img_blog_hero', 'img_home_banner',
        'img_about_banner', 'img_faq_hero', 'img_logo', 'img_footer_logo',
    ];
    if (!in_array($key, $allowed, true)) jsonResponse(['message' => 'Invalid image key.'], 400);
    $stmt = $pdo->prepare('SELECT value FROM bazaar_settings WHERE key_name = ?');
    $stmt->execute([$key]);
    $old = (string)$stmt->fetchColumn();
    $prefix = '/api/uploads/site/';
    if (strpos($old, $prefix) === 0) {
        @unlink(dirname(__DIR__) . '/uploads/site/' . basename(substr($old, strlen($prefix))));
    }
    $pdo->prepare('DELETE FROM bazaar_settings WHERE key_name = ?')->execute([$key]);
    jsonResponse(['key' => $key, 'url' => null]);
}

// ─── Category helpers ─────────────────────────────────────────
// `name` is the canonical key products are stored against, so it must stay on
// the canonical list. `display_name` is the free-text label the admin sets for
// the website and falls back to `name` when empty.
//
// Images come from two places: a root-relative path typed by the admin
// (/images/foo.jpg — served by the website itself) and an uploaded file stored
// as a server-relative path (uploads/bazaar/x.jpg). Only the latter needs the
// API origin prefixed; anything absolute or root-relative is passed through.
function categoryImageUrl(?string $image, string $baseUrl): ?string {
    $image = trim((string)$image);
    if ($image === '') return null;
    if (preg_match('#^https?://#i', $image) || str_starts_with($image, '/') || str_starts_with($image, 'data:')) {
        return $image;
    }
    return $baseUrl . '/' . ltrim($image, '/');
}

function categoryPayload(array $row, string $baseUrl): array {
    $displayName = trim((string)($row['display_name'] ?? ''));
    return [
        'id'           => (int)$row['id'],
        'name'         => $row['name'],
        'display_name' => $displayName !== '' ? $displayName : $row['name'],
        'image'        => categoryImageUrl($row['image'] ?? null, $baseUrl),
        'sort_order'   => (int)($row['sort_order'] ?? 0),
    ];
}

// display_name is optional everywhere: absent/null clears it back to `name`.
function categoryDisplayName(array $body, ?string $current): ?string {
    if (!array_key_exists('display_name', $body)) return $current;
    $value = trim((string)$body['display_name']);
    return $value !== '' ? $value : null;
}

// ─── GET /api/bazaar/categories (public) ──────────────────────
// Returns the admin-managed category list, ordered by sort_order then name.
if ($method === 'GET' && $seg2 === 'categories' && !$seg3) {
    // display_name is only there once its migration has run, so the select
    // list is built from the columns this database actually has.
    $columns = ['id', 'name', 'image', 'sort_order'];
    if (hasBazaarColumn($pdo, 'display_name')) array_splice($columns, 2, 0, ['display_name']);

    $stmt = $pdo->query(
        'SELECT ' . implode(', ', $columns) . '
         FROM bazaar_categories
         ORDER BY sort_order ASC, name ASC'
    );
    jsonResponse(array_map(fn($r) => categoryPayload($r, $baseUrl), $stmt->fetchAll()));
}

// ─── POST /api/bazaar/categories/:id/image (admin upload) ─────
// Must be matched before the numeric PUT/DELETE branches. `!$seg4` is what
// keeps /categories/5 from being read as a create/update of category 5.
if ($method === 'POST' && $seg2 === 'categories' && is_numeric($seg3 ?? '') && $seg4 === 'image') {
    requireAdminAuth();
    $categoryId = (int)$seg3;

    $stmt = $pdo->prepare('SELECT * FROM bazaar_categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) jsonResponse(['message' => 'Category not found.'], 404);

    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);

    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'], true)) {
        jsonResponse(['message' => 'Image must be jpg, png, gif, webp, avif or svg.'], 400);
    }

    // Only delete the previous file when we uploaded it — an admin-supplied
    // /images/... path lives in the website's public folder, not on disk here.
    $oldPath = trim((string)($category['image'] ?? ''));
    $filePath = 'uploads/bazaar/categories/' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/bazaar/categories', 0755, true);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath)) {
        jsonResponse(['message' => 'Could not save the uploaded image.'], 500);
    }
    if ($oldPath !== '' && !preg_match('#^(https?://|/|data:)#i', $oldPath)) {
        $oldFull = dirname(__DIR__) . '/' . ltrim($oldPath, '/');
        if (is_file($oldFull)) unlink($oldFull);
    }

    $pdo->prepare('UPDATE bazaar_categories SET image = ? WHERE id = ?')->execute([$filePath, $categoryId]);

    $stmt->execute([$categoryId]);
    jsonResponse(categoryPayload($stmt->fetch(), $baseUrl));
}

// ─── DELETE /api/bazaar/categories/:id/image (admin remove) ──
if ($method === 'DELETE' && $seg2 === 'categories' && is_numeric($seg3 ?? '') && $seg4 === 'image') {
    requireAdminAuth();
    $categoryId = (int)$seg3;

    $stmt = $pdo->prepare('SELECT * FROM bazaar_categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) jsonResponse(['message' => 'Category not found.'], 404);

    $oldPath = trim((string)($category['image'] ?? ''));
    if ($oldPath !== '' && !preg_match('#^(https?://|/|data:)#i', $oldPath)) {
        $oldFull = dirname(__DIR__) . '/' . ltrim($oldPath, '/');
        if (is_file($oldFull)) unlink($oldFull);
    }

    $pdo->prepare('UPDATE bazaar_categories SET image = NULL WHERE id = ?')->execute([$categoryId]);

    $stmt->execute([$categoryId]);
    jsonResponse(categoryPayload($stmt->fetch(), $baseUrl));
}

// ─── POST /api/bazaar/subcategories/image (admin upload) ──────
// Subcategories have no table — they're a hardcoded list on the site — so each
// tile image lives in a JSON map (`subcategory_images`) inside bazaar_settings,
// keyed `${category}||${subcategory}` (lower-cased, matching the site's boxKey).
// This endpoint only stores the file and hands back the URL for the admin to
// save into that map via PUT /bazaar/settings.
if ($method === 'POST' && $seg2 === 'subcategories' && $seg3 === 'image') {
    requireAdminAuth();

    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);

    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'], true)) {
        jsonResponse(['message' => 'Image must be jpg, png, gif, webp, avif or svg.'], 400);
    }

    // Best-effort cleanup of the file this upload replaces. Only delete files
    // we own inside this folder — an admin-supplied /images/... URL lives in
    // the website's public folder, not on disk here.
    $old = trim((string)($_POST['old'] ?? ''));
    $uploadPrefix = '/api/uploads/bazaar/subcategories/';
    if ($old !== '' && str_starts_with($old, $uploadPrefix)) {
        $oldFull = dirname(__DIR__) . '/uploads/bazaar/subcategories/' . basename(substr($old, strlen($uploadPrefix)));
        if (is_file($oldFull)) unlink($oldFull);
    }

    $filePath = 'uploads/bazaar/subcategories/' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/bazaar/subcategories', 0755, true);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath)) {
        jsonResponse(['message' => 'Could not save the uploaded image.'], 500);
    }

    // Root-relative /api/... URL: the API always lives under /api on this site
    // (the front-end axios base is '/api'), so this is correct regardless of
    // the APP_URL used elsewhere.
    jsonResponse(['image' => '/api/' . $filePath]);
}

// ─── POST /api/bazaar/categories (admin create) ───────────────
if ($method === 'POST' && $seg2 === 'categories' && !$seg3) {
    requireAdminAuth();
    $body = getBody();
    if (empty(trim($body['name'] ?? ''))) jsonResponse(['message' => 'Category name is required.'], 400);

    $name = trim($body['name']);
    $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : 0;
    $image = isset($body['image']) && trim($body['image']) !== '' ? trim($body['image']) : null;

    $exists = $pdo->prepare('SELECT id FROM bazaar_categories WHERE LOWER(name) = LOWER(?)');
    $exists->execute([$name]);
    if ($exists->fetch()) jsonResponse(['message' => 'Category already exists.'], 409);

    $hasDisplayName = hasBazaarColumn($pdo, 'display_name');
    $displayName = $hasDisplayName ? categoryDisplayName($body, null) : null;

    if ($hasDisplayName) {
        $pdo->prepare('INSERT INTO bazaar_categories (name, display_name, image, sort_order) VALUES (?, ?, ?, ?)')
            ->execute([$name, $displayName, $image, $sortOrder]);
    } else {
        $pdo->prepare('INSERT INTO bazaar_categories (name, image, sort_order) VALUES (?, ?, ?)')
            ->execute([$name, $image, $sortOrder]);
    }
    $newId = (int)$pdo->lastInsertId();

    jsonResponse([
        'id'           => $newId,
        'name'         => $name,
        'display_name' => $displayName !== null ? $displayName : $name,
        'image'        => categoryImageUrl($image, $baseUrl),
        'sort_order'   => $sortOrder,
    ], 201);
}

// ─── PUT /api/bazaar/categories/:id (admin rename) ────────────
if (($method === 'PUT' || $method === 'POST') && $seg2 === 'categories' && is_numeric($seg3 ?? '') && !$seg4) {
    requireAdminAuth();
    $categoryId = (int)$seg3;
    $body = getBody();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) jsonResponse(['message' => 'Category not found.'], 404);

    $name = isset($body['name']) ? trim($body['name']) : $category['name'];
    if ($name === '') jsonResponse(['message' => 'Category name is required.'], 400);

    $dup = $pdo->prepare('SELECT id FROM bazaar_categories WHERE LOWER(name) = LOWER(?) AND id <> ?');
    $dup->execute([$name, $categoryId]);
    if ($dup->fetch()) jsonResponse(['message' => 'Another category with this name already exists.'], 409);

    $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : (int)$category['sort_order'];
    $image = isset($body['image']) ? (trim($body['image']) !== '' ? trim($body['image']) : null) : $category['image'];

    if (hasBazaarColumn($pdo, 'display_name')) {
        $displayName = categoryDisplayName($body, $category['display_name'] ?? null);
        $pdo->prepare('UPDATE bazaar_categories SET name = ?, display_name = ?, image = ?, sort_order = ? WHERE id = ?')
            ->execute([$name, $displayName, $image, $sortOrder, $categoryId]);
    } else {
        $pdo->prepare('UPDATE bazaar_categories SET name = ?, image = ?, sort_order = ? WHERE id = ?')
            ->execute([$name, $image, $sortOrder, $categoryId]);
    }

    $stmt->execute([$categoryId]);
    jsonResponse(categoryPayload($stmt->fetch(), $baseUrl));
}

// ─── DELETE /api/bazaar/categories/:id (admin delete) ─────────
// Deleting a category only removes it from the list. Existing products
// that used it keep their free-text category value (products are never lost).
if ($method === 'DELETE' && $seg2 === 'categories' && is_numeric($seg3 ?? '') && !$seg4) {
    requireAdminAuth();
    $categoryId = (int)$seg3;

    $stmt = $pdo->prepare('SELECT * FROM bazaar_categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if (!$category) jsonResponse(['message' => 'Category not found.'], 404);

    $pdo->prepare('DELETE FROM bazaar_categories WHERE id = ?')->execute([$categoryId]);

    jsonResponse(['message' => 'Category deleted.', 'id' => $categoryId]);
}
$seg5 = $parts[5] ?? null; // numeric photo_id when seg4 = 'photos'

// Resolve common IDs
$productId = ($seg2 === 'products' && is_numeric($seg3)) ? (int)$seg3 : null;
$orderId   = ($seg2 === 'orders'   && is_numeric($seg3)) ? (int)$seg3 : null;
$sellerId  = ($seg2 === 'sellers'  && is_numeric($seg3)) ? (int)$seg3 : null;
$photoId   = ($seg4 === 'photos'   && is_numeric($seg5)) ? (int)$seg5 : null;

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Fetch a single product with its photos array and seller info.
 * Returns null if the product does not exist.
 * Only returns active products unless $anyStatus is true.
 */
function getProductFull(PDO $pdo, int $id, string $baseUrl, bool $anyStatus = false): ?array {
    $statusClause = $anyStatus ? '' : "AND p.status = 'active'";
    $stmt = $pdo->prepare(
        "SELECT p.*,
                COALESCE(u.company_name, u.full_name) AS seller_name,
                u.full_name    AS seller_full_name,
                u.company_name AS seller_company_name,
                u.location     AS seller_location,
                u.website      AS seller_description,
                u.phone        AS seller_phone
         FROM bazaar_products p
         JOIN users u ON u.id = p.seller_id
         WHERE p.id = ? $statusClause"
    );
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) return null;

    // Attach photos array
    $photos = $pdo->prepare(
        'SELECT id, file_path, sort_order
         FROM bazaar_product_photos
         WHERE product_id = ?
         ORDER BY sort_order ASC, id ASC'
    );
    $photos->execute([$id]);
    $product['photos'] = array_map(
        fn($ph) => [
            'id'       => $ph['id'],
            'url'      => "$baseUrl/{$ph['file_path']}",
            'sort_order' => $ph['sort_order'],
        ],
        $photos->fetchAll()
    );

    try {
        $tg = $pdo->prepare('SELECT telegram FROM user_profiles WHERE user_id = ?');
        $tg->execute([(int)$product['seller_id']]);
        $product['seller_telegram'] = $tg->fetchColumn() ?: null;
    } catch (PDOException $e) {
        $product['seller_telegram'] = null;
    }

    // Single source of truth for the -X% badge shown on every page
    $price = (float)$product['price'];
    $product['discount_percent'] = ($price > 0 && $product['discount_price'] !== null && (float)$product['discount_price'] < $price)
        ? round((($price - (float)$product['discount_price']) / $price) * 100)
        : null;

    return $product;
}

/**
 * Save an uploaded file to uploads/bazaar/ and return the relative path.
 * Returns null if no file was uploaded.
 */
function saveBazaarUpload(): ?string {
    if (empty($_FILES['file']['tmp_name'])) return null;
    $ext  = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $path = 'uploads/bazaar/' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/bazaar', 0755, true);
    move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $path);
    return $path;
}

// ─── GET /api/bazaar/products/trending (public) ────────────────
// Returns top-selling products (most ordered items) for trending/best-sellers display.
// Supports ?period=week|month|all (default: all) and ?limit=N (default: 6)
if ($method === 'GET' && $seg2 === 'products' && $seg3 === 'trending') {
    $period = $_GET['period'] ?? 'all';
    $limit  = min((int)($_GET['limit'] ?? 6), 20);

    $dateFilter = '';
    if ($period === 'week') {
        $dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
    } elseif ($period === 'month') {
        $dateFilter = "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    }

    $sql = "SELECT p.*,
                   COALESCE(u.company_name, u.full_name) AS seller_name,
                   u.location AS seller_location,
                   u.website AS seller_description,
                   COUNT(oi.id) AS order_count
            FROM bazaar_products p
            JOIN users u ON u.id = p.seller_id
            LEFT JOIN bazaar_order_items oi ON oi.product_id = p.id
            LEFT JOIN bazaar_orders o ON o.id = oi.order_id AND o.status = 'confirmed' $dateFilter
            WHERE p.status = 'active'
            GROUP BY p.id
            ORDER BY order_count DESC, p.created_at DESC
            LIMIT ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll();

    // Attach photos to each product in a single query
    $result = attachPhotos($pdo, $products, $baseUrl);
    foreach ($result as &$p) $p['order_count'] = (int)$p['order_count'];
    unset($p);

    jsonResponse($result);
}

// ─── GET /api/bazaar/products/best-deals (public) ──────────────
// Best discounted products. Only products with a real discount (discount_price < price).
// ?period=today|week (default today), ?limit=N (default 4, max 12)
// Ranking: most units sold inside the window → biggest % off → most viewed.
if ($method === 'GET' && $seg2 === 'products' && $seg3 === 'best-deals') {
    $period = ($_GET['period'] ?? 'today') === 'week' ? 'week' : 'today';
    $limit  = max(1, min((int)($_GET['limit'] ?? 4), 12));

    $dateFilter = $period === 'week'
        ? "AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
        : "AND o.created_at >= CURDATE()";

    $buildSql = fn(bool $withViews) => "SELECT p.*,
               COALESCE(u.company_name, u.full_name) AS seller_name,
               u.location AS seller_location,
               u.website AS seller_description,
               COALESCE(SUM(oi.quantity), 0) AS sold_count
        FROM bazaar_products p
        JOIN users u ON u.id = p.seller_id
        LEFT JOIN bazaar_order_items oi ON oi.product_id = p.id
        LEFT JOIN bazaar_orders o ON o.id = oi.order_id AND o.status = 'confirmed' $dateFilter
        WHERE p.status = 'active'
          AND p.discount_price IS NOT NULL
          AND p.discount_price > 0
          AND p.discount_price < p.price
        GROUP BY p.id
        ORDER BY sold_count DESC,
                 ((p.price - p.discount_price) / NULLIF(p.price,0)) DESC"
                 . ($withViews ? ", p.views DESC" : "")
                 . ", p.id DESC
        LIMIT $limit";

    try {
        $stmt = $pdo->query($buildSql(true));
        $products = $stmt->fetchAll();
    } catch (PDOException $e) {
        // views column may not exist yet — retry without it
        $products = $pdo->query($buildSql(false))->fetchAll();
    }

    $result = attachPhotos($pdo, $products, $baseUrl);
    foreach ($result as &$p) {
        $p['sold_count'] = (int)$p['sold_count'];
        $price = (float)$p['price'];
        $p['discount_percent'] = ($price > 0 && $p['discount_price'] !== null && (float)$p['discount_price'] < $price)
            ? round((($price - (float)$p['discount_price']) / $price) * 100)
            : null;
    }
    unset($p);

    jsonResponse($result);
}

// ─── GET /api/bazaar/products (public) ────────────────────────
// Returns all active products with seller name and photos.
// Supports query params: seller_id, category, search, min_price, max_price, scope
// scope=market → always available (ignores bazaar open window), all active products.
// scope=bazaar (default) → only during an open bazaar window, and only products with in_bazaar = 1.
if ($method === 'GET' && $seg2 === 'products' && !$productId && $seg3 !== 'admin' && $seg3 !== 'trending' && $seg3 !== 'best-deals') {
    $scope = ($_GET['scope'] ?? 'bazaar') === 'market' ? 'market' : 'bazaar';

    // Seller viewing their own products — bypass bazaar open check
    $isSellerOwnView = !empty($_GET['seller_id']) && !empty($_GET['include_inactive']);

    // If bazaar is closed and not a seller viewing their own store, return closed status
    if ($scope === 'bazaar' && !$isSellerOwnView && !isBazaarOpen($pdo)) {
        jsonResponse(['bazaar_closed' => true, 'products' => []]);
    }

    $where  = $isSellerOwnView ? ["p.status != 'removed'"] : ["p.status = 'active'"];
    $params = [];

    // Bazaar scope only shows products the seller opted in to the bazaar
    if ($scope === 'bazaar' && !$isSellerOwnView) {
        static $hasInBazaarCol = null;
        if ($hasInBazaarCol === null) {
            try {
                $col = $pdo->query("SHOW COLUMNS FROM bazaar_products LIKE 'in_bazaar'")->fetch();
                $hasInBazaarCol = (bool)$col;
            } catch (PDOException $e) { $hasInBazaarCol = false; }
        }
        if ($hasInBazaarCol) $where[] = 'p.in_bazaar = 1';
    }
    // Filter by seller
    if (!empty($_GET['seller_id'])) {
        $where[]  = 'p.seller_id = ?';
        $params[] = (int)$_GET['seller_id'];
    }

    // Filter by category (exact match, case-insensitive via LOWER)
    if (!empty($_GET['category'])) {
        $where[]  = 'LOWER(p.category) = LOWER(?)';
        $params[] = $_GET['category'];
    }

    // Filter by subcategory (case-insensitive)
    if (!empty($_GET['subcategory']) && hasBazaarColumn($pdo, 'subcategory')) {
        $where[]  = 'LOWER(p.subcategory) = LOWER(?)';
        $params[] = $_GET['subcategory'];
    }

    // Full-text search on name or description (case-insensitive)
    if (!empty($_GET['search'])) {
        $where[]  = '(LOWER(p.name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?))';
        $term     = '%' . $_GET['search'] . '%';
        $params[] = $term;
        $params[] = $term;
    }

    // Price range filters. Compare against the price the buyer actually pays
    // (discount_price when it is set and lower) so a discounted product can
    // never show a price outside the range the user filtered for.
    $effectivePrice = "CASE WHEN p.discount_price IS NOT NULL AND p.discount_price > 0
                              AND p.price > 0 AND p.discount_price < p.price
                         THEN p.discount_price ELSE p.price END";
    if (isset($_GET['min_price']) && $_GET['min_price'] !== '') {
        $where[]  = "$effectivePrice >= ?";
        $params[] = (float)$_GET['min_price'];
    }
    if (isset($_GET['max_price']) && $_GET['max_price'] !== '') {
        $where[]  = "$effectivePrice <= ?";
        $params[] = (float)$_GET['max_price'];
    }

    $whereClause = 'WHERE ' . implode(' AND ', $where);

    $sql = "SELECT p.*,
                   COALESCE(u.company_name, u.full_name) AS seller_name,
                   u.location    AS seller_location,
                   u.website     AS seller_description,
                   CASE WHEN p.discount_price IS NOT NULL AND p.discount_price > 0 AND p.price > 0 AND p.discount_price < p.price
                        THEN ROUND(((p.price - p.discount_price) / p.price) * 100)
                        ELSE NULL END AS discount_percent
            FROM bazaar_products p
            JOIN users u ON u.id = p.seller_id
            $whereClause
            ORDER BY p.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Attach photos to each product in a single query
    $result = attachPhotos($pdo, $products, $baseUrl);

    jsonResponse($result);
}

// ─── GET /api/bazaar/products/:id (public) ────────────────────
// Returns full product record with photos and seller info.
// Increments the product's view counter. Returns 404 if not found or not active.
if ($method === 'GET' && $productId && !$seg4) {
    try {
        $pdo->prepare('UPDATE bazaar_products SET views = views + 1 WHERE id = ?')->execute([$productId]);
    } catch (PDOException $e) { /* views column may not exist yet — ignore */ }
    $product = getProductFull($pdo, $productId, $baseUrl);
    if (!$product) {
        jsonResponse(['message' => 'Product not found.'], 404);
    }
    jsonResponse($product);
}

// ─── POST /api/bazaar/products/:id/like (public) ──────────────
// Body: { "liked": true|false } — increments or decrements the like counter.
// Dedupe is handled client-side (localStorage); server just counts.
if ($method === 'POST' && $productId && $seg4 === 'like') {
    $body  = getBody();
    $liked = !empty($body['liked']);
    try {
        if ($liked) {
            $pdo->prepare('UPDATE bazaar_products SET likes = likes + 1 WHERE id = ?')->execute([$productId]);
        } else {
            $pdo->prepare('UPDATE bazaar_products SET likes = GREATEST(likes - 1, 0) WHERE id = ?')->execute([$productId]);
        }
        $stmt = $pdo->prepare('SELECT likes FROM bazaar_products WHERE id = ?');
        $stmt->execute([$productId]);
        jsonResponse(['likes' => (int)$stmt->fetchColumn()]);
    } catch (PDOException $e) {
        jsonResponse(['message' => 'Likes are not available yet.'], 500);
    }
}

// ─── GET /api/bazaar/sellers/:id (public) ─────────────────────
// Minimal public contact card (phone/telegram) for a seller.
if ($method === 'GET' && $seg2 === 'sellers' && $sellerId && !$seg4) {
    $stmt = $pdo->prepare(
        'SELECT id,
                COALESCE(company_name, full_name) AS name,
                location,
                phone
         FROM users
         WHERE id = ?'
    );
    $stmt->execute([$sellerId]);
    $seller = $stmt->fetch();
    if (!$seller) {
        jsonResponse(['message' => 'Seller not found.'], 404);
    }
    $seller['telegram'] = null;
    try {
        $tg = $pdo->prepare('SELECT telegram FROM user_profiles WHERE user_id = ?');
        $tg->execute([$sellerId]);
        $seller['telegram'] = $tg->fetchColumn() ?: null;
    } catch (PDOException $e) {
        $seller['telegram'] = null;
    }
    jsonResponse($seller);
}

// ─── GET /api/bazaar/sellers/:id/banks (public) ───────────────
// Returns all bank account rows for the given seller.
// Public endpoint — no auth required (shown to customer during checkout).
if ($method === 'GET' && $seg2 === 'sellers' && $sellerId && $seg4 === 'banks') {
    $stmt = $pdo->prepare(
        'SELECT id, bank, account_number, account_name
         FROM bazaar_seller_banks
         WHERE seller_id = ?
         ORDER BY bank ASC'
    );
    $stmt->execute([$sellerId]);
    jsonResponse($stmt->fetchAll());
}

// ─── POST /api/bazaar/products (seller create) ────────────────
// Requires auth. Validates name, price > 0, category, stock_quantity >= 0.
// Inserts into bazaar_products with seller_id = $user['id'].
// NOTE: $seg3 === 'admin' is excluded so the admin-create branch below owns
// POST /products/admin — otherwise this branch would match first and
// requireUserAuth() would reject the admin.
if ($method === 'POST' && $seg2 === 'products' && !$productId && $seg3 !== 'admin') {
    $user = requireUserAuth();
    $body = getBody();

    if (empty($body['name']))     jsonResponse(['message' => 'Name is required.'], 400);
    if (empty($body['category'])) jsonResponse(['message' => 'Category is required.'], 400);

    $price = isset($body['price']) ? (float)$body['price'] : null;
    if ($price === null || $price <= 0) jsonResponse(['message' => 'Price must be greater than zero.'], 400);

    $stock = isset($body['stock_quantity']) ? (int)$body['stock_quantity'] : 0;
    if ($stock < 0) jsonResponse(['message' => 'Stock quantity must be zero or greater.'], 400);

    $isPackage = !empty($body['is_package']) ? 1 : 0;
    $packageItems = $body['package_items'] ?? null;
    if ($isPackage && is_array($packageItems)) {
        $packageItems = json_encode($packageItems);
    } elseif (!$isPackage) {
        $packageItems = null;
    }

    $discountPrice = isset($body['discount_price']) ? (float)$body['discount_price'] : null;
    if ($discountPrice !== null && $discountPrice <= 0) $discountPrice = null;
    if ($discountPrice !== null && $price > 0 && $discountPrice >= $price) {
        jsonResponse(['message' => 'Discount price must be lower than the original price.'], 400);
    }

    $inBazaar = isset($body['in_bazaar']) ? ($body['in_bazaar'] ? 1 : 0) : 1;
    $subcategory = isset($body['subcategory']) && trim((string)$body['subcategory']) !== '' ? trim((string)$body['subcategory']) : null;
    $hasSub = hasBazaarColumn($pdo, 'subcategory');

    if ($hasSub) {
        $stmt = $pdo->prepare(
            'INSERT INTO bazaar_products (seller_id, name, description, price, discount_price, category, subcategory, stock_quantity, colors, status, is_package, package_items, in_bazaar)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            (int)$user['id'],
            $body['name'],
            $body['description'] ?? '',
            $price,
            $discountPrice,
            normalizeCategory($body['category']),
            $subcategory,
            $stock,
            $body['colors'] ?? null,
            'pending',
            $isPackage,
            $packageItems,
            $inBazaar,
        ]);
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO bazaar_products (seller_id, name, description, price, discount_price, category, stock_quantity, colors, status, is_package, package_items, in_bazaar)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            (int)$user['id'],
            $body['name'],
            $body['description'] ?? '',
            $price,
            $discountPrice,
            normalizeCategory($body['category']),
            $stock,
            $body['colors'] ?? null,
            'pending',
            $isPackage,
            $packageItems,
            $inBazaar,
        ]);
    }
    $newId = (int)$pdo->lastInsertId();
    jsonResponse(getProductFull($pdo, $newId, $baseUrl, true), 201);
}

// ─── PUT /api/bazaar/products/:id (seller update) ─────────────
// Requires auth. Verifies ownership (403 if not owner). Validates price > 0, stock >= 0.
if ($method === 'PUT' && $productId && !$seg4) {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);
    if ((int)$product['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    $body = getBody();

    $price = isset($body['price']) ? (float)$body['price'] : (float)$product['price'];
    if ($price <= 0) jsonResponse(['message' => 'Price must be greater than zero.'], 400);

    $stock = isset($body['stock_quantity']) ? (int)$body['stock_quantity'] : (int)$product['stock_quantity'];
    if ($stock < 0) jsonResponse(['message' => 'Stock quantity must be zero or greater.'], 400);

    $isPackage = isset($body['is_package']) ? ($body['is_package'] ? 1 : 0) : (int)$product['is_package'];
    $packageItems = $body['package_items'] ?? $product['package_items'];
    if (is_array($packageItems)) {
        $packageItems = json_encode($packageItems);
    }

    $discountPrice = isset($body['discount_price']) ? (float)$body['discount_price'] : $product['discount_price'];
    if ($discountPrice !== null && $discountPrice <= 0) $discountPrice = null;
    if ($discountPrice !== null && $price > 0 && $discountPrice >= $price) {
        jsonResponse(['message' => 'Discount price must be lower than the original price.'], 400);
    }

    $inBazaar = isset($body['in_bazaar'])
        ? ($body['in_bazaar'] ? 1 : 0)
        : (int)($product['in_bazaar'] ?? 1);

    $hasSub = hasBazaarColumn($pdo, 'subcategory');
    if ($hasSub) {
        $subcategory = isset($body['subcategory']) && trim((string)$body['subcategory']) !== ''
            ? trim((string)$body['subcategory'])
            : ($product['subcategory'] ?? null);
        $pdo->prepare(
            'UPDATE bazaar_products
             SET name=?, description=?, price=?, discount_price=?, category=?, subcategory=?, stock_quantity=?, colors=?, is_package=?, package_items=?, in_bazaar=?
             WHERE id=?'
        )->execute([
            $body['name']        ?? $product['name'],
            $body['description'] ?? $product['description'],
            $price,
            $discountPrice,
            normalizeCategory($body['category'] ?? $product['category']),
            $subcategory,
            $stock,
            $body['colors']      ?? $product['colors'],
            $isPackage,
            $packageItems,
            $inBazaar,
            $productId,
        ]);
    } else {
        $pdo->prepare(
            'UPDATE bazaar_products
             SET name=?, description=?, price=?, discount_price=?, category=?, stock_quantity=?, colors=?, is_package=?, package_items=?, in_bazaar=?
             WHERE id=?'
        )->execute([
            $body['name']        ?? $product['name'],
            $body['description'] ?? $product['description'],
            $price,
            $discountPrice,
            normalizeCategory($body['category'] ?? $product['category']),
            $stock,
            $body['colors']      ?? $product['colors'],
            $isPackage,
            $packageItems,
            $inBazaar,
            $productId,
        ]);
    }

    jsonResponse(getProductFull($pdo, $productId, $baseUrl, true));
}

// ─── DELETE /api/bazaar/products/:id (seller soft-delete) ─────
// Requires auth. Verifies ownership (403 if not owner). Sets status = 'inactive'.
if ($method === 'DELETE' && $productId && !$seg4) {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);
    if ((int)$product['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    $pdo->prepare("UPDATE bazaar_products SET status = 'inactive' WHERE id = ?")
        ->execute([$productId]);

    jsonResponse(['message' => 'Product deleted.']);
}

// ─── POST /api/bazaar/products/:id/photos (seller upload) ─────
// Requires auth. Verifies ownership. Max 5 photos per product.
if ($method === 'POST' && $productId && $seg4 === 'photos') {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);
    if ((int)$product['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    // Count existing photos
    $countStmt = $pdo->prepare('SELECT COUNT(*) AS cnt FROM bazaar_product_photos WHERE product_id = ?');
    $countStmt->execute([$productId]);
    if ((int)$countStmt->fetch()['cnt'] >= 5) {
        jsonResponse(['message' => 'Maximum 5 photos per product.'], 400);
    }

    $filePath = saveBazaarUpload();
    if (!$filePath) jsonResponse(['message' => 'No file uploaded.'], 400);

    $sortOrder = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;
    $ins = $pdo->prepare(
        'INSERT INTO bazaar_product_photos (product_id, file_path, sort_order) VALUES (?, ?, ?)'
    );
    $ins->execute([$productId, $filePath, $sortOrder]);
    $photoRowId = (int)$pdo->lastInsertId();

    $row = $pdo->prepare('SELECT * FROM bazaar_product_photos WHERE id = ?');
    $row->execute([$photoRowId]);
    $photo = $row->fetch();
    $photo['url'] = "$baseUrl/{$photo['file_path']}";

    jsonResponse($photo, 201);
}

// ─── DELETE /api/bazaar/products/:id/photos/:photo_id ─────────
// Requires auth. Verifies product ownership. Deletes file from disk and DB row.
if ($method === 'DELETE' && $productId && $seg4 === 'photos' && $photoId) {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);
    if ((int)$product['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    $photoStmt = $pdo->prepare('SELECT * FROM bazaar_product_photos WHERE id = ? AND product_id = ?');
    $photoStmt->execute([$photoId, $productId]);
    $photo = $photoStmt->fetch();
    if (!$photo) jsonResponse(['message' => 'Photo not found.'], 404);

    // Delete file from disk
    $fullPath = dirname(__DIR__) . '/' . $photo['file_path'];
    if (file_exists($fullPath)) unlink($fullPath);

    $pdo->prepare('DELETE FROM bazaar_product_photos WHERE id = ?')->execute([$photoId]);

    jsonResponse(['message' => 'Photo deleted.']);
}

// ─── PUT /api/bazaar/sellers/banks (seller upsert bank) ───────
// Requires auth. Validates bank enum. Upserts into bazaar_seller_banks.
if ($method === 'PUT' && $seg2 === 'sellers' && $seg3 === 'banks') {
    $user = requireUserAuth();
    $body = getBody();

    $allowedBanks = ['cbe', 'awash', 'dashen', 'abyssinia', 'telebirr'];
    $bank = $body['bank'] ?? '';
    if (!in_array($bank, $allowedBanks, true)) {
        jsonResponse(['message' => 'Bank must be one of: cbe, awash, dashen, abyssinia, telebirr.'], 400);
    }
    if (empty($body['account_number'])) jsonResponse(['message' => 'Account number is required.'], 400);

    $pdo->prepare(
        'INSERT INTO bazaar_seller_banks (seller_id, bank, account_number, account_name)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           account_number = VALUES(account_number),
           account_name   = VALUES(account_name),
           updated_at     = CURRENT_TIMESTAMP'
    )->execute([
        (int)$user['id'],
        $bank,
        $body['account_number'],
        $body['account_name'] ?? null,
    ]);

    $row = $pdo->prepare(
        'SELECT * FROM bazaar_seller_banks WHERE seller_id = ? AND bank = ?'
    );
    $row->execute([(int)$user['id'], $bank]);
    jsonResponse($row->fetch());
}

// ─── GET /api/bazaar/products/admin/all (admin) ───────────────
// Returns ALL products regardless of status, joined with seller name and photos.
// Supports query params: seller_id, category, status
// NOTE: This route is checked BEFORE the numeric productId routes because $seg3 = 'admin'.
if ($method === 'GET' && $seg2 === 'products' && $seg3 === 'admin' && $seg4 === 'all') {
    $admin = requireAdminAuth();

    $where  = ['1=1'];
    $params = [];

    // Filter by seller
    if (!empty($_GET['seller_id'])) {
        $where[]  = 'p.seller_id = ?';
        $params[] = (int)$_GET['seller_id'];
    }

    // Filter by category (exact match, case-insensitive)
    if (!empty($_GET['category'])) {
        $where[]  = 'LOWER(p.category) = LOWER(?)';
        $params[] = $_GET['category'];
    }

    // Filter by status (active, inactive, removed)
    if (!empty($_GET['status'])) {
        $where[]  = 'p.status = ?';
        $params[] = $_GET['status'];
    }

    $whereClause = 'WHERE ' . implode(' AND ', $where);

    $sql = "SELECT p.*,
                   COALESCE(u.company_name, u.full_name) AS seller_name,
                   u.location    AS seller_location,
                   u.website     AS seller_description
            FROM bazaar_products p
            JOIN users u ON u.id = p.seller_id
            $whereClause
            ORDER BY p.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    // Attach photos to each product in a single query
    $result = attachPhotos($pdo, $products, $baseUrl);

    jsonResponse($result);
}

// ─── PUT /api/bazaar/products/admin/:id (admin update) ─────────
if (($method === 'PUT' || $method === 'POST') && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && !isset($parts[5])) {
    requireAdminAuth();
    $pid = (int)$seg4;
    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$pid]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);

    $body = getBody();
    $price = isset($body['price']) ? (float)$body['price'] : (float)$product['price'];
    if ($price <= 0) jsonResponse(['message' => 'Price must be greater than zero.'], 400);
    $stock = isset($body['stock_quantity']) ? (int)$body['stock_quantity'] : (int)$product['stock_quantity'];
    if ($stock < 0) jsonResponse(['message' => 'Stock quantity must be zero or greater.'], 400);

    $isPackage = isset($body['is_package']) ? ($body['is_package'] ? 1 : 0) : (int)$product['is_package'];
    $packageItems = $body['package_items'] ?? $product['package_items'];
    if (is_array($packageItems)) $packageItems = json_encode($packageItems);

    $discountPrice = isset($body['discount_price']) ? (float)$body['discount_price'] : $product['discount_price'];
    if ($discountPrice !== null && $discountPrice <= 0) $discountPrice = null;
    if ($discountPrice !== null && $price > 0 && $discountPrice >= $price) {
        jsonResponse(['message' => 'Discount price must be lower than the original price.'], 400);
    }

    $hasSub = hasBazaarColumn($pdo, 'subcategory');
    if ($hasSub) {
        $subcategory = isset($body['subcategory']) && trim((string)$body['subcategory']) !== ''
            ? trim((string)$body['subcategory'])
            : ($product['subcategory'] ?? null);
        $pdo->prepare(
            'UPDATE bazaar_products
             SET name=?, description=?, price=?, discount_price=?, category=?, subcategory=?, stock_quantity=?, colors=?, is_package=?, package_items=?
             WHERE id=?'
        )->execute([
            $body['name']        ?? $product['name'],
            $body['description'] ?? $product['description'],
            $price,
            $discountPrice,
            normalizeCategory($body['category'] ?? $product['category']),
            $subcategory,
            $stock,
            $body['colors']      ?? $product['colors'],
            $isPackage,
            $packageItems,
            $pid,
        ]);
    } else {
        $pdo->prepare(
            'UPDATE bazaar_products
             SET name=?, description=?, price=?, discount_price=?, category=?, stock_quantity=?, colors=?, is_package=?, package_items=?
             WHERE id=?'
        )->execute([
            $body['name']        ?? $product['name'],
            $body['description'] ?? $product['description'],
            $price,
            $discountPrice,
            normalizeCategory($body['category'] ?? $product['category']),
            $stock,
            $body['colors']      ?? $product['colors'],
            $isPackage,
            $packageItems,
            $pid,
        ]);
    }

    jsonResponse(getProductFull($pdo, $pid, $baseUrl, true));
}

// ─── DELETE /api/bazaar/products/admin/:id (admin remove) ─────
// Requires admin auth. Reads removal_reason from request body.

// ─── PUT /api/bazaar/products/admin/:id/approve (admin approve) ──
if ($method === 'PUT' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && ($parts[5] ?? '') === 'approve') {
    requireAdminAuth();
    $pid = (int)$seg4;
    $pdo->prepare("UPDATE bazaar_products SET status = 'active' WHERE id = ?")->execute([$pid]);
    jsonResponse(['message' => 'Product approved.', 'id' => $pid]);
}

// ─── PUT /api/bazaar/products/admin/:id/reject (admin reject) ──
if ($method === 'PUT' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && ($parts[5] ?? '') === 'reject') {
    requireAdminAuth();
    $pid = (int)$seg4;
    $body = getBody();
    $reason = $body['reason'] ?? 'Rejected by admin';
    $pdo->prepare("UPDATE bazaar_products SET status = 'removed', removal_reason = ? WHERE id = ?")->execute([$reason, $pid]);
    jsonResponse(['message' => 'Product rejected.', 'id' => $pid]);
}

// ─── PUT /api/bazaar/products/admin/:id/in-bazaar (admin toggle bazaar listing)
// Body: { "in_bazaar": true|false }
if ($method === 'PUT' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && ($parts[5] ?? '') === 'in-bazaar') {
    requireAdminAuth();
    $pid = (int)$seg4;
    $body = getBody();
    if (!array_key_exists('in_bazaar', $body)) {
        jsonResponse(['message' => 'in_bazaar field is required (true or false).'], 400);
    }
    $inBazaar = $body['in_bazaar'] ? 1 : 0;
    $stmt = $pdo->prepare('UPDATE bazaar_products SET in_bazaar = ? WHERE id = ?');
    try {
        $stmt->execute([$inBazaar, $pid]);
    } catch (PDOException $e) {
        jsonResponse(['message' => 'Run database/bazaar_in_bazaar_migration.sql first.'], 500);
    }
    jsonResponse(['message' => $inBazaar ? 'Product added to Bazaar.' : 'Product removed from Bazaar.', 'id' => $pid, 'in_bazaar' => $inBazaar]);
}

// ─── POST /api/bazaar/products/admin (admin create) ────────────
// Body: { seller_id, name, description, price, discount_price, category,
//         subcategory, stock_quantity, colors, is_package, package_items, status }
// Multipart also accepted so photos can be attached in the same request.
if ($method === 'POST' && $seg2 === 'products' && $seg3 === 'admin' && !$seg4) {
    requireAdminAuth();
    $body = getBody();

    $sellerId = (int)($body['seller_id'] ?? 0);
    if ($sellerId <= 0) jsonResponse(['message' => 'seller_id is required.'], 400);
    $sellerStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $sellerStmt->execute([$sellerId]);
    if (!$sellerStmt->fetch()) jsonResponse(['message' => 'Seller not found.'], 404);

    $name = trim((string)($body['name'] ?? ''));
    if ($name === '') jsonResponse(['message' => 'Product name is required.'], 400);

    $price = (float)($body['price'] ?? 0);
    if ($price <= 0) jsonResponse(['message' => 'Price must be greater than zero.'], 400);

    $stock = (int)($body['stock_quantity'] ?? 0);
    if ($stock < 0) jsonResponse(['message' => 'Stock quantity must be zero or greater.'], 400);

    $discountPrice = isset($body['discount_price']) && $body['discount_price'] !== ''
        ? (float)$body['discount_price'] : null;
    if ($discountPrice !== null && $discountPrice <= 0) $discountPrice = null;
    if ($discountPrice !== null && $discountPrice >= $price) {
        jsonResponse(['message' => 'Discount price must be lower than the original price.'], 400);
    }

    $category = trim((string)($body['category'] ?? ''));
    if ($category === '') jsonResponse(['message' => 'Category is required.'], 400);

    $isPackage = !empty($body['is_package']) ? 1 : 0;
    $packageItems = $body['package_items'] ?? null;
    if (is_array($packageItems)) $packageItems = json_encode($packageItems);
    if ($packageItems === '' ) $packageItems = null;

    $status = (string)($body['status'] ?? 'active');
    if (!in_array($status, ['active', 'inactive'], true)) $status = 'active';

    // Build the column list from the columns this database actually has, so the
    // route also works on installations where an optional migration hasn't run.
    $subcategory = trim((string)($body['subcategory'] ?? '')) ?: null;

    $columns = [
        'seller_id'        => $sellerId,
        'name'             => $name,
        'description'      => $body['description'] ?? null,
        'price'            => $price,
        'discount_price'   => $discountPrice,
        'category'         => normalizeCategory($category),
        'subcategory'      => $subcategory,
        'stock_quantity'   => $stock,
        'colors'           => $body['colors'] ?? null,
        'is_package'       => $isPackage,
        'package_items'    => $packageItems,
        'status'           => $status,
        'in_bazaar'        => 1,
    ];

    $columns = array_filter(
        $columns,
        fn($col) => hasBazaarColumn($pdo, $col),
        ARRAY_FILTER_USE_KEY
    );

    $names = array_keys($columns);
    $ins = $pdo->prepare(
        'INSERT INTO bazaar_products (' . implode(', ', $names) . ') VALUES (' .
        implode(', ', array_fill(0, count($names), '?')) . ')'
    );
    $ins->execute(array_values($columns));
    $newId = (int)$pdo->lastInsertId();

    // Optional photo attached in the same multipart request
    if (!empty($_FILES['file']['tmp_name'])) {
        $photoPath = saveBazaarUpload();
        if ($photoPath) {
            $pdo->prepare('INSERT INTO bazaar_product_photos (product_id, file_path, sort_order) VALUES (?, ?, 0)')
                ->execute([$newId, $photoPath]);
        }
    }

    jsonResponse(getProductFull($pdo, $newId, $baseUrl, true), 201);
}

// ─── POST /api/bazaar/products/admin/:id/photos (admin upload) ──
// Admin equivalent of the seller photo route: no ownership check.
if ($method === 'POST' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && ($parts[5] ?? '') === 'photos') {
    requireAdminAuth();
    $pid = (int)$seg4;

    $stmt = $pdo->prepare('SELECT id FROM bazaar_products WHERE id = ?');
    $stmt->execute([$pid]);
    if (!$stmt->fetch()) jsonResponse(['message' => 'Product not found.'], 404);

    $countStmt = $pdo->prepare('SELECT COUNT(*) AS cnt FROM bazaar_product_photos WHERE product_id = ?');
    $countStmt->execute([$pid]);
    if ((int)$countStmt->fetch()['cnt'] >= 5) {
        jsonResponse(['message' => 'Maximum 5 photos per product.'], 400);
    }

    $filePath = saveBazaarUpload();
    if (!$filePath) jsonResponse(['message' => 'No file uploaded.'], 400);

    $sortOrder = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;
    $ins = $pdo->prepare(
        'INSERT INTO bazaar_product_photos (product_id, file_path, sort_order) VALUES (?, ?, ?)'
    );
    $ins->execute([$pid, $filePath, $sortOrder]);
    $photoRowId = (int)$pdo->lastInsertId();

    $row = $pdo->prepare('SELECT * FROM bazaar_product_photos WHERE id = ?');
    $row->execute([$photoRowId]);
    $photo = $row->fetch();
    $photo['url'] = "$baseUrl/{$photo['file_path']}";

    jsonResponse($photo, 201);
}

// ─── DELETE /api/bazaar/products/admin/:id/photos/:photo_id ────
// Admin equivalent of the seller photo delete route.
if ($method === 'DELETE' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && ($parts[5] ?? '') === 'photos' && is_numeric($parts[6] ?? null)) {
    requireAdminAuth();
    $pid     = (int)$seg4;
    $adminPh = (int)$parts[6];

    $photoStmt = $pdo->prepare('SELECT * FROM bazaar_product_photos WHERE id = ? AND product_id = ?');
    $photoStmt->execute([$adminPh, $pid]);
    $photo = $photoStmt->fetch();
    if (!$photo) jsonResponse(['message' => 'Photo not found.'], 404);

    $fullPath = dirname(__DIR__) . '/' . $photo['file_path'];
    if (file_exists($fullPath)) unlink($fullPath);

    $pdo->prepare('DELETE FROM bazaar_product_photos WHERE id = ?')->execute([$adminPh]);

    jsonResponse(['message' => 'Photo deleted.']);
}
// Returns 400 if removal_reason is absent or empty.
// Returns 404 if product not found.
// Sets status = 'removed', removal_reason, removed_by, removed_at = NOW().
// NOTE: the !$parts[5] guard keeps this from swallowing
// /products/admin/<id>/photos/<photo_id> handled just above.
if ($method === 'DELETE' && $seg2 === 'products' && $seg3 === 'admin' && is_numeric($seg4) && !isset($parts[5])) {
    $admin = requireAdminAuth();
    $adminProductId = (int)$seg4;
    $body = getBody();

    if (empty($body['removal_reason'])) {
        jsonResponse(['message' => 'Removal reason is required.'], 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
    $stmt->execute([$adminProductId]);
    $product = $stmt->fetch();
    if (!$product) jsonResponse(['message' => 'Product not found.'], 404);

    $pdo->prepare(
        "UPDATE bazaar_products
         SET status = 'removed',
             removal_reason = ?,
             removed_by = ?,
             removed_at = NOW()
         WHERE id = ?"
    )->execute([
        $body['removal_reason'],
        (int)$admin['id'],
        $adminProductId,
    ]);

    jsonResponse(['message' => 'Product removed.', 'product_id' => $adminProductId]);
}

// ─── POST /api/bazaar/orders (customer create order) ──────────
// Accepts both buyer JWT (role=buyer) and seller JWT (role=seller).
// Validates seller_id, items, payment_method, proof_type, proof_value.
// For each item: verifies product belongs to seller, is active, and has sufficient stock.
// Wraps inserts and stock decrements in a PDO transaction.
// Returns 201 with order_id on success; 409 on insufficient stock; 500 on DB error.
if ($method === 'POST' && $seg2 === 'orders' && !$orderId) {
    // Accept both buyer and seller tokens
    $rawToken = getBearerToken();
    if (!$rawToken) jsonResponse(['message' => 'Not authenticated.'], 401);
    try {
        $decoded = \Firebase\JWT\JWT::decode($rawToken, new \Firebase\JWT\Key(getJwtSecret(), 'HS256'));
        $authPayload = (array) $decoded;
    } catch (Exception $e) {
        jsonResponse(['message' => 'Invalid token.'], 403);
    }
    $isBuyer = ($authPayload['role'] ?? '') === 'buyer';
    $authId  = (int) $authPayload['id'];

    $body = getBody();

    // Validate required top-level fields
    if (empty($body['seller_id']))       jsonResponse(['message' => 'seller_id is required.'], 400);
    if (empty($body['items']) || !is_array($body['items'])) {
        jsonResponse(['message' => 'items is required and must be an array.'], 400);
    }
    $allowedMethods = ['cbe', 'awash', 'dashen', 'abyssinia', 'telebirr'];
    if (empty($body['payment_method']) || !in_array($body['payment_method'], $allowedMethods, true)) {
        jsonResponse(['message' => 'payment_method must be one of: cbe, awash, dashen, abyssinia, telebirr.'], 400);
    }
    $allowedProofTypes = ['screenshot', 'reference'];
    if (empty($body['proof_type']) || !in_array($body['proof_type'], $allowedProofTypes, true)) {
        jsonResponse(['message' => 'proof_type must be screenshot or reference.'], 400);
    }
    if ($body['proof_type'] === 'reference' && empty($body['proof_value'])) {
        jsonResponse(['message' => 'proof_value is required.'], 400);
    }

    $sellerId    = (int)$body['seller_id'];
    $items       = $body['items'];
    $totalAmount = 0.0;
    $products    = [];

    // Validate each line item before starting the transaction
    foreach ($items as $item) {
        if (empty($item['product_id']) || empty($item['quantity'])) {
            jsonResponse(['message' => 'Each item must have product_id and quantity.'], 400);
        }
        $qty = (int)$item['quantity'];
        if ($qty < 1) jsonResponse(['message' => 'Item quantity must be at least 1.'], 400);

        $stmt = $pdo->prepare('SELECT * FROM bazaar_products WHERE id = ?');
        $stmt->execute([(int)$item['product_id']]);
        $product = $stmt->fetch();

        if (!$product) {
            jsonResponse(['message' => 'Product not found.'], 404);
        }
        if ((int)$product['seller_id'] !== $sellerId) {
            jsonResponse(['message' => "Product {$product['name']} does not belong to this seller."], 400);
        }
        if ($product['status'] !== 'active') {
            jsonResponse(['message' => "Product {$product['name']} is not available."], 400);
        }
        if ((int)$product['stock_quantity'] < $qty) {
            jsonResponse(['message' => "Insufficient stock for product: {$product['name']}"], 409);
        }

        $totalAmount += (float)$product['price'] * $qty;
        $products[]   = ['product' => $product, 'quantity' => $qty];
    }

    // Wrap all writes in a transaction
    try {
        $pdo->beginTransaction();

        // Insert the order — set buyer_id or customer_id based on role
        if ($isBuyer) {
            $pdo->prepare(
                'INSERT INTO bazaar_orders (buyer_id, customer_id, seller_id, total_amount, status)
                 VALUES (?, NULL, ?, ?, ?)'
            )->execute([$authId, $sellerId, $totalAmount, 'pending']);
        } else {
            $pdo->prepare(
                'INSERT INTO bazaar_orders (customer_id, buyer_id, seller_id, total_amount, status)
                 VALUES (?, NULL, ?, ?, ?)'
            )->execute([$authId, $sellerId, $totalAmount, 'pending']);
        }
        $newOrderId = (int)$pdo->lastInsertId();

        // Insert order items and decrement stock
        foreach ($products as $line) {
            $p   = $line['product'];
            $qty = $line['quantity'];

            $pdo->prepare(
                'INSERT INTO bazaar_order_items (order_id, product_id, quantity, unit_price)
                 VALUES (?, ?, ?, ?)'
            )->execute([$newOrderId, (int)$p['id'], $qty, (float)$p['price']]);

            $pdo->prepare(
                'UPDATE bazaar_products
                 SET stock_quantity = stock_quantity - ?
                 WHERE id = ?'
            )->execute([$qty, (int)$p['id']]);
        }

        // Handle payment proof
        if ($body['proof_type'] === 'screenshot') {
            $proofValue = saveBazaarUpload();
            if (!$proofValue) jsonResponse(['message' => 'Screenshot file is required.'], 400);
        } else {
            $proofValue = $body['proof_value'];
        }

        // Insert payment record
        $pdo->prepare(
            'INSERT INTO bazaar_payments (order_id, payment_method, proof_type, proof_value, status)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([$newOrderId, $body['payment_method'], $body['proof_type'], $proofValue, 'pending']);

        $pdo->commit();

        jsonResponse(['message' => 'Order created.', 'order_id' => $newOrderId], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Order creation failed.'], 500);
    }
}

// ─── GET /api/bazaar/orders/admin/all (admin) ─────────────────
// Returns ALL orders joined with customer name, seller name, and payment info.
// NOTE: This route is checked BEFORE the numeric orderId routes because $seg3 = 'admin'.
if ($method === 'GET' && $seg2 === 'orders' && $seg3 === 'admin' && $seg4 === 'all') {
    requireAdminAuth();

    $stmt = $pdo->query(
        "SELECT o.*,
                c.full_name                          AS customer_name,
                COALESCE(s.company_name, s.full_name) AS seller_name,
                p.payment_method,
                p.proof_type,
                p.proof_value,
                p.status                             AS payment_status
         FROM bazaar_orders o
         JOIN users c ON c.id = o.customer_id
         JOIN users s ON s.id = o.seller_id
         LEFT JOIN bazaar_payments p ON p.order_id = o.id
         ORDER BY o.created_at DESC"
    );
    $orders = $stmt->fetchAll();

    // Attach order items to each order
    $result = array_map(function ($order) use ($pdo) {
        $items = $pdo->prepare(
            'SELECT oi.*, bp.name AS product_name
             FROM bazaar_order_items oi
             JOIN bazaar_products bp ON bp.id = oi.product_id
             WHERE oi.order_id = ?'
        );
        $items->execute([$order['id']]);
        $order['items'] = $items->fetchAll();
        return $order;
    }, $orders);

    jsonResponse($result);
}

// ─── PUT /api/bazaar/orders/admin/:id/confirm|reject (admin) ──
// Admin override of seller confirm/reject, bypasses seller ownership check.
if ($method === 'PUT' && $seg2 === 'orders' && $seg3 === 'admin' && is_numeric($seg4 ?? '')) {
    requireAdminAuth();
    $orderId = (int)$seg4;
    $action  = $parts[5] ?? null; // 'confirm' | 'reject'

    $stmt = $pdo->prepare('SELECT * FROM bazaar_orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['message' => 'Order not found.'], 404);

    if ($action === 'confirm') {
        $pdo->prepare("UPDATE bazaar_orders SET status = 'confirmed' WHERE id = ?")->execute([$orderId]);
        $pdo->prepare("UPDATE bazaar_payments SET status = 'confirmed' WHERE order_id = ?")->execute([$orderId]);
        jsonResponse(['message' => 'Order confirmed.', 'order_id' => $orderId]);
    }

    if ($action === 'reject') {
        $itemsStmt = $pdo->prepare('SELECT * FROM bazaar_order_items WHERE order_id = ?');
        $itemsStmt->execute([$orderId]);
        $orderItems = $itemsStmt->fetchAll();

        try {
            $pdo->beginTransaction();
            $pdo->prepare("UPDATE bazaar_orders SET status = 'rejected' WHERE id = ?")->execute([$orderId]);
            $pdo->prepare("UPDATE bazaar_payments SET status = 'rejected' WHERE order_id = ?")->execute([$orderId]);
            foreach ($orderItems as $item) {
                $pdo->prepare('UPDATE bazaar_products SET stock_quantity = stock_quantity + ? WHERE id = ?')
                    ->execute([(int)$item['quantity'], (int)$item['product_id']]);
            }
            $pdo->commit();
            jsonResponse(['message' => 'Order rejected.', 'order_id' => $orderId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Order rejection failed.'], 500);
        }
    }

    jsonResponse(['message' => 'Not found.'], 404);
}

// ─── GET /api/bazaar/orders (user or buyer) ───────────────────
// Returns orders for the authenticated user or buyer.
// ?seller_id=   → seller view (seller JWT only)
// ?customer_id= → seller purchasing as customer (seller JWT)
// ?buyer_id=    → buyer purchase history (buyer JWT)
if ($method === 'GET' && $seg2 === 'orders' && !$orderId && $seg3 !== 'admin') {
    // Accept both buyer and seller tokens
    $rawToken = getBearerToken();
    if (!$rawToken) jsonResponse(['message' => 'Not authenticated.'], 401);
    try {
        $decoded = \Firebase\JWT\JWT::decode($rawToken, new \Firebase\JWT\Key(getJwtSecret(), 'HS256'));
        $authPayload = (array) $decoded;
    } catch (Exception $e) {
        jsonResponse(['message' => 'Invalid token.'], 403);
    }
    $isBuyer = ($authPayload['role'] ?? '') === 'buyer';
    $authId  = (int) $authPayload['id'];
    // Keep $user for backward compat with seller_id check
    $user = $authPayload;

    if (isset($_GET['seller_id']) && (int)$_GET['seller_id'] === $authId && !$isBuyer) {
        // Seller view: orders where this user is the seller
        $stmt = $pdo->prepare(
            "SELECT o.*,
                    COALESCE(c.full_name, b.full_name) AS customer_name,
                    p.payment_method,
                    p.proof_type,
                    p.proof_value,
                    p.status      AS payment_status
             FROM bazaar_orders o
             LEFT JOIN users c ON c.id = o.customer_id
             LEFT JOIN buyers b ON b.id = o.buyer_id
             LEFT JOIN bazaar_payments p ON p.order_id = o.id
             WHERE o.seller_id = ?
             ORDER BY o.created_at DESC"
        );
        $stmt->execute([$authId]);
        $orders = $stmt->fetchAll();

        // Attach order items to each order
        $result = array_map(function ($order) use ($pdo) {
            $items = $pdo->prepare(
                'SELECT oi.*, bp.name AS product_name
                 FROM bazaar_order_items oi
                 JOIN bazaar_products bp ON bp.id = oi.product_id
                 WHERE oi.order_id = ?'
            );
            $items->execute([$order['id']]);
            $order['items'] = $items->fetchAll();
            return $order;
        }, $orders);

        jsonResponse($result);
    }

    if (isset($_GET['buyer_id']) && (int)$_GET['buyer_id'] === $authId && $isBuyer) {
        // Buyer purchase history
        $stmt = $pdo->prepare(
            "SELECT o.*,
                    COALESCE(s.company_name, s.full_name) AS seller_name,
                    p.payment_method,
                    p.proof_type,
                    p.proof_value,
                    p.status      AS payment_status
             FROM bazaar_orders o
             JOIN users s ON s.id = o.seller_id
             LEFT JOIN bazaar_payments p ON p.order_id = o.id
             WHERE o.buyer_id = ?
             ORDER BY o.created_at DESC"
        );
        $stmt->execute([$authId]);
        $orders = $stmt->fetchAll();

        // Attach order items with product details
        $result = array_map(function ($order) use ($pdo, $rawToken) {
            $items = $pdo->prepare(
                'SELECT oi.*, bp.name AS product_name, bp.description AS product_description,
                        bp.category AS product_category
                 FROM bazaar_order_items oi
                 JOIN bazaar_products bp ON bp.id = oi.product_id
                 WHERE oi.order_id = ?
                 ORDER BY oi.id ASC'
            );
            $items->execute([$order['id']]);
            $rawItems = $items->fetchAll();

            // Attach first photo to each item
            $itemsWithPhotos = array_map(function ($item) use ($pdo) {
                $photo = $pdo->prepare(
                    'SELECT file_path FROM bazaar_product_photos WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1'
                );
                $photo->execute([$item['product_id']]);
                $row = $photo->fetch();
                $item['product_photo'] = $row ? "/{$row['file_path']}" : null;
                return $item;
            }, $rawItems);

            $order['items'] = $itemsWithPhotos;
            return $order;
        }, $orders);

        jsonResponse($result);
    }

    if (isset($_GET['customer_id']) && (int)$_GET['customer_id'] === $authId && !$isBuyer) {
        // Customer view: seller purchasing as customer
        $stmt = $pdo->prepare(
            "SELECT o.*,
                    COALESCE(s.company_name, s.full_name) AS seller_name,
                    p.payment_method,
                    p.proof_type,
                    p.proof_value,
                    p.status      AS payment_status
             FROM bazaar_orders o
             JOIN users s ON s.id = o.seller_id
             LEFT JOIN bazaar_payments p ON p.order_id = o.id
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC"
        );
        $stmt->execute([$authId]);
        jsonResponse($stmt->fetchAll());
    }

    // Neither param matched the authenticated user
    jsonResponse(['message' => 'Forbidden.'], 403);
}

// ─── PUT /api/bazaar/orders/:id/confirm (seller) ──────────────
// Requires auth. Verifies order belongs to the authenticated seller.
// Sets order status = 'confirmed' and payment status = 'confirmed'.
if ($method === 'PUT' && $orderId && $seg4 === 'confirm') {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['message' => 'Order not found.'], 404);
    if ((int)$order['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    $pdo->prepare("UPDATE bazaar_orders SET status = 'confirmed' WHERE id = ?")
        ->execute([$orderId]);
    $pdo->prepare("UPDATE bazaar_payments SET status = 'confirmed' WHERE order_id = ?")
        ->execute([$orderId]);

    jsonResponse(['message' => 'Order confirmed.', 'order_id' => $orderId]);
}

// ─── PUT /api/bazaar/orders/:id/reject (seller) ───────────────
// Requires auth. Verifies order belongs to the authenticated seller.
// Wraps in a transaction: sets statuses to 'rejected' and restores stock for each item.
if ($method === 'PUT' && $orderId && $seg4 === 'reject') {
    $user = requireUserAuth();

    $stmt = $pdo->prepare('SELECT * FROM bazaar_orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['message' => 'Order not found.'], 404);
    if ((int)$order['seller_id'] !== (int)$user['id']) jsonResponse(['message' => 'Forbidden.'], 403);

    // Fetch order items before the transaction
    $itemsStmt = $pdo->prepare('SELECT * FROM bazaar_order_items WHERE order_id = ?');
    $itemsStmt->execute([$orderId]);
    $orderItems = $itemsStmt->fetchAll();

    try {
        $pdo->beginTransaction();

        $pdo->prepare("UPDATE bazaar_orders SET status = 'rejected' WHERE id = ?")
            ->execute([$orderId]);
        $pdo->prepare("UPDATE bazaar_payments SET status = 'rejected' WHERE order_id = ?")
            ->execute([$orderId]);

        // Restore stock for each order item
        foreach ($orderItems as $item) {
            $pdo->prepare(
                'UPDATE bazaar_products
                 SET stock_quantity = stock_quantity + ?
                 WHERE id = ?'
            )->execute([(int)$item['quantity'], (int)$item['product_id']]);
        }

        $pdo->commit();

        jsonResponse(['message' => 'Order rejected.', 'order_id' => $orderId]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Order rejection failed.'], 500);
    }
}

// ─── POST /api/bazaar/delivery (customer create delivery request) ─
// Accepts both buyer JWT (role=buyer) and seller JWT (role=seller).
// Validates order_id, delivery_address, contact_phone.
// Verifies order belongs to the authenticated customer/buyer and is confirmed.
// Rejects duplicate delivery requests with 409.
// Inserts into bazaar_delivery_requests and returns 201 with request_id.
if ($method === 'POST' && $seg2 === 'delivery') {
    $rawToken = getBearerToken();
    if (!$rawToken) jsonResponse(['message' => 'Not authenticated.'], 401);
    try {
        $decoded = \Firebase\JWT\JWT::decode($rawToken, new \Firebase\JWT\Key(getJwtSecret(), 'HS256'));
        $authPayload = (array) $decoded;
    } catch (Exception $e) {
        jsonResponse(['message' => 'Invalid token.'], 403);
    }
    $isBuyer = ($authPayload['role'] ?? '') === 'buyer';
    $authId  = (int) $authPayload['id'];

    $body = getBody();

    if (empty($body['order_id']))         jsonResponse(['message' => 'order_id is required.'], 400);
    if (empty($body['delivery_address'])) jsonResponse(['message' => 'delivery_address is required.'], 400);
    if (empty($body['contact_phone']))    jsonResponse(['message' => 'contact_phone is required.'], 400);

    $stmt = $pdo->prepare('SELECT * FROM bazaar_orders WHERE id = ?');
    $stmt->execute([(int)$body['order_id']]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['message' => 'Order not found.'], 404);

    // Verify ownership based on role
    if ($isBuyer) {
        if ((int)$order['buyer_id'] !== $authId) {
            jsonResponse(['message' => 'Forbidden.'], 403);
        }
    } else {
        if ((int)$order['customer_id'] !== $authId) {
            jsonResponse(['message' => 'Forbidden.'], 403);
        }
    }

    if ($order['status'] !== 'confirmed') {
        jsonResponse(['message' => 'Order must be confirmed before requesting delivery.'], 400);
    }

    // Check for existing delivery request
    $existsStmt = $pdo->prepare('SELECT id FROM bazaar_delivery_requests WHERE order_id = ?');
    $existsStmt->execute([(int)$body['order_id']]);
    if ($existsStmt->fetch()) {
        jsonResponse(['message' => 'A delivery request already exists for this order.'], 409);
    }

    if ($isBuyer) {
        $ins = $pdo->prepare(
            'INSERT INTO bazaar_delivery_requests (order_id, buyer_id, customer_id, delivery_address, contact_phone, preferred_delivery_time)
             VALUES (?, ?, NULL, ?, ?, ?)'
        );
        $ins->execute([
            (int)$body['order_id'],
            $authId,
            $body['delivery_address'],
            $body['contact_phone'],
            $body['preferred_delivery_time'] ?? null,
        ]);
    } else {
        $ins = $pdo->prepare(
            'INSERT INTO bazaar_delivery_requests (order_id, customer_id, buyer_id, delivery_address, contact_phone, preferred_delivery_time)
             VALUES (?, ?, NULL, ?, ?, ?)'
        );
        $ins->execute([
            (int)$body['order_id'],
            $authId,
            $body['delivery_address'],
            $body['contact_phone'],
            $body['preferred_delivery_time'] ?? null,
        ]);
    }
    $newId = (int)$pdo->lastInsertId();

    jsonResponse(['message' => 'Delivery request created.', 'request_id' => $newId], 201);
}

// ─── GET /api/bazaar/delivery (customer list delivery requests) ───
// Requires auth. Returns all delivery requests for the authenticated customer,
// joined with order total_amount, order status, and seller name.
// Ordered by created_at DESC.
if ($method === 'GET' && $seg2 === 'delivery') {
    $user = requireUserAuth();

    $stmt = $pdo->prepare(
        "SELECT dr.*,
                o.total_amount  AS order_total_amount,
                o.status        AS order_status,
                COALESCE(s.company_name, s.full_name) AS seller_name
         FROM bazaar_delivery_requests dr
         JOIN bazaar_orders o ON o.id = dr.order_id
         JOIN users s ON s.id = o.seller_id
         WHERE dr.customer_id = ?
         ORDER BY dr.created_at DESC"
    );
    $stmt->execute([(int)$user['id']]);
    jsonResponse($stmt->fetchAll());
}

// ─── Fallthrough ──────────────────────────────────────────────
jsonResponse(['message' => 'Not found.'], 404);
