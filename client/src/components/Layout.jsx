import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import ChatSupport from './ChatSupport'
import '../styles/layout.css'

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { language, toggleLanguage, t } = useLanguage()
  const isActive = (path) => location.pathname === path ? 'active' : ''
  
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="bg-pattern"></div>
      
      {/* Mobile Overlay */}
      <div className={`menu-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
      
      <nav className="navbar">
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? 'rotate-down' : ''}></span>
          <span className={menuOpen ? 'fade-out' : ''}></span>
          <span className={menuOpen ? 'rotate-up' : ''}></span>
        </button>
        <Link to="/" className="logo">
          <img src="/logo.jpg" alt="All Things" className="logo-img" />
          <span className="logo-text">All <span>Things</span></span>
        </Link>
        <button className="lang-toggle-mobile" onClick={toggleLanguage}>
          {language === 'en' ? '🇪🇹' : '🇬🇧'}
        </button>
        
        {/* Desktop Nav */}
        <ul className="nav-links desktop-nav">
          <li><Link to="/" className={isActive('/')}>{t('home')}</Link></li>
          <li><Link to="/about" className={isActive('/about')}>{t('about')}</Link></li>
          <li><Link to="/clients" className={isActive('/clients')}>{t('ourClients')}</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>{t('contact')}</Link></li>
          <li><Link to="/login" className={isActive('/login')}>{t('login')}</Link></li>
          <li><Link to="/register" className="nav-btn">{t('register')}</Link></li>
          <li>
            <button className="lang-toggle" onClick={toggleLanguage}>
              {language === 'en' ? '🇪🇹 አማ' : '🇬🇧 EN'}
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Telegram-style Slide Drawer Menu */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src="/logo.jpg" alt="All Things" className="drawer-avatar-img" />
            <div className="drawer-brand">
              <span className="logo-text">All <span>Things</span></span>
              <span className="drawer-tagline">{t('marketingAgency')}</span>
            </div>
          </div>
        </div>
        <div className="drawer-links">
          <Link to="/" className={isActive('/')} onClick={closeMenu}>
            <span className="drawer-icon">🏠</span> {t('home')}
          </Link>
          <Link to="/about" className={isActive('/about')} onClick={closeMenu}>
            <span className="drawer-icon">ℹ️</span> {t('about')}
          </Link>
          <Link to="/clients" className={isActive('/clients')} onClick={closeMenu}>
            <span className="drawer-icon">👥</span> {t('ourClients')}
          </Link>
          <Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>
            <span className="drawer-icon">📧</span> {t('contact')}
          </Link>
          <div className="drawer-divider"></div>
          <Link to="/login" className={isActive('/login')} onClick={closeMenu}>
            <span className="drawer-icon">🔐</span> {t('login')}
          </Link>
          <Link to="/register" className={isActive('/register')} onClick={closeMenu}>
            <span className="drawer-icon">📝</span> {t('register')}
          </Link>
          <div className="drawer-divider"></div>
          <Link to="/privacy-policy" className={isActive('/privacy-policy')} onClick={closeMenu}>
            <span className="drawer-icon">📜</span> {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
          </Link>
          <div className="drawer-divider"></div>
          <button className="drawer-lang-btn" onClick={toggleLanguage}>
            <span className="drawer-icon">{language === 'en' ? '🇪🇹' : '🇬🇧'}</span>
            {language === 'en' ? 'አማርኛ' : 'English'}
          </button>
        </div>
        <div className="drawer-footer">
          <span>© 2026 All Things</span>
        </div>
      </div>

      <main className="page-content">
        <Outlet />
      </main>
      
      {/* Customer Support Chat */}
      <ChatSupport />
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="All Things" className="footer-logo-img" />
              <span className="logo-text" style={{fontSize: '1.3rem'}}>All <span>Things</span></span>
            </div>
            <p>{t('premiumMarketing')}</p>
            <div className="footer-contact">
              <p>📧 allthingsethiopia2026@gmail.com</p>
              <p>📞 +251911031884 | +251905841982 | +251915840037</p>
            </div>
            <div className="footer-social">
              <a href="https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                📸 Instagram
              </a>
              <a href="https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                🎵 TikTok
              </a>
              <a href="https://t.me/Allthings2026" target="_blank" rel="noopener noreferrer" className="social-link telegram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
            </div>
          </div>
          <div className="footer-links">
            <h4>{t('pages')}</h4>
            <ul>
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/clients">{t('ourClients')}</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
              <li><Link to="/privacy-policy">{language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>{t('services')}</h4>
            <ul>
              <li><a href="#">{t('socialMedia')}</a></li>
              <li><a href="#">{t('contentCreation')}</a></li>
              <li><a href="#">{t('paidAds')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} <span>All Things</span> E-commerce. {t('allRightsReserved')}</p>
        </div>
      </footer>
    </>
  )
}
