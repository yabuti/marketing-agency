import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

export default function SellerChat() {
  const navigate = useNavigate();
  const { t } = useLang();
  const token = localStorage.getItem('userToken');

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const lastMsgTime = useRef(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    API.get('/chat/conversations')
      .then(r => setConversations(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const loadMessages = useCallback(() => {
    if (!selected) return;
    const since = lastMsgTime.current ? '&since=' + encodeURIComponent(lastMsgTime.current) : '';
    API.get(`/chat/conversations/${selected}/messages?x=1${since}`)
      .then(r => {
        const data = r.data;
        if (Array.isArray(data) && data.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m.id));
            const newMsgs = data.filter(m => !ids.has(m.id));
            if (newMsgs.length) {
              lastMsgTime.current = newMsgs[newMsgs.length - 1].created_at;
              return [...prev, ...newMsgs];
            }
            return prev;
          });
        }
      });
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    API.get(`/chat/conversations/${selected}/messages`)
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          setMessages(data);
          if (data.length) lastMsgTime.current = data[data.length - 1].created_at;
        }
      });
    API.post(`/chat/conversations/${selected}/read`);
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [selected, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !selected) return;
    const msg = input.trim();
    setInput('');
    try {
      const r = await API.post(`/chat/conversations/${selected}/messages`, { message: msg });
      if (r.data?.id) setMessages(prev => [...prev, r.data]);
    } catch { setInput(msg); }
  };

  return (
    <div className="page" style={{ padding: 0, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--sidebar-width, 0px) - 80px)', minHeight: 500, gap: 0 }}>
        {/* Header with back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--primary)', padding: '4px 8px' }}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{t.chatTitle}</h2>
        </div>

        <div className="chat-panes" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Conversation list */}
          <div className="chat-list" style={{ width: 280, borderRight: '1px solid rgba(0,0,0,0.05)', overflowY: 'auto', flexShrink: 0 }}>
            {loading ? (
              <div style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>{t.loading}</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center', fontSize: 16 }}>{t.chatNoConversations}</div>
            ) : (
              conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); setMessages([]); lastMsgTime.current = null; }}
                  style={{
                    width: '100%', padding: '14px 16px', background: selected === c.id ? 'rgba(255,122,0,0.08)' : 'none',
                    border: 'none', borderBottom: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17 }}>{c.seller_name || c.buyer_name || t.chatConversationFallback}</div>
                  {c.last_message && <div style={{ fontSize: 16, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>}
                  {Number(c.unread_count) > 0 && <div style={{ fontSize: 16, color: '#fff', background: 'var(--primary)', borderRadius: 20, padding: '2px 8px', alignSelf: 'flex-start' }}>{t.chatUnread(c.unread_count)}</div>}
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 16 }}>
                {t.chatSelectConversation}
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.map(msg => {
                    const isMe = msg.sender_type === 'seller' || msg.sender_type === 'user';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%', padding: '8px 12px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: isMe ? '#f97316' : '#e5e7eb',
                          color: isMe ? '#000' : '#000', fontSize: 16, lineHeight: 1.5,
                        }}>
                          {msg.message}
                          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={t.chatTypeMessage} style={{ flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-main)', fontSize: 16, outline: 'none' }} />
                  <button onClick={send} disabled={!input.trim()}
                    style={{ background: input.trim() ? '#f97316' : 'var(--card-border)', border: 'none', borderRadius: 10, padding: '8px 14px', color: input.trim() ? '#000' : 'var(--text-muted)', fontWeight: 700, cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: 17 }}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            .chat-panes { flex-direction: column; }
            .chat-list { width: 100% !important; max-height: 45%; overflow-y: auto; border-right: none !important; border-bottom: 1px solid rgba(0,0,0,0.05); }
          }
        `}</style>
      </div>
    </div>
  );
}
