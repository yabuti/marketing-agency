import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import News from './pages/News';
import NewsForm from './pages/NewsForm';
import Contacts from './pages/Contacts';
import Registrations from './pages/Registrations';
import Users from './pages/Users';
import Ads from './pages/Ads';
import Banners from './pages/Banners';
import Analytics from './pages/Analytics';
import TeamAdmin from './pages/Team';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="contacts" element={<Contacts />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="users" element={<Users />} />
          <Route path="ads" element={<Ads />} />
          <Route path="banners" element={<Banners />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<TeamAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
