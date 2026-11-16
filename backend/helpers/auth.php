<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJwtSecret() {
    return getenv('JWT_SECRET') ?: 'allthings_secret_key_2026';
}

function generateToken(array $payload, string $expiry = '+7 days'): string {
    $payload['iat'] = time();
    $payload['exp'] = strtotime($expiry);
    return JWT::encode($payload, getJwtSecret(), 'HS256');
}

function getBearerToken(): string {
    // Try getallheaders()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if ($auth) return str_replace('Bearer ', '', trim($auth));
        // Try X-Auth-Token custom header
        $xtoken = $headers['X-Auth-Token'] ?? $headers['x-auth-token'] ?? '';
        if ($xtoken) return trim($xtoken);
    }
    // Try $_SERVER
    $auth = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $_SERVER['HTTP_X_AUTHORIZATION']
        ?? '';
    if ($auth) return str_replace('Bearer ', '', trim($auth));
    // Try X-Auth-Token via $_SERVER
    $xtoken = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
    if ($xtoken) return trim($xtoken);
    // Try query string fallback
    return $_GET['token'] ?? '';
}

function requireAdminAuth(): array {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        die(json_encode(['message' => 'Access denied. No token provided.']));
    }
    try {
        $decoded = (array) JWT::decode($token, new Key(getJwtSecret(), 'HS256'));
        // Verify the token's email belongs to a real admin (any valid JWT no longer passes)
        require_once __DIR__ . '/../config/db.php';
        // db.php is always already loaded at global scope by the router, so the
        // require_once above is a no-op and $pdo is NOT in this function's scope.
        // Without this `global`, every admin route fatals on $pdo->prepare().
        global $pdo;
        $email = $decoded['email'] ?? '';
        if (!$email) {
            http_response_code(403);
            die(json_encode(['message' => 'Admin access required.']));
        }
        $stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ?');
        $stmt->execute([$email]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            die(json_encode(['message' => 'Admin access required.']));
        }
        return $decoded;
    } catch (Exception $e) {
        http_response_code(403);
        die(json_encode(['message' => 'Invalid or expired token.']));
    }
}

function requireUserAuth(): array {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        die(json_encode(['message' => 'Not authenticated.']));
    }
    try {
        $decoded = JWT::decode($token, new Key(getJwtSecret(), 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) {
        http_response_code(403);
        die(json_encode(['message' => 'Invalid token.']));
    }
}

function requireBuyerAuth(): array {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        die(json_encode(['message' => 'Not authenticated.']));
    }
    try {
        $decoded = JWT::decode($token, new Key(getJwtSecret(), 'HS256'));
        $payload = (array) $decoded;
        if (($payload['role'] ?? '') !== 'buyer') {
            http_response_code(403);
            die(json_encode(['message' => 'Buyer access required.']));
        }
        return $payload;
    } catch (Exception $e) {
        http_response_code(403);
        die(json_encode(['message' => 'Invalid token.']));
    }
}
