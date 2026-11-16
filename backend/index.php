<?php
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/helpers/response.php';

$uri   = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $uri);

// Method override: many shared hosts reject DELETE (and sometimes PUT) at the
// HTTP layer. The admin panel therefore tunnels them as POST with a JSON body
// { "_method": "DELETE" }. Resolve before dispatching so every route handler
// sees the intended method via getMethod().
$_SERVER['REQUEST_METHOD'] = $_SERVER['REQUEST_METHOD'] === 'POST'
    ? resolveMethod()
    : strtoupper($_SERVER['REQUEST_METHOD']);

// Serve uploaded files and banners directly (images, videos)
if ($parts[0] === 'uploads' || $parts[0] === 'banners') {
    $filePath = __DIR__ . '/' . urldecode($uri);
    if (file_exists($filePath) && is_file($filePath)) {
        $mime = mime_content_type($filePath);
        header("Content-Type: $mime");
        header("Access-Control-Allow-Origin: *");
        readfile($filePath);
        exit;
    }
    http_response_code(404);
    exit;
}

// Expected: /api/<resource>/...
// $parts[0] = 'api', $parts[1] = resource
$resource = $parts[1] ?? '';

switch ($resource) {
    case 'auth':        require __DIR__ . '/routes/auth.php';        break;
    case 'clients':     require __DIR__ . '/routes/clients.php';     break;
    case 'news':        require __DIR__ . '/routes/news.php';        break;
    case 'contact':     require __DIR__ . '/routes/contact.php';     break;
    case 'users':       require __DIR__ . '/routes/users.php';       break;
    case 'buyers':      require __DIR__ . '/routes/buyers.php';      break;
    case 'team':        require __DIR__ . '/routes/team.php';        break;
    case 'ads':         require __DIR__ . '/routes/ads.php';         break;
    case 'banners':     require __DIR__ . '/routes/banners.php';     break;
    case 'newsletter':  require __DIR__ . '/routes/newsletter.php';  break;
    case 'settings':    require __DIR__ . '/routes/settings.php';    break;
    case 'submissions': require __DIR__ . '/routes/submissions.php'; break;
    case 'bazaar':      require __DIR__ . '/routes/bazaar.php';      break;
    case 'chat':        require __DIR__ . '/routes/chat.php';        break;
    case 'health':      jsonResponse(['status' => 'ok', 'message' => 'All Things API is running']); break;
    default:            jsonResponse(['message' => 'Not found.'], 404);
}
