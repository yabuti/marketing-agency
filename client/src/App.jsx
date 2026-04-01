import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivacyPolicy from './pages/PrivacyPolicy'

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:slug" element={<ClientDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
        </Route>
      </Routes>
    </LanguageProvider>
  )
}

export default App
