# All Things Platform - Setup & Operations Guide

## 1. Database Installation (XAMPP / Plesk)

### Using XAMPP
1. Start **Apache** and **MySQL** in XAMPP Control Panel.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Create a database named `allthings_db`.
4. Click **Import** and select `database/production_full_install.sql`.
5. Click **Go** to generate all tables and baseline configurations.

### Using Plesk
1. Log into your Plesk Panel.
2. Navigate to **Databases** → **Add Database**.
3. Create database `allthings_db` and a database user.
4. Open **phpMyAdmin** for that database and import `database/production_full_install.sql`.

---

## 2. Environment Configuration

Create your `backend/.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=allthings_db
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your_secure_32_character_random_jwt_secret

APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=allthingsethiopia2026@gmail.com
MAIL_PASS=your_16_char_gmail_app_password
NOTIFY_EMAIL=allthingsethiopia2026@gmail.com
```

---

## 3. Development Workflow

### Run Everything Together
```bash
npm start
```
Starts:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:3000`
- **Admin Console**: `http://localhost:3001`

### Run Services Individually
- Backend: `npm run dev:backend`
- Frontend: `npm run dev:frontend`
- Admin: `npm run dev:admin`

---

## 4. Production Build for Plesk

Run the unified build command from the root:
```bash
npm run build
```
This automatically:
1. Runs production builds for `frontend` and `admin`.
2. Assembles all compiled assets and the backend API into `httpdocs/`.
3. Prepares the universal router (`httpdocs/index.php`) so that:
   - `/api/*` routes to the PHP backend.
   - `/admin/*` routes to the Admin Single Page App.
   - All other routes serve the main React website.
   - Static files (images, JS, CSS) are served directly with cache headers.

---

## 5. Flutter Mobile App (all_things_app)

To run the Flutter mobile application:
```bash
cd mobile
flutter pub get
flutter run
```
Configure `lib/services/api_service.dart` with your API host:
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Production Server**: `https://yourdomain.com/api`
