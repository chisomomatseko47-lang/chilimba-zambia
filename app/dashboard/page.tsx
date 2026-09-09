import Link from 'next/link';

const groups = [
  { name: 'My Chilimba', contribution: 'K500', members: '12 members', next: '15 Oct', status: '11/12 paid' },
];

export default function DashboardPage() {
  return <main className="shell"><nav className="topbar"><strong>Chilimba Zambia</strong><Link href="/groups/new" className="btn">+ Create group</Link></nav><section><span className="eyebrow">Member dashboard</span><h1>Your savings groups</h1><p className="muted">Track contributions, payouts and group activity.</p></section><section className="grid">{groups.map(g=><div className="card" key={g.name}><div className="row"><h2>{g.name}</h2><span className="pill">Active</span></div><p>{g.contribution} monthly · {g.members}</p><hr/><div className="row"><span>Next payout</span><strong>{g.next}</strong></div><div className="row"><span>Contributions</span><strong>{g.status}</strong></div><Link className="btn secondary full" href="/groups/demo">Open group</Link></div>)}<div className="card"><h2>Need a group?</h2><p>Create a chilimba and invite your friends, family or workmates.</p><Link className="btn full" href="/groups/new">Create Chilimba</Link></div></section></main>;
}
