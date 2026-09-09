'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: g, error: ge } = await supabase.from('chilimba_groups').select('*').eq('id', id).single();
      if (ge) { setError(ge.message); return; }
      setGroup(g);
      const { data: ms } = await supabase.from('group_members').select('id,user_id,role,status,payout_position,profiles(full_name,phone)').eq('group_id', id).order('payout_position');
      setMembers(ms || []);
      const { data: ps } = await supabase.from('payouts').select('*').eq('group_id', id).order('payout_position');
      setPayouts(ps || []);
    }
    load();
  }, [id]);

  if (error) return <main className="shell"><p role="alert">{error}</p><Link href="/dashboard">Back</Link></main>;
  if (!group) return <main className="shell"><p>Loading chilimba…</p></main>;
  const pool = group.contribution_amount * members.length;
  return <main className="shell"><nav className="topbar"><Link href="/dashboard">← Dashboard</Link><strong>{group.name}</strong></nav><section><span className="eyebrow">CHILIMBA GROUP</span><h1>{group.name}</h1><p className="muted">K{Number(group.contribution_amount).toLocaleString()} · {group.frequency} · {members.length} members</p></section><section className="stats"><div className="card"><span>Cycle payout</span><strong>K{pool.toLocaleString()}</strong></div><div className="card"><span>Members</span><strong>{members.length}</strong></div><div className="card"><span>Currency</span><strong>ZMW</strong></div></section><section className="card"><h2>Members & payout order</h2>{members.map((m,i)=><div className="member" key={m.id}><span className="avatar">{(m.profiles?.full_name||'?')[0]}</span><div><strong>{m.profiles?.full_name||m.profiles?.phone||'Member'}</strong><small>Position {m.payout_position||i+1}</small></div><span className="pill">{m.role}</span></div>)}</section><section className="card"><h2>Payout schedule</h2>{payouts.length===0?<p className="muted">Payout schedule will appear after members and cycle dates are configured.</p>:payouts.map(p=><div className="payout" key={p.id}><span>{p.payout_position}</span><div><strong>{p.scheduled_date}</strong><small>{p.status}</small></div><strong>K{Number(p.amount).toLocaleString()}</strong></div>)}</section></main>;
}
