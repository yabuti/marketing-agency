# Implementation Plan: Client Promotion Paths

## Overview

Implement the Promotion Paths feature across four layers: database migration, Express backend routes, admin panel UI (PathManager component + Analytics page + Dashboard stats), and the public ClientDetail page. Each task builds on the previous, ending with full integration.

## Tasks

- [x] 1. Database migration — add promotion path tables
  - Append the two `CREATE TABLE IF NOT EXISTS` statements for `client_promotion_paths` and `client_path_media` to `database/allthings_db.sql` exactly as specified in the design's SQL Migration section
  - Verify foreign key constraints: `client_id` → `clients(id)` ON DELETE CASCADE, `path_id` → `client_promotion_paths(id)` ON DELETE CASCADE
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Backend — extend upload middleware for path media
  - In `backend/middleware/upload.js`, add a check in the `destination` function: if `req.baseUrl` includes `/paths`, route files to `uploads/paths/` (images and videos both go there)
  - _Requirements: 3.1, 3.3_

- [x] 3. Backend — promotion path CRUD and media routes
  - [x] 3.1 Add `/admin/stats` and `/admin/analytics` routes to `backend/routes/clients.js` **before** the existing `/:id` wildcard route
    - `GET /admin/stats`: single query returning `{ totalPaths, totalImages, totalVideos }` via COUNT aggregates on `client_promotion_paths` and `client_path_media`
    - `GET /admin/analytics`: accepts `location`, `date`, `month`, `year` query params; builds a dynamic WHERE clause on `clients.location` and `clients.created_at`; returns `{ count, clients }`
    - Both routes require `auth` middleware
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [ ]* 3.2 Write property test for stats endpoint accuracy (Property 13)
    - **Property 13: Stats endpoint accuracy**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**

  - [ ]* 3.3 Write property tests for analytics filter correctness (Properties 14, 15, 16)
    - **Property 14: Location filter returns only matching clients**
    - **Property 15: Date filter returns only matching clients**
    - **Property 16: Analytics count equals results length**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.7**

  - [x] 3.4 Add promotion path CRUD routes to `backend/routes/clients.js`
    - `GET /api/clients/:id/paths` — fetch all paths for a client ordered by `path_date DESC`, each including its images and videos from `client_path_media`; attach to response
    - `POST /api/clients/:id/paths` — validate `title` present (return 400 if missing), insert row, return created object with HTTP 201
    - `PUT /api/clients/:id/paths/:pathId` — update `title` and/or `path_date`, return updated object; return 404 if not found
    - `DELETE /api/clients/:id/paths/:pathId` — delete all `client_path_media` files from disk (loop + `fs.existsSync`/`fs.unlinkSync`), then delete path record (cascade handles DB rows); return 404 if not found
    - All write routes require `auth` middleware
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.5 Write property tests for path CRUD (Properties 1, 2, 3, 4, 5, 6)
    - **Property 1: Path creation round-trip**
    - **Property 2: Missing title is rejected**
    - **Property 3: Path update round-trip**
    - **Property 4: Path delete cascades to media and files**
    - **Property 5: No upper limit on paths per client**
    - **Property 6: Paths are ordered by path_date descending**
    - **Validates: Requirements 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 3.6 Add path media upload and delete routes to `backend/routes/clients.js`
    - `POST /api/clients/:id/paths/:pathId/media` — multipart upload via `upload.single('file')`; count existing images/videos for the path; return 400 with `"Maximum 5 images per path reached."` or `"Maximum 5 videos per path reached."` if at limit; otherwise insert `client_path_media` record and return HTTP 201
    - `DELETE /api/clients/:id/paths/:pathId/media/:mediaId` — delete file from disk and remove DB record; return 404 if not found
    - Both routes require `auth` middleware
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.7 Write property tests for path media upload/delete (Properties 7, 8, 9, 10)
    - **Property 7: Media upload round-trip**
    - **Property 8: Media per-type limit is enforced**
    - **Property 9: Media delete removes record**
    - **Property 10: Path media counts are accurate**
    - **Validates: Requirements 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 4. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Backend — extend `getClientFull` to include promotion paths
  - In `backend/routes/clients.js`, update the `getClientFull` helper to also query `client_promotion_paths` and their `client_path_media`, building a `promotionPaths` array (ordered by `path_date DESC`) attached to the returned client object
  - Each path entry should include `id`, `title`, `path_date`, `created_at`, `images`, and `videos` arrays (same URL-mapping pattern as existing `images`/`videos`)
  - _Requirements: 4.1_

  - [ ]* 5.1 Write property test for client detail includes all path data (Property 11)
    - **Property 11: Client detail includes all path data**
    - **Validates: Requirements 4.1**

- [x] 6. Admin Panel — PathManager component
  - Create `admin-panel/src/pages/PathManager.js` as a self-contained component accepting a `clientId` prop
  - On mount, fetch `GET /api/clients/:clientId/paths` and store in state
  - Render a list of existing paths ordered by `path_date` descending, each showing title, date, and `X/5 images, Y/5 videos` counts
  - Each path row has an expand toggle that reveals image slots (5) and video slots (5) with upload inputs and delete buttons — reuse the same slot-grid pattern from `ClientForm.js`
  - Include a "New Path" form (title + date inputs + Save button) that calls `POST /api/clients/:clientId/paths`
  - Each path has an Edit button (inline title/date edit → `PUT`) and a Delete button (confirm → `DELETE`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 6.1 Write property test for path render contains title and date (Property 12)
    - **Property 12: Path render contains title and date**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [x] 7. Admin Panel — embed PathManager in ClientForm
  - In `admin-panel/src/pages/ClientForm.js`, import `PathManager` and render it as a new `<Section>` titled `"🛣️ Promotion Paths"` below the existing Videos section, passing `clientId={savedId}` — only render when `savedId` is set
  - _Requirements: 2.6_

- [x] 8. Admin Panel — Dashboard stat cards
  - In `admin-panel/src/pages/Dashboard.js`, add a `useEffect` call to `GET /api/clients/admin/stats` and store `{ totalPaths, totalImages, totalVideos }` in state
  - Append three new cards to the `cards` array: `{ label: 'Promotion Paths', value: stats.totalPaths, icon: '🛣️', color: '#06b6d4' }`, `{ label: 'Path Images', value: stats.totalImages, icon: '🖼️', color: '#8b5cf6' }`, `{ label: 'Path Videos', value: stats.totalVideos, icon: '🎬', color: '#ec4899' }`
  - Update the grid to `repeat(auto-fill, minmax(180px, 1fr))` or similar to accommodate the extra cards
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Admin Panel — Analytics page and navigation
  - Create `admin-panel/src/pages/Analytics.js` with:
    - A location dropdown (populated with the same `ETHIOPIAN_CITIES` list from `ClientForm.js`) and a "All cities" default option
    - Three date filter inputs: specific date (`<input type="date">`), month (`<input type="month">`), year (`<input type="number">`) — only one active at a time (selecting one clears the others)
    - On any filter change, call `GET /api/clients/admin/analytics` with the active params and update `results` and `count` state
    - Display the count and a table/list of matching clients (name, location, created_at)
    - When no filters are applied, show all clients
    - When count is 0, show an empty state message
  - Add route `<Route path="/analytics" element={<Analytics />} />` to `admin-panel/src/App.js`
  - Add `{ to: '/analytics', label: '📈 Analytics' }` nav link to `admin-panel/src/components/Layout.js`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [x] 10. Checkpoint — Ensure all admin panel components render without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Public Website — Promotion Paths section in ClientDetail
  - In `all-things-react/src/pages/ClientDetail.js`, after the existing Videos section, add a conditional block: if `client.promotionPaths?.length > 0`, render a `"Promotion Paths"` heading followed by one group per path
  - Each group shows: path title + formatted `path_date` as a subheading, an image grid (same `gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'` style with lightbox support), and a video list (same card style as existing videos)
  - If a path has no images, skip the image grid; if no videos, skip the video list
  - If `client.promotionPaths` is empty or absent, render nothing (no section heading)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 11.1 Write unit tests for ClientDetail promotion paths rendering
    - Test: section not rendered when `promotionPaths` is empty or absent
    - Test: each path's title and date appear in the output
    - Test: images and videos render within their respective path group
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with `{ numRuns: 100 }` per the design's testing strategy
- The `/admin/stats` and `/admin/analytics` routes **must** be registered before the `/:id` wildcard in `clients.js` to avoid route conflicts
- File cleanup on delete follows the existing `fs.existsSync` + `fs.unlinkSync` pattern already used in the codebase
