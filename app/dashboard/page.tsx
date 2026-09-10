'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/components/brand';

export default function DashboardPage(){
 const supabase=createClient();
 const [groups,setGroups]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(user){const {data}=await supabase.from('group_members').select('group_id,role,payout_position,chilimba_groups(id,name,contribution_amount,frequency,start_date)').eq('user_id',user.id).eq('status','active');setGroups(data||[])}setLoading(false)})()},[]);
 const total=groups.reduce((sum,x)=>sum+Number(x.chilimba_groups?.contribution_amount||0),0);
 return <main className="shell">
  <header className="topbar"><Link href="/dashboard"><Brand compact/></Link><nav><Link href="/groups">Groups</Link> <Link href="/profile">Profile</Link></nav></header>
  <section className="hero"><p className="eyebrow">YOUR FINANCIAL JOURNEY</p><h1>Save together.<br/>Build tomorrow.</h1><p>One trusted place for your chilimbas, contributions and payout schedule.</p><div style={{marginTop:22}}><Link className="btn" href="/groups/new">+ Create a chilimba</Link></div></section>
  <section className="stats">
   <div className="stat"><span>Active groups</span><strong>{groups.length}</strong><small className="positive">● All systems active</small></div>
   <div className="stat"><span>Monthly commitment</span><strong>K{total.toLocaleString()}</strong><small>Across your groups</small></div>
   <div className="stat"><span>Trust status</span><strong>Verified</strong><small className="positive">Secure account</small></div>
  </section>
  <div className="dashboard-grid">
   <section className="card"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><div><p className="eyebrow">MY CHILIMBAS</p><h2>Your groups</h2></div><Link className="pill" href="/groups">View all</Link></div>
    {loading?<p className="muted">Loading your groups…</p>:groups.length===0?<><p className="muted">Create your first group or join one with an invitation.</p><Link className="btn" href="/groups/new">Start saving</Link></>:groups.map(x=>{const g=x.chilimba_groups;return <Link className="member" href={`/groups/${g.id}`} key={g.id}><span className="avatar">{g.name[0]}</span><div><strong>{g.name}</strong><small>K{Number(g.contribution_amount).toLocaleString()} · {g.frequency} · Payout #{x.payout_position||'—'}</small></div><span className="positive">→</span></Link>})}
   </section>
   <section className="card"><p className="eyebrow">QUICK ACTIONS</p><h2>Manage your money</h2><div className="quick-actions" style={{marginTop:14}}><Link className="action" href="/groups/new"><b>＋ New group</b><span>Create a trusted circle</span></Link><Link className="action" href="/member"><b>₭ Contribute</b><span>Make your next payment</span></Link><Link className="action" href="/profile"><b>♙ Profile</b><span>Account & security</span></Link><Link className="action" href="/groups"><b>↗ Activity</b><span>See group activity</span></Link></div></section>
  </div>
  <nav className="mobile-nav"><Link className="active" href="/dashboard">⌂<span>Home</span></Link><Link href="/groups">♧<span>Groups</span></Link><Link href="/member">▣<span>Payments</span></Link><Link href="/profile">♙<span>Profile</span></Link></nav>
  <footer>Chilimba Zambia · Save · Grow · Together · ZMW</footer>
 </main>
}
