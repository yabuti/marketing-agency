const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BANNERS_DIR = path.join(__dirname, '..', 'banners');
const IMAGES_PER_SLOT = 3;   // show 3 banners per 12-hour window
const WINDOW_HOURS = 12;     // rotate every 12 hours
const SECONDS_PER_BANNER = 5; // 3 banners × 5s = 15s total

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const BASE_URL = () => `http://localhost:${process.env.PORT || 5000}`;

// Encode filename for safe URL (handles spaces and special chars)
function toUrl(filename) {
  return `${BASE_URL()}/banners/${encodeURIComponent(filename)}`;
}

/**
 * Returns all banner image filenames sorted alphabetically.
 * You just drop images into backend/banners/ — no DB needed.
 */
function getAllBanners() {
  if (!fs.existsSync(BANNERS_DIR)) return [];
  return fs
    .readdirSync(BANNERS_DIR)
    .filter((f) => SUPPORTED.includes(path.extname(f).toLowerCase()) && f !== '.gitkeep')
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Which 12-hour slot are we in right now?
 * Slot 0 = 00:00–11:59 on day 0
 * Slot 1 = 12:00–23:59 on day 0
 * Slot 2 = 00:00–11:59 on day 1
 * ...
 *
 * We use a fixed epoch (Jan 1 2026) so the slot number is consistent
 * across all users regardless of when they load the page.
 */
function currentSlot() {
  const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
  const now = Date.now();
  const hoursElapsed = Math.floor((now - EPOCH) / (1000 * 60 * 60));
  return Math.floor(hoursElapsed / WINDOW_HOURS);
}

/**
 * Pick 3 images for the current slot.
 * We cycle through all images in order, never repeating a set
 * until all images have been shown.
 */
function getBannersForSlot(slot, allBanners) {
  if (allBanners.length === 0) return [];

  const totalSets = Math.ceil(allBanners.length / IMAGES_PER_SLOT);
  const setIndex = slot % totalSets; // cycle through all sets
  const start = setIndex * IMAGES_PER_SLOT;
  const slice = allBanners.slice(start, start + IMAGES_PER_SLOT);

  // If last set has fewer than 3, wrap around from the beginning
  while (slice.length < IMAGES_PER_SLOT && allBanners.length >= IMAGES_PER_SLOT) {
    const needed = IMAGES_PER_SLOT - slice.length;
    slice.push(...allBanners.slice(0, needed));
  }

  return slice;
}

// ─── PUBLIC: GET /api/banners/current ────────────────────────────
// Returns the 3 banners to show right now + slot info
router.get('/current', (req, res) => {
  const all = getAllBanners();
  const slot = currentSlot();
  const banners = getBannersForSlot(slot, all);

  // Calculate when this slot ends (for client-side refresh)
  const EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
  const slotStartMs = EPOCH + slot * WINDOW_HOURS * 3600 * 1000;
  const slotEndMs   = slotStartMs + WINDOW_HOURS * 3600 * 1000;
  const msUntilNext = slotEndMs - Date.now();

  res.json({
    slot,
    total_banners: all.length,
    banners: banners.map((filename, i) => ({
      index: i,
      filename,
      url: toUrl(filename),
      duration_sec: SECONDS_PER_BANNER,
    })),
    slot_ends_in_ms: msUntilNext,
    next_slot_at: new Date(slotEndMs).toISOString(),
  });
});

// ─── PUBLIC: GET /api/banners/all ────────────────────────────────
// Admin preview — list every banner image
router.get('/all', (req, res) => {
  const all = getAllBanners();
  const slot = currentSlot();
  const totalSets = Math.ceil(all.length / IMAGES_PER_SLOT);

  res.json({
    total: all.length,
    images_per_slot: IMAGES_PER_SLOT,
    window_hours: WINDOW_HOURS,
    current_slot: slot,
    total_sets: totalSets,
    banners: all.map((filename, i) => {
      const setIndex = Math.floor(i / IMAGES_PER_SLOT);
      return {
        index: i,
        filename,
        url: toUrl(filename),
        set: setIndex,
        is_current_set: setIndex === slot % totalSets,
      };
    }),
  });
});

module.exports = router;
