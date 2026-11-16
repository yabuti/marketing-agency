import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from './components/socials';
import { useSiteSettings } from './SiteSettingsContext';
import { useLang } from './LangContext';
import Navbar from './components/Navbar';
import ContactBar from './components/ContactBar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

// Route-level code splitting — only the visited page downloads with the vendor
// chunk; every other page (incl. framer-motion-heavy ones) becomes its own chunk.
const Home = lazy(() => import('./pages/Home'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const AllClients = lazy(() => import('./pages/AllClients'));
const BlogNews = lazy(() => import('./pages/BlogNews'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const BuyerRegister = lazy(() => import('./pages/BuyerRegister'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const MyStore = lazy(() => import('./pages/MyStore'));
const MyPurchases = lazy(() => import('./pages/MyPurchases'));
const Links = lazy(() => import('./pages/Links'));
const Submit = lazy(() => import('./pages/Submit'));
const Team = lazy(() => import('./pages/Team'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Legal = lazy(() => import('./pages/Legal'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const SellerChat = lazy(() => import('./pages/SellerChat'));
const BazaarPage = lazy(() => import('./pages/bazaar/BazaarPage'));
const MarketPage = lazy(() => import('./pages/bazaar/MarketPage'));
const SellerStorePage = lazy(() => import('./pages/bazaar/SellerStorePage'));
const ProductDetailPage = lazy(() => import('./pages/bazaar/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/bazaar/CartPage'));
const CheckoutPage = lazy(() => import('./pages/bazaar/CheckoutPage'));
const DeliveryPage = lazy(() => import('./pages/bazaar/DeliveryPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
      Loading…
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
}

function BuyerProtectedRoute({ children }) {
  const token = localStorage.getItem('buyerToken');
  return token ? children : <Navigate to="/login" replace />;
}

function AnyAuthRoute({ children }) {
  const token = localStorage.getItem('buyerToken') || localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
}

// Routes where Navbar/Footer are hidden
const NO_NAV = ['/login', '/register', '/register/buyer', '/all-clients'];

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

const WHATSAPP_MSG = 'Hi%20All%20Things!%20I%20have%20a%20question.';

function FloatingWhatsApp() {
  const { social } = useSiteSettings();
  const { t } = useLang();
  const waNumber = (social.whatsapp || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  return (
    <a
      href={`https://wa.me/${waNumber}?text=${WHATSAPP_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      title={t.chatOnWhatsApp}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(37, 211, 102, 0.3)',
        zIndex: 9998,
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 211, 102, 0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 211, 102, 0.3)'; }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259L10.732 8.2l3.131 3.259L19.752 8.2l-6.559 6.763z"/>
      </svg>
    </a>
  );
}

// React Router keeps the previous scroll offset across navigations, so leaving a
// long page that was scrolled to the footer lands you at the bottom of the next
// one. Reset on every pathname change so a new page always opens at the top.
function ScrollToTop() {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // Some browsers keep a stale offset when the new document is shorter, so
    // nudge again on the next frame.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, [pathname, search]);

  return null;
}

function SiteLayout() {
  const { pathname } = useLocation();
  const hideNav = NO_NAV.includes(pathname);
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className={!hideNav ? (isMobile ? 'has-topbar' : (sidebarCollapsed ? 'has-sidebar-collapsed' : 'has-sidebar')) : ''} style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      {!hideNav && <ContactBar />}
      {!hideNav && <Navbar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />}
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/website"     element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/register/buyer" element={<BuyerRegister />} />
          <Route path="/clients"     element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/all-clients" element={<AllClients />} />
          <Route path="/blog"        element={<BlogNews />} />
          <Route path="/news"        element={<Navigate to="/blog" replace />} />
          <Route path="/about"       element={<About />} />
          <Route path="/team"        element={<Team />} />
          <Route path="/faq"         element={<FAQ />} />
          <Route path="/terms"       element={<Legal />} />
          <Route path="/privacy-policy" element={<Legal />} />
          <Route path="/billing-policy" element={<Legal />} />
          <Route path="/cookie-policy" element={<Legal />} />
          <Route path="/copyright-infringement" element={<Legal />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/dashboard"   element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/my-store"    element={<ProtectedRoute><MyStore /></ProtectedRoute>} />
          <Route path="/my-purchases" element={<ProtectedRoute><MyPurchases /></ProtectedRoute>} />
          <Route path="/messages"    element={<ProtectedRoute><SellerChat /></ProtectedRoute>} />
          <Route path="/buyer-dashboard" element={<BuyerProtectedRoute><BuyerDashboard /></BuyerProtectedRoute>} />
          <Route path="/submit"      element={<ProtectedRoute><Submit /></ProtectedRoute>} />
          <Route path="/bazaar"                     element={<BazaarPage />} />
<Route path="/market"                     element={<MarketPage />} />
          <Route path="/bazaar/seller/:id"          element={<SellerStorePage />} />
          <Route path="/bazaar/product/:id"         element={<ProductDetailPage />} />
          <Route path="/bazaar/wishlist/:seller_id" element={<AnyAuthRoute><CartPage /></AnyAuthRoute>} />
          <Route path="/bazaar/checkout/:seller_id" element={<CheckoutPage />} />
          <Route path="/bazaar/delivery"            element={<BuyerProtectedRoute><DeliveryPage /></BuyerProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!hideNav && <Footer />}
      <ChatBot />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    ['user', 'buyer'].forEach(key => {
      const val = localStorage.getItem(key);
      if (val === 'undefined' || val === 'null' || val === '') {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"   element={<Links />} />
            <Route path="/*"  element={<SiteLayout />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
