# cPanel Deployment Guide

## Final folder structure on Plesk httpdocs:
```
httpdocs/
  api/
    index.php
    .htaccess
    .env          ← create from .env.example
    config/
    helpers/
    routes/
    vendor/       ← run: composer install locally first
    uploads/      ← create manually, chmod 755
    banners/      ← put your banner images here
  index.html      ← built all-things-react
  static/
  .htaccess       ← React Router htaccess (see step 5)
  admin/
    index.html    ← built admin-panel
    static/
    .htaccess     ← Admin Router htaccess (see step 5)
```

---

## Step 1 — Build React apps locally

```bash
# Main website
cd all-things-react
set REACT_APP_API_URL=https://allthings.com.et/api
npm run build

# Admin panel
cd ../admin-panel
set REACT_APP_API_URL=https://allthings.com.et/api
npm run build
```

---

## Step 2 — Install PHP dependencies locally

```bash
cd php-backend
C:\xampp\php\php.exe composer.phar install
```

---

## Step 3 — Upload files via Plesk File Manager

- `php-backend/` contents → `httpdocs/api/`
- `all-things-react/build/` contents → `httpdocs/`
- `admin-panel/build/` contents → `httpdocs/admin/`
- Your banner images → `httpdocs/api/banners/`

---

## Step 4 — Create httpdocs/api/.env

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_plesk_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

JWT_SECRET=change_this_to_a_long_random_string

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=allthingsethiopia2026@gmail.com
MAIL_PASS=your_gmail_app_password
NOTIFY_EMAIL=allthingsethiopia2026@gmail.com

FRONTEND_URL=https://allthings.com.et,https://allthings.com.et/admin
```

---

## Step 5 — Create .htaccess files

**httpdocs/.htaccess** (main website):
```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**httpdocs/admin/.htaccess** (admin panel):
```
RewriteEngine On
RewriteBase /admin/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /admin/index.html [L]
```

---

## Step 6 — Import database

- Plesk → Databases → Add Database → name it (e.g. `allthings`)
- Plesk → Databases → phpMyAdmin → Import → `database/allthings_db.sql`
- Then import `database/unique_fields_migration.sql`

---

## Step 7 — Set folder permissions

Set `httpdocs/api/uploads/` to **755** and create subfolders:
`clients`, `paths`, `team`, `news`, `ads`

---

## Step 8 — Test

- `https://allthings.com.et/api/health` → `{"status":"ok"}`
- `https://allthings.com.et` → main website
- `https://allthings.com.et/admin` → admin panel

## Final folder structure on cPanel public_html:
```
public_html/
  api/
    index.php
    .htaccess
    .env          ← create from .env.example
    config/
    helpers/
    routes/
    vendor/       ← run: composer install locally first
    uploads/      ← create manually, chmod 755
  index.html      ← built all-things-react
  static/
  .htaccess       ← React Router htaccess (see step 5)
  admin/
    index.html    ← built admin-panel
    static/
    .htaccess     ← Admin Router htaccess (see step 5)
```

---

## Step 1 — Install PHP dependencies (run locally)
```bash
cd php-backend
composer install
```
This creates the `vendor/` folder with JWT and PHPMailer.

---

## Step 2 — Build React apps (run locally)

Replace `https://yourdomain.com` with your actual domain:

```bash
# Main website
cd all-things-react
set REACT_APP_API_URL=https://yourdomain.com/api
npm run build

# Admin panel
cd admin-panel
set REACT_APP_API_URL=https://yourdomain.com/api
npm run build
```

On Mac/Linux use `export` instead of `set`.

---

## Step 3 — Upload files via cPanel File Manager or FTP

- Upload `php-backend/` contents → `public_html/api/`
- Upload `all-things-react/build/` contents → `public_html/`
- Upload `admin-panel/build/` contents → `public_html/admin/`

---

## Step 4 — Create .env in public_html/api/
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=cpanelusername_dbuser
DB_PASSWORD=your_password
DB_NAME=cpanelusername_allthings

JWT_SECRET=some_long_random_secret_string

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=allthingsethiopia2026@gmail.com
MAIL_PASS=your_gmail_app_password
NOTIFY_EMAIL=allthingsethiopia2026@gmail.com

FRONTEND_URL=https://yourdomain.com,https://yourdomain.com/admin
```

---

## Step 5 — Create .htaccess files

**public_html/.htaccess** (main website React Router):
```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**public_html/admin/.htaccess** (admin panel React Router):
```
RewriteEngine On
RewriteBase /admin/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /admin/index.html [L]
```

**public_html/api/.htaccess** (already included in php-backend):
```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ index.php [QSA,L]
RewriteRule ^(.*)$ index.php [QSA,L]
```

---

## Step 6 — Import database
- cPanel → MySQL Databases → create database + user + assign all privileges
- cPanel → phpMyAdmin → select database → Import → `database/allthings_db.sql`
- Also run: `database/unique_fields_migration.sql`
- Also run: `database/multilingual_migration.sql`

---

## Step 7 — Set folder permissions
In cPanel File Manager, set `public_html/api/uploads/` to **755**.

---

## Step 8 — Test
- `https://yourdomain.com/api/health` → `{"status":"ok"}`
- `https://yourdomain.com` → main website
- `https://yourdomain.com/admin` → admin panel
