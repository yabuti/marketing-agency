import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const PER_PAGE = 10;

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
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
        setBlogs(all.filter(n => String(n.category || '').toLowerCase() !== 'news'));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load blogs');
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

  const deleteBlog = async (id, title) => {
    if (!(await confirm.ask(`Delete blog "${title}"?`, { okLabel: 'Delete Blog' }))) return;
    try {
      await API.post(`/news/${id}`, { _method: 'DELETE' });
      toast.success(`"${title}" deleted successfully.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete blog.');
    }
  };

  const togglePublish = async (item) => {
    const nextStatus = item.is_published ? 0 : 1;
    try {
      await API.post(`/news/${item.id}`, { is_published: nextStatus, _method: 'PUT' });
      toast.info(`Blog ${nextStatus ? 'published' : 'moved to drafts'}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update blog status.');
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const totalPages = Math.max(1, Math.ceil(blogs.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = blogs.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>📝 Blogs</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{blogs.length} articles published</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={retranslateAll} disabled={retranslating} style={btnSecondary}>
            {retranslating ? '⏳ Translating...' : '🌐 Re-translate All'}
          </button>
          <button onClick={() => navigate('/blogs/new')} style={btnPrimary}>+ Add Blog</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {paginated.map((b) => (
          <div key={b.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            {b.images?.[0] && (
              <img src={b.images[0].url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{b.title}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 4 }}>
                {b.category} · {new Date(b.created_at).toLocaleDateString()} · 📸 {b.images?.length || 0} images
              </div>
            </div>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#a855f720', color: '#a855f7' }}>
              📝 Blog
            </span>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: b.is_published ? '#22c55e20' : '#ef444420', color: b.is_published ? '#22c55e' : '#ef4444' }}>
              {b.is_published ? 'Published' : 'Draft'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => togglePublish(b)} style={btnSecondary}>{b.is_published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => navigate(`/blogs/${b.id}/edit`)} style={btnSecondary}>Edit</button>
              <button onClick={() => deleteBlog(b.id, b.title)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <p style={{ color: '#a3a3a3' }}>No blog posts yet.</p>}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      {confirm.modal}
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
