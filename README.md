# All Things - Marketing Agency & Bazaar Platform

A unified enterprise-grade platform featuring a marketing portfolio showcase, multi-vendor live Bazaar, multilingual news & blogs, business directory, and an executive administration console.

---

## 🏛️ Monorepo Architecture

```
marketing-agency-main/
├── backend/            # PHP REST API (auth, clients, news, bazaar, orders, chat, settings)
├── frontend/           # Public React Website & Bazaar E-Commerce Store
├── admin/              # Executive Administration Dashboard (News, Clients, Bazaar, Inquiries)
├── mobile/             # Flutter Mobile Application
├── database/           # Full SQL schemas, migrations, and seeders
├── httpdocs/           # Production-ready Plesk deployment bundle
├── scripts/            # Unified build and local multi-service runners
├── archive/            # Safely preserved legacy prototypes
├── package.json        # Unified workspace configuration & scripts
└── .env.example        # Environment variable reference
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **PHP 8.1+** (with `pdo_mysql`, `curl`, `mbstring`)
- **MySQL 8.0+** (or MariaDB via XAMPP)
- **Node.js 18+** & npm

### 2. Database Setup
1. Open phpMyAdmin or your MySQL CLI.
2. Create database `allthings_db`.
3. Import `database/production_full_install.sql`.

Default admin credentials:
- **Email / Username**: `admin` (or `admin@allthings.com`)
- **Password**: `Admin@123` (or `admin123`)

### 3. Install Dependencies
From the repository root:
```bash
npm run install:all
```

### 4. Configure Environment
```bash
cp .env.example backend/.env
```
Edit `backend/.env` with your database credentials.

### 5. Launch All Services
```bash
npm start
```
This single command spins up:
- 🌐 **Frontend Website**: `http://localhost:3000`
- 👨‍💼 **Admin Panel**: `http://localhost:3001` (or `http://localhost:3000/admin`)
- ⚙️ **Backend API**: `http://localhost:5000`

---

## 📦 Production Build & Plesk Deployment

To assemble the complete production package for Plesk:
```bash
npm run build
```
This compiles both React applications and bundles them with the PHP API into the `/httpdocs` directory:
- `/httpdocs/index.html` → Public React Website
- `/httpdocs/admin/index.html` → Admin Panel SPA
- `/httpdocs/api/` → PHP Backend API
- `/httpdocs/index.php` → Unified routing gateway for Plesk

Simply upload the contents of `/httpdocs` to your Plesk server's `httpdocs/` directory.

---

## 🛠️ Management & Capabilities
- **News & Editorial**: Multi-lingual publishing (English, Amharic, Afaan Oromoo) with instant auto-translation and media attachments.
- **Bazaar Hub**: Product catalogue, order verification, slip review, and live schedule toggling.
- **Client Portfolio**: Registered company credentials, verification details, social channels, and photo/video campaign tracks.
- **Inquiries & Communication**: Live chat, contact form tracking, and custom quote requests.
