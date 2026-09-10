export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Chilimba Zambia">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <defs><linearGradient id="brandGold" x1="0" x2="1"><stop offset="0"/><stop offset="1" stopColor="#ffd84d"/></linearGradient><linearGradient id="brandGreen" x1="0" x2="1"><stop offset="0" stopColor="#20c878"/><stop offset="1" stopColor="#087a4d"/></linearGradient></defs>
          <path d="M50 16a25 25 0 1 0 3 25" fill="none" stroke="url(#brandGold)" strokeWidth="8" strokeLinecap="round"/>
          <path d="M15 48a25 25 0 0 0 37-17" fill="none" stroke="url(#brandGreen)" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="32" cy="25" r="6" fill="#ffd84d"/><circle cx="22" cy="33" r="5" fill="#ffd84d"/><circle cx="42" cy="33" r="5" fill="#ffd84d"/>
          <path d="M32 31v12M22 38v5M42 38v5" stroke="#ffd84d" strokeWidth="4" strokeLinecap="round"/>
          <path d="M48 12l-2 13 11-5" fill="#20c878"/>
        </svg>
      </span>
      <span className="brand-copy"><strong>Chilimba</strong><b>Zambia</b>{!compact && <small>SAVE · GROW · TOGETHER</small>}</span>
    </div>
  );
}
