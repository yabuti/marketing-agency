import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../../api';
import { useLang } from '../../LangContext';
import ChatWindow from '../../components/ChatWindow';
import { parseColors, categoryDisplayName } from '../../constants';
import { addToCart, getCartKey } from './cartUtils';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
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

const LENS_W = 170;
const LENS_H = 130;
const LENS_ZOOM = 2.5;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showChat, setShowChat] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  
  // Desktop hover magnifier
  const [zoom, setZoom] = useState(null);
  const imgRef = useRef(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [liked, setLiked] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('bazaar_liked_products')) || []).includes(Number(id)); } catch { return false; }
  });
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    API.get('/bazaar/products/' + id)
      .then(r => {
        setProduct(r.data);
        setViewCount(Number(r.data.views) || 0);
        setLikeCount(Number(r.data.likes) || 0);
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(c => Math.max(0, c + (next ? 1 : -1)));
    try {
      const ids = JSON.parse(localStorage.getItem('bazaar_liked_products')) || [];
      const filtered = ids.filter(x => x !== Number(id));
      if (next) filtered.push(Number(id));
      localStorage.setItem('bazaar_liked_products', JSON.stringify(filtered));
    } catch { /* ignore */ }
    API.post(`/bazaar/products/${id}/like`, { liked: next })
      .then(r => { if (typeof r.data?.likes === 'number') setLikeCount(r.data.likes); })
      .catch(() => {});
  };

  const handleZoomMove = (e) => {
    // Only zoom on desktop devices with hover support
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    const W = box.width, H = box.height;
    const mx = e.clientX - box.left, my = e.clientY - box.top;
    const src = photos[activePhoto]?.url;
    if (!src) { setZoom(null); return; }
    const el = imgRef.current;
    const nw = (el && el.naturalWidth) || W;
    const nh = (el && el.naturalHeight) || H;
    const fit = Math.min(W / nw, H / nh);
    const dw = nw * fit, dh = nh * fit;
    const offX = (W - dw) / 2, offY = (H - dh) / 2;
    const lw = Math.min(LENS_W, W), lh = Math.min(LENS_H, H);
    const lensX = Math.max(0, Math.min(W - lw - 14, mx - lw / 2));
    const lensY = Math.max(0, Math.min(H - lh - 14, my - lh / 2));
    setZoom({
      src, lensX, lensY, w: lw, h: lh,
      bgW: dw * LENS_ZOOM,
      bgH: dh * LENS_ZOOM,
      bgX: lw / 2 - (lensX + lw / 2 - offX) * LENS_ZOOM,
      bgY: lh / 2 - (lensY + lh / 2 - offY) * LENS_ZOOM,
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (!lightbox) return;
    const photos = product?.photos || [];
    if (e.key === 'ArrowRight') setActivePhoto(p => (p + 1) % photos.length);
    if (e.key === 'ArrowLeft') setActivePhoto(p => (p - 1 + photos.length) % photos.length);
    if (e.key === 'Escape') setLightbox(false);
  }, [lightbox, product]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('buyerToken') || localStorage.getItem('userToken');
    if (!token) { setShowLoginPrompt(true); return; }

    const prod = product;
    const key = getCartKey(prod.seller_id);
    if (!key) { setShowLoginPrompt(true); return; }

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(key)) || []; } catch { cart = []; }
    if (!Array.isArray(cart)) cart = [];
    cart = addToCart(cart, prod, quantity);
    localStorage.setItem(key, JSON.stringify(cart));
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
    showToast(`${quantity} × ${prod.name} ${t.pdWishlistToast}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t.pdLinkCopied);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--primary)', fontWeight: 700 }}>
        {t.loading}
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="page product-detail-page">
        <div className="hero-gradient" style={{ height: '25vh' }} />
        <Link to="/bazaar" style={{ color: 'var(--primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14 }}>
          ← {t.backToBazaar}
        </Link>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t.pdNotFound}</p>
          <Link to="/bazaar" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>
            {t.pdBrowseBazaar} →
          </Link>
        </div>
      </div>
    );
  }

  const photos = product.photos || [];
  const outOfStock = Number(product.stock_quantity) === 0;
  const lowStock = !outOfStock && Number(product.stock_quantity) <= 5;
  const maxQty = Math.min(Number(product.stock_quantity) || 1, 20);
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const displayPrice = hasDiscount ? Number(product.discount_price) : Number(product.price);

  return (
    <div className="page product-detail-page">
      <div className="hero-gradient" style={{ height: '25vh' }} />
      <TibebPattern />

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="creative-card"
            style={{ padding: '36px 24px', maxWidth: 400, width: '100%', textAlign: 'center', border: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{t.pdSignInTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{t.pdSignInDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {t.pdSignInCta}
              </button>
              <button onClick={() => navigate('/register/buyer')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                {t.pdRegisterBuyer}
              </button>
              <button onClick={() => setShowLoginPrompt(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 6 }}>
                {t.pdCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      {lightbox && photos.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 20 }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 20, right: 20, background: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer', zIndex: 1, fontWeight: 700 }}
          >
            ✕
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={photos[activePhoto]?.url}
            alt={product.name}
            style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 40px 90px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="pd-breadcrumb">
        <Link to="/bazaar">{t.bazaarTitle}</Link>
        <span>›</span>
        <Link to={`/bazaar/seller/${product.seller_id}`}>{product.seller_name}</Link>
        <span>›</span>
        <span className="pd-breadcrumb-current">{product.name}</span>
      </nav>

      {/* Main 2-Column or Mobile Stack */}
      <div className="pd-grid">
        {/* Left Column: Gallery */}
        <Reveal>
          <div className="pd-gallery-wrap">
            <div
              className="creative-card pd-main-img-card"
              onClick={() => photos.length > 0 && setLightbox(true)}
              onMouseMove={photos.length > 0 ? handleZoomMove : undefined}
              onMouseLeave={() => setZoom(null)}
            >
              {photos.length > 0 ? (
                <img
                  ref={imgRef}
                  src={photos[activePhoto]?.url}
                  alt={product.name}
                  className="pd-main-img"
                  style={{ opacity: outOfStock ? 0.5 : 1 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-subtle)' }} />
              )}

              {hasDiscount && (
                <div className="pd-discount-badge">
                  {t.pdOffPct(Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100))}
                </div>
              )}

              {outOfStock && (
                <>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)' }} />
                  <div className="sold-out-ribbon">{t.pdSoldOut}</div>
                </>
              )}

              {/* Magnifier lens on desktop */}
              {zoom && (
                <div style={{ position: 'absolute', left: zoom.lensX, top: zoom.lensY, width: zoom.w, height: zoom.h, pointerEvents: 'none', zIndex: 4 }}>
                  <div style={{
                    position: 'absolute', inset: 0, boxSizing: 'border-box', borderRadius: 14,
                    border: '3px solid var(--primary)', overflow: 'hidden',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
                    backgroundImage: `url(${zoom.src})`, backgroundRepeat: 'no-repeat',
                    backgroundSize: `${zoom.bgW}px ${zoom.bgH}px`,
                    backgroundPosition: `${zoom.bgX}px ${zoom.bgY}px`,
                  }} />
                  <div style={{ position: 'absolute', right: -13, bottom: -13, width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-main)', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.2)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
              <div className="pd-thumbs-track">
                {photos.map((ph, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`pd-thumb-btn ${activePhoto === i ? 'active' : ''}`}
                  >
                    <img src={ph.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Right Column: Product Info & Purchase Actions */}
        <div className="pd-info-col">
          <Reveal delay={0.1}>
            {/* Tag & Share row */}
            <div className="pd-meta-row">
              <span className="section-tag" style={{ margin: 0 }}>
                {categoryDisplayName(t, product.category)}
                {product.subcategory && <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 700 }}>› {product.subcategory}</span>}
              </span>
              <button onClick={handleShare} className="btn-outline pd-share-btn">
                <span>↗</span>
                <span>{t.pdShare}</span>
              </button>
            </div>

            {/* Color swatches */}
            {(() => {
              const dots = parseColors(product.colors);
              if (dots.length === 0) return null;
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    {t.pdAvailableColors}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {dots.map((d, i) =>
                      d.all ? (
                        <span key={i} title={t.cardAllColorsTitle} className="pd-color-chip">
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'conic-gradient(#EF4444,#EAB308,#22C55E,#3B82F6,#8B5CF6,#EF4444)', display: 'inline-block', flexShrink: 0 }} />
                          {t.pdAllColors}
                        </span>
                      ) : (
                        <span key={i} title={d.name} className="pd-color-chip">
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: d.hex || '#e5e7eb', border: '1px solid rgba(0,0,0,0.15)', display: 'inline-block', flexShrink: 0 }} />
                          {d.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Title */}
            <h1 className="pd-name">{product.name}</h1>

            {/* Price & Low Stock */}
            <div className="pd-price-row">
              <span className="pd-price">
                {hasDiscount ? (
                  <>
                    <span className="pd-old-price">ETB {Number(product.price).toLocaleString()}</span>
                    <span className="pd-curr-price">ETB {Number(product.discount_price).toLocaleString()}</span>
                  </>
                ) : (
                  <span className="pd-curr-price">ETB {Number(product.price).toLocaleString()}</span>
                )}
              </span>
              {lowStock && (
                <span className="pd-low-stock">
                  🔥 {t.pdOnlyLeft(product.stock_quantity)}
                </span>
              )}
            </div>

            {/* Like and View counters */}
            <div className="pd-social-row">
              <button onClick={toggleLike} className={`pd-social-pill ${liked ? 'liked' : ''}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likeCount} {likeCount === 1 ? t.pdLikeOne : t.pdLikes}
              </button>
              <span className="pd-social-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {viewCount} {viewCount === 1 ? t.pdViewOne : t.pdViews}
              </span>
            </div>

            {/* Description Card */}
            <div className="creative-card pd-desc-card">
              <h3 className="pd-desc-title">{t.pdDescription}</h3>
              <p className="pd-desc-text">{product.description || t.pdNoDescription}</p>
            </div>

            {/* Package contents */}
            {Number(product.is_package) === 1 && product.package_items && (
              <div className="creative-card" style={{ padding: '18px 20px', marginBottom: 20, border: '1px solid rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.03)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  📦 {t.pdWhatsIncluded}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(() => {
                    try {
                      const items = typeof product.package_items === 'string' ? JSON.parse(product.package_items) : product.package_items;
                      return items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6' }}>#{i + 1}</span>
                          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{item.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 10, color: '#8b5cf6' }}>×{item.quantity}</span>
                        </div>
                      ));
                    } catch { return null; }
                  })()}
                </div>
              </div>
            )}
          </Reveal>

          {/* Seller Card (Responsive Layout) */}
          <Reveal delay={0.2}>
            <div className="creative-card pd-seller-card">
              <div className="pd-seller-top">
                <div className="pd-seller-avatar">
                  {product.seller_name?.charAt(0)}
                </div>
                <div className="pd-seller-info">
                  <div className="pd-seller-kicker">{t.pdSoldBy}</div>
                  <Link to={`/bazaar/seller/${product.seller_id}`} className="pd-seller-name">
                    {product.seller_name}
                  </Link>
                  {product.seller_location && (
                    <div className="pd-seller-loc">📍 {product.seller_location}</div>
                  )}
                </div>
              </div>

              {(product.seller_phone || product.seller_telegram) && (
                <div className="pd-seller-contacts">
                  {product.seller_phone && (
                    <a href={`tel:${product.seller_phone}`} className="pd-contact-pill">
                      📞 {product.seller_phone}
                    </a>
                  )}
                  {product.seller_telegram && (
                    <a href={`https://t.me/${String(product.seller_telegram).replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="pd-contact-pill">
                      ✈️ {t.sellerContactTelegram}
                    </a>
                  )}
                </div>
              )}

              <Link to={`/bazaar/seller/${product.seller_id}`} className="btn-outline pd-store-btn">
                {t.pdStore} →
              </Link>
            </div>
          </Reveal>

          {/* Quantity & Subtotal Selector */}
          {!outOfStock && (
            <Reveal delay={0.25}>
              <div className="pd-qty-card">
                <div>
                  <div className="pd-qty-label">{t.pdQuantity}</div>
                  <div className="pd-qty-controls">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="pd-qty-btn">-</button>
                    <span className="pd-qty-num">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} className="pd-qty-btn">+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="pd-qty-label">{t.pdSubtotal}</div>
                  <div className="pd-subtotal-val">ETB {(displayPrice * quantity).toLocaleString()}</div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Action Buttons */}
          <Reveal delay={0.3}>
            <div className="pd-actions-wrap">
              {outOfStock ? (
                <div className="btn-outline pd-disabled-btn">{t.pdSoldOut}</div>
              ) : (
                <button onClick={handleAddToCart} className="btn-primary pd-cart-btn">
                  {addedFeedback ? `✓ ${t.pdAddedToWishlist}` : `${t.pdAddToWishlist} — ETB ${(displayPrice * quantity).toLocaleString()}`}
                </button>
              )}
              <button onClick={() => setShowChat(true)} className="btn-outline pd-chat-btn">
                💬 {t.pdChatWithSeller}
              </button>
            </div>
          </Reveal>

          {/* Quality & Delivery Assurances */}
          <Reveal delay={0.35}>
            <div className="pd-assurances-grid">
              <div className="pd-assurance-item">
                <span className="pd-assurance-icon">🚚</span>
                <div>
                  <div className="pd-assurance-title">{t.pdDeliveryTitle}</div>
                  <div className="pd-assurance-sub">{t.pdDeliveryDesc}</div>
                </div>
              </div>
              <div className="pd-assurance-item">
                <span className="pd-assurance-icon">🛡️</span>
                <div>
                  <div className="pd-assurance-title">{t.pdSecureTitle}</div>
                  <div className="pd-assurance-sub">{t.pdSecureDesc}</div>
                </div>
              </div>
              <div className="pd-assurance-item">
                <span className="pd-assurance-icon">✅</span>
                <div>
                  <div className="pd-assurance-title">{t.pdAuthenticTitle}</div>
                  <div className="pd-assurance-sub">{t.pdAuthenticDesc}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="pd-floating-toast"
        >
          {toast}
        </motion.div>
      )}

      {showChat && (
        <ChatWindow
          sellerId={product.seller_id}
          sellerName={product.seller_name}
          productId={product.id}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* ─── Product Detail Responsive CSS ─── */}
      <style>{`
        .product-detail-page {
          padding-top: 100px;
          max-width: 100%;
          overflow-x: hidden;
        }

        .pd-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 700;
        }

        .pd-breadcrumb a {
          color: var(--primary);
          text-decoration: none;
        }

        .pd-breadcrumb-current {
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        .pd-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 48px;
          align-items: start;
        }

        .pd-gallery-wrap {
          position: sticky;
          top: 120px;
        }

        .pd-main-img-card {
          position: relative;
          padding: 0 !important;
          overflow: hidden;
          cursor: zoom-in;
          aspect-ratio: 1 / 1;
          background: var(--bg-subtle);
          border-radius: 20px !important;
        }

        .pd-main-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .pd-discount-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #ef4444;
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 100px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
          z-index: 2;
        }

        .pd-thumbs-track {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }

        .pd-thumb-btn {
          width: 72px;
          height: 72px;
          border-radius: 14px;
          overflow: hidden;
          padding: 0;
          background: var(--bg-main);
          border: 2px solid rgba(0,0,0,0.06);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s ease;
        }

        .pd-thumb-btn.active {
          border-color: var(--primary);
        }

        .pd-thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pd-info-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pd-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .pd-share-btn {
          padding: 7px 16px !important;
          font-size: 13px !important;
          border-radius: 100px !important;
        }

        .pd-color-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          background: var(--bg-subtle);
          border: 1px solid rgba(127,127,127,0.2);
          font-weight: 700;
          font-size: 13px;
        }

        .pd-name {
          font-size: clamp(20px, 3.5vw, 28px);
          font-weight: 900;
          color: var(--secondary);
          line-height: 1.25;
          margin: 0;
          word-break: break-word;
        }

        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
        }

        .pd-price {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pd-old-price {
          text-decoration: line-through;
          color: var(--text-muted);
          font-size: 18px;
          font-weight: 600;
        }

        .pd-curr-price {
          font-size: 28px;
          font-weight: 900;
          color: var(--primary);
        }

        .pd-low-stock {
          color: #f59e0b;
          font-weight: 800;
          font-size: 13px;
        }

        .pd-social-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pd-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          background: var(--bg-subtle);
          border: 1px solid rgba(127,127,127,0.25);
          color: var(--text-muted);
        }

        .pd-social-pill.liked {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.35);
          color: #ef4444;
        }

        .pd-desc-card {
          padding: 18px 20px !important;
          background: var(--bg-subtle) !important;
          border: none !important;
        }

        .pd-desc-title {
          font-size: 12px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .pd-desc-text {
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.65;
          margin: 0;
        }

        /* Seller Card */
        .pd-seller-card {
          padding: 20px !important;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pd-seller-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pd-seller-avatar {
          width: 50px;
          height: 50px;
          background: var(--primary);
          color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .pd-seller-info {
          flex: 1;
          min-width: 0;
        }

        .pd-seller-kicker {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 800;
          text-transform: uppercase;
        }

        .pd-seller-name {
          font-size: 16px;
          font-weight: 800;
          color: var(--secondary);
          text-decoration: none;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pd-seller-loc {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .pd-seller-contacts {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pd-contact-pill {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          background: var(--bg-subtle);
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .pd-store-btn {
          width: 100% !important;
          justify-content: center;
          padding: 10px 16px !important;
          font-size: 13px !important;
        }

        /* Quantity controls */
        .pd-qty-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--bg-subtle);
          border-radius: 16px;
          gap: 16px;
        }

        .pd-qty-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .pd-qty-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pd-qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: var(--bg-main);
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pd-qty-num {
          font-size: 18px;
          font-weight: 900;
          min-width: 24px;
          text-align: center;
        }

        .pd-subtotal-val {
          font-size: 18px;
          font-weight: 900;
          color: var(--secondary);
        }

        .pd-actions-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pd-cart-btn, .pd-chat-btn, .pd-disabled-btn {
          width: 100% !important;
          justify-content: center;
          padding: 14px 20px !important;
          font-size: 15px !important;
          border-radius: 100px !important;
        }

        .pd-assurances-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .pd-assurance-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 14px 8px;
          background: var(--bg-subtle);
          border-radius: 14px;
          gap: 6px;
        }

        .pd-assurance-icon {
          font-size: 20px;
        }

        .pd-assurance-title {
          font-size: 12px;
          font-weight: 800;
          color: var(--secondary);
        }

        .pd-assurance-sub {
          font-size: 10px;
          color: var(--text-muted);
        }

        .pd-floating-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: rgba(15, 23, 42, 0.95);
          color: #fff;
          padding: 14px 24px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        /* ─── TABLET BREAKPOINT (max-width: 900px) ─── */
        @media (max-width: 900px) {
          .pd-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .pd-gallery-wrap {
            position: static !important;
          }
        }

        /* ─── PHONE BREAKPOINT (max-width: 640px) ─── */
        @media (max-width: 640px) {
          .product-detail-page {
            padding-top: 76px !important;
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .pd-breadcrumb {
            font-size: 12px !important;
            gap: 6px !important;
            margin-bottom: 16px !important;
          }

          .pd-main-img-card {
            border-radius: 16px !important;
          }

          .pd-thumb-btn {
            width: 58px !important;
            height: 58px !important;
            border-radius: 12px !important;
          }

          .pd-name {
            font-size: 20px !important;
          }

          .pd-curr-price {
            font-size: 22px !important;
          }

          .pd-old-price {
            font-size: 15px !important;
          }

          .pd-assurances-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .pd-assurance-item {
            flex-direction: row !important;
            text-align: left !important;
            padding: 10px 14px !important;
            gap: 12px !important;
          }

          .pd-floating-toast {
            left: 16px !important;
            right: 16px !important;
            bottom: 20px !important;
            text-align: center !important;
            padding: 12px 18px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
