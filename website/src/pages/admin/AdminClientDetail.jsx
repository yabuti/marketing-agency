import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/admin-client-detail.css'

export default function AdminClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const response = await api.get(`/admin/clients/${id}`)
      setClient(response.data)
      setImages(response.data.images || [])
      setVideos(response.data.videos || [])
    } catch (error) {
      console.error('Error fetching client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageAdd = async () => {
    const url = prompt('Enter image URL:')
    if (url && images.length < 10) {
      const newImages = [...images, url]
      setImages(newImages)
      await updateClientMedia(newImages, videos)
    }
  }

  const handleVideoAdd = async () => {
    const url = prompt('Enter video URL:')
    if (url && videos.length < 5) {
      const newVideos = [...videos, url]
      setVideos(newVideos)
      await updateClientMedia(images, newVideos)
    }
  }

  const handleImageRemove = async (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    await updateClientMedia(newImages, videos)
  }

  const handleVideoRemove = async (index) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
    await updateClientMedia(images, newVideos)
  }

  const updateClientMedia = async (newImages, newVideos) => {
    try {
      await api.put(`/admin/clients/${id}/media`, {
        images: newImages,
        videos: newVideos
      })
    } catch (error) {
      console.error('Error updating media:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading client details...</div>
  }

  if (!client) {
    return <div className="error">Client not found</div>
  }

  return (
    <div className="admin-client-detail">
      <div className="page-header">
        <h1 className="page-title">Manage Client: {client.name}</h1>
        <div className="header-actions">
          <Link to={`/admin/clients/edit/${id}`} className="btn btn-primary">Edit Info</Link>
          <Link to="/admin/clients" className="btn btn-outline">← Back to Clients</Link>
        </div>
      </div>

      <div className="client-info-card">
        <div className="client-header">
          <div className="client-icon">{client.icon}</div>
          <div className="client-basic">
            <h2>{client.name}</h2>
            <p className="client-category">{client.category} • {client.industry}</p>
            <p className="client-location">📍 {client.location}</p>
          </div>
          <div className="client-status">
            <span className={`status-badge ${client.is_active ? 'active' : 'inactive'}`}>
              {client.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="client-details-grid">
          <div className="detail-item">
            <label>Established</label>
            <span>{client.established}</span>
          </div>
          <div className="detail-item">
            <label>Employees</label>
            <span>{client.employees}</span>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <span>{client.phone}</span>
          </div>
          <div className="detail-item">
            <label>Website</label>
            <span>{client.website || 'Not provided'}</span>
          </div>
          <div className="detail-item full">
            <label>Address</label>
            <span>{client.address}</span>
          </div>
          <div className="detail-item full">
            <label>Description</label>
            <span>{client.full_description}</span>
          </div>
        </div>
      </div>

      <div className="media-management">
        <div className="media-section">
          <div className="section-header">
            <h3>🖼️ Images ({images.length}/10)</h3>
            {images.length < 10 && (
              <button className="btn btn-primary" onClick={handleImageAdd}>
                + Add Image
              </button>
            )}
          </div>
          
          <div className="media-grid">
            {images.map((image, index) => (
              <div key={index} className="media-item">
                <img src={image} alt={`Client image ${index + 1}`} />
                <button 
                  className="remove-btn" 
                  onClick={() => handleImageRemove(index)}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="empty-state">
                <p>No images added yet</p>
                <button className="btn btn-outline" onClick={handleImageAdd}>
                  Add First Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="media-section">
          <div className="section-header">
            <h3>🎥 Videos ({videos.length}/5)</h3>
            {videos.length < 5 && (
              <button className="btn btn-primary" onClick={handleVideoAdd}>
                + Add Video
              </button>
            )}
          </div>
          
          <div className="media-grid videos">
            {videos.map((video, index) => (
              <div key={index} className="media-item video-item">
                <video src={video} controls />
                <button 
                  className="remove-btn" 
                  onClick={() => handleVideoRemove(index)}
                  title="Remove video"
                >
                  ×
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="empty-state">
                <p>No videos added yet</p>
                <button className="btn btn-outline" onClick={handleVideoAdd}>
                  Add First Video
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="license-info-card">
        <h3>📄 License Information</h3>
        <div className="license-grid">
          <div className="license-item">
            <label>License Type</label>
            <span>{client.license_type}</span>
          </div>
          <div className="license-item">
            <label>License Number</label>
            <span>{client.license_number}</span>
          </div>
          <div className="license-item">
            <label>Issue Date</label>
            <span>{client.license_issue}</span>
          </div>
          <div className="license-item">
            <label>Expiry Date</label>
            <span>{client.license_expiry}</span>
          </div>
          <div className="license-item full">
            <label>Issuing Authority</label>
            <span>{client.authority}</span>
          </div>
        </div>
      </div>
    </div>
  )
}