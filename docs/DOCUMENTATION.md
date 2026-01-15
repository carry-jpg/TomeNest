# TomeNest – Software Application Documentation

## 1. Overview
TomeNest is a web-based library management application with authentication, book/stock management, a wishlist, and a rentals workflow (user requests + admin approval/return). [file:2][file:36]  
The backend is a PHP REST-like API under `/api/*` using cookie-based PHP sessions for authentication. [file:2][file:3]  
The frontend is a React single-page application that renders pages like library browsing, wishlist, rentals, stock editor, and support/about. [file:36]

## 2. Architecture
### Backend (PHP)
The API router is implemented in `index.php`, which maps HTTP method + path to controller methods and inline handlers. [file:2]  
CORS is configured to allow credentials, enabling session-cookie auth from the frontend. [file:2]  
Authentication and authorization are enforced with session checks (e.g., “Not authenticated” 401 and “Forbidden” 403). [file:2][file:3]

### Frontend (React)
The main UI state and navigation live in `App.jsx`, which loads the current user session via `/api/auth/me` and switches pages in the SPA. [file:36]  
Admin-only pages (e.g., stock editing and wishlists admin) are shown conditionally based on `user.role`. [file:36]

## 3. User roles and permissions
The system defines two roles: `user` and `admin`. [file:3]  
Bootstrap rule: the first registered account becomes `admin`, all subsequent accounts become `user`. [file:3]  
Admin-only endpoints are protected by a backend authorization check that returns HTTP 403 if the session user is not an admin. [file:2][file:3]

## 4. Core features
### Authentication
- Register: creates an account and starts a session. [file:2][file:3]  
- Login: verifies password and starts a session. [file:2][file:3]  
- Logout: clears the session cookie and destroys the session. [file:2][file:3]  
- Me: returns the currently authenticated user. [file:2][file:3]

### Open Library integration
The backend can search Open Library and resolve/import editions into the local database. [file:2]  
Imported editions can then be used for stock creation and cover rendering (cover URLs follow the Open Library covers pattern). [file:2]

### Stock management
Admins can list stock and update/create stock records using an Open Library edition ID (OLID). [file:2]  
`POST /api/stock/set` expects `olid`, `quality`, and `quantity`, and can optionally import the book first if it does not exist yet. [file:2]  
Admins can also delete a stock row via `POST /api/stock/delete` (by `stockId`). [file:2]

### Wishlist
Authenticated users can:
- List their wishlist items (`/api/wishlist/me`) and wishlist IDs (`/api/wishlist/ids`). [file:2]  
- Add/remove items using `/api/wishlist/toggle` (toggle behavior). [file:2]  
Admins can view an aggregated wishlist summary via `/api/wishlist/admin/summary`. [file:2]

### Rentals workflow
User flow:
- A user creates a rental request via `POST /api/rentals/request`, which stores a `pending` request with no dates yet. [file:2]  
- The user can view their rentals via `GET /api/rentals/my`. [file:2]  

Admin flow:
- Admin lists pending requests (`GET /api/rentals/admin/requests`). [file:2]  
- Admin approves a request (`POST /api/rentals/admin/approve`) by assigning `startAt` and `endAt`, changing status to `approved`, and decrementing stock quantity. [file:2]  
- Admin can dismiss a pending request (`POST /api/rentals/admin/dismiss`). [file:2]  
- Admin can complete/close an active rental (`POST /api/rentals/admin/complete`), which marks it returned and increments stock quantity. [file:2]  
Overdue handling is supported by marking past-end-date approved rentals as `notreturned`. [file:2]

## 5. API reference (endpoints)

### Auth
- `GET /api/auth/me` [file:2]  
- `POST /api/auth/register` [file:2]  
- `POST /api/auth/login` [file:2]  
- `POST /api/auth/logout` [file:2]  

### Open Library
- `GET /api/openlibrary/search` [file:2]  
- `GET /api/openlibrary/edition` [file:2]  
- `POST /api/openlibrary/resolve-editions` [file:2]  
- `POST /api/books/import-edition` [file:2]  

### Stock
- `GET /api/stock/list` [file:2]  
- `POST /api/stock/set` (admin) [file:2]  
- `POST /api/stock/delete` (admin) [file:2]  

### Wishlist
- `GET /api/wishlist/me` [file:2]  
- `GET /api/wishlist/ids` [file:2]  
- `POST /api/wishlist/toggle` [file:2]  
- `POST /api/wishlist/remove` [file:2]  
- `GET /api/wishlist/admin/summary` (admin) [file:2]  

### Rentals
- `GET /api/rentals/my` [file:2]  
- `POST /api/rentals/request` [file:2]  
- `GET /api/rentals/admin/requests` (admin) [file:2]  
- `GET /api/rentals/admin/approved` (admin) [file:2]  
- `GET /api/rentals/admin/active` (admin) [file:2]  
- `POST /api/rentals/admin/approve` (admin) [file:2]  
- `POST /api/rentals/admin/dismiss` (admin) [file:2]  
- `POST /api/rentals/admin/complete` (admin) [file:2]  

## 6. Setup notes (local)
The backend reads DB connection and Open Library base URL from `src/Config/config.php` if present, otherwise from environment variables with defaults. [file:2]  
Because the frontend relies on session cookies, requests must include credentials, and the backend CORS policy must allow credentials. [file:2][file:36]
