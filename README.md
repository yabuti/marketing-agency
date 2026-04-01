# All Things - Marketing Agency Portfolio

A professional marketing agency website built with Laravel. We promote verified, licensed businesses across all social media platforms.

## Features

- 🏠 Modern landing page with orange/black/white theme
- 👥 Client showcase with license verification display
- 📧 Contact form with user authentication
- 🔐 User registration with email verification
- 🔑 Forgot password with reCAPTCHA
- 👨‍💼 Admin panel for managing clients and messages
- 📱 Fully responsive design

## Tech Stack

- Laravel 12
- MySQL
- Blade Templates
- Custom CSS

## Demo Accounts

**User Login:**
- Email: demo@allthings.com
- Password: demo1234

**Admin Login:**
- URL: /admin/login
- Username: admin
- Password: admin123

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## License

MIT