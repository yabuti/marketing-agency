import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../LangContext';
import { useSiteSettings } from '../SiteSettingsContext';

// ─── Bot knowledge base per language ─────────────────────────
const KB = {
  en: {
    greeting: "👋 Hello! I'm the All Things assistant. How can I help you today?",
    menuLabel: 'Choose a topic:',
    menu: [
      { id: 'about',    label: '🏢 About All Things' },
      { id: 'services', label: '📱 Our Services' },
      { id: 'register', label: '📝 How to Register' },
      { id: 'clients',  label: '🤝 Our Customers' },
      { id: 'contact',  label: '📞 Contact & Phone Numbers' },
      { id: 'login',    label: '🔑 How to Login' },
      { id: 'news',     label: '📰 News & Updates' },
    ],
    answers: {
      about: "🏢 *All Things by All Things Solution* is a digital marketing & e-commerce company based in Addis Ababa, Ethiopia.\n\nWe exclusively work with *verified, licensed businesses* to grow their social media presence and digital visibility.\n\n✅ Vision: Ethiopia's leading digital marketing company for MSMEs.\n✅ Mission: Affordable, measurable marketing solutions.",
      services: "📱 *Our Services:*\n\n• Social Media Management — full management of your accounts\n• Content Creation — professional photos, videos & graphics\n• Growth Strategy — data-driven strategies\n• Paid Advertising — targeted ads on all platforms\n• Branding & Logo Design\n• Outdoor Advertising\n• E-Commerce Setup\n• Business Consultation",
      register: "📝 *How to Register:*\n\n1️⃣ Go to the *Register* page from the top menu\n2️⃣ Fill in your *Full Name, Phone & Password*\n3️⃣ Enter your *Company Name & Business Type*\n4️⃣ Provide your *Business License Number* (required)\n5️⃣ Optionally add TIN, E-LMIS & website\n6️⃣ Click *Create Account*\n\n⚠️ We only accept *licensed businesses*.\n📋 Your account will be reviewed by our team within 1–2 business days.",
      clients: "🤝 *Our Customers* are verified, licensed businesses we promote across social media platforms.\n\nVisit the *Customers* page to see all businesses we work with, including their social media stats, growth numbers, and marketing work we've done for them.",
      login: "🔑 *How to Login:*\n\n1️⃣ Click *Sign In* in the top menu\n2️⃣ Enter your *Phone Number* or *Email*\n3️⃣ Enter your *Password*\n4️⃣ Click *Sign In*\n\nAfter login you can access your *Dashboard* to update your profile and submit content.\n\n⚠️ If your account is *pending*, our team is still reviewing it.",
      news: "📰 Visit the *News* page to read our latest articles, marketing tips, and business updates.\n\nArticles are available in *English, Amharic, and Afaan Oromo*.",
    },
    back: '⬅️ Back to menu',
    callNow: '📞 Call Now',
    placeholder: 'Type a message...',
    title: 'All Things Support',
    subtitle: 'We reply instantly',
  },
  am: {
    greeting: "👋 ሰላም! እኔ የ All Things ረዳት ነኝ። ዛሬ እንዴት ልረዳዎ እችላለሁ?",
    menuLabel: 'ርዕስ ይምረጡ:',
    menu: [
      { id: 'about',    label: '🏢 ስለ All Things' },
      { id: 'services', label: '📱 አገልግሎቶቻችን' },
      { id: 'register', label: '📝 እንዴት መመዝገብ' },
      { id: 'clients',  label: '🤝 ደንበኞቻችን' },
      { id: 'contact',  label: '📞 ያግኙን እና ስልክ ቁጥሮች' },
      { id: 'login',    label: '🔑 እንዴት መግባት' },
      { id: 'news',     label: '📰 ዜና እና ዝማኔዎች' },
    ],
    answers: {
      about: "🏢 *All Things by All Things Solution* በአዲስ አበባ፣ ኢትዮጵያ የሚገኝ የዲጂታል ማርኬቲንግ እና ኢ-ኮሜርስ ኩባንያ ነው።\n\nከ*ተረጋግጠው ፈቃድ ካላቸው ንግዶች* ጋር ብቻ እንሰራለን።\n\n✅ ራዕይ: ለMSMEዎች የኢትዮጵያ ቀዳሚ የዲጂታል ማርኬቲንግ ኩባንያ።\n✅ ተልዕኮ: ተመጣጣኝ እና ሊለካ የሚችሉ የማርኬቲንግ መፍትሄዎች።",
      services: "📱 *አገልግሎቶቻችን:*\n\n• የሶሻል ሚዲያ አስተዳደር\n• ይዘት መፍጠር — ፎቶዎች፣ ቪዲዮዎች እና ግራፊክስ\n• የዕድገት ስትራቴጂ\n• የሚከፈልበት ማስታወቂያ\n• ብራንዲንግ እና ሎጎ ዲዛይን\n• ውጫዊ ማስታወቂያ\n• ኢ-ኮሜርስ ማዋቀር\n• የንግድ ምክር",
      register: "📝 *እንዴት መመዝገብ:*\n\n1️⃣ ከላይኛው ምናሌ *ተመዝገብ* ገጽ ይሂዱ\n2️⃣ *ሙሉ ስም፣ ስልክ እና የይለፍ ቃል* ይሙሉ\n3️⃣ *የኩባንያ ስም እና የንግድ አይነት* ያስገቡ\n4️⃣ *የንግድ ፈቃድ ቁጥር* ያስገቡ (አስፈላጊ)\n5️⃣ TIN፣ E-LMIS እና ድህረ ገጽ ማከል ይችላሉ\n6️⃣ *መለያ ፍጠር* ይጫኑ\n\n⚠️ *ፈቃድ ያላቸው ንግዶች* ብቻ ይቀበላሉ።\n📋 መለያዎ በ1-2 የስራ ቀናት ውስጥ ይገመገማል።",
      clients: "🤝 *ደንበኞቻችን* በሶሻል ሚዲያ ላይ የምናስተዋውቃቸው ተረጋግጠው ፈቃድ ያላቸው ንግዶች ናቸው።\n\n*ደንበኞች* ገጽን ይጎብኙ — የሶሻል ሚዲያ ስታቲስቲክስ፣ የዕድገት ቁጥሮች እና ለእነሱ ያደረግናቸውን የማርኬቲንግ ስራዎች ያያሉ።",
      login: "🔑 *እንዴት መግባት:*\n\n1️⃣ ከላይኛው ምናሌ *ግባ* ይጫኑ\n2️⃣ *ስልክ ቁጥርዎ* ወይም *ኢሜይልዎ* ያስገቡ\n3️⃣ *የይለፍ ቃልዎ* ያስገቡ\n4️⃣ *ግባ* ይጫኑ\n\nከገቡ በኋላ *ዳሽቦርድዎን* ለማዘመን እና ይዘት ለማስገባት ይችላሉ።\n\n⚠️ መለያዎ *በጥበቃ ላይ* ከሆነ ቡድናችን አሁንም እየገመገመ ነው።",
      news: "📰 የቅርብ ጊዜ ጽሑፎቻችን፣ የማርኬቲንግ ምክሮች እና የንግድ ዝማኔዎችን ለማንበብ *ዜና* ገጽን ይጎብኙ።\n\nጽሑፎቹ በ*እንግሊዝኛ፣ አማርኛ እና አፋን ኦሮሞ* ይገኛሉ።",
    },
    back: '⬅️ ወደ ምናሌ ተመለስ',
    callNow: '📞 አሁን ይደውሉ',
    placeholder: 'መልዕክት ይፃፉ...',
    title: 'All Things ድጋፍ',
    subtitle: 'ወዲያውኑ እንመልሳለን',
  },
  or: {
    greeting: "👋 Akkam! Ani gargaaraa All Things dha. Har'a akkamitti si gargaaruu danda'a?",
    menuLabel: 'Mata duree filadhu:',
    menu: [
      { id: 'about',    label: "🏢 Waa'ee All Things" },
      { id: 'services', label: '📱 Tajaajila Keenya' },
      { id: 'register', label: "📝 Akkamitti Galmaa'uu" },
      { id: 'clients',  label: '🤝 Maamiltoota Keenya' },
      { id: 'contact',  label: '📞 Nu Quunnamaa fi Lakkoofsa Bilbilaa' },
      { id: 'login',    label: '🔑 Akkamitti Seenuu' },
      { id: 'news',     label: '📰 Oduu fi Haaromsa' },
    ],
    answers: {
      about: "🏢 *All Things by All Things Solution* dhaabbata maarketiingii dijitaalaa fi e-commerce Finfinnee, Itoophiyaa keessa jiru dha.\n\n*Daldala hayyama qaban mirkana'e* qofa waliin hojjenna.\n\n✅ Mul'ata: Dhaabbata maarketiingii dijitaalaa duraa Itoophiyaa keessaa MSME-ootiif.\n✅ Ergama: Furmaata maarketiingii gatii madaalawaa fi safaramuu danda'u.",
      services: "📱 *Tajaajila Keenya:*\n\n• Bulchiinsa Miidiyaa Hawaasaa\n• Uumuu Qabiyyee — suuraa, viidiyoo fi graafiiksii\n• Tarsiimoo Guddina\n• Beeksisa Kaffalamu\n• Braadingiingii fi Dizaayinii Mallattoo\n• Beeksisa Alaa\n• Qophii E-Commerce\n• Gorsa Daldala",
      register: "📝 *Akkamitti Galmaa'uu:*\n\n1️⃣ Gara fuula *Galmaa'i* deemuuf fiilaa olii ilaali\n2️⃣ *Maqaa Guutuu, Bilbila fi Jecha Darbii* guuti\n3️⃣ *Maqaa Dhaabbata fi Gosa Daldala* galchi\n4️⃣ *Lakkoofsa Hayyama Daldala* galchi (dirqama)\n5️⃣ TIN, E-LMIS fi marsariitii dabaluu dandeessa\n6️⃣ *Herrega Uumi* tuqi\n\n⚠️ *Daldala hayyama qaban* qofa simanna.\n📋 Herregni kee guyyaa hojii 1-2 keessatti madaalama.",
      clients: "🤝 *Maamiltoota Keenya* daldala hayyama qaban mirkana'e marsaalee miidiyaa hawaasaa irratti beeksifnu dha.\n\nFuula *Maamiltoota* daawwadhu — saayitistikii miidiyaa hawaasaa, lakkoofsa guddina fi hojii maarketiingii isaaniif hojjenne ni argita.",
      login: "🔑 *Akkamitti Seenuu:*\n\n1️⃣ Fiilaa olii irraa *Seeni* tuqi\n2️⃣ *Lakkoofsa Bilbilaa* ykn *Imeelii* kee galchi\n3️⃣ *Jecha Darbii* kee galchi\n4️⃣ *Seeni* tuqi\n\nSeenuu booda *Daashboordii* kee haaromsuu fi qabiyyee galchuuf dandeessa.\n\n⚠️ Herregni kee *madaallii jala* yoo jiraate, gareen keenya ammallee madaalaa jira.",
      news: "📰 Barreeffama haaraa, gorsa maarketiingii fi haaromsa daldala dubbisuu fuula *Oduu* daawwadhu.\n\nBarreeffamoonni *Afaan Ingilizii, Amaariffaa fi Afaan Oromoo* keessatti argamu.",
    },
    back: "⬅️ Gara fiilaa deebi'i",
    callNow: '📞 Amma Bilbili',
    placeholder: 'Ergaa barreessi...',
    title: 'Deeggarsa All Things',
    subtitle: 'Hatattamaan deebina',
  },
};

function buildContactAnswer(lang, contact) {
  const ps = (contact.phones || []).filter(Boolean);
  if (lang === 'am') {
    return `📞 *ያግኙን:*\n\n📱 ስልክ 1: ${ps[0]}\n📱 ስልክ 2: ${ps[1]}\n📱 ስልክ 3: ${ps[2]}\n\n📧 ኢሜይል: ${contact.email}\n📍 አካባቢ: ${contact.address}\n\nወይም ድህረ ገጻችን ላይ *ያግኙን* ገጽን ተጠቀሙ።`;
  }
  if (lang === 'or') {
    return `📞 *Nu Quunnamaa:*\n\n📱 Bilbila 1: ${ps[0]}\n📱 Bilbila 2: ${ps[1]}\n📱 Bilbila 3: ${ps[2]}\n\n📧 Imeelii: ${contact.email}\n📍 Bakka: ${contact.address}\n\nYookaan fuula *Nu Quunnamaa* marsariitii keenya irratti fayyadami.`;
  }
  return `📞 *Contact Us:*\n\n📱 Phone 1: ${ps[0]}\n📱 Phone 2: ${ps[1]}\n📱 Phone 3: ${ps[2]}\n\n📧 Email: ${contact.email}\n📍 Location: ${contact.address}\n\nOr use the *Contact* page on our website to send us a message directly.`;
}

// ─── Format message text (bold with *) ───────────────────────
function formatText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*([^*]+)\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        <br />
      </span>
    );
  });
}

export default function ChatBot() {
  const { lang, t } = useLang();
  const { contact, content } = useSiteSettings();
  const phones = (contact.phones || []).filter(Boolean);
  const over = (content && content[lang]) || {};
  const kb = (() => {
    const base = KB[lang] || KB.en;
    return {
      ...base,
      title: over.chatTitle || base.title,
      subtitle: over.chatSubtitle || base.subtitle,
      greeting: over.chatGreeting || base.greeting,
      answers: { ...base.answers, contact: buildContactAnswer(lang, contact) },
    };
  })();

  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [showMenu, setShowMenu] = useState(true);
  const bottomRef = useRef(null);

  const greetingText = kb.greeting;

  // Reset chat when language changes
  useEffect(() => {
    setMessages([{ from: 'bot', text: greetingText, isMenu: false }]);
    setShowMenu(true);
  }, [lang, greetingText]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function addMessage(from, text, extra = {}) {
    setMessages(prev => [...prev, { from, text, ...extra }]);
  }

  function handleMenu(item) {
    addMessage('user', item.label);
    const answer = kb.answers[item.id];
    setShowMenu(false);
    setTimeout(() => {
      addMessage('bot', answer, { showBack: true, isContact: item.id === 'contact' });
    }, 300);
  }

  function handleBack() {
    setShowMenu(true);
    addMessage('bot', kb.menuLabel, { isMenuPrompt: true });
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addMessage('user', text);
    setTimeout(() => {
      // Simple keyword matching
      const lower = text.toLowerCase();
      let matched = null;
      if (/register|sign up|account|galmaa|ተመዝገብ/i.test(lower)) matched = 'register';
      else if (/login|sign in|seeni|ግባ/i.test(lower)) matched = 'login';
      else if (/service|tajaajila|አገልግሎት/i.test(lower)) matched = 'services';
      else if (/contact|phone|bilbila|ስልክ|quunnamaa|ያግኙን/i.test(lower)) matched = 'contact';
      else if (/client|maamil|ደንበኛ/i.test(lower)) matched = 'clients';
      else if (/news|oduu|ዜና/i.test(lower)) matched = 'news';
      else if (/about|waa'ee|ስለ/i.test(lower)) matched = 'about';

      if (matched) {
        addMessage('bot', kb.answers[matched], { showBack: true, isContact: matched === 'contact' });
        setShowMenu(false);
      } else {
        addMessage('bot', kb.menuLabel, { isMenuPrompt: true });
        setShowMenu(true);
      }
    }, 400);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label={t.chatOpenSupport}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 24, zIndex: 9998,
          // maxWidth keeps the panel on-screen on narrow phones (320px wide +
          // 24px offset would overflow a 360px viewport).
          width: 320, maxWidth: 'calc(100vw - 32px)', maxHeight: 480,
          background: '#0f0f0f', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          border: '1px solid #1f1f1f',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ color: '#000', fontWeight: 700, fontSize: 17 }}>{kb.title}</div>
              <div style={{ color: '#00000099', fontSize: 16 }}>🟢 {kb.subtitle}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%', padding: '8px 12px', borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.from === 'user' ? '#f97316' : '#1a1a1a',
                    color: msg.from === 'user' ? '#000' : '#e5e5e5',
                    fontSize: 16, lineHeight: 1.6,
                  }}>
                    {formatText(msg.text)}
                  </div>
                </div>

                {/* Phone call buttons for contact answer */}
                {msg.isContact && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, paddingLeft: 4 }}>
                    {phones.map(p => (
                      <a key={p} href={`tel:${p.replace(/\s/g, '')}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#1a1a1a', border: '1px solid #f97316',
                        color: '#f97316', borderRadius: 8, padding: '6px 12px',
                        fontSize: 16, fontWeight: 600, textDecoration: 'none',
                      }}>
                        📞 {p}
                      </a>
                    ))}
                  </div>
                )}

                {/* Back button */}
                {msg.showBack && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 6 }}>
                    <button onClick={handleBack} style={{
                      background: 'transparent', border: '1px solid #333',
                      color: '#ffffff', borderRadius: 8, padding: '4px 10px',
                      fontSize: 16, cursor: 'pointer',
                    }}>
                      {kb.back}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Menu buttons */}
            {showMenu && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {kb.menu.map(item => (
                  <button key={item.id} onClick={() => handleMenu(item)} style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    color: '#e5e5e5', borderRadius: 10, padding: '8px 12px',
                    fontSize: 16, cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #1f1f1f', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={kb.placeholder}
              style={{
                flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 10, padding: '8px 12px', color: '#fff',
                fontSize: 16, outline: 'none',
              }}
            />
            <button onClick={handleSend} style={{
              background: '#f97316', border: 'none', borderRadius: 10,
              padding: '8px 14px', color: '#000', fontWeight: 700,
              cursor: 'pointer', fontSize: 16,
            }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
