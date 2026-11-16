import React, { useEffect, useState } from 'react';

// Self-contained deal countdown: owns its own 1-second tick so the parent page
// (often 800+ lines) does not re-render every second, and being module-scope it
// stays a stable component type instead of re-mounting on each parent render.
export default function CountdownChip({ target, label }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ef44440F', border: '1px solid #ef444430', color: '#ef4444', fontWeight: 800, fontSize: 17, padding: '5px 12px', borderRadius: 100 }}>
      ⏳ {label} <span style={{ fontVariantNumeric: 'tabular-nums' }}>{`${pad(h)}:${pad(m)}:${pad(s)}`}</span>
    </span>
  );
}
