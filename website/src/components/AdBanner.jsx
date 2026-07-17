import { useEffect, useState } from 'react'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'

export default function AdBanner() {
  const [banners, setBanners] = useState([])
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    api.get('/banners/current')
      .then(res => {
        if (res.data?.banners?.length) setBanners(res.data.banners)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % banners.length)
        setFade(true)
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners])

  if (!banners.length) return null

  const banner = banners[index]

  return (
    <div className="ad-banner">
      {banner.url && (
        <img
          src={banner.url}
          alt={banner.filename || 'Banner'}
          className="ad-banner-image"
          style={{ opacity: fade ? 1 : 0 }}
        />
      )}
      {banners.length > 1 && (
        <div className="ad-banner-dots">
          {banners.map((_, i) => (
            <div
              key={i}
              onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true) }, 400) }}
              className={`ad-banner-dot ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
