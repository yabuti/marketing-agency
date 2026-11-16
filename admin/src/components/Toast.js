import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, title, type = 'info', duration = 4500 }) => {
    if (!message) return null;
    const id = ++toastCounter;
    const toast = { id, message, title, type, createdAt: Date.now() };

    setToasts((prev) => [toast, ...prev].slice(0, 6)); // Keep maximum 6 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Success', duration = 4000) => {
    return addToast({ message, title, type: 'success', duration });
  }, [addToast]);

  const error = useCallback((message, title = 'Error', duration = 6000) => {
    return addToast({ message, title, type: 'error', duration });
  }, [addToast]);

  const warning = useCallback((message, title = 'Warning', duration = 5000) => {
    return addToast({ message, title, type: 'warning', duration });
  }, [addToast]);

  const info = useCallback((message, title = 'Notification', duration = 4000) => {
    return addToast({ message, title, type: 'info', duration });
  }, [addToast]);

  const value = useMemo(() => ({
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    toast: addToast,
  }), [addToast, removeToast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if used outside provider (e.g. tests or early render)
    return {
      success: (msg) => console.log('Toast [success]:', msg),
      error: (msg) => console.error('Toast [error]:', msg),
      warning: (msg) => console.warn('Toast [warning]:', msg),
      info: (msg) => console.info('Toast [info]:', msg),
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}

const TYPE_CONFIG = {
  success: {
    bg: '#052e16',
    border: '#15803d',
    accent: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.25)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
  },
  error: {
    bg: '#450a0a',
    border: '#b91c1c',
    accent: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.25)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
  warning: {
    bg: '#422006',
    border: '#b45309',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    bg: '#082f49',
    border: '#0369a1',
    accent: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.25)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 420,
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const conf = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
        return (
          <div
            key={toast.id}
            role="alert"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 14,
              background: conf.bg,
              border: `1px solid ${conf.border}`,
              boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 20px ${conf.glow}`,
              backdropFilter: 'blur(12px)',
              color: '#fff',
              position: 'relative',
              animation: 'toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {conf.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
              {toast.title && (
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#fff',
                    marginBottom: 2,
                    letterSpacing: -0.2,
                  }}
                >
                  {toast.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#e2e8f0',
                  wordBreak: 'break-word',
                }}
              >
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
                lineHeight: 0,
                borderRadius: 6,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
