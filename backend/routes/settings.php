<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method = getMethod();

// GET /api/settings (public) — returns site-wide content managed from the admin panel.
// Falls back to an empty object so the front end uses its own defaults.
if ($method === 'GET') {
    try {
        $stmt = $pdo->query('SELECT settings_json FROM site_settings WHERE id = 1');
        $row  = $stmt->fetch();
        $settings = $row ? json_decode($row['settings_json'], true) : [];
        if (!is_array($settings)) $settings = [];
        jsonResponse(['settings' => $settings]);
    } catch (PDOException $e) {
        jsonResponse(['settings' => []]);
    }
}

// PUT or POST /api/settings (admin) — replaces the saved settings JSON.
if ($method === 'PUT' || $method === 'POST') {
    requireAdminAuth();
    $body     = getBody();
    $settings = (is_array($body['settings'] ?? null)) ? $body['settings'] : $body;
    if (!is_array($settings)) jsonResponse(['message' => 'Invalid settings payload.'], 400);

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO site_settings (id, settings_json) VALUES (1, ?)
             ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)'
        );
        $stmt->execute([json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        jsonResponse(['message' => 'Settings saved.', 'settings' => $settings]);
    } catch (PDOException $e) {
        jsonResponse(['message' => 'Could not save settings. Make sure the site_settings table exists (run database/site_settings.sql).'], 500);
    }
}

jsonResponse(['message' => 'Not found.'], 404);