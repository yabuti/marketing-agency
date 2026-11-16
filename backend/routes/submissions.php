<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method  = getMethod();
$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

// URL segments: /api/submissions[/admin[/all|:id]]
$uri   = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $uri);
$seg2  = $parts[2] ?? null; // 'admin'
$seg3  = $parts[3] ?? null; // 'all' or numeric id
$isAdminRoute = $seg2 === 'admin';
$subId = ($isAdminRoute && is_numeric($seg3)) ? (int)$seg3 : null;

/** Attach uploaded files to a submission row. */
function attachSubmissionFiles(PDO $pdo, array &$subs, string $baseUrl): void {
    if (!$subs) return;
    $ids = array_column($subs, 'id');
    $in  = implode(',', array_fill(0, count($ids), '?'));
    $f   = $pdo->prepare("SELECT * FROM user_submission_files WHERE submission_id IN ($in)");
    $f->execute($ids);
    $bySub = [];
    foreach ($f->fetchAll() as $row) {
        $row['url'] = "$baseUrl/{$row['file_path']}";
        $bySub[$row['submission_id']][] = $row;
    }
    foreach ($subs as &$sub) {
        $sub['files'] = $bySub[$sub['id']] ?? [];
    }
}

// ─── GET /api/submissions/admin/all (admin list) ───────────────
// NOTE: must stay ABOVE the user-scoped GET below, which has no action
// check and would otherwise swallow this route.
if ($method === 'GET' && $isAdminRoute && $seg3 === 'all') {
    requireAdminAuth();
    $status = $parts[4] ?? null;
    if ($status && in_array($status, ['pending', 'approved', 'rejected'], true)) {
        $stmt = $pdo->prepare(
            'SELECT s.*, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
             FROM user_submissions s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.status = ?
             ORDER BY s.created_at DESC'
        );
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query(
            'SELECT s.*, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
             FROM user_submissions s
             LEFT JOIN users u ON u.id = s.user_id
             ORDER BY s.created_at DESC'
        );
    }
    $subs = $stmt->fetchAll();
    attachSubmissionFiles($pdo, $subs, $baseUrl);
    jsonResponse($subs);
}

// ─── PUT /api/submissions/admin/:id (admin moderate) ───────────
if ($method === 'PUT' && $isAdminRoute && $subId) {
    requireAdminAuth();
    $body   = getBody();
    $status = $body['status'] ?? null;
    if (!in_array($status, ['pending', 'approved', 'rejected'], true)) {
        jsonResponse(['message' => 'Status must be pending, approved or rejected.'], 400);
    }
    $stmt = $pdo->prepare(
        'UPDATE user_submissions SET status = ? WHERE id = ?'
    );
    $stmt->execute([$status, $subId]);
    $out = $pdo->prepare(
        'SELECT s.*, u.full_name AS user_name, u.email AS user_email, u.phone AS user_phone
         FROM user_submissions s LEFT JOIN users u ON u.id = s.user_id WHERE s.id = ?'
    );
    $out->execute([$subId]);
    $row = $out->fetch();
    if (!$row) jsonResponse(['message' => 'Submission not found.'], 404);
    $one = [$row];
    attachSubmissionFiles($pdo, $one, $baseUrl);
    jsonResponse($one[0]);
}

// ─── DELETE /api/submissions/admin/:id (admin delete) ──────────
if ($method === 'DELETE' && $isAdminRoute && $subId) {
    requireAdminAuth();
    $files = $pdo->prepare('SELECT file_path FROM user_submission_files WHERE submission_id = ?');
    $files->execute([$subId]);
    foreach ($files->fetchAll() as $f) {
        if ($f['file_path'] && file_exists(dirname(__DIR__) . '/' . $f['file_path'])) {
            unlink(dirname(__DIR__) . '/' . $f['file_path']);
        }
    }
    $pdo->prepare('DELETE FROM user_submission_files WHERE submission_id = ?')->execute([$subId]);
    $del = $pdo->prepare('DELETE FROM user_submissions WHERE id = ?');
    $del->execute([$subId]);
    if (!$del->rowCount()) jsonResponse(['message' => 'Submission not found.'], 404);
    jsonResponse(['message' => 'Submission deleted.']);
}

// POST /api/submissions
if ($method === 'POST') {
    $user      = requireUserAuth();
    $path_name = $_POST['path_name'] ?? '';
    $description = $_POST['description'] ?? null;
    $images    = $_FILES['images'] ?? [];
    $videos    = $_FILES['videos'] ?? [];

    // Normalize multi-file upload structure
    $imageFiles = [];
    $videoFiles = [];
    if (!empty($images['tmp_name'])) {
        $count = is_array($images['tmp_name']) ? count($images['tmp_name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            $imageFiles[] = ['tmp_name' => is_array($images['tmp_name']) ? $images['tmp_name'][$i] : $images['tmp_name'], 'name' => is_array($images['name']) ? $images['name'][$i] : $images['name']];
        }
    }
    if (!empty($videos['tmp_name'])) {
        $count = is_array($videos['tmp_name']) ? count($videos['tmp_name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            $videoFiles[] = ['tmp_name' => is_array($videos['tmp_name']) ? $videos['tmp_name'][$i] : $videos['tmp_name'], 'name' => is_array($videos['name']) ? $videos['name'][$i] : $videos['name']];
        }
    }

    if (!$path_name) jsonResponse(['message' => 'Path name is required.'], 400);
    if (count($imageFiles) < 3) jsonResponse(['message' => 'Please upload at least 3 images.'], 400);
    if (count($imageFiles) > 5) jsonResponse(['message' => 'Maximum 5 images allowed.'], 400);
    if (count($videoFiles) < 3) jsonResponse(['message' => 'Please upload at least 3 videos.'], 400);
    if (count($videoFiles) > 5) jsonResponse(['message' => 'Maximum 5 videos allowed.'], 400);

    $stmt = $pdo->prepare('INSERT INTO user_submissions (user_id, path_name, description) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $path_name, $description]);
    $subId = (int)$pdo->lastInsertId();

    @mkdir(dirname(__DIR__) . '/uploads/submissions', 0755, true);
    $fileRows = [];
    foreach ($imageFiles as $f) {
        $ext  = pathinfo($f['name'], PATHINFO_EXTENSION);
        $path = 'uploads/submissions/' . uniqid() . '.' . $ext;
        move_uploaded_file($f['tmp_name'], dirname(__DIR__) . '/' . $path);
        $fileRows[] = [$subId, 'image', $path];
    }
    foreach ($videoFiles as $f) {
        $ext  = pathinfo($f['name'], PATHINFO_EXTENSION);
        $path = 'uploads/submissions/' . uniqid() . '.' . $ext;
        move_uploaded_file($f['tmp_name'], dirname(__DIR__) . '/' . $path);
        $fileRows[] = [$subId, 'video', $path];
    }

    $placeholders = implode(',', array_fill(0, count($fileRows), '(?, ?, ?)'));
    $flat = array_merge(...$fileRows);
    $pdo->prepare("INSERT INTO user_submission_files (submission_id, type, file_path) VALUES $placeholders")->execute($flat);

    jsonResponse(['message' => 'Submission received.', 'id' => $subId], 201);
}

// GET /api/submissions
if ($method === 'GET') {
    $user = requireUserAuth();
    $stmt = $pdo->prepare('SELECT * FROM user_submissions WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    $subs = $stmt->fetchAll();
    foreach ($subs as &$sub) {
        $files = $pdo->prepare('SELECT * FROM user_submission_files WHERE submission_id = ?');
        $files->execute([$sub['id']]);
        $sub['files'] = array_map(fn($f) => array_merge($f, ['url' => "$baseUrl/{$f['file_path']}"]), $files->fetchAll());
    }
    jsonResponse($subs);
}

jsonResponse(['message' => 'Not found.'], 404);
