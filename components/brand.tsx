export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Chilimba Zambia">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <defs>
            <linearGradient id="brandGold" x1="0" x2="1"><stop offset="0" stopColor="#ffe27a"/><stop offset="1" stopColor="#e9ae28"/></linearGradient>
            <linearGradient id="brandGreen" x1="0" x2="1"><stop offset="0" stopColor="#35df91"/><stop offset="1" stopColor="#078452"/></linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(245,200,75,.12)" strokeWidth="1"/>
          <path d="M49 15a25 25 0 1 0 4 25" fill="none" stroke="url(#brandGold)" strokeWidth="7" strokeLinecap="round"/>
          <path d="M15 49a25 25 0 0 0 37-17" fill="none" stroke="url(#brandGreen)" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="32" cy="24" r="5.5" fill="#ffd84d"/><circle cx="22" cy="32" r="4.5" fill="#ffd84d"/><circle cx="42" cy="32" r="4.5" fill="#ffd84d"/>
          <path d="M32 30v13M22 37v6M42 37v6" stroke="#ffd84d" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M48 11l-2 13 11-5" fill="#20c878"/>
        </svg>
      </span>
      <span className="brand-copy"><strong>Chilimba</strong><b>Zambia</b>{!compact && <small>SAVE · GROW · TOGETHER</small>}</span>
    </div>
  );
}
