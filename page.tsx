import Link from 'next/link';

export default function Home() {
  return <main><h1>Chilimba Zambia</h1><p className="muted">Transparent digital management for rotating savings groups.</p><div className="grid"><div className="card"><h2>Group savings</h2><p>Create a group, invite members and generate a payout schedule.</p></div><div className="card"><h2>Transparent ledger</h2><p>Members see contributions, outstanding payments and payouts.</p></div><div className="card"><h2>Mobile money</h2><p>Connect through a licensed payment provider; the platform does not hold funds.</p></div></div><Link className="btn" href="/login">Get started</Link></main>;
}
