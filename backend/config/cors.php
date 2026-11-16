<?php
$allowed = getenv('FRONTEND_URL') ?: '*';
// Support multiple origins (comma-separated in FRONTEND_URL)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedList = array_map('trim', explode(',', $allowed));
if ($allowed === '*' || in_array($origin, $allowedList)) {
    header("Access-Control-Allow-Origin: " . ($allowed === '*' ? '*' : $origin));
} else {
    header("Access-Control-Allow-Origin: " . $allowedList[0]);
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Cache public GET responses for 60 seconds, but never cache responses for
// authenticated requests (token is sent via Authorization/X-Auth-Token header
// or the ?token= query-param fallback used by the admin panel).
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $authed = !empty($_SERVER['HTTP_AUTHORIZATION'])
        || !empty($_SERVER['HTTP_X_AUTH_TOKEN'])
        || isset($_GET['token']);
    if ($authed) {
        header("Cache-Control: private, no-store");
    } else {
        header("Cache-Control: public, max-age=60");
    }
}
