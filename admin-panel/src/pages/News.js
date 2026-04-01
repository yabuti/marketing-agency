import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    API.get('/news/admin/all')
      .then((r) => setNews(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteNews = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await API.delete(`/news/${id}`);
    load();
  };

  const togglePublish = async (item) => {
    await API.put(`/news/${item.id}`, { ...item, is_published: item.is_published ? 0 : 1 });
    load();
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>News</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{news.length} articles</p>
        </div>
        <button onClick={() => navigate('/news/new')} style={btnPrimary}>+ Add Article</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {news.map((n) => (
          <div key={n.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            {n.images?.[0] && (
              <img src={n.images[0].url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{n.title}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 4 }}>
                {n.category} · {new Date(n.created_at).toLocaleDateString()} · 📸 {n.images?.length || 0} images
              </div>
            </div>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: n.is_published ? '#22c55e20' : '#ef444420', color: n.is_published ? '#22c55e' : '#ef4444' }}>
              {n.is_published ? 'Published' : 'Draft'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => togglePublish(n)} style={btnSecondary}>{n.is_published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => navigate(`/news/${n.id}/edit`)} style={btnSecondary}>Edit</button>
              <button onClick={() => deleteNews(n.id, n.title)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
        {news.length === 0 && <p style={{ color: '#a3a3a3' }}>No articles yet.</p>}
      </div>
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14 };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13 };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13 };
