import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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

// ── Ethiopian Delivery Services ──────────────────────────────────────────────

const DELIVERY_OPTIONS = [
  {
    id: 'yango_motor',
    name: 'Yango Motor',
    icon: '🛵',
    descKey: 'coYangoDesc',
    color: '#FFCC00',
  },
  {
    id: 'ride',
    name: 'Ride',
    icon: '🏍️',
    descKey: 'coRideDesc',
    color: '#2563EB',
  },
  {
    id: 'glovo',
    name: 'Glovo',
    icon: '🟡',
    descKey: 'coGlovoDesc',
    color: '#FFC244',
  },
  {
    id: 'lalamove',
    name: 'Lalamove',
    icon: '🚐',
    descKey: 'coLalamoveDesc',
    color: '#FF6600',
  },
  {
    id: 'local_courier',
    labelKey: 'coOtherCourier',
    icon: '📦',
    descKey: 'coOtherCourierDesc',
    color: '#7C3AED',
  },
  {
    id: 'none',
    labelKey: 'coPickup',
    icon: '🏠',
    descKey: 'coPickupDesc',
    color: '#64748B',
  },
];

const BANK_LABELS = {
  cbe: 'Commercial Bank of Ethiopia (CBE)',
  awash: 'Awash Bank',
  dashen: 'Dashen Bank',
  abyssinia: 'Bank of Abyssinia',
  telebirr: 'Telebirr',
};

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'delivery', labelKey: 'coDelivery', icon: '🚚' },
  { id: 'payment',  labelKey: 'coPayment',  icon: '💳' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { seller_id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();

  const deliveryLabel = (opt) => {
    if (!opt) return '';
    return opt.labelKey ? t[opt.labelKey] : opt.name;
  };

  const buyerToken = localStorage.getItem('buyerToken');
  const userToken  = localStorage.getItem('userToken');
  const token      = buyerToken || userToken;

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/bazaar/checkout/' + seller_id);
    }
  }, [token, navigate, seller_id]);

  const [items] = useState(() => loadCart(seller_id));
  useEffect(() => {
    if (items.length === 0) navigate('/bazaar');
  }, [items, navigate]);

  // Step state
  const [step, setStep] = useState('delivery'); // 'delivery' | 'payment'

  // Delivery
  const [selectedDelivery, setSelectedDelivery] = useState('');

  // Payment
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [proofType, setProofType] = useState('screenshot');
  const [proofFile, setProofFile] = useState(null);
  const [proofRef, setProofRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!seller_id) return;
    API.get('/bazaar/sellers/' + seller_id + '/banks')
      .then(r => setBanks(r.data || []))
      .catch(() => setBanks([]));
  }, [seller_id]);

  const cartTotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleDeliveryContinue = (e) => {
    e.preventDefault();
    if (!selectedDelivery) { setError(t.coSelectDelivery); return; }
    setError('');
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedBank) { setError(t.selectBank); return; }
    if (proofType === 'screenshot' && !proofFile) { setError(t.uploadScreenshot); return; }
    if (proofType === 'reference' && !proofRef.trim()) { setError(t.enterReference); return; }

    setSubmitting(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const itemsPayload = items.map(item => ({ product_id: item.product_id, quantity: item.quantity, unit_price: item.price }));

      let response;
      if (proofType === 'screenshot') {
        const formData = new FormData();
        formData.append('seller_id', seller_id);
        formData.append('items', JSON.stringify(itemsPayload));
        formData.append('payment_method', selectedBank);
        formData.append('delivery_method', selectedDelivery);
        formData.append('proof_type', 'screenshot');
        formData.append('file', proofFile);
        response = await fetch(apiBase + '/bazaar/orders', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
      } else {
        response = await fetch(apiBase + '/bazaar/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({
            seller_id, items: itemsPayload,
            payment_method: selectedBank,
            delivery_method: selectedDelivery,
            proof_type: 'reference', proof_value: proofRef.trim(),
          }),
        });
      }

      const data = await response.json();
      if (response.status === 201) {
        const cartKey = getCartKey(seller_id);
        if (cartKey) localStorage.removeItem(cartKey);
        setSuccess(data.order_id || data.id);
      } else {
        setError(data.message || t.outOfStockError);
      }
    } catch {
      setError(t.outOfStockError);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
    <div className="page checkout-page" style={{ paddingTop: 100 }}>
        <div className="hero-gradient" style={{ height: '40vh' }} />
        <Reveal>
          <div className="creative-card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '48px 40px' }}>
            <div style={{ width: 80, height: 80, background: '#22c55e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{t.coSuccessTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 8 }}>{t.coOrderId} <strong>#{success}</strong></p>
            {selectedDelivery !== 'none' && (
              <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>
                {t.coDeliveryVia} <strong style={{ color: 'var(--primary)' }}>{deliveryLabel(DELIVERY_OPTIONS.find(d => d.id === selectedDelivery))}</strong>
              </p>
            )}
            <Link to="/bazaar" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t.coBackToBazaar}</Link>
          </div>
        </Reveal>
      </div>
    );
  }

  // ── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ paddingTop: 100 }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />
      <TibebPattern />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Reveal>
          <Link to={`/bazaar/wishlist/${seller_id}`} style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>← {t.cartTitle}</Link>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 24 }}>{t.checkoutTitle}</h1>
        </Reveal>

        {/* ── Step Indicator ── */}
        <Reveal delay={0.05}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, gap: 0 }}>
            {STEPS.map((s, idx) => {
              const isActive   = s.id === step;
              const isDone     = (step === 'payment' && s.id === 'delivery');
              return (
                <React.Fragment key={s.id}>
                  <div
                    onClick={() => isDone && setStep(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      cursor: isDone ? 'pointer' : 'default',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: isDone ? '#22c55e' : isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: (isDone || isActive) ? '#fff' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: isDone ? 16 : 18,
                      transition: 'all 0.3s',
                      boxShadow: isActive ? '0 8px 20px rgba(255,122,0,0.25)' : 'none',
                    }}>
                      {isDone ? '✓' : s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: isActive ? 'var(--secondary)' : isDone ? '#22c55e' : 'var(--text-muted)' }}>{t[s.labelKey]}</div>
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: '0 16px',
                      background: isDone ? '#22c55e' : 'var(--bg-subtle)',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Reveal>

        {/* ── Order Summary (always visible) ── */}
        <Reveal delay={0.1}>
          <div className="creative-card" style={{ marginBottom: 28 }}>
            <h2 style={sectionTitleStyle}>{t.coOrderSummary}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>{item.name}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{t.coQty} {item.quantity} × ETB {Number(item.price).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>ETB {(Number(item.price) * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTop: '2px solid var(--bg-subtle)' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-muted)' }}>{t.coTotal}</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>ETB {cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </Reveal>

        {/* ── STEP 1: Delivery Selection ── */}
        <AnimatePresence mode="wait">
          {step === 'delivery' && (
            <motion.form
              key="delivery-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleDeliveryContinue}
              style={{ display: 'grid', gap: 24 }}
            >
              <div className="creative-card">
                <h2 style={sectionTitleStyle}>🚚 {t.coChooseDelivery}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 24 }}>
                  {t.coDeliveryIntro}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {DELIVERY_OPTIONS.map(opt => {
                    const isSelected = selectedDelivery === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSelectedDelivery(opt.id); setError(''); }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
                          border: isSelected ? `2px solid var(--primary)` : '2px solid transparent',
                          background: isSelected ? 'rgba(255, 122, 0, 0.05)' : 'var(--bg-subtle)',
                          transition: 'all 0.2s', textAlign: 'left',
                          boxShadow: isSelected ? '0 8px 25px rgba(255,122,0,0.1)' : 'none',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.border = '2px solid rgba(255,122,0,0.2)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.border = '2px solid transparent'; }}
                      >
                        {/* Icon + selected check */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                          <span style={{ fontSize: 28 }}>{opt.icon}</span>
                          {isSelected && (
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'var(--primary)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 17, fontWeight: 900,
                            }}>✓</div>
                          )}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)', marginBottom: 4 }}>{deliveryLabel(opt)}</div>
                        <div style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t[opt.descKey]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '20px 0', fontSize: 18 }}>
                {t.coContinuePayment}
              </button>
            </motion.form>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 'payment' && (
            <motion.form
              key="payment-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleSubmit}
              style={{ display: 'grid', gap: 28 }}
            >
              {/* Selected delivery summary */}
              {selectedDelivery && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 14, padding: '14px 20px',
                }}>
                  <span style={{ fontSize: 24 }}>{DELIVERY_OPTIONS.find(d => d.id === selectedDelivery)?.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.coDeliveryMethod}</div>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{DELIVERY_OPTIONS.find(d => d.id === selectedDelivery)?.name}</div>
                  </div>
                  <button type="button" onClick={() => setStep('delivery')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
                    {t.coChange}
                  </button>
                </div>
              )}

              {/* Bank selection */}
              <div className="creative-card">
                <h2 style={sectionTitleStyle}>{t.selectBank}</h2>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} style={selectStyle}>
                  <option value="">— {t.selectBank} —</option>
                  {banks.map(b => (
                    <option key={b.bank} value={b.bank}>{BANK_LABELS[b.bank] || b.bank}</option>
                  ))}
                </select>
                {selectedBank && (
                  <div style={{ marginTop: 20, background: 'var(--bg-subtle)', padding: 20, borderRadius: 16 }}>
                    <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>{t.coTransferTo}</p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--secondary)', margin: 0 }}>{banks.find(b => b.bank === selectedBank)?.account_number}</p>
                    <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 4 }}>{banks.find(b => b.bank === selectedBank)?.account_name}</p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              <div className="creative-card">
                <h2 style={sectionTitleStyle}>{t.coPaymentProof}</h2>
                <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                  {['screenshot', 'reference'].map(type => (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 17, color: proofType === type ? 'var(--primary)' : 'var(--text-muted)' }}>
                      <input type="radio" checked={proofType === type} onChange={() => setProofType(type)} style={{ accentColor: 'var(--primary)' }} />
                      {type === 'screenshot' ? t.uploadScreenshot : t.enterReference}
                    </label>
                  ))}
                </div>
                {proofType === 'screenshot' ? (
                  <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} style={fileInputStyle} />
                ) : (
                  <input type="text" value={proofRef} onChange={e => setProofRef(e.target.value)} placeholder={t.enterReference} style={inputStyle} />
                )}
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '20px 0', fontSize: 18 }}>
                {submitting ? t.submitting : t.placeOrder}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .page.checkout-page { padding-top: 76px !important; }
          .checkout-page [style*="gap: 24"][style*="margin-bottom: 24"] { flex-wrap: wrap !important; gap: 16px !important; }
          .checkout-page [style*="width: 40"][style*="height: 40"][style*="border-radius: 50%"] { width: 34px !important; height: 34px !important; font-size: 15px !important; }
          .checkout-page [style*="margin: 0 16px"] { margin: 0 8px !important; }
        }
        @media (max-width: 480px) {
          .checkout-page [style*="font-size: 13"][style*="font-weight: 800"] { display: none; }
          .checkout-page [style*="font-size: 28"][style*="font-weight: 900"] { font-size: 22px !important; }
        }
      `}</style>
    </div>
  );
}

const sectionTitleStyle = { fontSize: 20, fontWeight: 900, color: 'var(--secondary)', marginBottom: 20, marginTop: 0 };
const selectStyle = { width: '100%', padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, cursor: 'pointer', outline: 'none' };
const inputStyle = { width: '100%', padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' };
const fileInputStyle = { width: '100%', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1px dashed rgba(0,0,0,0.1)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' };
const errorStyle = { background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600 };
