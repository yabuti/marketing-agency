import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import About from './pages/About'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import News from './pages/News'
import Admin from './pages/Admin'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminClients from './pages/admin/AdminClients'
import ClientForm from './pages/admin/ClientForm'
import AdminClientDetail from './pages/admin/AdminClientDetail'
import Messages from './pages/admin/Messages'
import MessageDetail from './pages/admin/MessageDetail'
import AdminNews from './pages/admin/AdminNews'
import NewsForm from './pages/admin/NewsForm'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:slug" element={<ClientDetail />} />
        <Route path="news" element={<News />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="admin-old" element={<Admin />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<MessageDetail />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="clients/create" element={<ClientForm />} />
        <Route path="clients/:id" element={<AdminClientDetail />} />
        <Route path="clients/:id/edit" element={<ClientForm />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/edit/:id" element={<NewsForm />} />
      </Route>
    </Routes>
  )
}

export default App
