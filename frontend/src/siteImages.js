import { useEffect, useState } from 'react';
import API from './api';

// Fallbacks used until an admin override exists (and if the fetch fails).
export const SITE_IMAGE_DEFAULTS = {
  img_market_hero: '/images/market.jpg',
  img_bazaar_hero: '/images/bazzar.png',
  img_blog_hero: '/images/blogs.png',
  img_home_banner: '/images/home-background.png',
  img_about_banner: '/images/about-background.png',
  img_faq_hero: '/images/faq.png',
  img_logo: '/images/logo.jpg',
  img_footer_logo: '/images/footer-logo.jpg',
};

let cache = null;
let pending = null;

function loadSiteImages() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = API.get('/bazaar/site-images')
      .then(r => {
        cache = { ...SITE_IMAGE_DEFAULTS, ...(r.data || {}) };
        return cache;
      })
      .catch(() => SITE_IMAGE_DEFAULTS);
  }
  return pending;
}

export function useSiteImage(key) {
  const fallback = SITE_IMAGE_DEFAULTS[key] || '';
  const [src, setSrc] = useState(fallback);
  useEffect(() => {
    let alive = true;
    loadSiteImages().then(map => {
      if (alive) setSrc((map && map[key]) || fallback);
    });
    return () => { alive = false; };
  }, [key, fallback]);
  return src;
}
