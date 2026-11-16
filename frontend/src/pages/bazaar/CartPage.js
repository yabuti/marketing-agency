import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../../api';
import { useLang } from '../../LangContext';
import { getCartKey } from './cartUtils';

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

function loadCart(sellerId) {
  const key = getCartKey(sellerId);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function saveCart(sellerId, cart) {
  const key = getCartKey(sellerId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(cart));
}

function getToken() {
  return localStorage.getItem('buyerToken') || localStorage.getItem('userToken') || null;
}

export default function CartPage() {
  const { seller_id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const [items, setItems] = useState(() => loadCart(seller_id));
  const [sellerContact, setSellerContact] = useState(null);
  const token = getToken();
  const sellerName = items.length > 0 ? items[0].seller_name : null;
  const cartTotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  useEffect(() => {
    if (!seller_id) return;
    API.get('/bazaar/sellers/' + seller_id)
      .then(r => setSellerContact(r.data))
      .catch(() => setSellerContact(null));
  }, [seller_id]);

  const handleQuantityChange = (productId, rawValue) => {
    const qty = Math.max(1, parseInt(rawValue, 10) || 1);
    const updated = items.map(item => item.product_id === productId ? { ...item, quantity: qty } : item);
    setItems(updated);
    saveCart(seller_id, updated);
  };

  const handleRemove = (productId) => {
    const updated = items.filter(item => item.product_id !== productId);
    setItems(updated);
    saveCart(seller_id, updated);
  };

  const handleProceed = () => {
    if (!token) {
      navigate('/login', { state: { from: `/bazaar/wishlist/${seller_id}` } });
      return;
    }
    navigate(`/bazaar/checkout/${seller_id}`);
  };

  if (items.length === 0) {
    return (
      <div className="page cart-page" style={{ paddingTop: 100 }}>
        <div className="hero-gradient" style={{ height: '30vh' }} />
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <div className="creative-card" style={{ textAlign: 'center', padding: '64px 40px' }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>❤️</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{t.cartEmptyTitle}</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t.cartEmptyDesc}</p>
              <Link to="/bazaar" className="btn-primary" style={{ display: 'inline-flex' }}>{t.cartBrowse}</Link>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page" style={{ paddingTop: 100 }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />
      <TibebPattern />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Reveal>
          <Link to="/bazaar" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>{t.cartBack}</Link>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 8 }}>{t.cartTitle}</h1>
          {sellerName && <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>{t.cartStore} <strong style={{ color: 'var(--secondary)' }}>{sellerName}</strong></p>}
          {sellerContact && (sellerContact.phone || sellerContact.telegram) && (
            <div className="creative-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '14px 18px', marginBottom: 40 }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--secondary)' }}>📞 {t.sellerContactTitle}</span>
              {sellerContact.phone && (
                <a href={`tel:${sellerContact.phone}`} style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)', textDecoration: 'none' }}>{sellerContact.phone}</a>
              )}
              {sellerContact.telegram && (
                <a href={`https://t.me/${String(sellerContact.telegram).replace(/^@/, '')}`} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)', textDecoration: 'none' }}>
                  ✈️ {t.sellerContactTelegram}
                </a>
              )}
            </div>
          )}
        </Reveal>

        <div style={{ display: 'grid', gap: 32 }}>
          {/* Cart Items */}
          <Reveal delay={0.1}>
            <div className="creative-card">
              <h2 style={sectionTitleStyle}>
                {t.cartItems}
                <span style={{ marginLeft: 10, background: 'var(--primary)', color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 17, fontWeight: 800, verticalAlign: 'middle' }}>
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map(item => (
                  <div key={item.product_id} className="cart-item">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} className="cart-item-img" />
                    ) : (
                      <div className="cart-item-img" style={{ background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📦</div>
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-unit">{t.cartUnit} <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ETB {Number(item.price).toLocaleString()}</span></div>
                      <div className="cart-item-controls">
                        <div className="cart-item-qty">
                          <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.product_id, (item.quantity || 1) - 1)} aria-label={t.cartDecrease}>−</button>
                          <input type="number" min="1" value={item.quantity} onChange={e => handleQuantityChange(item.product_id, e.target.value)} />
                          <button type="button" className="qty-btn" onClick={() => handleQuantityChange(item.product_id, (item.quantity || 1) + 1)} aria-label={t.cartIncrease}>+</button>
                        </div>
                        <div className="cart-item-total">ETB {(Number(item.price) * item.quantity).toLocaleString()}</div>
                        <button type="button" className="cart-item-remove" onClick={() => handleRemove(item.product_id)} aria-label={t.cartRemoveItem}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 24, borderTop: '2px solid var(--bg-subtle)', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-muted)' }}>{t.cartTotal}</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>ETB {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <button
              onClick={handleProceed}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '20px 0', fontSize: 18 }}
            >
              {t.proceedToCheckout} — ETB {cartTotal.toLocaleString()}
            </button>
          </Reveal>
        </div>
      </div>

      <style>{`
        .cart-page .cart-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .cart-page .cart-item-img {
          width: 84px;
          height: 84px;
          object-fit: cover;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .cart-page .cart-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .cart-page .cart-item-name {
          font-weight: 800;
          color: var(--secondary);
          font-size: 16px;
          line-height: 1.3;
        }
        .cart-page .cart-item-unit {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 3px;
        }
        .cart-page .cart-item-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .cart-page .cart-item-qty {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 10px;
          overflow: hidden;
        }
        .cart-page .cart-item-qty .qty-btn {
          width: 34px;
          height: 36px;
          background: var(--bg-subtle);
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 800;
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .cart-page .cart-item-qty .qty-btn:hover { background: rgba(255,122,0,0.12); color: var(--primary); }
        .cart-page .cart-item-qty input {
          width: 48px;
          padding: 0;
          height: 36px;
          border: none;
          border-left: 1px solid rgba(0,0,0,0.06);
          border-right: 1px solid rgba(0,0,0,0.06);
          text-align: center;
          font-weight: 800;
          font-size: 14px;
          color: var(--secondary);
          outline: none;
          -moz-appearance: textfield;
          appearance: textfield;
          background: var(--bg-main);
        }
        .cart-page .cart-item-qty input::-webkit-outer-spin-button,
        .cart-page .cart-item-qty input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .cart-page .cart-item-total {
          color: var(--secondary);
          font-weight: 900;
          font-size: 16px;
          white-space: nowrap;
        }
        .cart-page .cart-item-remove {
          background: none;
          border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444;
          border-radius: 10px;
          width: 34px;
          height: 34px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-page .cart-item-remove:hover { background: rgba(239,68,68,0.1); }

        @media (max-width: 640px) {
          .page.cart-page { padding-top: 76px !important; }
          .cart-page .cart-item-img { width: 64px !important; height: 64px !important; border-radius: 12px !important; }
          .cart-page .cart-item-name { font-size: 14px !important; }
          .cart-page .cart-item-controls { flex-wrap: nowrap !important; gap: 8px !important; }
          .cart-page .cart-item-qty .qty-btn { width: 30px !important; height: 32px !important; }
          .cart-page .cart-item-qty input { width: 40px !important; height: 32px !important; }
          .cart-page .cart-item-total { font-size: 14px !important; }
          .cart-page .creative-card { padding: 20px 14px !important; }
        }
        @media (max-width: 400px) {
          .cart-page .cart-item { gap: 10px !important; }
          .cart-page .cart-item-img { width: 52px !important; height: 52px !important; }
          .cart-page .cart-item-controls { flex-wrap: wrap !important; }
          .cart-page .cart-item-total { order: 1; }
          .cart-page .cart-item-remove { order: 2; }
        }
      `}</style>
    </div>
  );
}

const sectionTitleStyle = { fontSize: 20, fontWeight: 900, color: 'var(--secondary)', marginBottom: 24, marginTop: 0 };
