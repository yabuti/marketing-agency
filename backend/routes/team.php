<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/translator.php';

$method  = getMethod();
// Support _method override for multipart form PUT (PHP doesn't populate $_FILES on PUT)
if ($method === 'POST' && ($_POST['_method'] ?? '') === 'PUT') {
    $method = 'PUT';
}
$uri     = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts   = explode('/', $uri);
$last    = end($parts);
$id      = is_numeric($last) ? (int)$last : null;
$isAll   = $last === 'all';
$lang    = $_GET['lang'] ?? 'en'; // en | am | or

$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

function formatMember(array $m, string $baseUrl, string $lang = 'en'): array {
    $m['photo_url'] = $m['photo_path'] ? "$baseUrl/{$m['photo_path']}" : null;
    if ($lang === 'am') {
        if (!empty($m['position_am']))         $m['position']         = $m['position_am'];
        if (!empty($m['responsibilities_am'])) $m['responsibilities'] = $m['responsibilities_am'];
    } elseif ($lang === 'or') {
        if (!empty($m['position_or']))         $m['position']         = $m['position_or'];
        if (!empty($m['responsibilities_or'])) $m['responsibilities'] = $m['responsibilities_or'];
    }
    return $m;
}

// GET /api/team (public active)
if ($method === 'GET' && !$id && !$isAll) {
    $rows = $pdo->query('SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();
    jsonResponse(array_map(fn($m) => formatMember($m, $baseUrl, $lang), $rows));
}

// GET /api/team/all (admin)
if ($method === 'GET' && $isAll) {
    requireAdminAuth();
    $rows = $pdo->query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC')->fetchAll();
    jsonResponse(array_map(fn($m) => formatMember($m, $baseUrl, 'en'), $rows));
}

// POST /api/team (admin create) or POST /api/team/:id with _method=PUT (handled above as PUT)
if ($method === 'POST' && !$id) {
    requireAdminAuth();
    $full_name        = $_POST['full_name'] ?? '';
    $position         = $_POST['position'] ?? '';
    $department       = $_POST['department'] ?? '';
    $responsibilities = $_POST['responsibilities'] ?? '';
    $sort_order       = (int)($_POST['sort_order'] ?? 0);

    if (!$full_name || !$position || !$department) jsonResponse(['message' => 'Full name, position and department are required.'], 400);

    $photo_path = null;
    if (!empty($_FILES['photo']['tmp_name'])) {
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $filename = 'uploads/team/' . uniqid() . '.' . $ext;
        @mkdir(dirname(__DIR__) . '/uploads/team', 0755, true);
        move_uploaded_file($_FILES['photo']['tmp_name'], dirname(__DIR__) . '/' . $filename);
        $photo_path = $filename;
    }

    $stmt = $pdo->prepare('INSERT INTO team_members (full_name, position, department, responsibilities, photo_path, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$full_name, $position, $department, $responsibilities, $photo_path, $sort_order]);
    $newId = (int)$pdo->lastInsertId();
    $member = $pdo->query("SELECT * FROM team_members WHERE id = $newId")->fetch();
    jsonResponse(formatMember($member, $baseUrl), 201);

    // Translate in background
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    $t = translateTeam($position, $responsibilities);
    $pdo->prepare('UPDATE team_members SET position_am=?, position_or=?, responsibilities_am=?, responsibilities_or=? WHERE id=?')
        ->execute([$t['position_am'], $t['position_or'], $t['responsibilities_am'], $t['responsibilities_or'], $newId]);
}

// PUT /api/team/:id (admin update)
if ($method === 'PUT' && $id) {
    requireAdminAuth();
    $existing = $pdo->prepare('SELECT * FROM team_members WHERE id = ?');
    $existing->execute([$id]);
    $row = $existing->fetch();
    if (!$row) jsonResponse(['message' => 'Member not found.'], 404);

    // FormData comes via POST with _method=PUT override, so $_POST and $_FILES are populated
    $full_name        = $_POST['full_name'] ?? $row['full_name'];
    $position         = $_POST['position'] ?? $row['position'];
    $department       = $_POST['department'] ?? $row['department'];
    $responsibilities = $_POST['responsibilities'] ?? $row['responsibilities'];
    $sort_order       = $_POST['sort_order'] ?? $row['sort_order'];
    $is_active        = (int)($_POST['is_active'] ?? $row['is_active']);
    $photo_path       = $row['photo_path'];

    if (!empty($_FILES['photo']['tmp_name'])) {
        if ($photo_path && file_exists(dirname(__DIR__) . '/' . $photo_path)) unlink(dirname(__DIR__) . '/' . $photo_path);
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $photo_path = 'uploads/team/' . uniqid() . '.' . $ext;
        @mkdir(dirname(__DIR__) . '/uploads/team', 0755, true);
        move_uploaded_file($_FILES['photo']['tmp_name'], dirname(__DIR__) . '/' . $photo_path);
    }

    $pdo->prepare('UPDATE team_members SET full_name=?, position=?, department=?, responsibilities=?, photo_path=?, sort_order=?, is_active=? WHERE id=?')
        ->execute([$full_name, $position, $department, $responsibilities, $photo_path, $sort_order, $is_active, $id]);
    $updated = $pdo->prepare('SELECT * FROM team_members WHERE id = ?');
    $updated->execute([$id]);
    jsonResponse(formatMember($updated->fetch(), $baseUrl));

    // Re-translate if position or responsibilities changed
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    if ($position !== $row['position'] || $responsibilities !== $row['responsibilities']) {
        $t = translateTeam($position, $responsibilities);
        $pdo->prepare('UPDATE team_members SET position_am=?, position_or=?, responsibilities_am=?, responsibilities_or=? WHERE id=?')
            ->execute([$t['position_am'], $t['position_or'], $t['responsibilities_am'], $t['responsibilities_or'], $id]);
    }
}

// DELETE /api/team/:id (admin)
if ($method === 'DELETE' && $id) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT * FROM team_members WHERE id = ?');
    $stmt->execute([$id]);
    $member = $stmt->fetch();
    if (!$member) jsonResponse(['message' => 'Member not found.'], 404);
    if ($member['photo_path'] && file_exists(dirname(__DIR__) . '/' . $member['photo_path'])) {
        unlink(dirname(__DIR__) . '/' . $member['photo_path']);
    }
    $pdo->prepare('DELETE FROM team_members WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Member deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
