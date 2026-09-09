import Link from 'next/link';

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">🇿🇲 Built for Zambia</span>
        <h1>Chilimba, made transparent.</h1>
        <p>Manage your rotating savings group, contributions and payout schedule in one simple place.</p>
        <div className="actions"><Link className="btn" href="/login">Get started</Link><Link className="btn secondary" href="/dashboard">View dashboard</Link></div>
      </section>
      <section className="grid">
        <div className="card"><h2>Transparent ledger</h2><p>Members can see contribution status and payout schedules.</p></div>
        <div className="card"><h2>Automatic reminders</h2><p>Keep members on schedule and reduce missed contributions.</p></div>
        <div className="card"><h2>Mobile money ready</h2><p>Designed to integrate with licensed Zambian payment providers.</p></div>
      </section>
    </main>
  );
}
