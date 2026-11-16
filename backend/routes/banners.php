<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method  = getMethod();
$uri     = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts   = explode('/', $uri);
$action  = $parts[2] ?? null; // 'current', 'all', 'upload', 'delete', or filename
$baseUrl = rtrim(getenv('APP_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');

$BANNERS_DIR     = dirname(__DIR__) . '/banners';
$IMAGES_PER_SLOT = 3;
$WINDOW_HOURS    = 12;
$SECS_PER_BANNER = 5;
$SUPPORTED       = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

function getAllBanners(string $dir, array $supported): array {
    if (!is_dir($dir)) return [];
    $files = array_filter(scandir($dir), fn($f) => in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), $supported) && $f !== '.gitkeep');
    // Sort by modification time descending (newest first)
    usort($files, fn($a, $b) => filemtime("$dir/$b") - filemtime("$dir/$a"));
    return array_values($files);
}

function currentSlot(int $windowHours): int {
    $epoch = strtotime('2026-01-01T00:00:00Z');
    $hoursElapsed = (int)floor((time() - $epoch) / 3600);
    return (int)floor($hoursElapsed / $windowHours);
}

function getBannersForSlot(int $slot, array $all, int $perSlot): array {
    if (!$all) return [];
    $totalSets = (int)ceil(count($all) / $perSlot);
    $setIndex  = $slot % $totalSets;
    $start     = $setIndex * $perSlot;
    $slice     = array_slice($all, $start, $perSlot);
    while (count($slice) < $perSlot && count($all) >= $perSlot) {
        $needed = $perSlot - count($slice);
        $slice  = array_merge($slice, array_slice($all, 0, $needed));
    }
    return $slice;
}

function safeBannerPath(string $dir, string $filename): ?string {
    $filename = basename(urldecode($filename)); // strip any traversal
    if ($filename === '' || str_contains($filename, '/') || str_contains($filename, '\\')) return null;
    return "$dir/$filename";
}

// POST /api/banners/upload (admin)
if ($method === 'POST' && $action === 'upload') {
    requireAdminAuth();
    if (empty($_FILES['banner']['tmp_name'])) jsonResponse(['message' => 'No file uploaded.'], 400);
    if ($_FILES['banner']['error'] !== UPLOAD_ERR_OK) jsonResponse(['message' => 'Upload error code ' . $_FILES['banner']['error'] . '. File may exceed server limit.'], 400);
    $ext = strtolower(pathinfo($_FILES['banner']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $SUPPORTED)) jsonResponse(['message' => "Unsupported file type .$ext. Allowed: jpg, png, webp, gif."], 400);
    if (!is_dir($BANNERS_DIR) && !@mkdir($BANNERS_DIR, 0755, true)) {
        jsonResponse(['message' => 'Server cannot create banners directory. Check folder permissions.'], 500);
    }
    // Prefix with timestamp so newest sorts first
    $filename = date('YmdHis') . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $_FILES['banner']['name']);
    $dest     = "$BANNERS_DIR/$filename";
    if (!@move_uploaded_file($_FILES['banner']['tmp_name'], $dest)) {
        jsonResponse(['message' => 'Server could not save the file. Check write permissions on the banners folder.'], 500);
    }
    @chmod($dest, 0644);
    jsonResponse(['message' => 'Uploaded.', 'filename' => $filename, 'url' => "$baseUrl/banners/" . rawurlencode($filename)], 201);
}

// DELETE via POST body — fallback for hosts/mod_security that block the DELETE method
// POST /api/banners/delete  { "filename": "..." }
if ($method === 'POST' && $action === 'delete') {
    requireAdminAuth();
    $body     = getBody();
    $filepath = safeBannerPath($BANNERS_DIR, $body['filename'] ?? '');
    if (!$filepath) jsonResponse(['message' => 'Invalid filename.'], 400);
    if (!file_exists($filepath)) jsonResponse(['message' => 'Already deleted or file not found.'], 200);
    if (!@unlink($filepath)) {
        $err = (error_get_last()['message'] ?? '') . ' | folder: ' . $BANNERS_DIR;
        jsonResponse(['message' => 'Server could not delete the file. ' . $err], 500);
    }
    jsonResponse(['message' => 'Deleted.']);
}

// DELETE /api/banners/:filename (admin)
if ($method === 'DELETE' && $action && $action !== 'current' && $action !== 'all') {
    requireAdminAuth();
    $filepath = safeBannerPath($BANNERS_DIR, $action);
    if (!$filepath) jsonResponse(['message' => 'Invalid filename.'], 400);
    if (!file_exists($filepath)) jsonResponse(['message' => 'Already deleted or file not found.'], 200);
    if (!@unlink($filepath)) {
        $err = (error_get_last()['message'] ?? '') . ' | folder: ' . $BANNERS_DIR;
        jsonResponse(['message' => 'Server could not delete the file. ' . $err], 500);
    }
    jsonResponse(['message' => 'Deleted.']);
}

// GET /api/banners/current
if ($method === 'GET' && $action === 'current') {
    header('Cache-Control: no-store, max-age=0');
    $all     = getAllBanners($BANNERS_DIR, $SUPPORTED);
    $slot    = currentSlot($WINDOW_HOURS);
    $banners = getBannersForSlot($slot, $all, $IMAGES_PER_SLOT);
    $epoch   = strtotime('2026-01-01T00:00:00Z');
    $slotEndMs = ($epoch + ($slot + 1) * $WINDOW_HOURS * 3600) * 1000;
    jsonResponse([
        'slot'            => $slot,
        'total_banners'   => count($all),
        'banners'         => array_map(fn($f, $i) => ['index' => $i, 'filename' => $f, 'url' => "$baseUrl/banners/" . rawurlencode($f), 'duration_sec' => $SECS_PER_BANNER], $banners, array_keys($banners)),
        'slot_ends_in_ms' => $slotEndMs - (int)(microtime(true) * 1000),
        'next_slot_at'    => date('c', (int)($slotEndMs / 1000)),
    ]);
}

// GET /api/banners/all (admin)
if ($method === 'GET' && $action === 'all') {
    requireAdminAuth();
    header('Cache-Control: no-store, max-age=0');
    $all       = getAllBanners($BANNERS_DIR, $SUPPORTED);
    $slot      = currentSlot($WINDOW_HOURS);
    $totalSets = max(1, (int)ceil(count($all) / $IMAGES_PER_SLOT));
    jsonResponse([
        'total'           => count($all),
        'images_per_slot' => $IMAGES_PER_SLOT,
        'window_hours'    => $WINDOW_HOURS,
        'current_slot'    => $slot,
        'total_sets'      => $totalSets,
        'banners'         => array_map(fn($f, $i) => [
            'index'          => $i,
            'filename'       => $f,
            'url'            => "$baseUrl/banners/" . rawurlencode($f),
            'set'            => (int)floor($i / $IMAGES_PER_SLOT),
            'is_current_set' => (int)floor($i / $IMAGES_PER_SLOT) === $slot % $totalSets,
        ], $all, array_keys($all)),
    ]);
}

jsonResponse(['message' => 'Not found.'], 404);
