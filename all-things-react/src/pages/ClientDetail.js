import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

// Format phone to +251 format
function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) return '+' + digits;
  if (digits.startsWith('0')) return '+251' + digits.slice(1);
  if (digits.length === 9 && (digits.startsWith('9') || digits.startsWith('7'))) return '+251' + digits;
  return phone; // return as-is if unrecognized
}

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const { t, lang } = useLang();

  const getField = (en, am, or_) => (lang === 'am' && am) ? am : (lang === 'or' && or_) ? or_ : en;

  useEffect(() => {
    API.get(`/clients/${id}`).then(r => setClient(r.data));
  }, [id]);

  if (!client) return <div style={{ textAlign: 'center', padding: 80, color: '#a3a3a3' }}>{t.loading}</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(28px, 5vw, 60px) clamp(14px, 4vw, 24px)' }}>
      <Link to="/clients" style={{ color: '#a3a3a3', fontSize: 14 }}>{t.backToClients}</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '32px 0 24px', flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
          {client.icon}
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900 }}>{client.name}</h1>
          <span style={{ background: '#f9731620', color: '#f97316', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
            {getField(client.category, client.category_am, client.category_or)}
          </span>
        </div>
      </div>

      <p style={{ color: '#a3a3a3', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
        {getField(client.full_description, client.full_description_am, client.full_description_or)}
      </p>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          ['📅', t.established, client.established],
          ['📍', t.location, client.location],
          ['🏷️', t.businessTypeLabel, client.business_type],
          ['👥', t.followers, client.followers],
        ].map(([icon, label, val]) => (
          <div key={label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ color: '#a3a3a3', fontSize: 12 }}>{label}</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* License */}
      <div style={{ background: '#171717', border: '2px solid #22c55e40', borderRadius: 16, padding: 20, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✓</div>
        <div>
          <div style={{ color: '#22c55e', fontWeight: 700 }}>{t.verifiedLicensed}</div>
          <div style={{ color: '#a3a3a3', fontSize: 13 }}>{t.licenseLabel}: {client.license_number || '—'}</div>
        </div>
      </div>

      {/* Phone & Social Media */}
      {(client.phone || client.facebook || client.instagram || client.tiktok || client.telegram || client.website) && (
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#f97316' }}>{t.contactSocial}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {client.phone && (
              <a href={`tel:${formatPhone(client.phone)}`} style={contactChip('#22c55e')}>
                📞 {formatPhone(client.phone)}
              </a>
            )}
            {client.facebook && (
              <a href={client.facebook} target="_blank" rel="noreferrer" style={contactChip('#1877F2')}>
                📘 Facebook
              </a>
            )}
            {client.instagram && (
              <a href={client.instagram} target="_blank" rel="noreferrer" style={contactChip('#E1306C')}>
                📸 Instagram
              </a>
            )}
            {client.tiktok && (
              <a href={client.tiktok} target="_blank" rel="noreferrer" style={contactChip('#fff')}>
                🎵 TikTok
              </a>
            )}
            {client.telegram && (
              <a href={client.telegram} target="_blank" rel="noreferrer" style={contactChip('#29A8E0')}>
                ✈️ Telegram
              </a>
            )}
            {client.website && (
              <a href={client.website} target="_blank" rel="noreferrer" style={contactChip('#f97316')}>
                🌐 Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {client.images?.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{t.ourMarketingWork}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {client.images.map(img => (
              <div key={img.id} onClick={() => setActiveImg(img.url)} style={{ cursor: 'zoom-in', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
                <img src={img.url} alt={img.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {client.videos?.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{t.videoContent}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {client.videos.map((v, i) => (
              <div key={v.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, background: '#f9731620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>▶</div>
                <div>
                  <div style={{ color: '#f97316', fontSize: 12, fontWeight: 600 }}>{t.video} {i + 1}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{v.description}</div>
                  <a href={v.url} target="_blank" rel="noreferrer" style={{ color: '#a3a3a3', fontSize: 13 }}>{t.watch}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promotion Paths */}
      {client.promotionPaths?.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>🛣️ Promotion Paths</h2>
          {client.promotionPaths.map(path => (
            <div key={path.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f97316', margin: 0 }}>{path.title}</h3>
                {path.path_date && (
                  <span style={{ color: '#a3a3a3', fontSize: 13, marginTop: 4, display: 'block' }}>
                    📅 {new Date(path.path_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>

              {path.images?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                    {path.images.map(img => (
                      <div key={img.id} onClick={() => setActiveImg(img.url)} style={{ cursor: 'zoom-in', borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={img.url} alt={img.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {path.videos?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {path.videos.map((v, i) => (
                    <div key={v.id} style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, background: '#f9731620', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>▶</div>
                      <div>
                        <div style={{ color: '#f97316', fontSize: 12, fontWeight: 600 }}>{t.video} {i + 1}</div>
                        <div style={{ fontWeight: 600, marginTop: 2 }}>{v.description}</div>
                        <a href={v.url} target="_blank" rel="noreferrer" style={{ color: '#a3a3a3', fontSize: 13 }}>{t.watch}</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeImg && (
        <div onClick={() => setActiveImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={activeImg} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setActiveImg(null)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  );
}

const contactChip = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 20,
  background: `${color}15`, border: `1px solid ${color}40`,
  color, fontWeight: 600, fontSize: 13,
  textDecoration: 'none', whiteSpace: 'nowrap',
});
