<?php
function translateText(string $text, string $to): string {
    if (!trim($text)) return '';
    $safe = mb_substr($text, 0, 4000);
    $url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' . $to . '&dt=t&q=' . urlencode($safe);
    $ctx = stream_context_create(['http' => ['header' => "User-Agent: Mozilla/5.0\r\n", 'timeout' => 10]]);
    $result = @file_get_contents($url, false, $ctx);
    if (!$result) return $safe;
    $parsed = json_decode($result, true);
    if (!$parsed || !isset($parsed[0])) return $safe;
    return implode('', array_column(array_filter($parsed[0]), 0));
}

function translateNews(string $title, string $content): array {
    return [
        'title_am'   => translateText($title, 'am'),
        'title_or'   => translateText($title, 'om'),
        'content_am' => translateText($content, 'am'),
        'content_or' => translateText($content, 'om'),
    ];
}

function translateClient(string $category, string $desc, string $fullDesc): array {
    return [
        'category_am'          => translateText($category, 'am'),
        'category_or'          => translateText($category, 'om'),
        'description_am'       => translateText($desc, 'am'),
        'description_or'       => translateText($desc, 'om'),
        'full_description_am'  => translateText($fullDesc, 'am'),
        'full_description_or'  => translateText($fullDesc, 'om'),
    ];
}

function translateTeam(string $position, string $responsibilities): array {
    return [
        'position_am'          => translateText($position, 'am'),
        'position_or'          => translateText($position, 'om'),
        'responsibilities_am'  => translateText($responsibilities, 'am'),
        'responsibilities_or'  => translateText($responsibilities, 'om'),
    ];
}
