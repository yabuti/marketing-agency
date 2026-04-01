# Social Media Links Update

## Changes Made

### React Website

#### 1. Home Page (client/src/pages/Home.jsx)
- Added Instagram and TikTok social media icons below the hero description
- Icons are clickable and open in new tabs
- Links:
  - Instagram: https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr
  - TikTok: https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc

#### 2. Home Page Styles (client/src/styles/home.css)
- Added `.social-links` container styling
- Added `.social-icon` styling with hover effects
- Instagram hover: Pink/purple gradient
- TikTok hover: Black/cyan gradient
- Responsive design for mobile

#### 3. Footer (client/src/components/Layout.jsx)
- Added "Follow Us" section in footer
- Instagram and TikTok icons with links
- Consistent with home page styling

#### 4. Footer Styles (client/src/styles/layout.css)
- Added `.footer-social` container
- Added `.footer-social-icon` styling
- Hover effects with orange glow
- Mobile responsive centering

### Flutter App

#### 1. Home Screen (all_things_app/lib/screens/home_screen.dart)
- Added `url_launcher` import
- Added two social media buttons (Instagram & TikTok)
- Buttons are full-width and side-by-side
- Added `_buildSocialButton()` method
- Added `_launchURL()` method to open links in external browser
- Same links as website

#### 2. Dependencies
- `url_launcher: ^6.2.1` already included in pubspec.yaml
- No additional packages needed

## Features

### Website Features
- **Hover Effects**: Beautiful gradient animations on hover
- **New Tab**: Links open in new browser tabs
- **Accessibility**: Added title attributes for screen readers
- **Responsive**: Works on mobile and desktop
- **Footer Integration**: Social links also in footer for easy access

### App Features
- **External Browser**: Opens links in device's default browser
- **Touch Feedback**: Visual feedback on tap
- **Error Handling**: Gracefully handles launch failures
- **Consistent Design**: Matches app's color scheme

## Testing

### Website
1. Visit the home page
2. Look for Instagram (📸) and TikTok (🎵) icons below the hero text
3. Hover over icons to see gradient effects
4. Click to open in new tab
5. Check footer for additional social links

### Flutter App
1. Open the app
2. On home screen, scroll to see social media buttons
3. Tap Instagram button - should open Instagram in browser
4. Tap TikTok button - should open TikTok in browser

## Links Added

- **Instagram**: https://www.instagram.com/all63527
- **TikTok**: https://www.tiktok.com/@allthings2026

Both links are now accessible from:
- Website home page (hero section)
- Website footer (all pages)
- Flutter app home screen
