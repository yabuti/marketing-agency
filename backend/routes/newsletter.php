<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method = getMethod();

// POST /api/newsletter/subscribe (public)
if ($method === 'POST') {
    $body  = getBody();
    $email = strtolower(trim($body['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['message' => 'Please enter a valid email address.'], 400);
    }
    try {
        $stmt = $pdo->prepare('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)');
        $stmt->execute([$email]);
        jsonResponse(['message' => 'Subscribed.', 'duplicate' => $stmt->rowCount() === 0], 201);
    } catch (PDOException $e) {
        jsonResponse(['message' => 'Could not subscribe right now.'], 500);
    }
}

// GET /api/newsletter (admin) — list subscribers
if ($method === 'GET') {
    requireAdminAuth();
    $stmt = $pdo->query('SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    jsonResponse(['total' => $pdo->query('SELECT COUNT(*) FROM newsletter_subscribers')->fetchColumn(), 'subscribers' => $stmt->fetchAll()]);
}

// DELETE /api/newsletter/:id (admin)
if ($method === 'DELETE') {
    requireAdminAuth();
    $parts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $id    = (int)($parts[2] ?? 0);
    if (!$id) jsonResponse(['message' => 'Invalid id.'], 400);
    $stmt = $pdo->prepare('DELETE FROM newsletter_subscribers WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['message' => 'Deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
