import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Banners() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    API.get('/banners/all')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const sets = data
    ? Array.from({ length: data.total_sets }, (_, i) =>
        data.banners.filter((b) => b.set === i)
      )
    : [];

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Banner Images</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 28 }}>
        Drop your images into <code style={{ background: '#262626', padding: '2px 8px', borderRadius: 4, color: '#f97316' }}>backend/banners/</code> folder.
        They rotate automatically every 12 hours — 3 banners per slot.
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          ['🖼️', 'Total Images', data.total],
          ['📦', 'Total Sets', data.total_sets],
          ['⏱️', 'Current Slot', `#${data.current_slot}`],
          ['🔄', 'Rotates Every', `${data.window_hours} hours`],
        ].map(([icon, label, value]) => (
          <div key={label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>{value}</div>
            <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {data.total === 0 && (
        <div style={{ background: '#171717', border: '2px dashed #333', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No banner images yet</h3>
          <p style={{ color: '#a3a3a3', fontSize: 14 }}>
            Add your banner images to the <strong style={{ color: '#f97316' }}>backend/banners/</strong> folder.<br />
            Supported formats: JPG, PNG, WebP, GIF<br />
            Images are sorted alphabetically — name them like <code style={{ color: '#f97316' }}>01_easter.jpg</code>, <code style={{ color: '#f97316' }}>02_promo.jpg</code> to control order.
          </p>
        </div>
      )}

      {/* Sets */}
      {sets.map((set, setIdx) => (
        <div key={setIdx} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              Set {setIdx + 1}
              {data.current_slot % data.total_sets === setIdx && (
                <span style={{ marginLeft: 10, fontSize: 12, background: '#f9731620', color: '#f97316', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                  ● SHOWING NOW
                </span>
              )}
            </h3>
            <span style={{ color: '#666', fontSize: 13 }}>
              Slot #{setIdx} · shown every {data.total_sets * data.window_hours}h cycle
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {set.map((banner) => (
              <div key={banner.filename} style={{ background: '#171717', border: `1px solid ${banner.is_current_set ? '#f97316' : '#262626'}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0a0a0a' }}>
                  <img
                    src={banner.url}
                    alt={banner.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
                    #{banner.index + 1} · 15s
                  </div>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {banner.filename}
                  </div>
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 3 - set.length) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#111', border: '2px dashed #262626', borderRadius: 14, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#444', fontSize: 13 }}>Empty slot</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20, marginTop: 16 }}>
        <h4 style={{ color: '#f97316', marginBottom: 12 }}>📋 How it works</h4>
        <ul style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
          <li>Drop any number of images into <strong style={{ color: '#fff' }}>backend/banners/</strong></li>
          <li>Images are grouped into sets of 3, sorted alphabetically by filename</li>
          <li>Every 12 hours, the next set of 3 is shown automatically</li>
          <li>After all sets are shown, it cycles back to Set 1</li>
          <li>Visitors must watch all 3 banners (15 seconds each = 45 seconds total) before entering</li>
          <li>Name files like <code style={{ color: '#f97316' }}>001_banner.jpg</code> to control display order</li>
        </ul>
      </div>
    </div>
  );
}
