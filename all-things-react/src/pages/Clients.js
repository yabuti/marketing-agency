import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS } from '../constants';

const CATEGORIES = [
  { key: 'all',           tKey: 'catAll',           icon: '🏢' },
  { key: 'startups',      tKey: 'catStartups',      icon: '🚀' },
  { key: 'retail',        tKey: 'catRetail',        icon: '🛍️' },
  { key: 'hospitality',   tKey: 'catHospitality',   icon: '🍽️' },
  { key: 'education',     tKey: 'catEducation',     icon: '🎓' },
  { key: 'services',      tKey: 'catServices',      icon: '🛠️' },
  { key: 'manufacturers', tKey: 'catManufacturers', icon: '🏭' },
];

const CATEGORY_MAP = {
  startups: [
    'Tech startups (apps, software, IT services)',
    'E-commerce businesses',
    'Digital service startups',
    'Creative startups (design, media, photography)',
  ],
  retail: [
    'Shops and minimarkets', 'Clothing and fashion stores', 'Shoe and accessories shops',
    'Electronics and mobile phone shops', 'Cosmetics and beauty product shops',
    'Bookshops and stationery shops', 'Furniture and home appliance shops',
    'Food and beverage wholesalers', 'Construction material suppliers',
    'Agricultural input suppliers', 'Textile and garment wholesalers',
  ],
  hospitality: [
    'Restaurants and cafes', 'Traditional food houses',
    'Event and conference venues', 'Car rental services',
  ],
  education: [
    'Private schools (KG–Grade 12)', 'Training centers', 'Language schools',
    'Computer and IT training centers', 'Tutorial and exam preparation centers',
    'Online learning platforms', 'Educational consultancy services',
  ],
  services: [
    'Advertising and marketing agencies', 'Printing and publishing services',
    'Graphic design and branding services', 'Accounting and auditing firms',
    'Legal and consultancy services', 'Cleaning and maintenance services',
    'Security service providers', 'Beauty salons and barber shops',
    'Transportation and logistics services',
  ],
  manufacturers: [
    'Food and beverage processing enterprises', 'Garment and textile manufacturers',
    'Shoe and leather product manufacturers', 'Plastic product manufacturers',
    'Metal and wood furniture manufacturers', 'Building material manufacturers',
    'Packaging and labeling manufacturers',
  ],
};

function getClientCategory(businessType, category) {
  // First try direct category name match (e.g. "Startups & Entrepreneurs")
  const catNameMap = {
    'startups': ['startup', 'entrepreneur', 'e-commerce', 'digital service', 'creative startup'],
    'retail': ['retail', 'wholesale', 'shop', 'store', 'minimarket', 'clothing', 'fashion', 'shoe', 'electronics', 'cosmetics', 'bookshop', 'furniture', 'food and beverage wholesal', 'construction material', 'agricultural', 'textile'],
    'hospitality': ['restaurant', 'cafe', 'food house', 'event', 'conference', 'car rental', 'hospitality', 'tourism'],
    'education': ['school', 'training', 'language', 'computer', 'tutorial', 'online learning', 'educational', 'education'],
    'services': ['advertising', 'marketing agenc', 'printing', 'graphic design', 'accounting', 'legal', 'cleaning', 'security', 'beauty salon', 'barber', 'transportation', 'logistics', 'service provider'],
    'manufacturers': ['manufactur', 'processing enterprise', 'garment', 'leather', 'plastic', 'metal', 'wood furniture', 'building material', 'packaging'],
  };

  const searchStr = ((businessType || '') + ' ' + (category || '')).toLowerCase();
  if (!searchStr.trim()) return null;

  for (const [key, keywords] of Object.entries(catNameMap)) {
    if (keywords.some(kw => searchStr.includes(kw))) return key;
  }

  // Fallback: exact match against CATEGORY_MAP values
  for (const [key, types] of Object.entries(CATEGORY_MAP)) {
    if (types.some(t => searchStr.includes(t.toLowerCase()) || t.toLowerCase().includes(searchStr.trim()))) {
      return key;
    }
  }
  return null;
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCity, setActiveCity] = useState('');
  const { t, lang } = useLang();

  useEffect(() => {
    API.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
  }, []);

  const getField = (en, am, or_) => (lang === 'am' && am) ? am : (lang === 'or' && or_) ? or_ : en;

  const filtered = activeCategory === 'all'
    ? clients
    : clients.filter(c => getClientCategory(c.business_type, c.category) === activeCategory);

  const displayed = activeCity
    ? filtered.filter(c => c.location && c.location.toLowerCase().includes(activeCity.toLowerCase()))
    : filtered;

  // Update category counts using the fixed function
  const getCategoryCount = (key) => key === 'all'
    ? clients.length
    : clients.filter(c => getClientCategory(c.business_type, c.category) === key).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#a3a3a3' }}>{t.loading}</div>;

  return (
    <div className="page">
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 8 }}>{t.ourClients}</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 28 }}>{t.verifiedBusinesses}</p>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {CATEGORIES.map(({ key, tKey, icon }) => {
          const count = key === 'all' ? clients.length : clients.filter(c => getClientCategory(c.business_type, c.category) === key).length;
          const isActive = activeCategory === key;
          return (
            <button key={key} onClick={() => setActiveCategory(key)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
              background: isActive ? '#f97316' : '#171717',
              border: isActive ? '2px solid #f97316' : '2px solid #262626',
              color: isActive ? '#000' : '#a3a3a3',
              minWidth: 90, transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{t[tKey]}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: isActive ? 'rgba(0,0,0,0.2)' : '#262626',
                color: isActive ? '#000' : '#f97316',
                borderRadius: 10, padding: '1px 7px',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* City Filter */}
      <div style={{ marginBottom: 36 }}>
        <select value={activeCity} onChange={e => setActiveCity(e.target.value)} style={{
          padding: '10px 16px', borderRadius: 10, background: '#171717',
          border: '1px solid #333', color: '#fff', fontSize: 14, cursor: 'pointer', minWidth: 200,
        }}>
          <option value="">{t.allCities}</option>
          {ETHIOPIAN_CITIES.map(c => (
            <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>
          ))}
        </select>
        {activeCity && (
          <button onClick={() => setActiveCity('')} style={{ marginLeft: 10, background: 'none', border: '1px solid #333', color: '#a3a3a3', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
            {t.clearFilter}
          </button>
        )}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {displayed.map(c => (
          <Link key={c.id} to={`/clients/${c.id}`} style={{ textDecoration: 'none' }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                  <div style={{ color: '#a3a3a3', fontSize: 13 }}>{getField(c.category, c.category_am, c.category_or)}</div>
                </div>
              </div>
              <p style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                {getField(c.description, c.description_am, c.description_or)}
              </p>
              <span style={badge}>{t.verified}</span>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTop: '1px solid #262626' }}>
                {[[t.followers, c.followers], [t.growth, c.growth], [t.engagement, c.engagement]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ color: '#f97316', fontWeight: 700, fontSize: 15 }}>{v}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {displayed.length === 0 && (
        <p style={{ color: '#a3a3a3', textAlign: 'center', marginTop: 60 }}>
          {activeCity ? t.noClientsInCity(activeCity) : activeCategory === 'all' ? t.noClients : t.noClientsInCategory}
        </p>
      )}
    </div>
  );
}

const card = { background: '#171717', border: '1px solid #262626', borderRadius: 20, padding: 22 };
const badge = { background: '#22c55e15', border: '1px solid #22c55e40', color: '#22c55e', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
