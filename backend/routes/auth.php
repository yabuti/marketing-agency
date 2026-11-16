<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method = getMethod();
$uri    = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts  = explode('/', $uri);
$action = end($parts); // login | change-password

// Hardcoded admin credentials
define('ADMIN_EMAIL',    'admin@allthings.com');
define('ADMIN_PASSWORD', 'Allthings@2026');

// POST /api/auth/login
if ($method === 'POST' && $action === 'login') {
    $body     = getBody();
    $email    = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');

    if (!$email || !$password) jsonResponse(['message' => 'Email and password are required.'], 400);

    // Check hardcoded credentials first
    if ($email === ADMIN_EMAIL && $password === ADMIN_PASSWORD) {
        // Get or create admin record
        $stmt = $pdo->prepare('SELECT * FROM admins WHERE email = ?');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        if (!$admin) {
            // Auto-create if not exists
            $pdo->prepare('INSERT INTO admins (email, name, password) VALUES (?, ?, ?)')
                ->execute([$email, 'Admin', password_hash($password, PASSWORD_BCRYPT)]);
            $stmt->execute([$email]);
            $admin = $stmt->fetch();
        }
        $token = generateToken(['id' => $admin['id'], 'email' => $admin['email']], '+7 days');
        jsonResponse(['token' => $token, 'admin' => ['id' => $admin['id'], 'email' => $admin['email'], 'name' => $admin['name']]]);
    }

    // Fallback: check database
    $stmt = $pdo->prepare('SELECT * FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        jsonResponse(['message' => 'Invalid credentials.'], 401);
    }

    $token = generateToken(['id' => $admin['id'], 'email' => $admin['email']], '+7 days');
    jsonResponse(['token' => $token, 'admin' => ['id' => $admin['id'], 'email' => $admin['email'], 'name' => $admin['name']]]);
}

// POST /api/auth/change-password
if ($method === 'POST' && $action === 'change-password') {
    $admin = requireAdminAuth();
    $body  = getBody();
    $currentPassword = $body['currentPassword'] ?? '';
    $newPassword     = $body['newPassword'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM admins WHERE id = ?');
    $stmt->execute([$admin['id']]);
    $row = $stmt->fetch();

    if (!password_verify($currentPassword, $row['password'])) {
        jsonResponse(['message' => 'Current password is incorrect.'], 400);
    }

    $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE admins SET password = ? WHERE id = ?')->execute([$hashed, $admin['id']]);
    jsonResponse(['message' => 'Password updated successfully.']);
}

jsonResponse(['message' => 'Not found.'], 404);
