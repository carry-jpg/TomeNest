<?php
declare(strict_types=1);

final class WishlistRepository
{
    public function __construct(private Database $db) {}

    public function listByUser(int $userid): array
    {
        $st = $this->db->pdo->prepare(
            "SELECT openlibraryid, title, author, coverurl, releaseyear, createdat
             FROM wishlist
             WHERE userid = ?
             ORDER BY createdat DESC"
        );
        $st->execute([$userid]);
        return $st->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function idsByUser(int $userid): array
    {
        $st = $this->db->pdo->prepare(
            "SELECT openlibraryid FROM wishlist WHERE userid = ?"
        );
        $st->execute([$userid]);
        return array_map(fn($r) => $r["openlibraryid"], $st->fetchAll(PDO::FETCH_ASSOC) ?: []);
    }

    public function exists(int $userid, string $olid): bool
    {
        $st = $this->db->pdo->prepare(
            "SELECT 1 FROM wishlist WHERE userid = ? AND openlibraryid = ? LIMIT 1"
        );
        $st->execute([$userid, $olid]);
        return (bool)$st->fetchColumn();
    }

    public function add(int $userid, array $row): void
    {
        $st = $this->db->pdo->prepare(
            "INSERT INTO wishlist (userid, openlibraryid, title, author, coverurl, releaseyear)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               title = VALUES(title),
               author = VALUES(author),
               coverurl = VALUES(coverurl),
               releaseyear = VALUES(releaseyear)"
        );

        $st->execute([
            $userid,
            $row["openlibraryid"],
            $row["title"] ?? null,
            $row["author"] ?? null,
            $row["coverurl"] ?? null,
            $row["releaseyear"] ?? null,
        ]);
    }

    public function remove(int $userid, string $olid): void
    {
        $st = $this->db->pdo->prepare(
            "DELETE FROM wishlist WHERE userid = ? AND openlibraryid = ?"
        );
        $st->execute([$userid, $olid]);
    }

    public function adminSummary(): array
    {
        $st = $this->db->pdo->query(
            "SELECT
                openlibraryid,
                MAX(title) AS title,
                MAX(author) AS author,
                MAX(coverurl) AS coverurl,
                MAX(releaseyear) AS releaseyear,
                COUNT(*) AS wishcount
             FROM wishlist
             GROUP BY openlibraryid
             ORDER BY wishcount DESC"
        );
        return $st->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }
}
