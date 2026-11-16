import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const PER_PAGE = 10;

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retranslating, setRetranslating] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/news/admin/all')
      .then((r) => {
        const all = Array.isArray(r.data) ? r.data : [];
        setNews(all.filter(n => String(n.category || '').toLowerCase() === 'news'));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load news articles');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const retranslateAll = async () => {
    setRetranslating(true);
    try {
      const { data } = await API.post('/news/retranslate');
      toast.success(data.message || 'Retranslation finished successfully.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retranslation failed.');
    } finally {
      setRetranslating(false);
    }
  };

  const deleteNews = async (id, title) => {
    if (!(await confirm.ask(`Delete news article "${title}"?`, { okLabel: 'Delete Article' }))) return;
    try {
      await API.post(`/news/${id}`, { _method: 'DELETE' });
      toast.success(`"${title}" deleted successfully.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete article.');
    }
  };

  const togglePublish = async (item) => {
    const nextStatus = item.is_published ? 0 : 1;
    try {
      await API.post(`/news/${item.id}`, { is_published: nextStatus, _method: 'PUT' });
      toast.info(`Article ${nextStatus ? 'published' : 'moved to drafts'}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update article status.');
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const totalPages = Math.max(1, Math.ceil(news.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = news.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>📰 News</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{news.length} articles published</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={retranslateAll} disabled={retranslating} style={btnSecondary}>
            {retranslating ? '⏳ Translating...' : '🌐 Re-translate All'}
          </button>
          <button onClick={() => navigate('/news/new')} style={btnPrimary}>+ Add Article</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {paginated.map((n) => (
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
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#3b82f620', color: '#3b82f6' }}>
              📰 News
            </span>
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

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      {confirm.modal}
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
