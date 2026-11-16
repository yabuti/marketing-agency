<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/mailer.php';

$method = getMethod();
$uri    = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts  = explode('/', $uri);
// /api/contact        → id=null
// /api/contact/5/status → id=5, action='status'
$id     = is_numeric($parts[2] ?? '') ? (int)$parts[2] : null;
$action = !is_numeric(end($parts)) ? end($parts) : null;

// POST /api/contact (public)
if ($method === 'POST' && !$id) {
    $body = getBody();
    $full_name = trim($body['full_name'] ?? '');
    $phone     = trim($body['phone'] ?? '');
    if (!$full_name || !$phone) jsonResponse(['message' => 'Name and phone are required.'], 400);

    $pdo->prepare(
        'INSERT INTO contact_submissions (full_name, email, phone, business_type, company_name, tin_number, elmis_registration, business_license, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $full_name, $body['email'] ?? null, $phone,
        $body['business_type'] ?? null, $body['company_name'] ?? null,
        $body['tin_number'] ?? null, $body['elmis_registration'] ?? null,
        $body['business_license'] ?? null, $body['message'] ?? null,
    ]);

    // Fire-and-forget email
    @notifyContact($body);
    jsonResponse(['message' => 'Submission received. We will contact you soon.']);
}

// GET /api/contact (admin)
if ($method === 'GET' && !$id) {
    requireAdminAuth();
    $rows = $pdo->query('SELECT * FROM contact_submissions ORDER BY created_at DESC')->fetchAll();
    jsonResponse($rows);
}

// PUT /api/contact/:id/status (admin)
if ($method === 'PUT' && $id && $action === 'status') {
    requireAdminAuth();
    $body = getBody();
    $pdo->prepare('UPDATE contact_submissions SET status = ? WHERE id = ?')->execute([$body['status'], $id]);
    jsonResponse(['message' => 'Status updated.']);
}

// DELETE /api/contact/:id (admin)
if ($method === 'DELETE' && $id) {
    requireAdminAuth();
    $pdo->prepare('DELETE FROM contact_submissions WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
