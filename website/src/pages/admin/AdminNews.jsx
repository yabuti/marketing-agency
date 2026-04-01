import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/admin-news.css'

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await api.get('/admin/news')
      setNews(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
      // Mock data for development
      setNews([
        {
          id: 1,
          title: 'Ethiopia Launches New Digital Payment System',
          title_am: 'ኢትዮጵያ አዲስ ዲጂታል የክፍያ ስርዓት ጀመረች',
          title_or: 'Itoophiyaan Sirna Kaffaltii Dijitaalaa Haaraa Jalqabde',
          category: 'Technology',
          date: '2026-02-15',
          status: 'published',
          images: 3
        },
        {
          id: 2,
          title: 'Ethiopian Tech Startups Receive $50M Investment',
          title_am: 'የኢትዮጵያ ቴክኖሎጂ ጅምር ኩባንያዎች 50 ሚሊዮን ዶላር ኢንቨስትመንት ተቀበሉ',
          title_or: 'Dhaabbileen Teeknooloojii Jalqabaa Itoophiyaa Invastimantii Doolaara Miliyoona 50 Argatan',
          category: 'Investment',
          date: '2026-02-12',
          status: 'published',
          images: 3
        },
        {
          id: 3,
          title: 'New Tech Hub Opens in Addis Ababa',
          title_am: 'አዲስ አበባ ውስጥ አዲስ የቴክኖሎጂ ማዕከል ተከፈተ',
          title_or: 'Finfinnee Keessatti Giddugala Teeknooloojii Haaraan Baname',
          category: 'Infrastructure',
          date: '2026-02-10',
          status: 'draft',
          images: 3
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      try {
        await api.delete(`/admin/news/${id}`)
        setNews(news.filter(item => item.id !== id))
      } catch (error) {
        console.error('Error deleting news:', error)
      }
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      await api.put(`/admin/news/${id}/status`, { status: newStatus })
      setNews(news.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading news...</div>
  }

  return (
    <div className="admin-news">
      <div className="page-header">
        <h1 className="page-title">News Management</h1>
        <Link to="/admin/news/new" className="btn btn-primary">+ Add News</Link>
      </div>

      <div className="news-stats">
        <div className="stat-card">
          <div className="stat-number">{news.length}</div>
          <div className="stat-label">Total Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{news.filter(n => n.status === 'published').length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{news.filter(n => n.status === 'draft').length}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      <div className="news-table-container">
        <table className="news-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="news-title-cell">
                    <div className="title-main">{item.title}</div>
                    <div className="title-translations">
                      <div className="title-am">{item.title_am}</div>
                      <div className="title-or">{item.title_or}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>
                  <button 
                    className={`status-badge ${item.status}`}
                    onClick={() => toggleStatus(item.id, item.status)}
                  >
                    {item.status}
                  </button>
                </td>
                <td>
                  <span className="images-count">{item.images} images</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/admin/news/edit/${item.id}`} 
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </Link>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {news.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📰</div>
          <h3>No news articles yet</h3>
          <p>Create your first news article to get started</p>
          <Link to="/admin/news/new" className="btn btn-primary">Add First Article</Link>
        </div>
      )}
    </div>
  )
}