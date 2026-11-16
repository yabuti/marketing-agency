import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api';
import { useLang } from '../LangContext';

export default function ChatWindow({ sellerId, sellerName, productId, onClose }) {
  const { t } = useLang();
  const token = localStorage.getItem('userToken') || localStorage.getItem('buyerToken');

  // Decode role from JWT payload to determine sender_type
  function getTokenRole(tok) {
    try {
      const payload = JSON.parse(atob(tok.split('.')[1]));
      return payload.role || 'user';
    } catch { return 'user'; }
  }
  const myRole = token ? getTokenRole(token) : 'user';
  const myType = myRole;

  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastMsgTime = useRef(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // Start or get conversation
  useEffect(() => {
    if (!token) return;
    setError('');
    API.post('/chat/conversations', { seller_id: sellerId, product_id: productId })
      .then(r => {
        const data = r.data;
        if (data && data.id) {
          setConvId(data.id);
        } else {
          setError(data?.message || t.chatStartError);
        }
        setLoading(false);
      })
      .catch(err => {
        const msg = err.response?.data?.message || t.chatConnectionError;
        setError(msg);
        setLoading(false);
      });
  }, [sellerId, productId, token]);

  // Load messages
  const loadMessages = useCallback(() => {
    if (!convId) return;
    const since = lastMsgTime.current ? '&since=' + encodeURIComponent(lastMsgTime.current) : '';
    API.get(`/chat/conversations/${convId}/messages?x=1${since}`)
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
  }, [convId, token]);

  useEffect(() => {
    if (!convId) return;
    // Initial load
    API.get(`/chat/conversations/${convId}/messages`)
      .then(r => {
        const data = r.data;
        if (Array.isArray(data)) {
          setMessages(data);
          if (data.length) lastMsgTime.current = data[data.length - 1].created_at;
        }
      });
    // Mark as read
    API.post(`/chat/conversations/${convId}/read`);
    // Poll every 3 seconds
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [convId, token, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !convId) return;
    setSending(true);
    setError('');
    const msg = input.trim();
    setInput('');
    try {
      const r = await API.post(`/chat/conversations/${convId}/messages`, { message: msg });
      const data = r.data;
      if (data && data.id) {
        setMessages(prev => [...prev, data]);
      } else {
        setError(data?.message || t.chatSendError);
        setInput(msg);
      }
    } catch {
      setError(t.chatSendRetryError);
      setInput(msg);
    }
    setSending(false);
  };

  if (!token) return (
    <div style={overlay}>
      <div style={box}>
        <div style={header}><span>{t.chatWith(sellerName)}</span><button onClick={onClose} style={closeBtn}>✕</button></div>
        <div style={{ padding: 24, textAlign: 'center', color: '#ffffff' }}>
          {t.chatSignInBefore} <a href="/login" style={{ color: '#f97316' }}>{t.chatSignInLink}</a> {t.chatSignInAfter}
        </div>
      </div>
    </div>
  );

  return (
    <div style={overlay}>
      <div style={box}>
        {/* Header */}
        <div style={header}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>💬 {sellerName}</div>
            <div style={{ fontSize: 16, color: 'rgba(0,0,0,0.6)' }}>🟢 {t.chatOnline}</div>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && <div style={{ textAlign: 'center', color: '#666', fontSize: 16, marginTop: 20 }}>{t.chatConnecting}</div>}
          {!loading && error && !convId && (
            <div style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ color: '#ef4444', fontSize: 16, marginBottom: 12 }}>⚠️ {error}</div>
              <button
                onClick={() => { setLoading(true); setError('');
                  API.post('/chat/conversations', { seller_id: sellerId, product_id: productId })
                    .then(r => { if (r.data?.id) setConvId(r.data.id); else setError(r.data?.message || t.chatFailed); setLoading(false); })
                    .catch(() => { setError(t.chatConnectionErrorShort); setLoading(false); });
                }}
                style={{ background: '#f97316', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 17 }}
              >
                {t.chatRetry}
              </button>
            </div>
          )}
          {!loading && !error && messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', fontSize: 16, marginTop: 20 }}>
              {t.chatEmpty}
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_type === myType;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: isMe ? '#f97316' : '#262626',
                  color: isMe ? '#000' : '#fff', fontSize: 16, lineHeight: 1.5,
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

        {/* Send error */}
        {error && convId && (
          <div style={{ padding: '4px 14px', color: '#ef4444', fontSize: 16 }}>⚠️ {error}</div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1f1f1f', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={convId ? 'Type a message...' : 'Connecting...'}
            disabled={!convId || sending}
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 16, outline: 'none', opacity: convId ? 1 : 0.5 }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim() || !convId}
            style={{
              background: (sending || !input.trim() || !convId) ? '#333' : '#f97316',
              border: 'none', borderRadius: 10, padding: '8px 14px',
              color: (sending || !input.trim() || !convId) ? '#666' : '#000',
              fontWeight: 700,
              cursor: (sending || !input.trim() || !convId) ? 'not-allowed' : 'pointer',
              fontSize: 16,
              transition: 'background 0.15s',
            }}
          >
            {sending ? '...' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}

// maxWidth keeps the panel on-screen on narrow phones: a fixed 340px plus a 24px
// right offset needs 364px, which overflows a 320/360px viewport.
const overlay = { position: 'fixed', bottom: 90, right: 24, zIndex: 9998, width: 340, maxWidth: 'calc(100vw - 32px)' };
const box = { background: '#0f0f0f', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', height: 460 };
const header = { background: 'linear-gradient(135deg,#f97316,#ea580c)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px 16px 0 0' };
const closeBtn = { background: 'none', border: 'none', color: '#000', fontSize: 18, cursor: 'pointer', fontWeight: 700 };
