import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../../api';
import { useLang } from '../../LangContext';
import ProductCard from '../../components/bazaar/ProductCard';
import { addToCart, getCartKey } from './cartUtils';

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

const TibebPattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.04, pointerEvents: 'none' }}>
    <pattern id="tibeb" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <path d="M60 0 L120 60 L60 120 L0 60 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M0 0 L120 120 M120 0 L0 120" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#tibeb)" />
  </svg>
);

export default function SellerStorePage() {
  const { id } = useParams();
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    API.get('/bazaar/products', { params: { seller_id: id } })
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : [];
        setProducts(data);
        if (data.length === 0) setNotFound(true);
      })
      .catch(() => { setProducts([]); setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAddToCart = (product) => {
    const key = getCartKey(product.seller_id);
    if (!key) { showToast(t.spSignInToSave); return; }
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(key)) || []; } catch { cart = []; }
    if (!Array.isArray(cart)) cart = [];
    cart = addToCart(cart, product, 1);
    localStorage.setItem(key, JSON.stringify(cart));
    showToast(`❤️ ${product.name} ${t.pdWishlistToast}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100, color: 'var(--primary)', fontWeight: 700 }}>{t.loading}</div>;
  }

  const seller = products.length > 0 ? {
    name: products[0].seller_name,
    location: products[0].seller_location || '',
    description: products[0].seller_description || '',
  } : null;

  return (
    <div className="page seller-store-page" style={{ paddingTop: 100 }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />
      <TibebPattern />

      <Reveal>
        <Link to="/bazaar" className="seller-back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.backToBazaar}
        </Link>
      </Reveal>

      {notFound || !seller ? (
        <Reveal>
          <div className="creative-card seller-empty-card">
            <div style={{ fontSize: 54, marginBottom: 16 }}>🏪</div>
            <h2 style={{ fontSize: 22, color: 'var(--text-muted)', fontWeight: 800 }}>{t.spNoProducts}</h2>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.1}>
            <div className="creative-card seller-hero-card">
              <div className="seller-hero-avatar">
                {seller.name?.charAt(0)}
              </div>
              <div className="seller-hero-info">
                <h1 className="seller-hero-name">{seller.name}</h1>
                {seller.location && <p className="seller-hero-loc">📍 {seller.location}</p>}
                <p className="seller-hero-desc">{seller.description || t.spVerifiedSeller}</p>
              </div>
            </div>
          </Reveal>

          <div className="seller-products-grid">
            {products.map((product, idx) => (
              <Reveal key={product.id} delay={0.05 + idx * 0.03}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </Reveal>
            ))}
          </div>
        </>
      )}

      {toast && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="seller-floating-toast"
        >
          {toast}
        </motion.div>
      )}

      <style>{`
        .seller-store-page {
          max-width: 1240px;
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
          padding-bottom: 60px;
        }
        .seller-back-link {
          color: var(--primary);
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          text-decoration: none;
          font-size: 15px;
          padding: 8px 12px 8px 0;
          transition: transform 0.2s;
        }
        .seller-back-link:hover {
          transform: translateX(-3px);
        }
        .seller-hero-card {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 36px;
          padding: 32px !important;
          border-radius: 20px;
        }
        .seller-hero-avatar {
          width: 80px;
          height: 80px;
          background: var(--primary);
          color: #fff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 900;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(255,122,0,0.25);
        }
        .seller-hero-info {
          flex: 1;
          min-width: 0;
        }
        .seller-hero-name {
          font-size: clamp(22px, 3.5vw, 32px);
          font-weight: 900;
          margin-bottom: 6px;
          color: var(--secondary);
          line-height: 1.2;
          overflow-wrap: anywhere;
        }
        .seller-hero-loc {
          font-size: 15px;
          color: var(--text-muted);
          margin-bottom: 10px;
          font-weight: 600;
        }
        .seller-hero-desc {
          color: var(--text-main);
          line-height: 1.6;
          margin: 0;
          font-size: 15px;
        }
        .seller-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .seller-empty-card {
          text-align: center;
          padding: 60px 24px !important;
          border-radius: 20px;
        }
        .seller-floating-toast {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: rgba(15,23,42,0.96);
          color: #fff;
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 640px) {
          .seller-store-page {
            padding-left: 14px;
            padding-right: 14px;
            padding-top: 76px !important;
          }
          .seller-hero-card {
            padding: 20px 16px !important;
            gap: 16px;
            margin-bottom: 24px;
          }
          .seller-hero-avatar {
            width: 58px;
            height: 58px;
            border-radius: 14px;
            font-size: 26px;
          }
          .seller-hero-name {
            font-size: 20px;
          }
          .seller-hero-loc {
            font-size: 13px;
            margin-bottom: 8px;
          }
          .seller-hero-desc {
            font-size: 13px;
          }
          .seller-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .seller-floating-toast {
            bottom: 20px;
            left: 16px;
            right: 16px;
            text-align: center;
            padding: 12px 20px;
            font-size: 13px;
          }
        }

        @media (max-width: 360px) {
          .seller-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
