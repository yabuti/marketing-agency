# Requirements Document

## Introduction

This feature adds a **Promotion Paths** system to the existing client management platform. Each client can have multiple named promotion paths (campaigns/projects), each holding up to 5 images and 5 videos. The admin can manage paths via the admin panel, and paths are displayed on the public client detail page. The admin dashboard gains three new stat counters, and a dedicated analytics section allows filtering/searching clients by location and creation date.

---

## Glossary

- **Promotion_Path**: A named campaign or project belonging to a client, containing a title, a date, and up to 5 images and 5 videos.
- **Path_Media**: An image or video file attached to a specific Promotion_Path.
- **Admin**: An authenticated administrator using the admin panel.
- **Client**: A business entity already stored in the `clients` table.
- **Client_Detail_Page**: The public-facing React page (`ClientDetail.js`) that displays a single client's information.
- **Dashboard**: The admin panel page (`Dashboard.js`) showing aggregate statistics.
- **Analytics_Section**: A dedicated section in the admin panel for searching and filtering clients.
- **Path_Manager**: The admin UI component for creating, editing, and deleting Promotion_Paths for a client.
- **API**: The Express.js backend REST API.

---

## Requirements

### Requirement 1: Promotion Path Data Model

**User Story:** As an Admin, I want each client to have multiple named promotion paths, so that I can organize campaigns and projects per client.

#### Acceptance Criteria

1. THE API SHALL store Promotion_Paths in a dedicated `client_promotion_paths` table with columns: `id`, `client_id`, `title`, `path_date`, `created_at`, `updated_at`.
2. THE `client_promotion_paths` table SHALL enforce a foreign key constraint on `client_id` referencing `clients(id)` with `ON DELETE CASCADE`.
3. THE API SHALL store Path_Media in a `client_path_media` table with columns: `id`, `path_id`, `type` (ENUM `image`/`video`), `file_path`, `description`, `sort_order`, `created_at`.
4. THE `client_path_media` table SHALL enforce a foreign key constraint on `path_id` referencing `client_promotion_paths(id)` with `ON DELETE CASCADE`.
5. THE API SHALL allow a client to have more than 10 Promotion_Paths with no upper limit on path count per client.

---

### Requirement 2: Admin — Create, Edit, Delete Promotion Paths

**User Story:** As an Admin, I want to create, edit, and delete promotion paths for any client, so that I can manage each client's campaigns.

#### Acceptance Criteria

1. WHEN an Admin submits a valid create-path request with a `title` and `path_date`, THE API SHALL insert a new Promotion_Path record and return the created object with HTTP 201.
2. IF an Admin submits a create-path request without a `title`, THEN THE API SHALL return HTTP 400 with a descriptive error message.
3. WHEN an Admin submits a valid edit-path request, THE API SHALL update the Promotion_Path's `title` and/or `path_date` and return the updated object.
4. WHEN an Admin deletes a Promotion_Path, THE API SHALL delete the path record, all associated Path_Media records, and all associated media files from disk.
5. THE Path_Manager SHALL display all existing Promotion_Paths for a client, ordered by `path_date` descending.
6. THE Path_Manager SHALL be accessible from the client edit page (`ClientForm.js`) as a dedicated section below the existing media sections.

---

### Requirement 3: Admin — Upload and Delete Path Media

**User Story:** As an Admin, I want to upload up to 5 images and 5 videos per promotion path, so that each campaign has its own media set.

#### Acceptance Criteria

1. WHEN an Admin uploads an image to a Promotion_Path that has fewer than 5 images, THE API SHALL store the file and insert a `client_path_media` record of type `image`.
2. IF an Admin attempts to upload an image to a Promotion_Path that already has 5 images, THEN THE API SHALL return HTTP 400 with the message "Maximum 5 images per path reached."
3. WHEN an Admin uploads a video to a Promotion_Path that has fewer than 5 videos, THE API SHALL store the file and insert a `client_path_media` record of type `video`.
4. IF an Admin attempts to upload a video to a Promotion_Path that already has 5 videos, THEN THE API SHALL return HTTP 400 with the message "Maximum 5 videos per path reached."
5. WHEN an Admin deletes a Path_Media item, THE API SHALL remove the database record and delete the file from disk.
6. THE Path_Manager SHALL display current image and video counts per path (e.g., "3/5 images, 2/5 videos").

---

### Requirement 4: Public Website — Display Promotion Paths on Client Detail Page

**User Story:** As a website visitor, I want to see a client's promotion paths on their detail page, so that I can browse their campaigns and media.

#### Acceptance Criteria

1. WHEN a visitor loads a Client_Detail_Page, THE API SHALL return all active Promotion_Paths for that client, each including its title, path_date, images, and videos.
2. THE Client_Detail_Page SHALL render a dedicated "Promotion Paths" section below the existing images and videos sections.
3. THE Client_Detail_Page SHALL display each Promotion_Path as a named group, showing the path title and date as a heading.
4. WHILE a Promotion_Path has images, THE Client_Detail_Page SHALL display those images in a grid within that path's group.
5. WHILE a Promotion_Path has videos, THE Client_Detail_Page SHALL display those videos in a list within that path's group.
6. THE Client_Detail_Page SHALL order Promotion_Paths by `path_date` descending (newest first).
7. WHERE a client has no Promotion_Paths, THE Client_Detail_Page SHALL not render the "Promotion Paths" section.

---

### Requirement 5: Admin Dashboard — Promotion Path Stats

**User Story:** As an Admin, I want to see aggregate counts of promotion paths, images, and videos on the dashboard, so that I can monitor content volume at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL display a stat card showing the total count of Promotion_Paths across all clients.
2. THE Dashboard SHALL display a stat card showing the total count of Path_Media items of type `image` across all client paths.
3. THE Dashboard SHALL display a stat card showing the total count of Path_Media items of type `video` across all client paths.
4. WHEN the Dashboard loads, THE API SHALL return the three counts in a single endpoint response to minimize round trips.
5. WHEN a Promotion_Path or Path_Media item is created or deleted, THE Dashboard counts SHALL reflect the updated totals on the next page load.

---

### Requirement 6: Admin Analytics — Search and Filter Clients

**User Story:** As an Admin, I want to search and filter clients by city/location and by creation date, so that I can analyze the client base.

#### Acceptance Criteria

1. THE Analytics_Section SHALL provide a text input or dropdown that filters clients by `location` (city).
2. THE Analytics_Section SHALL provide date filter controls that allow filtering clients by a specific date, by month, or by year using the `created_at` field.
3. WHEN an Admin applies a location filter, THE API SHALL return only clients whose `location` matches the selected value.
4. WHEN an Admin applies a date filter by specific date, THE API SHALL return only clients whose `created_at` date equals the specified date.
5. WHEN an Admin applies a date filter by month, THE API SHALL return only clients whose `created_at` falls within the specified year and month.
6. WHEN an Admin applies a date filter by year, THE API SHALL return only clients whose `created_at` falls within the specified year.
7. THE Analytics_Section SHALL display the count of clients matching the current filter criteria.
8. WHEN no filters are applied, THE Analytics_Section SHALL display all clients and their total count.
9. IF no clients match the applied filters, THEN THE Analytics_Section SHALL display a count of 0 and an empty results list.
10. THE Analytics_Section SHALL be a dedicated page or tab in the admin panel, separate from the main Clients list.
