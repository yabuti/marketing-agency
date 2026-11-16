<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/translator.php';

$method  = getMethod();
$uri     = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts   = explode('/', $uri);
$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

// URL segments: /api/clients[/admin/stats|/admin/all|/admin/analytics|/:id[/media/:mid|/paths[/:pid[/media/:pmid]]]]
$seg2 = $parts[2] ?? null; // 'admin' or numeric client id
$seg3 = $parts[3] ?? null; // 'stats','all','analytics','media','paths'
$seg4 = $parts[4] ?? null; // media id or path id
$seg5 = $parts[5] ?? null; // 'media'
$seg6 = $parts[6] ?? null; // path media id

$clientId = is_numeric($seg2) ? (int)$seg2 : null;
$mediaId  = is_numeric($seg4) ? (int)$seg4 : null;
$pathId   = ($seg3 === 'paths' && is_numeric($seg4)) ? (int)$seg4 : null;
$pathMediaId = is_numeric($seg6) ? (int)$seg6 : null;

// ─── Helpers ──────────────────────────────────────────────────

function getClientFull(PDO $pdo, int $id, string $baseUrl): ?array {
    $stmt = $pdo->prepare('SELECT * FROM clients WHERE id = ?');
    $stmt->execute([$id]);
    $client = $stmt->fetch();
    if (!$client) return null;

    $imgs = $pdo->prepare('SELECT * FROM client_media WHERE client_id = ? AND type = "image" ORDER BY sort_order ASC');
    $imgs->execute([$id]);
    $vids = $pdo->prepare('SELECT * FROM client_media WHERE client_id = ? AND type = "video" ORDER BY sort_order ASC');
    $vids->execute([$id]);

    $client['images'] = array_map(fn($m) => ['id' => $m['id'], 'url' => "$baseUrl/{$m['file_path']}", 'description' => $m['description']], $imgs->fetchAll());
    $client['videos'] = array_map(fn($m) => ['id' => $m['id'], 'url' => "$baseUrl/{$m['file_path']}", 'description' => $m['description']], $vids->fetchAll());
    $client['logo_url'] = !empty($client['logo_path']) ? "$baseUrl/{$client['logo_path']}" : null;
    $client['promotionPaths'] = getPathsFull($pdo, $id, $baseUrl);
    // Up to 3 work images (JSON column added by database/client_work_images.sql);
    // missing column or empty value simply yields an empty array.
    $client['work_images'] = workImagesResolved(
        json_decode(isset($client['work_images']) ? $client['work_images'] : '[]', true),
        $baseUrl
    );
    return $client;
}

function getPathsFull(PDO $pdo, int $clientId, string $baseUrl): array {
    $stmt = $pdo->prepare('SELECT * FROM client_promotion_paths WHERE client_id = ? ORDER BY path_date DESC, created_at DESC');
    $stmt->execute([$clientId]);
    $paths = $stmt->fetchAll();
    return array_map(function($p) use ($pdo, $baseUrl) {
        $imgs = $pdo->prepare("SELECT * FROM client_path_media WHERE path_id = ? AND type = 'image' ORDER BY sort_order ASC");
        $imgs->execute([$p['id']]);
        $vids = $pdo->prepare("SELECT * FROM client_path_media WHERE path_id = ? AND type = 'video' ORDER BY sort_order ASC");
        $vids->execute([$p['id']]);
        $p['images'] = array_map(fn($m) => ['id' => $m['id'], 'url' => "$baseUrl/{$m['file_path']}", 'description' => $m['description'], 'price' => $m['price'] ?? null], $imgs->fetchAll());
        $p['videos'] = array_map(fn($m) => ['id' => $m['id'], 'url' => "$baseUrl/{$m['file_path']}", 'description' => $m['description'], 'price' => $m['price'] ?? null], $vids->fetchAll());
        return $p;
    }, $paths);
}

function saveUpload(string $subdir): ?string {
    if (empty($_FILES['file']['tmp_name'])) return null;
    $uploadError = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($uploadError !== UPLOAD_ERR_OK) return null;
    $ext  = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    $path = "uploads/$subdir/" . uniqid() . '.' . $ext;
    $dir  = dirname(__DIR__) . "/uploads/$subdir";
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!is_writable($dir)) return null;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $path)) return null;
    return $path;
}

// Does the clients table have a column yet? (work_images needs a migration;
// the API degrades gracefully until the admin runs it.)
function hasClientColumn(PDO $pdo, string $column): bool {
    static $cache = [];
    if (!array_key_exists($column, $cache)) {
        try {
            $cache[$column] = (bool)$pdo->query("SHOW COLUMNS FROM clients LIKE '" . str_replace("'", "''", $column) . "'")->fetch();
        } catch (PDOException $e) {
            $cache[$column] = false;
        }
    }
    return $cache[$column];
}

// Resolve stored work-image paths to URLs; absolute/relative/data: pass through.
function workImagesResolved($paths, string $baseUrl): array {
    if (!is_array($paths)) return [];
    $out = [];
    foreach ($paths as $p) {
        if (!is_string($p) || trim($p) === '') continue;
        $out[] = preg_match('#^(https?://|/|data:)#i', $p) ? $p : "$baseUrl/$p";
    }
    return $out;
}

// ─── GET /api/clients (public) ────────────────────────────────
if ($method === 'GET' && !$clientId && $seg2 !== 'admin') {
    $rows = $pdo->query('SELECT * FROM clients WHERE is_active = 1 ORDER BY created_at DESC')->fetchAll();
    jsonResponse(array_map(fn($c) => getClientFull($pdo, $c['id'], $baseUrl), $rows));
}

// ─── GET /api/clients/admin/stats ─────────────────────────────
if ($method === 'GET' && $seg2 === 'admin' && $seg3 === 'stats') {
    requireAdminAuth();
    $paths = $pdo->query('SELECT COUNT(*) AS c FROM client_promotion_paths')->fetch()['c'];
    $imgs  = $pdo->query("SELECT COUNT(*) AS c FROM client_path_media WHERE type = 'image'")->fetch()['c'];
    $vids  = $pdo->query("SELECT COUNT(*) AS c FROM client_path_media WHERE type = 'video'")->fetch()['c'];
    jsonResponse(['totalPaths' => $paths, 'totalImages' => $imgs, 'totalVideos' => $vids]);
}

// ─── GET /api/clients/admin/analytics ─────────────────────────
if ($method === 'GET' && $seg2 === 'admin' && $seg3 === 'analytics') {
    requireAdminAuth();
    $where = []; $params = [];
    if (!empty($_GET['location'])) { $where[] = 'location = ?'; $params[] = $_GET['location']; }
    if (!empty($_GET['date']))     { $where[] = 'DATE(created_at) = ?'; $params[] = $_GET['date']; }
    elseif (!empty($_GET['month']) && !empty($_GET['year'])) { $where[] = 'MONTH(created_at) = ? AND YEAR(created_at) = ?'; $params[] = (int)$_GET['month']; $params[] = (int)$_GET['year']; }
    elseif (!empty($_GET['month'])) { $where[] = 'MONTH(created_at) = ?'; $params[] = (int)$_GET['month']; }
    elseif (!empty($_GET['year']))  { $where[] = 'YEAR(created_at) = ?'; $params[] = (int)$_GET['year']; }
    $sql  = 'SELECT id, name, location, category, created_at FROM clients' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY created_at DESC';
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    $clients = $stmt->fetchAll();
    jsonResponse(['count' => count($clients), 'clients' => $clients]);
}

// ─── GET /api/clients/admin/all ───────────────────────────────
if ($method === 'GET' && $seg2 === 'admin' && $seg3 === 'all') {
    requireAdminAuth();
    $rows = $pdo->query('SELECT * FROM clients ORDER BY created_at DESC')->fetchAll();
    jsonResponse(array_map(fn($c) => getClientFull($pdo, $c['id'], $baseUrl), $rows));
}

// ─── GET /api/clients/:id ─────────────────────────────────────
if ($method === 'GET' && $clientId && !$seg3) {
    $client = getClientFull($pdo, $clientId, $baseUrl);
    if (!$client) jsonResponse(['message' => 'Client not found.'], 404);
    jsonResponse($client);
}

// ─── POST /api/clients (admin create) ─────────────────────────
if ($method === 'POST' && !$clientId) {
    requireAdminAuth();
    $body = getBody();
    if (!($body['name'] ?? '') || !($body['category'] ?? '')) jsonResponse(['message' => 'Name and category are required.'], 400);

    // Required field checks
    if (!($body['tin_number'] ?? ''))               jsonResponse(['message' => 'TIN Number is required.'], 400);
    if (!($body['business_license_number'] ?? ''))  jsonResponse(['message' => 'Business License Number is required.'], 400);
    if (!($body['elmis_registration'] ?? ''))       jsonResponse(['message' => 'E-LMIS Registration is required.'], 400);

    // Uniqueness checks
    $uniqueFields = [
        'tin_number'              => $body['tin_number'] ?? '',
        'business_license_number' => $body['business_license_number'] ?? '',
        'elmis_registration'      => $body['elmis_registration'] ?? '',
    ];
    $labels = [
        'tin_number'              => 'TIN Number',
        'business_license_number' => 'Business License Number',
        'elmis_registration'      => 'E-LMIS Registration',
    ];
    foreach ($uniqueFields as $field => $value) {
        if (!empty($value)) {
            $chk = $pdo->prepare("SELECT id FROM clients WHERE `$field` = ?");
            $chk->execute([$value]);
            if ($chk->fetch()) jsonResponse(['message' => "{$labels[$field]} \"$value\" is already registered to another client."], 409);
        }
    }

    $stmt = $pdo->prepare('INSERT INTO clients (name, category, business_type, icon, description, full_description, established, location, phone, tin_number, business_license_number, elmis_registration, website, facebook, instagram, tiktok, telegram, followers, growth, engagement, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
    $stmt->execute([$body['name'], $body['category'], $body['business_type'] ?? null, $body['icon'] ?? '🏢', $body['description'] ?? '', $body['full_description'] ?? '', $body['established'] ?? '', $body['location'] ?? '', $body['phone'] ?? '', $body['tin_number'], $body['business_license_number'], $body['elmis_registration'], $body['website'] ?? null, $body['facebook'] ?? null, $body['instagram'] ?? null, $body['tiktok'] ?? null, $body['telegram'] ?? null, $body['followers'] ?? '0', $body['growth'] ?? '0%', $body['engagement'] ?? '0%']);
    $newId = (int)$pdo->lastInsertId();
    jsonResponse(getClientFull($pdo, $newId, $baseUrl), 201);
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    $t = translateClient($body['category'], $body['description'] ?? '', $body['full_description'] ?? '');
    $pdo->prepare('UPDATE clients SET category_am=?, category_or=?, description_am=?, description_or=?, full_description_am=?, full_description_or=? WHERE id=?')->execute(array_merge(array_values($t), [$newId]));
}

// ─── PUT /api/clients/:id (admin update) ──────────────────────
if (($method === 'PUT' || $method === 'POST') && $clientId && !$seg3) {
    requireAdminAuth();
    $body = getBody();

    // Fall back to the stored value for any omitted field, so a partial update
    // (e.g. a status toggle) can never blank out or re-activate other columns.
    $existingStmt = $pdo->prepare('SELECT * FROM clients WHERE id = ?');
    $existingStmt->execute([$clientId]);
    $existing = $existingStmt->fetch();
    if (!$existing) jsonResponse(['message' => 'Client not found.'], 404);

    $val = function (string $key, $default = null) use ($body, $existing) {
        return array_key_exists($key, $body) ? $body[$key] : ($existing[$key] ?? $default);
    };

    // Uniqueness checks (exclude current client)
    $uniqueFields = [
        'tin_number'              => $body['tin_number'] ?? '',
        'business_license_number' => $body['business_license_number'] ?? '',
        'elmis_registration'      => $body['elmis_registration'] ?? '',
    ];
    $labels = [
        'tin_number'              => 'TIN Number',
        'business_license_number' => 'Business License Number',
        'elmis_registration'      => 'E-LMIS Registration',
    ];
    foreach ($uniqueFields as $field => $value) {
        if (!empty($value)) {
            $chk = $pdo->prepare("SELECT id FROM clients WHERE `$field` = ? AND id != ?");
            $chk->execute([$value, $clientId]);
            if ($chk->fetch()) jsonResponse(['message' => "{$labels[$field]} \"$value\" is already registered to another client."], 409);
        }
    }

    $pdo->prepare('UPDATE clients SET name=?, category=?, business_type=?, icon=?, description=?, full_description=?, established=?, location=?, phone=?, tin_number=?, business_license_number=?, elmis_registration=?, website=?, facebook=?, instagram=?, tiktok=?, telegram=?, followers=?, growth=?, engagement=?, is_active=? WHERE id=?')
        ->execute([$val('name'), $val('category'), $val('business_type'), $val('icon', '🏢'), $val('description', ''), $val('full_description', ''), $val('established', ''), $val('location', ''), $val('phone', ''), $val('tin_number'), $val('business_license_number'), $val('elmis_registration'), $val('website'), $val('facebook'), $val('instagram'), $val('tiktok'), $val('telegram'), $val('followers', '0'), $val('growth', '0%'), $val('engagement', '0%'), (int) (int) $val('is_active', 1), $clientId]);
    jsonResponse(getClientFull($pdo, $clientId, $baseUrl));
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    $t = translateClient($val('category'), $val('description', ''), $val('full_description', ''));
    $pdo->prepare('UPDATE clients SET category_am=?, category_or=?, description_am=?, description_or=?, full_description_am=?, full_description_or=? WHERE id=?')->execute(array_merge(array_values($t), [$clientId]));
}

// ─── DELETE /api/clients/:id ──────────────────────────────────
if ($method === 'DELETE' && $clientId && !$seg3) {
    requireAdminAuth();
    $media = $pdo->prepare('SELECT file_path FROM client_media WHERE client_id = ?');
    $media->execute([$clientId]);
    foreach ($media->fetchAll() as $m) { if (file_exists(dirname(__DIR__) . '/' . $m['file_path'])) unlink(dirname(__DIR__) . '/' . $m['file_path']); }
    $pdo->prepare('DELETE FROM client_media WHERE client_id = ?')->execute([$clientId]);
    $pdo->prepare('DELETE FROM clients WHERE id = ?')->execute([$clientId]);
    jsonResponse(['message' => 'Client deleted.']);
}

// ─── POST /api/clients/:id/logo ───────────────────────────────
if ($method === 'POST' && $clientId && $seg3 === 'logo') {
    requireAdminAuth();
    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);
    $old = $pdo->prepare('SELECT logo_path FROM clients WHERE id = ?');
    $old->execute([$clientId]);
    $oldPath = $old->fetch()['logo_path'] ?? null;
    if ($oldPath && file_exists(dirname(__DIR__) . '/' . $oldPath)) unlink(dirname(__DIR__) . '/' . $oldPath);
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $filePath = 'uploads/clients/logo_' . $clientId . '_' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/clients', 0755, true);
    move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath);
    $pdo->prepare('UPDATE clients SET logo_path = ? WHERE id = ?')->execute([$filePath, $clientId]);
    jsonResponse(['logo_url' => "$baseUrl/$filePath"]);
}

// ─── DELETE /api/clients/:id/logo ─────────────────────────────
if ($method === 'DELETE' && $clientId && $seg3 === 'logo') {
    requireAdminAuth();
    $old = $pdo->prepare('SELECT logo_path FROM clients WHERE id = ?');
    $old->execute([$clientId]);
    $row = $old->fetch();
    if (!$row) jsonResponse(['message' => 'Client not found.'], 404);
    if ($row['logo_path'] && file_exists(dirname(__DIR__) . '/' . $row['logo_path'])) {
        unlink(dirname(__DIR__) . '/' . $row['logo_path']);
    }
    $pdo->prepare('UPDATE clients SET logo_path = NULL WHERE id = ?')->execute([$clientId]);
    jsonResponse(['message' => 'Logo removed.']);
}

// ─── POST /api/clients/:id/work-images (admin, max 3) ─────────
// Up to 3 "work samples" shown above the contact card on the public client
// detail page. Stored as a JSON array of paths in clients.work_images, so the
// array index IS the slot: upload with `index` replaces that slot, upload
// without appends. Removal is POST {"_method":"DELETE","index":n} — the same
// tunnel used elsewhere (some hosts block verb overrides).
if ($method === 'POST' && $clientId && $seg3 === 'work-images') {
    requireAdminAuth();
    if (!hasClientColumn($pdo, 'work_images')) {
        jsonResponse(['message' => 'Database migration missing — run database/client_work_images.sql in phpMyAdmin first.'], 500);
    }

    $stmt = $pdo->prepare('SELECT work_images FROM clients WHERE id = ?');
    $stmt->execute([$clientId]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(['message' => 'Client not found.'], 404);
    $current = json_decode($row['work_images'] ?? '[]', true);
    if (!is_array($current)) $current = [];
    $current = array_values($current); // always reindexed 0..n-1 so index = slot

    $body = getBody();

    // ── Remove a slot ──
    if (trim((string)($body['_method'] ?? '')) === 'DELETE') {
        $idx = (int)($body['index'] ?? -1);
        if ($idx < 0 || $idx >= count($current)) jsonResponse(['message' => 'Work image slot not found.'], 404);
        $old = $current[$idx];
        array_splice($current, $idx, 1);
        $pdo->prepare('UPDATE clients SET work_images = ? WHERE id = ?')
            ->execute([json_encode(array_values($current)), $clientId]);
        // Only delete files we own in the work folder.
        if (is_string($old) && preg_match('#^uploads/clients/work/#', $old)) {
            $f = dirname(__DIR__) . '/' . $old;
            if (is_file($f)) unlink($f);
        }
        jsonResponse(['work_images' => workImagesResolved($current, $baseUrl)]);
    }

    // ── Upload / replace a slot ──
    if (empty($_FILES['file']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'], true)) {
        jsonResponse(['message' => 'Image must be jpg, png, gif, webp, avif or svg.'], 400);
    }
    $idx = (isset($body['index']) && $body['index'] !== '') ? (int)$body['index'] : count($current);
    if ($idx < 0 || $idx > 2 || ($idx >= count($current) && count($current) >= 3)) {
        jsonResponse(['message' => 'Maximum 3 work images.'], 400);
    }

    // Replace: clean up the previous file only if we own it.
    if (isset($current[$idx]) && is_string($current[$idx]) && preg_match('#^uploads/clients/work/#', $current[$idx])) {
        $f = dirname(__DIR__) . '/' . $current[$idx];
        if (is_file($f)) unlink($f);
    }

    $filePath = 'uploads/clients/work/' . $clientId . '_' . uniqid() . '.' . $ext;
    @mkdir(dirname(__DIR__) . '/uploads/clients/work', 0755, true);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], dirname(__DIR__) . '/' . $filePath)) {
        jsonResponse(['message' => 'Could not save the uploaded image.'], 500);
    }
    $current[$idx] = $filePath;
    $current = array_values($current);
    $pdo->prepare('UPDATE clients SET work_images = ? WHERE id = ?')
        ->execute([json_encode($current), $clientId]);
    jsonResponse(['work_images' => workImagesResolved($current, $baseUrl)]);
}

// ─── POST /api/clients/:id/media ──────────────────────────────
if ($method === 'POST' && $clientId && $seg3 === 'media' && !$mediaId) {
    requireAdminAuth();
    $filePath = saveUpload('clients');
    if (!$filePath) jsonResponse(['message' => 'No file uploaded.'], 400);
    $type = str_starts_with(mime_content_type(dirname(__DIR__) . '/' . $filePath), 'video/') ? 'video' : 'image';
    $stmt = $pdo->prepare('INSERT INTO client_media (client_id, type, file_path, description, sort_order) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$clientId, $type, $filePath, $_POST['description'] ?? '', (int)($_POST['sort_order'] ?? 0)]);
    jsonResponse(['id' => (int)$pdo->lastInsertId(), 'type' => $type, 'url' => "$baseUrl/$filePath", 'description' => $_POST['description'] ?? ''], 201);
}

// ─── DELETE /api/clients/:id/media/:mediaId ───────────────────
if ($method === 'DELETE' && $clientId && $seg3 === 'media' && $mediaId) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT * FROM client_media WHERE id = ? AND client_id = ?');
    $stmt->execute([$mediaId, $clientId]);
    $m = $stmt->fetch();
    if (!$m) jsonResponse(['message' => 'Media not found.'], 404);
    if (file_exists(dirname(__DIR__) . '/' . $m['file_path'])) unlink(dirname(__DIR__) . '/' . $m['file_path']);
    $pdo->prepare('DELETE FROM client_media WHERE id = ?')->execute([$mediaId]);
    jsonResponse(['message' => 'Media deleted.']);
}

// ─── GET /api/clients/:id/paths ───────────────────────────────
if ($method === 'GET' && $clientId && $seg3 === 'paths' && !$pathId) {
    jsonResponse(getPathsFull($pdo, $clientId, $baseUrl));
}

// ─── POST /api/clients/:id/paths ──────────────────────────────
if ($method === 'POST' && $clientId && $seg3 === 'paths' && !$pathId) {
    requireAdminAuth();
    $body = getBody();
    if (!($body['title'] ?? '')) jsonResponse(['message' => 'Title is required.'], 400);
    $stmt = $pdo->prepare('INSERT INTO client_promotion_paths (client_id, title, path_date) VALUES (?, ?, ?)');
    $stmt->execute([$clientId, $body['title'], $body['path_date'] ?? null]);
    $pid = (int)$pdo->lastInsertId();
    $p = $pdo->prepare('SELECT * FROM client_promotion_paths WHERE id = ?');
    $p->execute([$pid]);
    $path = $p->fetch();
    $path['images'] = []; $path['videos'] = [];
    jsonResponse($path, 201);
}

// ─── PUT /api/clients/:id/paths/:pathId ───────────────────────
if (($method === 'PUT' || $method === 'POST') && $clientId && $seg3 === 'paths' && $pathId && $seg5 !== 'media') {
    requireAdminAuth();
    $body = getBody();
    $existing = $pdo->prepare('SELECT * FROM client_promotion_paths WHERE id = ? AND client_id = ?');
    $existing->execute([$pathId, $clientId]);
    $row = $existing->fetch();
    if (!$row) jsonResponse(['message' => 'Path not found.'], 404);
    $pdo->prepare('UPDATE client_promotion_paths SET title=?, path_date=? WHERE id=?')
        ->execute([$body['title'] ?? $row['title'], $body['path_date'] ?? $row['path_date'], $pathId]);
    $paths = getPathsFull($pdo, $clientId, $baseUrl);
    $full  = array_values(array_filter($paths, fn($p) => $p['id'] === $pathId));
    jsonResponse($full[0] ?? $row);
}

// ─── DELETE /api/clients/:id/paths/:pathId ────────────────────
if ($method === 'DELETE' && $clientId && $seg3 === 'paths' && $pathId && !$seg5) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT * FROM client_promotion_paths WHERE id = ? AND client_id = ?');
    $stmt->execute([$pathId, $clientId]);
    if (!$stmt->fetch()) jsonResponse(['message' => 'Path not found.'], 404);
    $media = $pdo->prepare('SELECT file_path FROM client_path_media WHERE path_id = ?');
    $media->execute([$pathId]);
    foreach ($media->fetchAll() as $m) { if (file_exists(dirname(__DIR__) . '/' . $m['file_path'])) unlink(dirname(__DIR__) . '/' . $m['file_path']); }
    $pdo->prepare('DELETE FROM client_promotion_paths WHERE id = ?')->execute([$pathId]);
    jsonResponse(['message' => 'Path deleted.']);
}

// ─── POST /api/clients/:id/paths/:pathId/media ────────────────
if ($method === 'POST' && $clientId && $seg3 === 'paths' && $pathId && $seg5 === 'media') {
    requireAdminAuth();
    // Detailed upload error info
    if (empty($_FILES['file']['tmp_name'])) {
        $phpError = $_FILES['file']['error'] ?? 'no_file_key';
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds upload_max_filesize (' . ini_get('upload_max_filesize') . ')',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds MAX_FILE_SIZE in form',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION  => 'Upload stopped by extension',
        ];
        $msg = is_int($phpError) ? ($errorMessages[$phpError] ?? "PHP upload error code: $phpError") : 'No file in request';
        jsonResponse(['message' => $msg, 'php_limits' => ['upload_max_filesize' => ini_get('upload_max_filesize'), 'post_max_size' => ini_get('post_max_size')]], 400);
    }
    $filePath = saveUpload('paths');
    if (!$filePath) {
        $dir = dirname(__DIR__) . '/uploads/paths';
        $writable = is_writable($dir);
        $exists = is_dir($dir);
        jsonResponse(['message' => 'File save failed', 'dir_exists' => $exists, 'dir_writable' => $writable], 400);
    }
    $type = str_starts_with(mime_content_type(dirname(__DIR__) . '/' . $filePath), 'video/') ? 'video' : 'image';
    $count = $pdo->prepare('SELECT COUNT(*) AS cnt FROM client_path_media WHERE path_id = ? AND type = ?');
    $count->execute([$pathId, $type]);
    $limit = ($type === 'video') ? 3 : 5;
    if ($count->fetch()['cnt'] >= $limit) {
        unlink(dirname(__DIR__) . '/' . $filePath);
        jsonResponse(['message' => "Maximum {$limit} {$type}s per path reached."], 400);
    }
    $stmt = $pdo->prepare('INSERT INTO client_path_media (path_id, type, file_path, description, sort_order, price) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$pathId, $type, $filePath, $_POST['description'] ?? '', (int)($_POST['sort_order'] ?? 0), $_POST['price'] ?? null]);
    jsonResponse(['id' => (int)$pdo->lastInsertId(), 'type' => $type, 'url' => "$baseUrl/$filePath", 'description' => $_POST['description'] ?? '', 'price' => $_POST['price'] ?? null], 201);
}

// ─── DELETE /api/clients/:id/paths/:pathId/media/:mediaId ─────
if ($method === 'DELETE' && $clientId && $seg3 === 'paths' && $pathId && $seg5 === 'media' && $pathMediaId) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT * FROM client_path_media WHERE id = ? AND path_id = ?');
    $stmt->execute([$pathMediaId, $pathId]);
    $m = $stmt->fetch();
    if (!$m) jsonResponse(['message' => 'Media not found.'], 404);
    if (file_exists(dirname(__DIR__) . '/' . $m['file_path'])) unlink(dirname(__DIR__) . '/' . $m['file_path']);
    $pdo->prepare('DELETE FROM client_path_media WHERE id = ?')->execute([$pathMediaId]);
    jsonResponse(['message' => 'Media deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
