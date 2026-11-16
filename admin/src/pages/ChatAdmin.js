import React, { useState, useEffect } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';

export default function ChatAdmin() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const loadConversations = () => {
    API.get('/chat/admin/all')
      .then(r => { if (Array.isArray(r.data)) setConversations(r.data); })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Could not load chat conversations.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadConversations(); }, []);

  const openConv = (c) => {
    setSelected(c);
    API.get(`/chat/conversations/${c.id}/messages`)
      .then(r => { if (Array.isArray(r.data)) setMessages(r.data); })
      .catch(() => toast.error('Failed to load message thread.'));
  };

  const refreshAll = () => {
    loadConversations();
    if (selected) {
      API.get(`/chat/conversations/${selected.id}/messages`)
        .then(r => { if (Array.isArray(r.data)) setMessages(r.data); });
    }
    toast.info('Chat refreshed.');
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    try {
      const r = await API.post(`/chat/conversations/${selected.id}/messages?as_admin=1`, { message: text });
      setMessages(prev => [...prev, r.data]);
      setReply('');
      loadConversations();
      toast.success('Reply sent.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>💬 Live Chat Support</h1>
        <button
          onClick={refreshAll}
          style={{
            background: '#171717', border: '1px solid #333', color: '#d4d4d4',
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
          }}
        >
          ↻ Refresh Messages
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 620 }}>
        {/* List */}
        <div style={{ width: 320, background: '#111', border: '1px solid #222', borderRadius: 14, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #222', color: '#a3a3a3', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {conversations.length} Conversations
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map(c => (
              <div
                key={c.id}
                onClick={() => openConv(c)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #1a1a1a',
                  cursor: 'pointer',
                  background: selected?.id === c.id ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                  borderLeft: selected?.id === c.id ? '3px solid #f97316' : '3px solid transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: selected?.id === c.id ? '#fff' : '#e5e5e5' }}>
                  {c.buyer_name || 'Buyer'} ➔ {c.seller_name || 'Seller'}
                </div>
                <div style={{ color: '#888', fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.last_message || 'No messages yet'}
                </div>
                <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
                  {new Date(c.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#666', fontSize: 13 }}>
                No active conversations
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666', gap: 12 }}>
              <span style={{ fontSize: 32 }}>💬</span>
              <span>Select a conversation from the left to view messages</span>
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #222', background: '#141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{selected.buyer_name} ↔ {selected.seller_name}</span>
                  <span style={{ marginLeft: 12, fontSize: 11, color: '#f97316', background: 'rgba(249, 115, 22, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    Replying as Admin / {selected.seller_name}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'seller' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                      background: msg.sender_type === 'seller' ? 'rgba(249, 115, 22, 0.18)' : '#1e1e1e',
                      border: msg.sender_type === 'seller' ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid #2a2a2a',
                      color: '#fff', fontSize: 13, lineHeight: 1.5
                    }}>
                      <div style={{ fontSize: 11, color: msg.sender_type === 'seller' ? '#f97316' : '#38bdf8', marginBottom: 4, fontWeight: 700 }}>
                        {msg.sender_type === 'seller' ? (selected.seller_name + ' (Store/Admin)') : (selected.buyer_name || 'Buyer')}
                      </div>
                      {msg.message}
                      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid #222', background: '#141414', display: 'flex', gap: 10 }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Type a message as admin..."
                  style={{
                    flex: 1, background: '#1e1e1e', border: '1px solid #333', color: '#fff',
                    borderRadius: 8, padding: '11px 14px', fontSize: 13, outline: 'none'
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  style={{
                    padding: '11px 22px', background: '#f97316', color: '#000', border: 'none',
                    borderRadius: 8, fontWeight: 700, fontSize: 13,
                    cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !reply.trim() ? 0.6 : 1
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
