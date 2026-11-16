import React, { createContext, useContext, useEffect, useState } from 'react';
import API from './api';

export const DEFAULT_SETTINGS = {
  contact: {
    email: 'allthingsethiopia2026@gmail.com',
    phones: ['+251 905 841 982', '+251 967 033 544', '+251 911 031 884'],
    address: 'Addis Ababa, Ethiopia',
    hours: 'Mon–Fri: 9AM–6PM',
    telegramHandle: '@Allthings2026',
  },
  social: {
    whatsapp: '251911031884',
    facebook: 'https://facebook.com/Allthingssolutionplc',
    instagram: 'https://www.instagram.com/allthings.ethiopia/',
    tiktok: 'https://www.tiktok.com/@kingarsenal26',
    youtube: 'https://www.youtube.com/@ALLTHINGS-2026',
    telegram: 'https://t.me/Allthings2026',
    messenger: 'https://m.me/61586399832267',
  },
  home: {
    satisfaction: '98',
    businessFallback: '5',
    productFallback: '50',
    cityFallback: '5',
    testimonials: [
      { quote: 'All Things doubled our reach in just a few months. Their team truly cares about our growth.', name: 'Selam T.', role: 'Selam Fashion' },
      { quote: 'A game-changer for our coffee business — real customers from every region of Ethiopia.', name: 'Dawit M.', role: 'Dawit Coffee' },
      { quote: 'Professional, transparent, and results-driven. Our sales have never been better.', name: 'Hanna G.', role: 'Hanna Cosmetics' },
      { quote: 'From a local shop to an online brand — the marketplace made it happen for us.', name: 'Yonas K.', role: 'Yonas Electronics' },
    ],
  },
  about: {
    stats: [
      { num: '5000+', label: 'Businesses Empowered' },
      { num: '98%', label: 'Client Satisfaction' },
      { num: '10+', label: 'Years of Experience' },
      { num: '20+', label: 'Markets Reached' },
    ],
  },
  footer: {
    quickLinks: [
      { to: '/website', labelKey: 'home', label: 'Home' },
      { to: '/market', labelKey: 'marketTitle', label: 'Market' },
      { to: '/bazaar', labelKey: 'bazaarTitle', label: 'Bazaar' },
      { to: '/blog', labelKey: 'blogsNews', label: 'Blogs/News' },
      { to: '/about', labelKey: 'about', label: 'About' },
      { to: '/team', labelKey: 'team', label: 'Team' },
      { to: '/faq', labelKey: 'faq', label: 'FAQ' },
      { to: '/contact', labelKey: 'contact', label: 'Contact' },
      { to: '/all-clients', labelKey: 'allClientsLabel', label: 'Customers' },
    ],
    legalLinks: [
      { to: '/terms', labelKey: 'legalTerms', label: 'Terms & Conditions' },
      { to: '/privacy-policy', labelKey: 'legalPrivacy', label: 'Privacy Policy' },
      { to: '/billing-policy', labelKey: 'legalBilling', label: 'Billing Policy' },
      { to: '/cookie-policy', labelKey: 'legalCookie', label: 'Cookie Policy' },
      { to: '/copyright-infringement', labelKey: 'legalCopyright', label: 'Copyright Policy' },
    ],
    copyright: '© 2026 AllThings. All rights reserved.',
  },
  content: {
    en: {},
    am: {},
    or: {},
  },
};

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

function mergeDeep(base, over) {
  if (!isObj(over)) return over;
  const out = isObj(base) ? { ...base } : {};
  Object.keys(over).forEach(k => {
    const bv = isObj(base) ? base[k] : undefined;
    out[k] = Array.isArray(over[k]) ? over[k] : mergeDeep(bv, over[k]);
  });
  return out;
}

const SettingsContext = createContext(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    API.get('/settings')
      .then(r => {
        // Only merge a real settings object. The API can legitimately return
        // {"settings":[]} (no saved row yet) — merging an array used to wipe
        // the defaults and crash every consumer with a white page.
        const s = r.data?.settings;
        if (active && isObj(s)) setSettings(mergeDeep(DEFAULT_SETTINGS, s));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  const s = useContext(SettingsContext);
  return isObj(s) ? s : DEFAULT_SETTINGS;
}