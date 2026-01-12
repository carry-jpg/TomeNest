import React, { useMemo, useState } from "react";
import { olSearch, olEdition } from "../api/openlibrary";
import { setStock } from "../api/stock";

function extractOlidFromKey(key) {
  const s = String(key || "").trim();
  if (!s) return "";
  const parts = s.split("/");
  const last = parts[parts.length - 1] || "";
  return last.toUpperCase().startsWith("OL") ? last.toUpperCase() : "";
}

function pickEditionOlidFromDoc(doc) {
  // 1) NEW: backend-provided edition OLID
  if (doc?.edition_olid) return doc.edition_olid;

  // 2) Existing logic you already have:
  const edDocs = doc?.editions?.docs;
  if (Array.isArray(edDocs) && edDocs.length > 0) {
    const k = extractOlidFromKey(edDocs[0]?.key);
    if (k.endsWith("M")) return k;
  }

  const ek = doc?.edition_key;
  if (Array.isArray(ek) && ek.length > 0) {
    const k = String(ek[0] || "").toUpperCase();
    if (k.endsWith("M")) return k;
  }

  const dk = extractOlidFromKey(doc?.key);
  if (dk.endsWith("M")) return dk;

  return "";
}

export default function EditStock({ onSaved }) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);

  const [searchRes, setSearchRes] = useState(null);
  const [searchErr, setSearchErr] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selectedOlid, setSelectedOlid] = useState("");
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [loadingEdition, setLoadingEdition] = useState(false);

  const [quality, setQuality] = useState(3);
  const [quantity, setQuantity] = useState(1);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const docs = useMemo(() => searchRes?.docs || [], [searchRes]);

  async function runSearch() {
    setSearchErr("");
    setSearchRes(null);
    setSelectedEdition(null);

    const q = query.trim();
    if (!q) return;

    setLoadingSearch(true);
    try {
      const fields = [
        "key",
        "title",
        "author_name",
        "first_publish_year",
        "edition_key",
        // These editions fields work when OpenLibrary includes them for the work. [web:16]
        "editions",
        "editions.key",
        "editions.title",
      ].join(",");

      const data = await olSearch(q, limit, fields);
      setSearchRes(data);
    } catch (e) {
      setSearchErr(String(e?.message || e));
    } finally {
      setLoadingSearch(false);
    }
  }

  async function loadEdition(olid) {
    const clean = String(olid || "").trim();
    setSelectedOlid(clean);
    setSelectedEdition(null);

    if (!clean) return;

    setLoadingEdition(true);
    try {
      const ed = await olEdition(clean); // /books/OL...M.json behind proxy [web:7]
      setSelectedEdition(ed);
    } catch (e) {
      setSelectedEdition({ error: String(e?.message || e) });
    } finally {
      setLoadingEdition(false);
    }
  }

  async function saveStock() {
    setSaveErr("");
    setSaveMsg("");

    const olid = String(selectedOlid || "").trim().toUpperCase();
    if (!olid || !olid.endsWith("M")) {
      setSaveErr("Pick/paste an edition OLID ending with 'M' (example: OL7353617M).");
      return;
    }

    setSaving(true);
    try {
      await setStock({
        olid,
        quality: Number(quality),
        quantity: Number(quantity),
        importIfMissing: true,
      });
      setSaveMsg("Saved.");
      onSaved?.();
    } catch (e) {
      setSaveErr(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Edit stock</h1>
      <p className="text-sm text-[color:var(--text-secondary)] mb-6">
        Search OpenLibrary, select an edition (OLID ending in M), then set quality + quantity and save.
      </p>

      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel-bg)] p-4 mb-6">
        <div className="flex gap-3 items-center">
          <input
            className="flex-1 px-3 py-2 rounded-md border border-[color:var(--border)] bg-transparent"
            placeholder="Search title/author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? runSearch() : null)}
          />
          <select
            className="px-3 py-2 rounded-md border border-[color:var(--border)] bg-transparent text-sm"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            className="px-4 py-2 rounded-md bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white font-semibold"
            onClick={runSearch}
            disabled={loadingSearch}
          >
            {loadingSearch ? "Searching..." : "Search"}
          </button>
        </div>

        {searchErr && <div className="text-sm text-red-600 mt-3">{searchErr}</div>}

        <div className="mt-4 text-sm text-[color:var(--text-secondary)]">
          Found: {searchRes ? (searchRes.numFound ?? docs.length) : 0}
        </div>

        {docs.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.slice(0, limit).map((d) => {
              const olid = pickEditionOlidFromDoc(d);
              const title = d?.title ?? "";
              const author = Array.isArray(d?.author_name) ? d.author_name[0] : "";
              const year = d?.first_publish_year ?? "";

              const disabled = !olid;

              return (
                <button
                  key={`${d.key}-${title}`}
                  type="button"
                  className={[
                    "text-left rounded-lg border p-3 transition-colors",
                    selectedOlid === olid && olid
                      ? "border-[color:var(--accent)] bg-[color:var(--active-bg)]"
                      : "border-[color:var(--border)] hover:bg-[color:var(--active-bg)]",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                  onClick={() => (disabled ? null : loadEdition(olid))}
                  disabled={disabled}
                  title={
                    disabled
                      ? "No edition OLID found in this search item. Use Manual OLID below."
                      : `Select ${olid}`
                  }
                >
                  <div className="font-semibold text-[color:var(--text-primary)] line-clamp-2">{title}</div>
                  <div className="text-sm text-[color:var(--text-secondary)]">
                    {author} {year ? `• ${year}` : ""}
                  </div>
                  <div className="text-xs text-[color:var(--text-secondary)] mt-1">OLID: {olid || "—"}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel-bg)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Selected edition</div>
            <div className="text-xs text-[color:var(--text-secondary)]">{selectedOlid || "None"}</div>
          </div>

          {loadingEdition && <div className="text-sm text-[color:var(--text-secondary)]">Loading edition...</div>}

          {!loadingEdition && !selectedOlid && (
            <div className="text-sm text-[color:var(--text-secondary)]">
              Pick a result (or paste a manual OLID) to load edition JSON.
            </div>
          )}

          {!loadingEdition && selectedOlid && (
            <>
              {selectedEdition?.error ? (
                <div className="text-sm text-red-600">{selectedEdition.error}</div>
              ) : (
                <pre className="text-xs overflow-auto max-h-80 bg-[color:var(--active-bg)] border border-[color:var(--border)] rounded-md p-3">
                  {JSON.stringify(selectedEdition, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel-bg)] p-4">
          <div className="font-semibold mb-3">Stock</div>

          <label className="block text-xs text-[color:var(--text-secondary)] mb-1">Manual OLID (edition)</label>
          <input
            value={selectedOlid}
            onChange={(e) => setSelectedOlid(e.target.value.trim())}
            placeholder="OL7353617M"
            className="w-full mb-3 px-3 py-2 rounded-md border border-[color:var(--border)] bg-transparent"
          />

          <button
            type="button"
            onClick={() => loadEdition(selectedOlid)}
            className="w-full mb-4 px-4 py-2 rounded-md border border-[color:var(--border)] hover:bg-[color:var(--active-bg)] text-sm text-[color:var(--text-secondary)]"
          >
            Load edition JSON
          </button>

          <label className="block text-xs text-[color:var(--text-secondary)] mb-1">Quality (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-md border border-[color:var(--border)] bg-transparent"
          />

          <label className="block text-xs text-[color:var(--text-secondary)] mb-1">Quantity</label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-md border border-[color:var(--border)] bg-transparent"
          />

          <button
            type="button"
            onClick={saveStock}
            disabled={saving}
            className="w-full px-4 py-2 rounded-md bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {saveMsg && <div className="text-sm text-green-700 mt-3">{saveMsg}</div>}
          {saveErr && <div className="text-sm text-red-600 mt-3">{saveErr}</div>}

          <div className="text-xs text-[color:var(--text-secondary)] mt-4">
            Tip: edition OLIDs end with <code>M</code>. [web:7]
          </div>
        </div>
      </div>
    </div>
  );
}
