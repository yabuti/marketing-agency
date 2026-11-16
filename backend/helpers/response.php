<?php
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    if (function_exists('fastcgi_finish_request')) {
        @fastcgi_finish_request();
    }
    exit;
}

function getBody(): array {
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $raw = file_get_contents('php://input');
    $parsed = json_decode($raw, true);
    if (is_array($parsed)) {
        $cache = $parsed;
    } elseif ($_POST) {
        // multipart/form-data (e.g. FormData with a photo): PHP fills $_POST.
        $cache = $_POST;
    } else {
        $cache = [];
    }
    return $cache;
}

// Read the request body once and honor a `_method` override (e.g. DELETE/PUT
// tunnelled through POST). Cached in getBody() so route handlers reuse it.
function resolveMethod(): string {
    $method = strtoupper($_SERVER['REQUEST_METHOD']);
    $body   = getBody();
    $over   = isset($body['_method']) ? strtoupper(trim((string)$body['_method'])) : '';
    return in_array($over, ['PUT', 'PATCH', 'DELETE'], true) ? $over : $method;
}

function getMethod(): string {
    return $_SERVER['REQUEST_METHOD'];
}
