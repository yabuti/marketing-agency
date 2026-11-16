<?php
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/response.php';

$method = getMethod();
$uri    = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts  = explode('/', $uri);

// /api/chat/conversations
// /api/chat/conversations/:id/messages
// /api/chat/conversations/:id/read
// /api/chat/admin/all

$seg2 = $parts[2] ?? null; // 'conversations' or 'admin'
$seg3 = $parts[3] ?? null; // numeric id or 'all'
$seg4 = $parts[4] ?? null; // 'messages' or 'read'

$convId = is_numeric($seg3) ? (int)$seg3 : null;

// Helper: get auth info from token (buyer or seller/user)
function getChatAuth(): array {
    $token = getBearerToken();
    if (!$token) return [];
    try {
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key(getJwtSecret(), 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) { return []; }
}

function formatConversation(array $c, PDO $pdo): array {
    // Get last message
    $last = $pdo->prepare('SELECT message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1');
    $last->execute([$c['id']]);
    $lastMsg = $last->fetch();
    // Unread count (messages not from seller, i.e. from buyer or user side)
    $unread = $pdo->prepare("SELECT COUNT(*) FROM chat_messages WHERE conversation_id = ? AND is_read = 0 AND sender_type IN ('buyer', 'user')");
    $unread->execute([$c['id']]);
    $c['last_message'] = $lastMsg['message'] ?? null;
    $c['last_message_at'] = $lastMsg['created_at'] ?? $c['created_at'];
    $c['unread_count'] = (int)$unread->fetchColumn();
    return $c;
}

// ── POST /api/chat/conversations — start or get existing conversation ──
if ($method === 'POST' && $seg2 === 'conversations' && !$convId) {
    $auth = getChatAuth();
    if (empty($auth)) jsonResponse(['message' => 'Not authenticated.'], 401);

    $body = getBody();
    $sellerId  = (int)($body['seller_id'] ?? 0);
    $productId = !empty($body['product_id']) ? (int)$body['product_id'] : null;

    if (!$sellerId) jsonResponse(['message' => 'seller_id is required.'], 400);

    $isBuyer = ($auth['role'] ?? '') === 'buyer';
    $authId  = (int)$auth['id'];

    try {
        // Check if conversation already exists
        if ($isBuyer) {
            $existing = $pdo->prepare("SELECT * FROM chat_conversations WHERE seller_id = ? AND buyer_id = ? AND status = 'open'");
            $existing->execute([$sellerId, $authId]);
        } else {
            $existing = $pdo->prepare("SELECT * FROM chat_conversations WHERE seller_id = ? AND user_id = ? AND status = 'open'");
            $existing->execute([$sellerId, $authId]);
        }
        $conv = $existing->fetch();

        if (!$conv) {
            if ($isBuyer) {
                $pdo->prepare('INSERT INTO chat_conversations (seller_id, buyer_id, product_id) VALUES (?, ?, ?)')
                    ->execute([$sellerId, $authId, $productId]);
            } else {
                $pdo->prepare('INSERT INTO chat_conversations (seller_id, user_id, product_id) VALUES (?, ?, ?)')
                    ->execute([$sellerId, $authId, $productId]);
            }
            $newId = (int)$pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT c.*, COALESCE(u.company_name, u.full_name) AS seller_name, b.full_name AS buyer_name FROM chat_conversations c JOIN users u ON u.id = c.seller_id LEFT JOIN buyers b ON b.id = c.buyer_id WHERE c.id = ?');
            $stmt->execute([$newId]);
            $conv = $stmt->fetch();
        }

        jsonResponse(formatConversation($conv, $pdo), 201);
    } catch (Exception $e) {
        jsonResponse(['message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// ── GET /api/chat/conversations — list conversations for current user ──
if ($method === 'GET' && $seg2 === 'conversations' && !$convId) {
    $auth = getChatAuth();
    if (empty($auth)) jsonResponse(['message' => 'Not authenticated.'], 401);

    $isBuyer = ($auth['role'] ?? '') === 'buyer';
    $authId  = (int)$auth['id'];

    if ($isBuyer) {
        $stmt = $pdo->prepare('SELECT c.*, COALESCE(u.company_name, u.full_name) AS seller_name, b.full_name AS buyer_name FROM chat_conversations c JOIN users u ON u.id = c.seller_id LEFT JOIN buyers b ON b.id = c.buyer_id WHERE c.buyer_id = ? ORDER BY c.updated_at DESC');
        $stmt->execute([$authId]);
    } else {
        // Seller sees conversations where they are the seller OR the buyer (user)
        $stmt = $pdo->prepare('SELECT c.*, COALESCE(u.company_name, u.full_name) AS seller_name, COALESCE(b.full_name, cu.full_name) AS buyer_name FROM chat_conversations c JOIN users u ON u.id = c.seller_id LEFT JOIN buyers b ON b.id = c.buyer_id LEFT JOIN users cu ON cu.id = c.user_id WHERE c.seller_id = ? OR c.user_id = ? ORDER BY c.updated_at DESC');
        $stmt->execute([$authId, $authId]);
    }

    $convs = $stmt->fetchAll();
    jsonResponse(array_map(fn($c) => formatConversation($c, $pdo), $convs));
}

// ── GET /api/chat/conversations/:id/messages ──
if ($method === 'GET' && $convId && $seg4 === 'messages') {
    $auth = getChatAuth();
    if (empty($auth)) jsonResponse(['message' => 'Not authenticated.'], 401);

    $since = $_GET['since'] ?? null; // ISO timestamp for polling
    $sql = 'SELECT * FROM chat_messages WHERE conversation_id = ?';
    $params = [$convId];
    if ($since) { $sql .= ' AND created_at > ?'; $params[] = $since; }
    $sql .= ' ORDER BY id ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// ── POST /api/chat/conversations/:id/messages — admin reply as the conversation's seller ──
if ($method === 'POST' && $convId && $seg4 === 'messages' && ($_GET['as_admin'] ?? '') === '1') {
    requireAdminAuth();
    $body    = getBody();
    $message = trim($body['message'] ?? '');
    if (!$message) jsonResponse(['message' => 'Message cannot be empty.'], 400);

    $stmt = $pdo->prepare('SELECT seller_id FROM chat_conversations WHERE id = ?');
    $stmt->execute([$convId]);
    $conv = $stmt->fetch();
    if (!$conv) jsonResponse(['message' => 'Conversation not found.'], 404);

    $sellerId = (int)$conv['seller_id'];
    $pdo->prepare('INSERT INTO chat_messages (conversation_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)')
        ->execute([$convId, 'seller', $sellerId, $message]);
    $pdo->prepare('UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?')->execute([$convId]);

    $msgId = (int)$pdo->lastInsertId();
    $msg   = $pdo->prepare('SELECT * FROM chat_messages WHERE id = ?');
    $msg->execute([$msgId]);
    jsonResponse($msg->fetch(), 201);
}

// ── POST /api/chat/conversations/:id/messages — send message ──
if ($method === 'POST' && $convId && $seg4 === 'messages') {
    $auth = getChatAuth();
    if (empty($auth)) jsonResponse(['message' => 'Not authenticated.'], 401);

    $body = getBody();
    $message = trim($body['message'] ?? '');
    if (!$message) jsonResponse(['message' => 'Message cannot be empty.'], 400);

    $isBuyer    = ($auth['role'] ?? '') === 'buyer';
    $isSeller   = ($auth['role'] ?? '') === 'seller';
    $senderType = $isBuyer ? 'buyer' : ($isSeller ? 'seller' : 'user');
    $senderId   = (int)$auth['id'];

    try {
        $pdo->prepare('INSERT INTO chat_messages (conversation_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)')
            ->execute([$convId, $senderType, $senderId, $message]);

        // Update conversation updated_at
        $pdo->prepare('UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?')->execute([$convId]);

        $msgId = (int)$pdo->lastInsertId();
        $msg = $pdo->prepare('SELECT * FROM chat_messages WHERE id = ?');
        $msg->execute([$msgId]);
        jsonResponse($msg->fetch(), 201);
    } catch (Exception $e) {
        jsonResponse(['message' => 'Failed to send message: ' . $e->getMessage()], 500);
    }
}

// ── POST /api/chat/conversations/:id/read — mark messages as read ──
if ($method === 'POST' && $convId && $seg4 === 'read') {
    $auth = getChatAuth();
    if (empty($auth)) jsonResponse(['message' => 'Not authenticated.'], 401);

    $isBuyer    = ($auth['role'] ?? '') === 'buyer';
    $isSeller   = ($auth['role'] ?? '') === 'seller';
    // Mark the OTHER side's messages as read (not your own)
    if ($isSeller) {
        $senderType = 'buyer'; // seller reads buyer/user messages
    } elseif ($isBuyer) {
        $senderType = 'seller'; // buyer reads seller messages
    } else {
        $senderType = 'seller'; // regular user reads seller messages
    }
    $pdo->prepare('UPDATE chat_messages SET is_read = 1 WHERE conversation_id = ? AND sender_type = ?')
        ->execute([$convId, $senderType]);
    jsonResponse(['message' => 'Marked as read.']);
}

// ── GET /api/chat/admin/all — admin view all conversations ──
if ($method === 'GET' && $seg2 === 'admin' && $seg3 === 'all') {
    requireAdminAuth();
    $stmt = $pdo->query('SELECT c.*, COALESCE(u.company_name, u.full_name) AS seller_name, COALESCE(b.full_name, cu.full_name) AS buyer_name FROM chat_conversations c JOIN users u ON u.id = c.seller_id LEFT JOIN buyers b ON b.id = c.buyer_id LEFT JOIN users cu ON cu.id = c.user_id ORDER BY c.updated_at DESC');
    $convs = $stmt->fetchAll();
    jsonResponse(array_map(fn($c) => formatConversation($c, $pdo), $convs));
}

jsonResponse(['message' => 'Not found.'], 404);
