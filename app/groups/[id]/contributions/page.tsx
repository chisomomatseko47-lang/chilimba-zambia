'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ContributionsPage(){const {id}=useParams<{id:string}>();const supabase=createClient();const [rows,setRows]=useState<any[]>([]);const [busy,setBusy]=useState<string|null>(null);const [error,setError]=useState('');
async function load(){const {data}=await supabase.from('contributions').select('id,due_date,amount,status,paid_at,group_members!inner(user_id,profiles(full_name,phone))').eq('group_id',id).order('due_date').order('created_at');setRows(data||[])}
useEffect(()=>{load()},[id]);
async function pay(row:any){setBusy(row.id);setError('');const r=await fetch(`/api/groups/${id}/simulate-payment`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contribution_id:row.id})});const d=await r.json();if(!r.ok)setError(d.error||'Payment failed');await load();setBusy(null)}
return <main className="shell"><nav className="topbar"><a href={`/groups/${id}`}>← Group</a><strong>Contributions</strong></nav><section><span className="eyebrow">SAVINGS LEDGER</span><h1>Contributions</h1><p className="muted">Every contribution is recorded against a cycle.</p></section><section className="card">{error&&<p role="alert">{error}</p>}{rows.length===0?<p className="muted">No contribution records yet. Generate the schedule first.</p>:rows.map(r=><div className="payout" key={r.id}><span>{r.status==='paid'?'✓':'•'}</span><div><strong>{r.group_members?.profiles?.full_name||'Member'}</strong><small>Due {r.due_date} · {r.status}</small></div><div><strong>K{Number(r.amount).toLocaleString()}</strong>{r.status==='pending'&&<button onClick={()=>pay(r)} disabled={busy===r.id}>{busy===r.id?'…':'Pay'}</button>}</div></div>)}</section></main>}
