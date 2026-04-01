import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/chat-support.css'

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [showOptions, setShowOptions] = useState(true)
  const { t, language } = useLanguage()

  const quickReplies = language === 'en' ? [
    { id: 1, text: '💼 Services Info', response: 'We offer Social Media Management, Content Creation, Growth Strategy, and Paid Advertising. All services are exclusively for licensed businesses. Would you like to know more about any specific service?' },
    { id: 2, text: '💰 Pricing', response: 'Our pricing varies based on your business needs. We offer custom packages starting from $500/month. Contact us for a personalized quote!' },
    { id: 3, text: '📞 Contact Sales', response: 'You can reach our sales team at:\n📧 allthingsethiopia2026@gmail.com\n📞 +251911031884\n📞 +251905841982\n📞 +251915840037\n✈️ Telegram: t.me/Allthings2026\n\nOr fill out our contact form and we\'ll get back to you within 24 hours!' },
    { id: 4, text: '🕐 Working Hours', response: 'Our office hours are:\nMonday - Friday: 9:00 AM - 6:00 PM (EAT)\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed' },
  ] : [
    { id: 1, text: '💼 አገልግሎቶች', response: 'የማህበራዊ ሚዲያ አስተዳደር፣ ይዘት መፍጠር፣ የእድገት ስትራቴጂ እና የሚከፈልበት ማስታወቂያ እናቀርባለን። ሁሉም አገልግሎቶች ለፈቃድ ያላቸው ንግዶች ብቻ ናቸው።' },
    { id: 2, text: '💰 ዋጋ', response: 'ዋጋችን በንግድዎ ፍላጎት ላይ የተመሰረተ ነው። ከ$500/ወር ጀምሮ ብጁ ፓኬጆችን እናቀርባለን። ለግል ዋጋ ያግኙን!' },
    { id: 3, text: '📞 ሽያጭ አግኙ', response: 'የሽያጭ ቡድናችንን ማግኘት ይችላሉ:\n📧 allthingsethiopia2026@gmail.com\n📞 +251911031884\n📞 +251905841982\n📞 +251915840037\n✈️ ቴሌግራም: t.me/Allthings2026\n\nወይም የእውቂያ ቅጹን ይሙሉ በ24 ሰዓት ውስጥ እናገኝዎታለን!' },
    { id: 4, text: '🕐 የስራ ሰዓት', response: 'የቢሮ ሰዓታችን:\nሰኞ - አርብ: 9:00 AM - 6:00 PM\nቅዳሜ: 10:00 AM - 2:00 PM\nእሁድ: ዝግ' },
  ]

  const handleQuickReply = (reply) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', text: reply.text },
      { type: 'bot', text: reply.response }
    ])
    setShowOptions(false)
    setTimeout(() => setShowOptions(true), 1000)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setMessages(prev => [
      ...prev,
      { type: 'user', text: input },
      { type: 'bot', text: language === 'en' 
        ? 'Thank you for your message! Our team will get back to you soon. In the meantime, feel free to use the quick options below or contact us directly.'
        : 'ለመልዕክትዎ እናመሰግናለን! ቡድናችን በቅርቡ ያገኝዎታል። በዚህ መካከል ከታች ያሉትን ፈጣን አማራጮች ይጠቀሙ ወይም በቀጥታ ያግኙን።'
      }
    ])
    setInput('')
  }

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-support-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customer Support"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">AT</div>
            <div>
              <h4>{language === 'en' ? 'All Things Support' : 'የAll Things ድጋፍ'}</h4>
              <span className="chat-status">
                <span className="status-dot"></span>
                {language === 'en' ? 'Online' : 'መስመር ላይ'}
              </span>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chat-messages">
          {/* Welcome Message */}
          <div className="chat-message bot">
            <div className="message-content">
              {language === 'en' 
                ? '👋 Hi! Welcome to All Things Marketing. How can we help you today?'
                : '👋 ሰላም! ወደ All Things Marketing እንኳን ደህና መጡ። ዛሬ እንዴት ልንረዳዎ እንችላለን?'
              }
            </div>
          </div>

          {/* User Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.type}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}

          {/* Quick Reply Options */}
          {showOptions && (
            <div className="quick-replies">
              {quickReplies.map(reply => (
                <button 
                  key={reply.id} 
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'en' ? 'Type a message...' : 'መልዕክት ይጻፉ...'}
          />
          <button type="submit">➤</button>
        </form>
      </div>
    </>
  )
}
