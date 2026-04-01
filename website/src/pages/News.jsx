import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/news.css'

export default function News() {
  const { t, language } = useLanguage()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load mock data directly since we don't have a backend
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: 'Ethiopia Launches New Digital Payment System',
          title_am: 'ኢትዮጵያ አዲስ ዲጂታል የክፍያ ስርዓት ጀመረች',
          title_or: 'Itoophiyaan Sirna Kaffaltii Dijitaalaa Haaraa Jalqabde',
          content: 'The National Bank of Ethiopia has launched a revolutionary digital payment system that will transform how businesses and individuals conduct financial transactions across the country.',
          content_am: 'የኢትዮጵያ ብሔራዊ ባንክ አዲስ ዲጂታል የክፍያ ስርዓት ጀምሯል። ይህ ስርዓት ንግዶች እና ግለሰቦች በሀገሪቱ ውስጥ የገንዘብ ልውውጥ የሚያደርጉበትን መንገድ ይለውጣል።',
          content_or: 'Baankiin Biyyaalessaa Itoophiyaa sirna kaffaltii dijitaalaa haaraa jalqabe. Sirni kun akkaataa daldalonni fi namoonni dhuunfaa biyyattii keessatti daldalaa maallaqaa itti gaggeessan jijjiira.',
          images: [
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
            'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
          ],
          date: '2026-02-15',
          category: 'Technology'
        },
        {
          id: 2,
          title: 'Ethiopian Tech Startups Receive $50M Investment',
          title_am: 'የኢትዮጵያ ቴክኖሎጂ ጅምር ኩባንያዎች 50 ሚሊዮን ዶላር ኢንቨስትመንት ተቀበሉ',
          title_or: 'Dhaabbileen Teeknooloojii Jalqabaa Itoophiyaa Invastimantii Doolaara Miliyoona 50 Argatan',
          content: 'A consortium of international investors has committed $50 million to support Ethiopian technology startups, marking the largest tech investment in the country\'s history.',
          content_am: 'የአለም አቀፍ ኢንቨስተሮች ቡድን የኢትዮጵያ ቴክኖሎጂ ጅምር ኩባንያዎችን ለመደገፍ 50 ሚሊዮን ዶላር ቃል ገብቷል። ይህ በሀገሪቱ ታሪክ ውስጥ ትልቁ የቴክኖሎጂ ኢንቨስትመንት ነው።',
          content_or: 'Gareen invastartootaa addunyaa Itoophiyaa keessatti dhaabbileen teeknooloojii jalqabaa deeggaruuf doolaara miliyoona 50 waadaa galan. Kun seenaa biyyattii keessatti invastimantii teeknooloojii guddaa dha.',
          images: [
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
            'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400'
          ],
          date: '2026-02-12',
          category: 'Investment'
        },
        {
          id: 3,
          title: 'New Tech Hub Opens in Addis Ababa',
          title_am: 'አዲስ አበባ ውስጥ አዲስ የቴክኖሎጂ ማዕከል ተከፈተ',
          title_or: 'Finfinnee Keessatti Giddugala Teeknooloojii Haaraan Baname',
          content: 'The largest technology hub in East Africa has officially opened in Addis Ababa, providing workspace and resources for over 500 tech entrepreneurs and developers.',
          content_am: 'በምስራቅ አፍሪካ ውስጥ ትልቁ የቴክኖሎጂ ማዕከል በአዲስ አበባ በይፋ ተከፈተ። ይህ ማዕከል ከ500 በላይ የቴክኖሎጂ ስራ ፈጣሪዎች እና ገንቢዎች የስራ ቦታ እና ሀብት ይሰጣል።',
          content_or: 'Giddugalli teeknooloojii Afrikaa Bahaa keessatti guddaan Finfinnee keessatti ifatti baname. Giddugalli kun hojjettootaa teeknooloojii fi ijaartoota 500 ol bakka hojii fi qabeenya kenna.',
          images: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'
          ],
          date: '2026-02-10',
          category: 'Infrastructure'
        }
      ])
      setLoading(false)
    }, 1000) // Simulate loading time
  }, [])

  const getLocalizedContent = (item, field) => {
    if (language === 'am' && item[`${field}_am`]) return item[`${field}_am`]
    if (language === 'or' && item[`${field}_or`]) return item[`${field}_or`]
    return item[field]
  }

  if (loading) {
    return (
      <div className="news-loading">
        <div className="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
    )
  }

  return (
    <div className="news-page">
      <section className="news-hero">
        <div className="section-tag">📰 {t('news')}</div>
        <h1>{t('techNews')}</h1>
        <p>{t('latestTech')}</p>
      </section>

      <section className="news-grid">
        {news.map(item => (
          <article key={item.id} className="news-card">
            <div className="news-images">
              <div className="image-slider">
                {item.images.map((image, index) => (
                  <div key={index} className="news-image">
                    <img src={image} alt={`${getLocalizedContent(item, 'title')} - Image ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="news-content">
              <div className="news-meta">
                <span className="news-category">{item.category}</span>
                <span className="news-date">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              
              <h2 className="news-title">{getLocalizedContent(item, 'title')}</h2>
              
              <p className="news-excerpt">
                {getLocalizedContent(item, 'content').substring(0, 150)}...
              </p>
              
              <button className="read-more-btn">
                {t('readMore')} →
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}