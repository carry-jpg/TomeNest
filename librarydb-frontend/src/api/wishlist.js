// src/api/wishlist.js
import { apiGet, apiPost } from "./http";

export function apiWishlistMe() {
  return apiGet("/wishlist/me"); // -> /api/wishlist/me
}

export function apiWishlistIds() {
  return apiGet("/wishlist/ids"); // -> /api/wishlist/ids
}

export function apiWishlistToggle(payload) {
  return apiPost("/wishlist/toggle", payload); // -> /api/wishlist/toggle
}

export function apiWishlistRemove(olid) {
  return apiPost("/wishlist/remove", { olid }); // -> /api/wishlist/remove
}

export function apiWishlistAdminSummary() {
  return apiGet("/wishlist/admin/summary"); // -> /api/wishlist/admin/summary
}
