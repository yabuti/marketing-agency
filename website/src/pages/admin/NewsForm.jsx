import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/news-form.css'

const initialForm = {
  title: '',
  title_am: '',
  title_or: '',
  content: '',
  content_am: '',
  content_or: '',
  category: '',
  status: 'draft',
  images: []
}

export default function NewsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const isEdit = !!id

  useEffect(() => {
    if (id) {
      fetchNews()
    }
  }, [id])

  const fetchNews = async () => {
    try {
      const response = await api.get(`/admin/news/${id}`)
      setForm(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await api.put(`/admin/news/${id}`, form)
      } else {
        await api.post('/admin/news', form)
      }
      navigate('/admin/news')
    } catch (error) {
      console.error('Error saving news:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:')
    if (url && form.images.length < 5) {
      setForm({ ...form, images: [...form.images, url] })
    }
  }

  const handleImageRemove = (index) => {
    setForm({ 
      ...form, 
      images: form.images.filter((_, i) => i !== index) 
    })
  }

  return (
    <div className="news-form-page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit News Article' : 'Add New Article'}</h1>
        <Link to="/admin/news" className="btn btn-outline">← Back to News</Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>📝 Article Content</h3>
            
            <div className="form-group">
              <label>Title (English) *</label>
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                required 
                placeholder="Enter article title in English"
              />
            </div>

            <div className="form-group">
              <label>Title (Amharic) *</label>
              <input 
                name="title_am" 
                value={form.title_am} 
                onChange={handleChange} 
                required 
                placeholder="በአማርኛ ርዕስ ያስገቡ"
              />
            </div>

            <div className="form-group">
              <label>Title (Afaan Oromoo) *</label>
              <input 
                name="title_or" 
                value={form.title_or} 
                onChange={handleChange} 
                required 
                placeholder="Mata duree Afaan Oromootiin galchaa"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Investment">Investment</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Innovation">Innovation</option>
                  <option value="Business">Business</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Content (English) *</label>
              <textarea 
                name="content" 
                value={form.content} 
                onChange={handleChange} 
                rows="6" 
                required
                placeholder="Write the full article content in English..."
              />
            </div>

            <div className="form-group">
              <label>Content (Amharic) *</label>
              <textarea 
                name="content_am" 
                value={form.content_am} 
                onChange={handleChange} 
                rows="6" 
                required
                placeholder="ሙሉ ጽሁፉን በአማርኛ ይጻፉ..."
              />
            </div>

            <div className="form-group">
              <label>Content (Afaan Oromoo) *</label>
              <textarea 
                name="content_or" 
                value={form.content_or} 
                onChange={handleChange} 
                rows="6" 
                required
                placeholder="Barreeffama guutuu Afaan Oromootiin barreessaa..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>🖼️ Article Images</h3>
            <p className="section-desc">Add up to 5 images that will scroll horizontally in the news card</p>
            
            <div className="images-grid">
              {form.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Article image ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-btn" 
                    onClick={() => handleImageRemove(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {form.images.length < 5 && (
                <button 
                  type="button" 
                  className="add-image-btn" 
                  onClick={handleImageAdd}
                >
                  + Add Image
                </button>
              )}
            </div>
            
            {form.images.length === 0 && (
              <div className="empty-images">
                <p>No images added yet. Add at least 3 images for better presentation.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update Article' : 'Create Article'}
            </button>
            <Link to="/admin/news" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}