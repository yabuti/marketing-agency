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

// Segments: /api/users, /api/users/register, /api/users/login, /api/users/me,
//           /api/users/change-password, /api/users/:id, /api/users/:id/status
$seg2 = $parts[2] ?? null;
$seg3 = $parts[3] ?? null;
$id   = is_numeric($seg2) ? (int)$seg2 : null;

// POST /api/users/register
if ($method === 'POST' && $seg2 === 'register') {
    $body      = getBody();
    $full_name = trim($body['full_name'] ?? '');
    $phone     = trim($body['phone'] ?? '');
    $password  = $body['password'] ?? '';

    if (!$full_name || !$phone || !$password) jsonResponse(['message' => 'Name, phone and password are required.'], 400);
    if (strlen($password) < 6) jsonResponse(['message' => 'Password must be at least 6 characters.'], 400);

    $check = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
    $check->execute([$phone]);
    if ($check->fetch()) jsonResponse(['message' => 'Phone number already registered.'], 409);

    $email = $body['email'] ?? null;
    if ($email) {
        $checkEmail = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $checkEmail->execute([$email]);
        if ($checkEmail->fetch()) jsonResponse(['message' => 'Email already registered.'], 409);
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (full_name, email, password, phone, company_name, business_type, category, tin_number, elmis_registration, business_license_number, location, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$full_name, $email, $hashed, $phone, $body['company_name'] ?? null, $body['business_type'] ?? null, $body['category'] ?? null, $body['tin_number'] ?? null, $body['elmis_registration'] ?? null, $body['business_license_number'] ?? null, $body['location'] ?? null, $body['website'] ?? null]);
    $userId = (int)$pdo->lastInsertId();
    $pdo->prepare('INSERT INTO user_profiles (user_id) VALUES (?)')->execute([$userId]);

    $token = generateToken(['id' => $userId, 'phone' => $phone, 'role' => 'user'], '+30 days');

    @notifyRegistration($body);
    if ($email) @welcomeUser(['full_name' => $full_name, 'email' => $email]);

    jsonResponse(['token' => $token, 'user' => ['id' => $userId, 'full_name' => $full_name, 'email' => $email, 'phone' => $phone, 'company_name' => $body['company_name'] ?? null, 'status' => 'pending']], 201);
}

// POST /api/users/login
if ($method === 'POST' && $seg2 === 'login') {
    $body     = getBody();
    $phone    = $body['phone'] ?? null;
    $email    = $body['email'] ?? null;
    $password = $body['password'] ?? '';

    if ((!$phone && !$email) || !$password) jsonResponse(['message' => 'Phone/email and password are required.'], 400);

    $rows = null;
    if ($phone) {
        $s = $pdo->prepare('SELECT * FROM users WHERE phone = ?');
        $s->execute([$phone]);
        $rows = $s->fetch();
        if (!$rows) { // fallback: try email field
            $s = $pdo->prepare('SELECT * FROM users WHERE email = ?');
            $s->execute([$phone]);
            $rows = $s->fetch();
        }
    } else {
        $s = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $s->execute([$email]);
        $rows = $s->fetch();
    }

    // If not found in users table, try buyers table
    if (!$rows) {
        $identifier = $phone ?: $email;
        $s = $pdo->prepare('SELECT * FROM buyers WHERE phone = ?');
        $s->execute([$identifier]);
        $buyerRow = $s->fetch();
        if (!$buyerRow && $email) {
            $s = $pdo->prepare('SELECT * FROM buyers WHERE email = ?');
            $s->execute([$email]);
            $buyerRow = $s->fetch();
        }
        if ($buyerRow) {
            if (!password_verify($password, $buyerRow['password'])) {
                jsonResponse(['message' => 'Invalid credentials.'], 401);
            }
            $token = generateToken(
                ['id' => $buyerRow['id'], 'phone' => $buyerRow['phone'], 'role' => 'buyer'],
                '+30 days'
            );
            jsonResponse([
                'token' => $token,
                'buyer' => [
                    'id'        => $buyerRow['id'],
                    'full_name' => $buyerRow['full_name'],
                    'email'     => $buyerRow['email'],
                    'phone'     => $buyerRow['phone'],
                ],
            ]);
        }
        jsonResponse(['message' => 'Invalid credentials.'], 401);
    }

    if ($rows['status'] === 'suspended') jsonResponse(['message' => 'Your account has been suspended. Contact support.'], 403);
    if (!password_verify($password, $rows['password'])) jsonResponse(['message' => 'Invalid credentials.'], 401);

    // Track login
    $pdo->prepare('INSERT INTO user_logins (user_id, ip_address) VALUES (?, ?)')
        ->execute([$rows['id'], $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '']);

    $token = generateToken(['id' => $rows['id'], 'phone' => $rows['phone'], 'role' => 'seller'], '+30 days');
    jsonResponse(['token' => $token, 'user' => ['id' => $rows['id'], 'full_name' => $rows['full_name'], 'email' => $rows['email'], 'phone' => $rows['phone'], 'company_name' => $rows['company_name'], 'status' => $rows['status']]]);
}

// GET /api/users/me (user)
if ($method === 'GET' && $seg2 === 'me') {
    $user = requireUserAuth();
    $stmt = $pdo->prepare('SELECT u.*, p.bio, p.instagram, p.tiktok, p.telegram, p.facebook, p.employees, p.established, p.services_needed, p.notes FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ?');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(['message' => 'User not found.'], 404);
    unset($row['password']);
    jsonResponse($row);
}

// PUT /api/users/me (user)
if ($method === 'PUT' && $seg2 === 'me') {
    $user = requireUserAuth();
    $body = getBody();
    $pdo->prepare('UPDATE users SET full_name=?, phone=?, company_name=?, business_type=?, category=?, tin_number=?, elmis_registration=?, business_license_number=?, location=?, website=? WHERE id=?')
        ->execute([$body['full_name'] ?? null, $body['phone'] ?? null, $body['company_name'] ?? null, $body['business_type'] ?? null, $body['category'] ?? null, $body['tin_number'] ?? null, $body['elmis_registration'] ?? null, $body['business_license_number'] ?? null, $body['location'] ?? null, $body['website'] ?? null, $user['id']]);
    $pdo->prepare('INSERT INTO user_profiles (user_id, bio, instagram, tiktok, telegram, facebook, employees, established, services_needed, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE bio=VALUES(bio), instagram=VALUES(instagram), tiktok=VALUES(tiktok), telegram=VALUES(telegram), facebook=VALUES(facebook), employees=VALUES(employees), established=VALUES(established), services_needed=VALUES(services_needed), notes=VALUES(notes)')
        ->execute([$user['id'], $body['bio'] ?? null, $body['instagram'] ?? null, $body['tiktok'] ?? null, $body['telegram'] ?? null, $body['facebook'] ?? null, $body['employees'] ?? null, $body['established'] ?? null, $body['services_needed'] ?? null, $body['notes'] ?? null]);
    @notifyProfileUpdate($body);
    jsonResponse(['message' => 'Profile updated.']);
}

// POST /api/users/forgot-password (demo)
if ($method === 'POST' && $seg2 === 'forgot-password') {
    $body  = getBody();
    $phone = trim($body['phone'] ?? '');
    $stmt  = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    if (!$stmt->fetch()) jsonResponse(['message' => 'No account found with this phone number.'], 404);
    // Generate 6-digit OTP
    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    // Store OTP with 10-minute expiry
    $pdo->prepare('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE phone = ?')
        ->execute([$otp, date('Y-m-d H:i:s', time() + 600), $phone]);
    // Demo mode: return OTP in response (replace with SMS in production)
    jsonResponse(['message' => 'Verification code sent.', 'demo_otp' => $otp]);
}

// POST /api/users/reset-password
if ($method === 'POST' && $seg2 === 'reset-password') {
    $body        = getBody();
    $phone       = trim($body['phone'] ?? '');
    $otp         = trim($body['otp'] ?? '');
    $newPassword = $body['newPassword'] ?? '';
    if (strlen($newPassword) < 6) jsonResponse(['message' => 'Password must be at least 6 characters.'], 400);
    $stmt = $pdo->prepare('SELECT id, reset_otp, reset_otp_expires FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    if (!$user) jsonResponse(['message' => 'User not found.'], 404);
    if ($user['reset_otp'] !== $otp) jsonResponse(['message' => 'Invalid verification code.'], 400);
    if (strtotime($user['reset_otp_expires']) < time()) jsonResponse(['message' => 'Verification code expired. Please request a new one.'], 400);
    $pdo->prepare('UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?')
        ->execute([password_hash($newPassword, PASSWORD_BCRYPT), $user['id']]);
    jsonResponse(['message' => 'Password reset successfully.']);
}

// POST /api/users/change-password (user)
if ($method === 'POST' && $seg2 === 'change-password') {
    $user = requireUserAuth();
    $body = getBody();
    $newPassword = $body['newPassword'] ?? '';
    if (strlen($newPassword) < 6) jsonResponse(['message' => 'New password must be at least 6 characters.'], 400);
    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!password_verify($body['currentPassword'] ?? '', $row['password'])) jsonResponse(['message' => 'Current password is incorrect.'], 400);
    $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([password_hash($newPassword, PASSWORD_BCRYPT), $user['id']]);
    jsonResponse(['message' => 'Password changed.']);
}

// GET /api/users (admin all)
if ($method === 'GET' && !$seg2) {
    requireAdminAuth();
    $rows = $pdo->query('SELECT u.id, u.full_name, u.email, u.phone, u.company_name, u.business_type, u.category, u.tin_number, u.elmis_registration, u.business_license_number, u.location, u.website, u.status, u.created_at, u.updated_at, p.bio, p.instagram, p.tiktok, p.telegram, p.facebook, p.employees, p.established, p.services_needed, p.notes FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id ORDER BY u.created_at DESC')->fetchAll();
    jsonResponse($rows);
}

// GET /api/users/login-stats (admin)
if ($method === 'GET' && $seg2 === 'login-stats') {
    requireAdminAuth();
    $total     = $pdo->query('SELECT COUNT(*) FROM user_logins')->fetchColumn();
    $today     = $pdo->query("SELECT COUNT(*) FROM user_logins WHERE DATE(created_at) = CURDATE()")->fetchColumn();
    $thisWeek  = $pdo->query("SELECT COUNT(*) FROM user_logins WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
    $thisMonth = $pdo->query("SELECT COUNT(*) FROM user_logins WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
    $unique    = $pdo->query('SELECT COUNT(DISTINCT user_id) FROM user_logins')->fetchColumn();
    $recent    = $pdo->query('SELECT ul.created_at, ul.ip_address, u.full_name, u.phone, u.company_name FROM user_logins ul JOIN users u ON u.id = ul.user_id ORDER BY ul.created_at DESC LIMIT 20')->fetchAll();
    $daily     = $pdo->query("SELECT DATE(created_at) AS date, COUNT(*) AS count FROM user_logins WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date ASC")->fetchAll();
    jsonResponse(compact('total', 'today', 'thisWeek', 'thisMonth', 'unique', 'recent', 'daily'));
}

// GET /api/users/:id (admin)
if ($method === 'GET' && $id && !$seg3) {
    requireAdminAuth();
    $stmt = $pdo->prepare('SELECT u.*, p.bio, p.instagram, p.tiktok, p.telegram, p.facebook, p.employees, p.established, p.services_needed, p.notes FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonResponse(['message' => 'User not found.'], 404);
    unset($row['password']);
    jsonResponse($row);
}

// PUT /api/users/:id/status (admin)
if (($method === 'PUT' || $method === 'POST') && $id && $seg3 === 'status') {
    requireAdminAuth();
    $body = getBody();
    $pdo->prepare('UPDATE users SET status = ? WHERE id = ?')->execute([$body['status'], $id]);
    if ($body['status'] === 'active') {
        $u = $pdo->prepare('SELECT full_name, email, phone FROM users WHERE id = ?');
        $u->execute([$id]);
        $userData = $u->fetch();
        if ($userData) @notifyUserActivated($userData);
    }
    jsonResponse(['message' => 'Status updated.']);
}

// DELETE /api/users/:id (admin)
// Deleting a seller cascades to everything tied to them: their bazaar
// products (and product photos), seller bank accounts, orders + order items,
// payments and delivery requests, profile, logins, submissions and chat.
// Every statement is best-effort so an install missing an optional table
// (chat, buyer migration, ...) still cleans up the rest instead of failing.
if ($method === 'DELETE' && $id) {
    requireAdminAuth();

    // Grab this seller's product photo files so we can unlink them from disk
    // after the rows are removed (uploads/bazaar/<file>).
    $photoFiles = [];
    try {
        $q = $pdo->prepare(
            'SELECT ph.file_path
               FROM bazaar_product_photos ph
               JOIN bazaar_products p ON p.id = ph.product_id
              WHERE p.seller_id = ?'
        );
        $q->execute([$id]);
        $photoFiles = $q->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
        // bazaar tables not present - nothing to unlink
    }

    // Best-effort delete helper: swallow errors thrown by optional/missing
    // tables or columns so the remaining cleanup still runs.
    $safeDelete = function (string $sql, array $params = []) use ($pdo) {
        try {
            $pdo->prepare($sql)->execute($params);
        } catch (PDOException $e) {
            // ignore - table/column not part of this install
        }
    };

    // Product photos + order line items belonging to this seller's products.
    $safeDelete(
        'DELETE ph FROM bazaar_product_photos ph
           JOIN bazaar_products p ON p.id = ph.product_id
          WHERE p.seller_id = ?',
        [$id]
    );
    $safeDelete(
        'DELETE oi FROM bazaar_order_items oi
           JOIN bazaar_products p ON p.id = oi.product_id
          WHERE p.seller_id = ?',
        [$id]
    );

    // Orders where this user is the seller.
    $safeDelete(
        'DELETE FROM bazaar_delivery_requests
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE seller_id = ?)',
        [$id]
    );
    $safeDelete(
        'DELETE FROM bazaar_payments
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE seller_id = ?)',
        [$id]
    );
    $safeDelete(
        'DELETE FROM bazaar_order_items
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE seller_id = ?)',
        [$id]
    );
    $safeDelete('DELETE FROM bazaar_orders WHERE seller_id = ?', [$id]);

    // Orders where this user is the customer (older schema without buyer_id).
    $safeDelete(
        'DELETE FROM bazaar_delivery_requests
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE customer_id = ?)',
        [$id]
    );
    $safeDelete(
        'DELETE FROM bazaar_payments
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE customer_id = ?)',
        [$id]
    );
    $safeDelete(
        'DELETE FROM bazaar_order_items
          WHERE order_id IN (SELECT id FROM bazaar_orders WHERE customer_id = ?)',
        [$id]
    );
    $safeDelete('DELETE FROM bazaar_orders WHERE customer_id = ?', [$id]);

    // The seller's own rows.
    $safeDelete('DELETE FROM bazaar_products WHERE seller_id = ?', [$id]);
    $safeDelete('DELETE FROM bazaar_seller_banks WHERE seller_id = ?', [$id]);
    $safeDelete('DELETE FROM user_profiles WHERE user_id = ?', [$id]);
    $safeDelete('DELETE FROM user_logins WHERE user_id = ?', [$id]);

    // Submissions and their uploaded files.
    $safeDelete(
        'DELETE f FROM user_submission_files f
           JOIN user_submissions s ON s.id = f.submission_id
          WHERE s.user_id = ?',
        [$id]
    );
    $safeDelete('DELETE FROM user_submissions WHERE user_id = ?', [$id]);

    // Chat threads (messages cascade from the conversation).
    $safeDelete('DELETE FROM chat_conversations WHERE seller_id = ?', [$id]);
    $safeDelete('DELETE FROM chat_conversations WHERE user_id = ?', [$id]);

    // Finally the user row itself.
    $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);

    // Unlink product photos from disk (best-effort).
    foreach ($photoFiles as $rel) {
        $rel = (string)$rel;
        if ($rel === '') continue;
        // file_path is stored relative to php-backend (uploads/bazaar/x.jpg).
        $rel = ltrim($rel, '/');
        if (strpos($rel, 'uploads/') !== 0) continue;
        @unlink(dirname(__DIR__) . '/' . $rel);
    }

    jsonResponse(['message' => 'User deleted.']);
}

jsonResponse(['message' => 'Not found.'], 404);
