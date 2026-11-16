import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../LangContext';
import { getCartKey } from '../../pages/bazaar/cartUtils';
import { parseColors } from '../../constants';

export default function ProductCard({ product, onAddToCart, viewMode = 'grid', showTrending = false }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const { name, price, category, subcategory, seller_name, seller_id, seller_location, stock_quantity, photos = [], description, is_package, package_items, order_count, discount_price } = product;

  const outOfStock = Number(stock_quantity) === 0;
  const lowStock = !outOfStock && Number(stock_quantity) <= 5;
  const photoUrl = photos[imgIndex]?.url || photos[0]?.url;
  const dots = parseColors(product.colors);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const token = localStorage.getItem('buyerToken') || localStorage.getItem('userToken');
    if (!token) { setShowLoginPrompt(true); return; }
    // Only confirm visually when the page actually persisted the item; a
    // stale token without a profile makes the handler bail with a sign-in toast.
    const added = !onAddToCart || onAddToCart(product) !== false;
    if (!added) return;
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const isListMode = viewMode === 'list';

  return (
    <>
      {showLoginPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}
          onClick={() => setShowLoginPrompt(false)}>
          <div className="creative-card" style={{ padding: '48px 32px', maxWidth: 400, width: '100%', textAlign: 'center', border: 'none' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🔐</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{t.signInRequired}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
              {t.wishlistLoginDesc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t.signIn}</button>
              <button onClick={() => navigate('/register/buyer')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>{t.registerAsBuyer}</button>
              <button onClick={() => setShowLoginPrompt(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 17, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      <Link to={`/bazaar/product/${product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setImgIndex(0); }}>
        <div className="jiji-card" style={{
          display: 'flex', flexDirection: isListMode ? 'row' : 'column', height: '100%',
          overflow: 'hidden', borderRadius: 8, background: 'var(--bg-main)',
          border: '1px solid rgba(0,0,0,0.08)', transition: 'box-shadow 0.2s',
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        }}>

          {/* Image — aspect ratio 4/3 on grid */}
          <div style={{ position: 'relative', flexShrink: 0, width: isListMode ? 220 : '100%', overflow: 'hidden' }}>
            <div style={{ paddingBottom: isListMode ? 0 : '75%', position: 'relative', height: isListMode ? '100%' : undefined }}>
              {photoUrl ? (
                <img src={photoUrl} alt={name} style={{
                  width: '100%', height: isListMode ? '100%' : '100%', objectFit: 'cover',
                  position: isListMode ? 'relative' : 'absolute', top: 0, left: 0,
                  opacity: outOfStock ? 0.4 : 1,
                  transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                  transform: hovered ? 'scale(1.04)' : 'scale(1)',
                }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#D1D5DB' }}>📦</div>
              )}
            </div>

            {/* Badges — top-left */}
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
              {showTrending && order_count > 0 && (
                <span style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                  🔥 {t.cardSold(order_count)}
                </span>
              )}
              {Number(is_package) === 1 && (
                <span style={{ background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>📦 {t.cardBundle}</span>
              )}
              {discount_price && Number(discount_price) < Number(price) && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                  -{Math.round((1 - Number(discount_price) / Number(price)) * 100)}%
                </span>
              )}
            </div>

            {/* Photo count — bottom-right */}
            {photos.length > 1 && (
              <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, backdropFilter: 'blur(4px)', zIndex: 2 }}>
                📷 {photos.length}
              </span>
            )}

            {outOfStock && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', zIndex: 3 }} />
                <div className="sold-out-ribbon">{t.soldOut}</div>
              </>
            )}
            {lowStock && (
              <span style={{ position: 'absolute', top: 8, right: 8, background: '#f59e0b', color: '#fff', fontWeight: 800, fontSize: 10, padding: '3px 8px', borderRadius: 4, zIndex: 2 }}>
                {t.cardOnlyLeft(stock_quantity)}
              </span>
            )}
          </div>

          {/* Body — price first, then title, then meta */}
          <div style={{ padding: isListMode ? '14px 16px' : '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
            {/* Price — prominent */}
            <div style={{ fontWeight: 900, fontSize: isListMode ? 18 : 16, color: discount_price ? '#ef4444' : 'var(--secondary)', lineHeight: 1.2 }}>
              {discount_price && Number(discount_price) < Number(price) ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: 16, fontWeight: 600, marginRight: 6 }}>ETB {Number(price).toLocaleString()}</span>
                  ETB {Number(discount_price).toLocaleString()}
                </>
              ) : (
                <>ETB {Number(price).toLocaleString()}</>
              )}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: isListMode ? 14 : 13, fontWeight: 700, color: 'var(--secondary)', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {name}
              {Number(is_package) === 1 && <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', marginLeft: 4 }}>{t.bundle}</span>}
            </h3>

            {/* Color dots */}
            {dots.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }} title={t.cardColorsTitle(dots.length > 5 ? t.cardColorsCount(dots.length) : dots.map(d => d.all ? t.pdAllColors : d.name).join(', '))}>
                {dots.map((d, i) =>
                  d.all ? (
                    <span key={i} title={t.cardAllColorsTitle}
                      style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.12)', background: 'conic-gradient(#EF4444,#EAB308,#22C55E,#3B82F6,#8B5CF6,#EF4444)', flexShrink: 0 }} />
                  ) : (
                    <span key={i} title={d.name}
                      style={{ width: 14, height: 14, borderRadius: '50%', background: d.hex || '#e5e7eb', border: `1px solid ${d.hex === '#FFFFFF' || d.hex === '#EDE0C8' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.12)'}`, flexShrink: 0 }} />
                  )
                )}
                {dots.length > 5 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)' }}>+{dots.length - 5}</span>}
              </div>
            )}

            {/* Subcategory */}
            {subcategory && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: 6, alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {subcategory}
              </span>
            )}

            {/* Package items */}
            {Number(is_package) === 1 && package_items && (
              <div style={{ fontSize: 10, color: 'var(--text-light)', lineHeight: 1.4 }}>
                {(() => {
                  try {
                    const items = typeof package_items === 'string' ? JSON.parse(package_items) : package_items;
                    return items.map((item, i) => <span key={i}>{item.quantity}x {item.name}{i < items.length - 1 ? ', ' : ''}</span>);
                  } catch { return null; }
                })()}
              </div>
            )}

            {/* List description */}
            {isListMode && description && (
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {description.slice(0, 120)}{description.length > 120 ? '…' : ''}
              </p>
            )}

            {/* Likes & views */}
            {(Number(product.likes) > 0 || Number(product.views) > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, color: 'var(--text-light)', fontWeight: 700 }}>
                {Number(product.likes) > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {Number(product.likes)}
                  </span>
                )}
                {Number(product.views) > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {Number(product.views)}
                  </span>
                )}
              </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Seller + location row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid rgba(127,127,127,0.25)', paddingTop: 8, marginTop: 4 }}>
              <Link to={`/bazaar/seller/${seller_id}`} onClick={e => e.stopPropagation()}
                style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                🏪 {seller_name}
              </Link>
              {seller_location && (
                <span style={{ fontSize: 16, color: 'var(--text-light)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  📍 {seller_location}
                </span>
              )}
            </div>

            {/* Add to cart */}
            <button onClick={handleAddToCart} disabled={outOfStock}
              style={{
                width: '100%', padding: isListMode ? '10px 0' : '8px 0', borderRadius: 6, border: 'none',
                background: outOfStock ? '#F3F4F6' : addedFeedback ? '#22c55e' : '#FF6B00',
                color: outOfStock ? '#9CA3AF' : '#fff', fontWeight: 800, fontSize: 17,
                cursor: outOfStock ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}>
              {outOfStock ? t.outOfStock : addedFeedback ? `✓ ${t.added}` : t.addToCart}
            </button>
          </div>
        </div>
      </Link>
    </>
  );
}
