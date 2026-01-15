// src/state/wishlistStore.js
import {
  apiWishlistMe,
  apiWishlistIds,
  apiWishlistToggle,
  apiWishlistRemove,
} from "../api/wishlist";

const state = {
  loaded: false,
  loading: null,
  items: [],
  ids: new Set(),
};

function emit() {
  window.dispatchEvent(new Event("wishlist:changed"));
}

async function loadOnce() {
  if (state.loaded) return;
  if (state.loading) return state.loading;

  state.loading = (async () => {
    const [items, ids] = await Promise.all([apiWishlistMe(), apiWishlistIds()]);
    state.items = Array.isArray(items) ? items : [];
    state.ids = new Set((Array.isArray(ids) ? ids : []).map((x) => String(x).toUpperCase()));
    state.loaded = true;
    emit();
  })().finally(() => {
    state.loading = null;
  });

  return state.loading;
}

export function getWishlist() {
  // returns cached list; triggers load in background
  loadOnce().catch(() => {});
  return state.items;
}

export function isWishlisted(olid) {
  loadOnce().catch(() => {});
  return state.ids.has(String(olid || "").trim().toUpperCase());
}

export async function toggleWishlist(item) {
  await loadOnce();

  const olid = String(item?.openlibraryid || "").trim().toUpperCase();
  if (!olid) return false;

  const payload = {
    olid,
    title: item?.title ?? null,
    author: item?.author ?? null,
    coverurl: item?.coverurl ?? item?.cover_url ?? null,
    releaseyear: item?.releaseyear ?? item?.publishdate ?? item?.publish_date ?? null,
  };

  const res = await apiWishlistToggle(payload);
  const wished = !!res?.wished;

  if (wished) {
    state.ids.add(olid);
    // keep UI snappy: add/update item in cache
    const existingIdx = state.items.findIndex((x) => String(x.openlibraryid).toUpperCase() === olid);
    const row = {
      openlibraryid: olid,
      title: payload.title,
      author: payload.author,
      coverurl: payload.coverurl,
      releaseyear: payload.releaseyear,
    };
    if (existingIdx >= 0) state.items[existingIdx] = { ...state.items[existingIdx], ...row };
    else state.items.unshift(row);
  } else {
    state.ids.delete(olid);
    state.items = state.items.filter((x) => String(x.openlibraryid).toUpperCase() !== olid);
  }

  emit();
  return wished;
}

export async function removeFromWishlist(olid) {
  await loadOnce();
  const id = String(olid || "").trim().toUpperCase();
  if (!id) return;

  await apiWishlistRemove(id);
  state.ids.delete(id);
  state.items = state.items.filter((x) => String(x.openlibraryid).toUpperCase() !== id);
  emit();
}
