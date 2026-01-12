<?php
declare(strict_types=1);

final class OpenLibraryClient
{
	public function workEditions(string $workId, int $limit = 5): array
{
    // $workId like "OL12345W"
    $url = $this->baseUrl . '/works/' . rawurlencode($workId) . '/editions.json?limit=' . $limit;
    return $this->getJson($url);
}

public function searchWithEditionOlids(string $q, int $limit = 20): array
{
    $search = $this->search($q, $limit);

    if (!isset($search['docs']) || !is_array($search['docs'])) return $search;

    foreach ($search['docs'] as &$doc) {
        $doc['edition_olid'] = null;

        $key = isset($doc['key']) ? (string)$doc['key'] : ''; // "/works/OL...W"
        if (!preg_match('#^/works/(OL[0-9A-Z]+W)$#', $key, $m)) continue;

        $workId = $m[1];
        try {
            $eds = $this->workEditions($workId, 1);
            $entries = $eds['entries'] ?? [];
            if (is_array($entries) && isset($entries[0]['key'])) {
                // "/books/OL...M"
                if (preg_match('#^/books/(OL[0-9A-Z]+M)$#', (string)$entries[0]['key'], $mm)) {
                    $doc['edition_olid'] = $mm[1];
                }
            }
        } catch (Throwable $e) {
            // ignore per-doc failure
        }
    }

    return $search;
}

    private string $baseUrl;

    public function __construct(string $baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function search(string $q, int $limit = 20): array
    {
        $url = $this->baseUrl . '/search.json?q=' . urlencode($q) . '&limit=' . $limit;
        return $this->getJson($url);
    }

    public function edition(string $olid): array
    {
        $url = $this->baseUrl . '/books/' . rawurlencode($olid) . '.json';
        return $this->getJson($url);
    }

    public function booksByIsbn(string $isbn): array
    {
        $isbn = strtoupper(preg_replace('/[^0-9X]/i', '', $isbn) ?? '');
        if ($isbn === '') throw new InvalidArgumentException("ISBN is empty/invalid");

        $url = $this->baseUrl . '/api/books?bibkeys=ISBN:' . rawurlencode($isbn) . '&format=json&jscmd=data';
        $data = $this->getJson($url);

        $key = 'ISBN:' . $isbn;
        return (isset($data[$key]) && is_array($data[$key])) ? $data[$key] : [];
    }

    private function getJson(string $url): array
    {
        $raw = @file_get_contents($url);
        if ($raw === false) throw new RuntimeException("OpenLibrary request failed");

        $data = json_decode($raw, true);
        if (!is_array($data)) throw new RuntimeException("OpenLibrary invalid JSON");

        return $data;
    }
}
