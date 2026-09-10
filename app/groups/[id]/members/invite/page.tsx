'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch(`/api/groups/${id}/members`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, full_name: name }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(d.error || 'Unable to add member.');
      } else {
        setMessage(`Member added at payout position #${d.payout_position}.`);
        setPhone('');
        setName('');
      }
    } catch {
      setMessage('Unable to add member. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <nav className="topbar">
        <button onClick={() => router.back()}>← Back</button>
        <strong>Invite member</strong>
      </nav>
      <section>
        <span className="eyebrow">GROUP ADMIN</span>
        <h1>Add a member</h1>
        <p className="muted">The member must already have a Chilimba Zambia account. SMS/WhatsApp invitations can be connected next.</p>
      </section>
      <form className="card form-card" onSubmit={invite}>
        <label>Member name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></label>
        <label>Zambian mobile number<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+260 97 123 4567" /></label>
        {message && <p role="status">{message}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add member'}</button>
      </form>
    </main>
  );
}
