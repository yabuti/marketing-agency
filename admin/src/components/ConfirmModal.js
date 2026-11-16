import React, { useCallback, useState } from 'react';

// Promise-based confirmation rendered as a clean, modern in-app modal
export default function useConfirm() {
  const [state, setState] = useState(null); // { message, title, okLabel, danger }
  const [resolveRef, setResolveRef] = useState(null);

  const ask = useCallback((message, options = {}) => new Promise((resolve) => {
    const isOptionsObject = typeof options === 'object' && options !== null;
    const okLabel = isOptionsObject ? (options.okLabel || 'Confirm') : (options || 'Confirm');
    const title = isOptionsObject ? (options.title || 'Are you sure?') : 'Confirm Action';
    const danger = isOptionsObject ? (options.danger !== false) : true;

    setState({ message, okLabel, title, danger });
    setResolveRef(() => resolve);
  }), []);

  const settle = useCallback((result) => {
    setState(null);
    setResolveRef((resolve) => {
      if (resolve) resolve(result);
      return null;
    });
  }, []);

  const modal = state && (
    <div
      onClick={() => settle(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#141414',
          border: '1px solid #282828',
          borderRadius: 16,
          padding: '24px 24px 20px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.4)',
          animation: 'toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: state.danger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
              color: state.danger ? '#ef4444' : '#f97316',
              border: `1px solid ${state.danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)'}`,
              borderRadius: 12,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {state.danger ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.2 }}>
              {state.title}
            </h3>
            <p style={{ color: '#a3a3a3', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0' }}>
              {state.message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #222' }}>
          <button
            onClick={() => settle(false)}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: '1px solid #333',
              background: '#202020',
              color: '#d4d4d4',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#202020'; e.currentTarget.style.color = '#d4d4d4'; }}
          >
            Cancel
          </button>
          <button
            onClick={() => settle(true)}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: 'none',
              background: state.danger ? '#ef4444' : '#f97316',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: state.danger ? '0 4px 14px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(249, 115, 22, 0.4)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {state.okLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return { ask, modal };
}
