import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import News from './pages/News';
import NewsForm from './pages/NewsForm';
import Blogs from './pages/Blogs';
import BlogForm from './pages/BlogForm';
import Contacts from './pages/Contacts';
import Registrations from './pages/Registrations';
import Users from './pages/Users';
import Ads from './pages/Ads';
import Banners from './pages/Banners';
import NewsletterSubscribers from './pages/NewsletterSubscribers';
import Analytics from './pages/Analytics';
import TeamAdmin from './pages/Team';
import BazaarProducts from './pages/BazaarProducts';
import BazaarTransactions from './pages/BazaarTransactions';
import BazaarSettings from './pages/BazaarSettings';
import Categories from './pages/Categories';
import ChatAdmin from './pages/ChatAdmin';
import Submissions from './pages/Submissions';
import Buyers from './pages/Buyers';
import SiteSettings from './pages/SiteSettings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:id/edit" element={<ClientForm />} />
            <Route path="news" element={<News />} />
            <Route path="news/new" element={<NewsForm />} />
            <Route path="news/:id/edit" element={<NewsForm />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id/edit" element={<BlogForm />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="users" element={<Users />} />
            <Route path="buyers" element={<Buyers />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="ads" element={<Ads />} />
            <Route path="banners" element={<Banners />} />
            <Route path="newsletter" element={<NewsletterSubscribers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="team" element={<TeamAdmin />} />
            <Route path="bazaar-products" element={<BazaarProducts />} />
            <Route path="bazaar-schedule" element={<BazaarSettings />} />
            <Route path="bazaar-transactions" element={<BazaarTransactions />} />
            <Route path="bazaar-categories" element={<Categories />} />
            <Route path="chat" element={<ChatAdmin />} />
            <Route path="settings" element={<SiteSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
