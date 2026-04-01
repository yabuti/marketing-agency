# All Things - Setup Guide

## 1. Database (XAMPP)

1. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Click **Import** → choose `database/allthings_db.sql` → click **Go**
3. Database `allthings_db` will be created with all tables

Default admin login:
- Email: `admin@allthings.com`
- Password: `Admin@123`

---

## 2. Backend API

```bash
cd backend
cp .env.example .env        # edit DB_PASSWORD if you set one in XAMPP
npm install
npm start                   # runs on http://localhost:5000
```

Test it: open `http://localhost:5000/api/health`

### Email Setup (Gmail)
1. Go to your Google Account → Security → 2-Step Verification → App Passwords
2. Create an App Password for "Mail"
3. In `backend/.env`, set:
   ```
   MAIL_USER=allthingsethiopia2026@gmail.com
   MAIL_PASS=xxxx xxxx xxxx xxxx   ← your 16-char app password
   NOTIFY_EMAIL=allthingsethiopia2026@gmail.com
   ```
4. Restart the backend — emails will now send on every contact form and registration

---

## 3. Admin Panel

```bash
cd admin-panel
npm install
npm start                   # opens http://localhost:3000
```

Login with the admin credentials above.

---

## 4. Flutter App

The app connects to `http://10.0.2.2:5000/api` (Android emulator).

- For **iOS simulator**: change `baseUrl` in `lib/services/api_service.dart` to `http://localhost:5000/api`
- For **real device**: use your computer's local IP, e.g. `http://192.168.1.100:5000/api`

```bash
cd all_things_app
flutter pub get
flutter run
```

---

## How It Works

1. Admin logs into the admin panel
2. Admin adds clients (info + uploads images/videos)
3. Admin adds news articles (with images, multilingual)
4. Admin sees all contact form submissions
5. Flutter app and website fetch live data from the API
6. Any change in admin panel appears instantly in the app

## API Endpoints (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | All active clients |
| GET | /api/clients/:id | Single client |
| GET | /api/news | All published news |
| GET | /api/news/:id | Single news article |
| POST | /api/contact | Submit contact form |
