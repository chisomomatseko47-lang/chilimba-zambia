'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function generate() {
    setBusy(true); setMessage('');
    const res = await fetch(`/api/groups/${id}/setup`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Could not generate schedule.');
    else { setMessage(`Created ${data.cycles} payout cycles and contribution records.`); setTimeout(() => router.push(`/groups/${id}`), 800); }
    setBusy(false);
  }

  return <main className="shell"><nav className="topbar"><button onClick={()=>router.back()}>← Back</button><strong>Set up cycle</strong></nav><section><span className="eyebrow">AUTOMATION</span><h1>Generate the savings cycle</h1><p className="muted">This creates the contribution ledger and payout schedule from your group's members and payout order.</p></section><section className="card"><h2>Ready?</h2><p>Members will receive a contribution record for every cycle. Each payout position will receive the full group pool when its turn arrives.</p>{message&&<p role="status">{message}</p>}<button className="btn" onClick={generate} disabled={busy}>{busy?'Generating…':'Generate schedule'}</button></section></main>;
}
