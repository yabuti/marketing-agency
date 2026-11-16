import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap', rowGap: 10, marginTop: 48 }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        style={navBtnStyle(currentPage === 1)}>←</button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: 'var(--text-muted)', fontSize: 16, padding: '0 4px' }}>...</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            style={{
              ...pageBtnStyle,
              background: p === currentPage ? 'var(--primary)' : 'transparent',
              color: p === currentPage ? '#fff' : 'var(--text-muted)',
              fontWeight: p === currentPage ? 800 : 600,
            }}>{p}</button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        style={navBtnStyle(currentPage === totalPages)}>→</button>
    </div>
  );
}

const navBtnStyle = (disabled) => ({
  background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8,
  padding: '8px 14px', cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.3 : 1, fontSize: 16, color: 'var(--secondary)',
  transition: 'all 0.2s',
});

const pageBtnStyle = {
  width: 36, height: 36, borderRadius: 10, border: 'none',
  cursor: 'pointer', fontSize: 16, transition: 'all 0.2s',
};
