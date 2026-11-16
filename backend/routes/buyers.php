<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method = getMethod();
$uri    = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts  = explode('/', $uri);

// URL segments: /api/buyers/<action>
// $parts[0] = 'api', $parts[1] = 'buyers', $parts[2] = action
$action = $parts[2] ?? null; // 'register', 'me', 'change-password', 'admin'
$sub    = $parts[3] ?? null; // 'all' or numeric id (admin routes only)
$isAdminRoute = $action === 'admin';
$buyerId = ($isAdminRoute && is_numeric($sub)) ? (int)$sub : null;

// ─── GET /api/buyers/admin/all (admin list) ────────────────────
// NOTE: must stay ABOVE the buyer-scoped routes below so 'admin' is
// never mistaken for a buyer action.
if ($method === 'GET' && $isAdminRoute && $sub === 'all') {
    requireAdminAuth();
    $q    = trim((string)($_GET['q'] ?? ''));
    $stmt = $pdo->query('SELECT id, full_name, email, phone, created_at, updated_at FROM buyers ORDER BY created_at DESC');
    $rows = $stmt->fetchAll();
    if ($q !== '') {
        $needle = mb_strtolower($q);
        $rows = array_values(array_filter($rows, function ($r) use ($needle) {
            foreach (['full_name', 'email', 'phone'] as $k) {
                if (str_contains(mb_strtolower((string)($r[$k] ?? '')), $needle)) return true;
            }
            return false;
        }));
    }
    jsonResponse($rows);
}

// ─── DELETE /api/buyers/admin/:id (admin delete) ───────────────
if ($method === 'DELETE' && $isAdminRoute && $buyerId) {
    requireAdminAuth();
    $stmt = $pdo->prepare('DELETE FROM buyers WHERE id = ?');
    $stmt->execute([$buyerId]);
    if (!$stmt->rowCount()) jsonResponse(['message' => 'Buyer not found.'], 404);
    jsonResponse(['message' => 'Buyer deleted.']);
}

// ─── POST /api/buyers/register ────────────────────────────────
// Public. Validates fields, hashes password, inserts buyer, returns JWT.
if ($method === 'POST' && $action === 'register') {
    $body = getBody();

    $fullName = trim($body['full_name'] ?? '');
    $phone    = trim($body['phone']     ?? '');
    $password = $body['password']       ?? '';
    $email    = trim($body['email']     ?? '') ?: null;

    // Required field validation
    if (!$fullName || !$phone || !$password) {
        jsonResponse(['message' => 'Name, phone and password are required.'], 400);
    }

    // Password length
    if (strlen($password) < 6) {
        jsonResponse(['message' => 'Password must be at least 6 characters.'], 400);
    }

    // Duplicate phone check
    $check = $pdo->prepare('SELECT id FROM buyers WHERE phone = ?');
    $check->execute([$phone]);
    if ($check->fetch()) {
        jsonResponse(['message' => 'Phone number already registered.'], 409);
    }

    // Duplicate email check (only when email provided)
    if ($email !== null) {
        $checkEmail = $pdo->prepare('SELECT id FROM buyers WHERE email = ?');
        $checkEmail->execute([$email]);
        if ($checkEmail->fetch()) {
            jsonResponse(['message' => 'Email already registered.'], 409);
        }
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        'INSERT INTO buyers (full_name, email, phone, password) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$fullName, $email, $phone, $hash]);
    $buyerId = (int) $pdo->lastInsertId();

    $token = generateToken(
        ['id' => $buyerId, 'phone' => $phone, 'role' => 'buyer'],
        '+30 days'
    );

    jsonResponse([
        'token' => $token,
        'buyer' => [
            'id'        => $buyerId,
            'full_name' => $fullName,
            'email'     => $email,
            'phone'     => $phone,
        ],
    ], 201);
}

// ─── GET /api/buyers/me ───────────────────────────────────────
// Requires buyer JWT. Returns buyer profile without password.
if ($method === 'GET' && $action === 'me') {
    $buyer = requireBuyerAuth();

    $stmt = $pdo->prepare(
        'SELECT id, full_name, email, phone, created_at FROM buyers WHERE id = ?'
    );
    $stmt->execute([(int) $buyer['id']]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse(['message' => 'Buyer not found.'], 404);
    }

    jsonResponse($row);
}

// ─── PUT /api/buyers/me ───────────────────────────────────────
// Requires buyer JWT. Updates full_name, email, phone.
if ($method === 'PUT' && $action === 'me') {
    $buyer = requireBuyerAuth();
    $body  = getBody();

    $fullName = trim($body['full_name'] ?? '');
    $phone    = trim($body['phone']     ?? '');
    $email    = isset($body['email']) ? (trim($body['email']) ?: null) : null;

    if (!$fullName || !$phone) {
        jsonResponse(['message' => 'Name and phone are required.'], 400);
    }

    // Check phone uniqueness (exclude self)
    $check = $pdo->prepare('SELECT id FROM buyers WHERE phone = ? AND id != ?');
    $check->execute([$phone, (int) $buyer['id']]);
    if ($check->fetch()) {
        jsonResponse(['message' => 'Phone number already in use.'], 409);
    }

    // Check email uniqueness (exclude self, only when provided)
    if ($email !== null) {
        $checkEmail = $pdo->prepare('SELECT id FROM buyers WHERE email = ? AND id != ?');
        $checkEmail->execute([$email, (int) $buyer['id']]);
        if ($checkEmail->fetch()) {
            jsonResponse(['message' => 'Email already in use.'], 409);
        }
    }

    $pdo->prepare(
        'UPDATE buyers SET full_name = ?, email = ?, phone = ? WHERE id = ?'
    )->execute([$fullName, $email, $phone, (int) $buyer['id']]);

    $stmt = $pdo->prepare(
        'SELECT id, full_name, email, phone, created_at FROM buyers WHERE id = ?'
    );
    $stmt->execute([(int) $buyer['id']]);
    jsonResponse($stmt->fetch());
}

// ─── POST /api/buyers/change-password ────────────────────────
// Requires buyer JWT. Verifies current password, sets new password.
if ($method === 'POST' && $action === 'change-password') {
    $buyer = requireBuyerAuth();
    $body  = getBody();

    $currentPassword = $body['currentPassword'] ?? '';
    $newPassword     = $body['newPassword']     ?? '';

    if (!$currentPassword || !$newPassword) {
        jsonResponse(['message' => 'Current and new passwords are required.'], 400);
    }

    if (strlen($newPassword) < 6) {
        jsonResponse(['message' => 'New password must be at least 6 characters.'], 400);
    }

    $stmt = $pdo->prepare('SELECT password FROM buyers WHERE id = ?');
    $stmt->execute([(int) $buyer['id']]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($currentPassword, $row['password'])) {
        jsonResponse(['message' => 'Current password is incorrect.'], 401);
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE buyers SET password = ? WHERE id = ?')
        ->execute([$hash, (int) $buyer['id']]);

    jsonResponse(['message' => 'Password changed successfully.']);
}

jsonResponse(['message' => 'Not found.'], 404);
