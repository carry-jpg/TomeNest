# TomeNest

TomeNest is a library management web app: browse a catalog, manage stock (admin), maintain wishlists, and handle rentals (request → approve → return).  
It uses a React (Vite) frontend and a PHP JSON API backend with session cookies. [file:18][file:2]

## Tech stack

- Frontend: React + Vite
- Backend: PHP (router in `Public/index.php`) [file:2]
- Database: MySQL (recommended: XAMPP MySQL)
- External API: Open Library (search/import) [file:2]

## Setup (local development)

### 1) Database (MySQL / XAMPP)

1. Start **MySQL** from the XAMPP Control Panel.
2. Create a database named `librarydb` (or use a different name and configure `DB_DSN`). [file:2]

Backend default DSN (if you don’t override it) is:
`mysql:host=127.0.0.1;dbname=librarydb;charset=utf8mb4` [file:2]

### 2) Backend (PHP + XAMPP)

The backend entry point is `Public/index.php` and all routes are served under `/api/*`. [file:2]

**Option A: Use Apache in XAMPP (recommended)**
1. Copy the backend project into `C:\xampp\htdocs\TomeNest` (or similar).
2. Start **Apache** in XAMPP.
3. Your backend base URL will typically be:
   - `http://localhost/TomeNest/Public` (adjust to your folder name)

**Option B: Launch PHP from CMD**
1. Open a terminal in the backend project root.
2. Run PHP’s built-in server pointed at the `Public` folder, for example:
   ```bash
   php -S localhost:8000 -t Public
Backend base URL will be:

http://localhost:8000

Backend configuration
The backend loads config from src/Config/config.php if present; otherwise it uses environment variables (with defaults). [file:2]

Environment variables supported:

DB_DSN (default includes librarydb) [file:2]

DB_USER (default root) [file:2]

DB_PASS (default empty) [file:2]

OPENLIBRARY_BASE (default https://openlibrary.org) [file:2]

3) Frontend (Vite)
In the frontend folder:

bash
npm install
npm run dev
Configure the backend URL for the frontend:

Create a .env file in the frontend root:

bash
VITE_API_BASE_URL=http://localhost:8000
The frontend calls the backend as:
<VITE_API_BASE_URL>/api/<route> and defaults to http://localhost:8000 if the env var is missing. [file:18]
Requests include cookies (credentials: "include"), so CORS must allow credentials on the backend. [file:18][file:2]

API overview (selected)
All endpoints are under /api/*. [file:2]

Auth
GET /api/auth/me [file:2]

POST /api/auth/register [file:2]

POST /api/auth/login [file:2]

POST /api/auth/logout [file:2]

Stock
GET /api/stock/list [file:2]

POST /api/stock/set [file:2]

POST /api/stock/delete [file:2]

Wishlist
GET /api/wishlist/me [file:2]

POST /api/wishlist/toggle [file:2]

GET /api/wishlist/admin/summary (admin only) [file:2]

Rentals
GET /api/rentals/my [file:2]

POST /api/rentals/request [file:2]

POST /api/rentals/admin/approve (admin only; sets dates + decrements stock) [file:2]

POST /api/rentals/admin/complete (admin only; marks returned + increments stock) [file:2]

Troubleshooting
If login “doesn’t stick”, confirm the frontend is sending cookies (credentials: "include") and the backend allows credentialed CORS. [file:18][file:2]

If you change your backend port or path, update VITE_API_BASE_URL accordingly. [file:18]
