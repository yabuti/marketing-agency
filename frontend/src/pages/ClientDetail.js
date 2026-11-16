import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../api';
import { useLang } from '../LangContext';

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

function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) return '+' + digits;
  if (digits.startsWith('0')) return '+251' + digits.slice(1);
  if (digits.length === 9 && (digits.startsWith('9') || digits.startsWith('7'))) return '+251' + digits;
  return phone;
}

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const { t, lang } = useLang();

  const getField = (en, am, or_) => (lang === 'am' && am) ? am : (lang === 'or' && or_) ? or_ : en;

  useEffect(() => {
    API.get(`/clients/${id}`).then(r => setClient(r.data)).catch(() => {});
  }, [id]);

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--primary)', fontWeight: 700 }}>
        {t.loading}
      </div>
    );
  }

  // Up to 3 work samples stored as a JSON column; each entry is a resolved URL.
  const workImages = Array.isArray(client.work_images) ? client.work_images.filter(Boolean) : [];
  const promotionPaths = Array.isArray(client.promotionPaths) ? client.promotionPaths : [];
  const allVideos = Array.isArray(client.videos) ? client.videos : [];

  return (
    <div className="page client-detail-page">
      <div className="hero-gradient" style={{ height: '25vh' }} />

      <Reveal>
        <Link
          to="/clients"
          className="client-back-link"
          style={{
            color: 'var(--primary)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          ← {t.backToClients}
        </Link>

        {/* Client Hero Header */}
        <div className="client-header-card">
          <div className="client-logo-box">
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt={client.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
              />
            ) : (
              <span>{client.icon || '🏢'}</span>
            )}
          </div>
          <div className="client-header-info">
            <h1 className="client-title">{client.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="client-category-badge">
                {getField(client.category, client.category_am, client.category_or)}
              </span>
              {client.location && (
                <span className="client-location-badge">
                  📍 {getField(client.location, client.location_am, client.location_or)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {(client.full_description || client.description) && (
          <p className="client-desc">
            {getField(
              client.full_description || client.description,
              client.full_description_am || client.description_am,
              client.full_description_or || client.description_or
            )}
          </p>
        )}
      </Reveal>

      {/* 4 Key Business Info Cards */}
      <div className="client-cards-4">
        <Reveal delay={0.05}>
          <div className="creative-card info-card">
            <div className="info-card-icon">📅</div>
            <div className="info-card-label">{t.established}</div>
            <div className="info-card-value">{client.established || '—'}</div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="creative-card info-card">
            <div className="info-card-icon">📍</div>
            <div className="info-card-label">{t.location}</div>
            <div className="info-card-value">{client.location || '—'}</div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="creative-card info-card">
            <div className="info-card-icon">🏷️</div>
            <div className="info-card-label">{t.businessTypeLabel}</div>
            <div className="info-card-value">{client.business_type || client.category || '—'}</div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="creative-card info-card verified-card">
            <div className="info-card-icon">🛡️</div>
            <div className="info-card-label">{t.verifiedLicensed}</div>
            <div className="info-card-value verified-val">
              {client.business_license_number
                ? `${t.licenseLabel}: ${client.business_license_number}`
                : 'Verified Enterprise'}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Work Samples (3 Photos Showcase) */}
      {workImages.length > 0 && (
        <Reveal delay={0.25}>
          <div className="creative-card section-card">
            <h3 className="section-title">{t.clientWorkTitle}</h3>
            <div className="work-samples-grid">
              {workImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(url)}
                  className="sample-item"
                >
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Contact & Social Links */}
      {(client.phone || client.facebook || client.instagram || client.tiktok || client.telegram || client.website) && (
        <Reveal delay={0.3}>
          <div className="creative-card section-card">
            <h3 className="section-title">{t.contactSocial}</h3>
            <div className="social-chips-wrap">
              {client.phone && (
                <a href={`tel:${formatPhone(client.phone)}`} className="social-chip chip-phone">
                  <span>📞</span>
                  <span>{formatPhone(client.phone)}</span>
                </a>
              )}
              {client.telegram && (
                <a href={`https://t.me/${String(client.telegram).replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="social-chip chip-telegram">
                  <span>✈️</span>
                  <span>Telegram</span>
                </a>
              )}
              {client.website && (
                <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noreferrer" className="social-chip chip-web">
                  <span>🌐</span>
                  <span>Website</span>
                </a>
              )}
              {client.facebook && (
                <a href={client.facebook} target="_blank" rel="noreferrer" className="social-chip chip-fb">
                  <span>📘</span>
                  <span>Facebook</span>
                </a>
              )}
              {client.instagram && (
                <a href={client.instagram} target="_blank" rel="noreferrer" className="social-chip chip-ig">
                  <span>📸</span>
                  <span>Instagram</span>
                </a>
              )}
              {client.tiktok && (
                <a href={client.tiktok} target="_blank" rel="noreferrer" className="social-chip chip-tt">
                  <span>🎵</span>
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Main Client Marketing Gallery */}
      {client.images?.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <Reveal>
            <h2 className="section-heading">{t.ourMarketingWork}</h2>
          </Reveal>
          <div className="client-gallery-grid">
            {client.images.map((img, i) => (
              <Reveal key={img.id || i} delay={i * 0.04}>
                <div className="creative-card gallery-card" style={{ padding: 0 }}>
                  <div
                    onClick={() => setActiveImg(img.url)}
                    className="gallery-img-box"
                  >
                    <img src={img.url} alt={img.description || ''} />
                  </div>
                  {(img.price || img.description) && (
                    <div className="gallery-caption">
                      {img.price && (
                        <div className="gallery-price">
                          ETB {Number(img.price).toLocaleString()}
                        </div>
                      )}
                      {img.description && (
                        <div className="gallery-desc">
                          {img.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Client Videos (if any) */}
      {allVideos.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <Reveal>
            <h2 className="section-heading">🎬 Video Highlights</h2>
          </Reveal>
          <div className="client-videos-grid">
            {allVideos.map((vid, i) => (
              <div key={vid.id || i} className="creative-card video-card" style={{ padding: 0 }}>
                <video src={vid.url} controls preload="metadata" style={{ width: '100%', borderRadius: 16 }} />
                {vid.description && (
                  <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {vid.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Promotion Campaign Paths (if available) */}
      {promotionPaths.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <Reveal>
            <h2 className="section-heading">🛣️ Promotional Campaigns</h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {promotionPaths.map((path) => (
              <div key={path.id} className="creative-card section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{path.title}</h3>
                  {path.path_date && (
                    <span style={{ fontSize: 12, color: 'var(--primary)', background: 'rgba(255,122,0,0.1)', padding: '4px 12px', borderRadius: 100, fontWeight: 700 }}>
                      📅 {new Date(path.path_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {path.images?.length > 0 && (
                  <div className="client-gallery-grid" style={{ marginBottom: 16 }}>
                    {path.images.map((img, i) => (
                      <div key={img.id || i} onClick={() => setActiveImg(img.url)} className="sample-item" style={{ aspectRatio: '1/1', cursor: 'zoom-in' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Preview */}
      {activeImg && (
        <div
          onClick={() => setActiveImg(null)}
          className="lightbox-overlay"
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={activeImg}
            alt=""
            className="lightbox-img"
          />
          <button
            onClick={() => setActiveImg(null)}
            className="lightbox-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dedicated Scoped CSS for Phone & Tablet responsiveness */}
      <style>{`
        .client-detail-page {
          padding-top: 100px;
          max-width: 100%;
          overflow-x: hidden;
        }

        .client-header-card {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .client-logo-box {
          width: 90px;
          height: 90px;
          background: var(--bg-subtle);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }

        .client-header-info {
          flex: 1;
          min-width: 220px;
        }

        .client-title {
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 900;
          margin-bottom: 8px;
          line-height: 1.2;
          color: var(--secondary);
          word-break: break-word;
        }

        .client-category-badge {
          background: rgba(255, 122, 0, 0.1);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 800;
          display: inline-block;
        }

        .client-location-badge {
          background: var(--bg-subtle);
          color: var(--text-muted);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          display: inline-block;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .client-desc {
          color: var(--text-main);
          line-height: 1.65;
          margin-bottom: 36px;
          max-width: 800px;
          font-size: 16px;
          word-break: break-word;
        }

        /* 4 Info Cards Grid */
        .client-cards-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }

        .info-card {
          padding: 20px 18px !important;
          min-width: 0;
        }

        .info-card-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .info-card-label {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .info-card-value {
          font-weight: 800;
          font-size: 16px;
          margin-top: 4px;
          color: var(--secondary);
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .verified-card {
          border: 1px solid rgba(34, 197, 94, 0.4) !important;
          box-shadow: 0 10px 24px -10px rgba(34, 197, 94, 0.25) !important;
        }

        .verified-val {
          color: #22c55e !important;
          font-size: 14px !important;
        }

        .section-card {
          margin-bottom: 36px;
          padding: 24px !important;
        }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 18px;
          color: var(--secondary);
        }

        .section-heading {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 20px;
          color: var(--secondary);
        }

        .work-samples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }

        .sample-item {
          cursor: zoom-in;
          aspect-ratio: 4 / 3;
          border-radius: 14px;
          overflow: hidden;
          background: var(--bg-subtle);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .sample-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s ease;
        }

        .sample-item:hover img {
          transform: scale(1.04);
        }

        .social-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .social-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 100px;
          background: var(--bg-main);
          border: 1px solid rgba(0,0,0,0.08);
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: transform 0.15s ease;
        }

        .social-chip:hover {
          transform: translateY(-2px);
        }

        .chip-phone { color: #22c55e; }
        .chip-telegram { color: #29A8E0; }
        .chip-web { color: var(--primary); }
        .chip-fb { color: #1877F2; }
        .chip-ig { color: #E1306C; }
        .chip-tt { color: var(--secondary); }

        .client-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .gallery-card {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .gallery-img-box {
          cursor: zoom-in;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--bg-subtle);
        }

        .gallery-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-caption {
          padding: 12px 14px;
        }

        .gallery-price {
          color: var(--primary);
          font-weight: 800;
          font-size: 16px;
        }

        .gallery-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .client-videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Lightbox modal */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          padding: 24px;
        }

        .lightbox-img {
          max-width: 92vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }

        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.9);
          color: #000;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── PHONE SIZE RESPONSIVE OVERRIDES (max-width: 640px) ─── */
        @media (max-width: 640px) {
          .client-detail-page {
            padding-top: 76px !important;
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .client-header-card {
            gap: 14px !important;
            margin-bottom: 20px !important;
          }

          .client-logo-box {
            width: 72px !important;
            height: 72px !important;
            border-radius: 16px !important;
            font-size: 32px !important;
          }

          .client-title {
            font-size: 22px !important;
            margin-bottom: 6px !important;
          }

          .client-category-badge, .client-location-badge {
            font-size: 12px !important;
            padding: 4px 10px !important;
          }

          .client-desc {
            font-size: 14px !important;
            margin-bottom: 24px !important;
            line-height: 1.55 !important;
          }

          /* 2x2 grid for info cards on mobile instead of 1 fat column */
          .client-cards-4 {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            margin-bottom: 24px !important;
          }

          .info-card {
            padding: 14px 12px !important;
            border-radius: 14px !important;
          }

          .info-card-icon {
            font-size: 20px !important;
            margin-bottom: 4px !important;
          }

          .info-card-label {
            font-size: 10px !important;
            letter-spacing: 0.05em !important;
          }

          .info-card-value {
            font-size: 13px !important;
            margin-top: 2px !important;
          }

          .verified-val {
            font-size: 11px !important;
          }

          .section-card {
            padding: 16px 14px !important;
            border-radius: 14px !important;
            margin-bottom: 24px !important;
          }

          .section-title, .section-heading {
            font-size: 16px !important;
            margin-bottom: 14px !important;
          }

          /* 2 clean columns for work samples on mobile */
          .work-samples-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }

          .sample-item {
            border-radius: 10px !important;
          }

          /* Social chips stack neatly on small screens */
          .social-chips-wrap {
            gap: 8px !important;
          }

          .social-chip {
            padding: 8px 14px !important;
            font-size: 12px !important;
            flex: 1 1 calc(50% - 8px);
            justify-content: center;
          }

          /* 2 clean columns for marketing gallery photos on mobile */
          .client-gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }

          .gallery-caption {
            padding: 8px 10px !important;
          }

          .gallery-price {
            font-size: 13px !important;
          }

          .gallery-desc {
            font-size: 11px !important;
          }

          .client-videos-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .lightbox-overlay {
            padding: 12px !important;
          }

          .lightbox-close {
            top: 14px !important;
            right: 14px !important;
            width: 34px !important;
            height: 34px !important;
            font-size: 15px !important;
          }
        }

        @media (max-width: 380px) {
          .client-cards-4 {
            grid-template-columns: 1fr !important;
          }
          .social-chip {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
