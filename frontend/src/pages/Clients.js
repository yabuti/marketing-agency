import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../api';
import { useLang } from '../LangContext';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS } from '../constants';
import Pagination from '../components/Pagination';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const CATEGORY_LABEL_KEYS = {
  'Food and beverage processing enterprises': 'clientsCatFoodBeverage',
  'Garment and textile manufacturers': 'clientsCatGarmentTextile',
  'Shoe and leather product manufacturers': 'clientsCatShoeLeather',
  'Retail and Wholesale Businesses': 'clientsCatRetailWholesale',
  'Clothing and fashion stores': 'clientsCatClothingFashion',
  'Furniture and home appliance shops': 'clientsCatFurnitureAppliance',
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCity, setActiveCity] = useState('');
  const [page, setPage] = useState(1);
  const { t, lang } = useLang();
  const PER_PAGE = 10;

  useEffect(() => {
    API.get('/clients').then(r => setClients(Array.isArray(r.data) ? r.data : [])).catch(() => setClients([])).finally(() => setLoading(false));
  }, []);

  const getField = (en, am, or_) => (lang === 'am' && am) ? am : (lang === 'or' && or_) ? or_ : en;

  const filtered = activeCategory === 'all'
    ? clients
    : clients.filter(c => c.business_type === activeCategory || c.category === activeCategory);

  const displayed = activeCity
    ? filtered.filter(c => c.location && c.location.toLowerCase().includes(activeCity.toLowerCase()))
    : filtered;
  const totalPages = Math.ceil(displayed.length / PER_PAGE);
  const paginated = displayed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div style={{ textAlign: 'center', padding: 100, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{t.loading}</div>;

  return (
    <div className="page" style={{ paddingTop: 100 }}>
      <div className="hero-gradient" style={{ height: '40vh' }} />
      
      <Reveal>
        <div className="section-tag">{t.verifiedBusinesses}</div>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 16 }}>
          {t.ourPartners} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.ourPartnersHighlight}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40, maxWidth: 600 }}>
          {t.partnersDesc}
        </p>
      </Reveal>

      {/* Filters */}
      <Reveal delay={0.1}>
        <div style={{ 
          background: 'var(--bg-subtle)', 
          padding: '32px', 
          borderRadius: 24, 
          display: 'flex', 
          gap: 20, 
          marginBottom: 40, 
          flexWrap: 'wrap',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={labelStyle}>{t.category}</label>
            <select value={activeCategory} onChange={e => { setActiveCategory(e.target.value); setPage(1); }} style={selectStyle}>
              <option value="all">{t.allCategoriesLabel}</option>
              <optgroup label={t.clientsGroupManufacturers}>
                {['Food and beverage processing enterprises', 'Garment and textile manufacturers', 'Shoe and leather product manufacturers'].map(bt => <option key={bt} value={bt}>{t[CATEGORY_LABEL_KEYS[bt]]}</option>)}
              </optgroup>
              <optgroup label={t.clientsGroupRetailWholesale}>
                {['Retail and Wholesale Businesses', 'Clothing and fashion stores', 'Furniture and home appliance shops'].map(bt => <option key={bt} value={bt}>{t[CATEGORY_LABEL_KEYS[bt]]}</option>)}
              </optgroup>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={labelStyle}>{t.city}</label>
            <select value={activeCity} onChange={e => { setActiveCity(e.target.value); setPage(1); }} style={selectStyle}>
              <option value="">{t.allCities}</option>
              {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>)}
            </select>
          </div>

          {(activeCategory !== 'all' || activeCity) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setActiveCategory('all'); setActiveCity(''); }} className="btn-outline" style={{ padding: '12px 24px', fontSize: 16 }}>
                {t.clearFilter}
              </button>
            </div>
          )}
        </div>
      </Reveal>

      <div className="grid-2" style={{ gap: 32 }}>
        {paginated.map((c, i) => (
          <Reveal key={c.id} delay={i % 2 * 0.1}>
            <Link to={`/clients/${c.id}`} style={{ textDecoration: 'none' }}>
              <div className="creative-card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                  <div style={{ 
                    width: 64, height: 64, 
                    background: 'var(--bg-subtle)', 
                    borderRadius: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 28, 
                    flexShrink: 0, 
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {c.logo_url ? <img src={c.logo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🏢'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--secondary)' }}>{c.name}</div>
                    <div style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700 }}>{getField(c.category, c.category_am, c.category_or)}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                  {getField(c.description, c.description_am, c.description_or)}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={badgeStyle}>✓ {t.verified}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--secondary)' }}>{c.location || t.clientsEthiopia}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      {displayed.length === 0 && (
        <Reveal>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>
              {activeCity ? t.noClientsInCity(activeCity) : t.noClients}
            </p>
          </div>
        </Reveal>
      )}

      <style>{`
        @media (max-width: 768px) {
          .page[style*="paddingTop: 100"] { padding-top: 80px !important; }
          .page .hero-gradient { height: 20vh !important; }
          .page .grid-2 { grid-template-columns: 1fr !important; gap: 16px !important; }
          .page .creative-card { padding: 20px 16px !important; }
          .page .creative-card [style*="gap: 20"] { gap: 12px !important; }
          .page .creative-card [style*="fontSize: 20"] { font-size: 16px !important; }
          .page [style*="marginBottom: 64"] { margin-bottom: 32px !important; }
          .page [style*="marginBottom: 24"] { margin-bottom: 12px !important; }
        }
        @media (max-width: 480px) {
          .page[style*="paddingTop: 100"] { padding-top: 72px !important; }
          .page .hero-gradient { height: 15vh !important; }
          .page .grid-2 { grid-template-columns: 1fr !important; gap: 12px !important; }
          .page .creative-card { padding: 16px 14px !important; }
          .page .creative-card [style*="gap: 20"] { gap: 10px !important; }
          .page .creative-card [style*="width: 64"] { width: 48px !important; height: 48px !important; }
          .page .creative-card [style*="fontSize: 20"] { font-size: 15px !important; }
          .page [style*="minWidth: 260"] { min-width: 100% !important; }
          .page > div:nth-child(3) { flex-direction: column !important; }
          .page [style*="marginBottom: 64"] { margin-bottom: 24px !important; }
          .page [style*="marginBottom: 24"] { margin-bottom: 8px !important; }
          .page [style*="marginBottom: 16"] { margin-bottom: 6px !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 17, fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 };
const selectStyle = {
  width: '100%', padding: '14px 20px',
  background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 16, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, cursor: 'pointer',
  appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FF7A00' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center',
  paddingRight: 48, transition: 'all 0.3s'
};

const badgeStyle = { 
  background: 'rgba(34, 197, 94, 0.08)', 
  color: '#22c55e', 
  padding: '6px 16px', 
  borderRadius: 100, 
  fontSize: 16, 
  fontWeight: 800,
  letterSpacing: '0.05em'
};
