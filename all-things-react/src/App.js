import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdSplash from './components/AdSplash';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import News from './pages/News';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Links from './pages/Links';
import Submit from './pages/Submit';
import Team from './pages/Team';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
}

const NO_NAV = ['/login', '/register'];

function Layout() {
  const { pathname } = useLocation();
  const hideNav = NO_NAV.includes(pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/clients"     element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/news"        element={<News />} />
        <Route path="/about"       element={<About />} />
        <Route path="/team"        element={<Team />} />
        <Route path="/contact"     element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/dashboard"   element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/links"       element={<Links />} />
        <Route path="/submit"      element={<ProtectedRoute><Submit /></ProtectedRoute>} />
      </Routes>
      {!hideNav && <Footer />}
    </>
  );
}

export default function App() {
  const [adsDone, setAdsDone] = useState(false);

  if (!adsDone) return <AdSplash onDone={() => setAdsDone(true)} />;

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
