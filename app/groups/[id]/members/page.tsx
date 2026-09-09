'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function MembersPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const supabase = createClient();
  const [members,setMembers]=useState<any[]>([]); const [phone,setPhone]=useState(''); const [name,setName]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function load(){ const {data}=await supabase.from('group_members').select('id,role,status,payout_position,profiles(full_name,phone)').eq('group_id',id).order('payout_position'); setMembers(data||[]); }
  useEffect(()=>{load()},[id]);
  async function add(e:FormEvent){e.preventDefault();setBusy(true);setError('');const r=await fetch(`/api/groups/${id}/members`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone,full_name:name})});const d=await r.json();if(!r.ok)setError(d.error||'Unable to add member');else{setPhone('');setName('');await load()}setBusy(false)}
  return <main className="shell"><nav className="topbar"><button onClick={()=>router.back()}>← Back</button><strong>Members</strong></nav><section><span className="eyebrow">GROUP MANAGEMENT</span><h1>Manage members</h1><p className="muted">Add members by their registered Zambian phone number.</p></section><form className="card form-card" onSubmit={add}><h2>Add member</h2><label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" /></label><label>Phone number<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+260 97…" /></label>{error&&<p role="alert">{error}</p>}<button className="btn" disabled={busy}>{busy?'Adding…':'Add member'}</button></form><section className="card"><h2>{members.length} members</h2>{members.map(m=><div className="member" key={m.id}><span className="avatar">{(m.profiles?.full_name||m.profiles?.phone||'?')[0]}</span><div><strong>{m.profiles?.full_name||'Member'}</strong><small>{m.profiles?.phone||'Phone not set'} · Payout #{m.payout_position}</small></div><span className="pill">{m.status}</span></div>)}</section></main>;
}
