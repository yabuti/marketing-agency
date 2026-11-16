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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        style={navBtnStyle(currentPage === 1)}>←</button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ color: '#a3a3a3', fontSize: 14, padding: '0 4px' }}>...</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            style={{
              ...pageBtnStyle,
              background: p === currentPage ? '#f97316' : '#262626',
              color: p === currentPage ? '#000' : '#fff',
              fontWeight: p === currentPage ? 700 : 400,
              border: p === currentPage ? '1px solid #f97316' : '1px solid #333',
            }}>{p}</button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        style={navBtnStyle(currentPage === totalPages)}>→</button>
    </div>
  );
}

const navBtnStyle = (disabled) => ({
  background: '#262626', border: '1px solid #333', borderRadius: 8,
  padding: '8px 14px', cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.3 : 1, fontSize: 16, color: '#fff',
  transition: 'all 0.2s',
});

const pageBtnStyle = {
  width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
};
