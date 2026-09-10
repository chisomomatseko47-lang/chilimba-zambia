'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function TransactionsPage(){
 const supabase=createClient(); const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){window.location.href='/login';return}const {data}=await supabase.from('payment_transactions').select('id,amount,currency,status,provider,created_at,metadata,chilimba_groups(name)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);setRows(data||[]);setLoading(false)})()},[supabase]);
 return <main className="shell"><header className="topbar"><Link href="/dashboard">← Dashboard</Link><strong>Transactions</strong></header><section className="hero"><p className="eyebrow">MONEY ACTIVITY</p><h1>Your<br/>transaction history.</h1><p>Every contribution and payment status, clearly recorded in Zambian kwacha.</p></section><section className="card"><div className="section-head"><div><p className="eyebrow">LEDGER</p><h2>Recent activity</h2></div><span className="pill badge-gold">ZMW</span></div>{loading?<p className="muted">Loading transactions…</p>:rows.length===0?<p className="muted">Your payment activity will appear here after your first contribution.</p>:rows.map(r=>{const network=r.metadata?.network;return <div className="payout" key={r.id}><span className="avatar">{r.status==='successful'?'✓':'₭'}</span><div><strong>{r.chilimba_groups?.name||'Chilimba contribution'}</strong><small>{new Date(r.created_at).toLocaleString()} · {network?String(network).toUpperCase():'Mobile money'}</small></div><div><strong>K{Number(r.amount).toLocaleString()}</strong><small className={r.status==='successful'?'positive':''}>{r.status}</small></div></div>})}</section><nav className="mobile-nav"><Link href="/dashboard">⌂<span>Home</span></Link><Link href="/groups">♧<span>Groups</span></Link><Link href="/member">₭<span>Pay</span></Link><Link className="active" href="/transactions">◷<span>History</span></Link><Link href="/profile">♙<span>Profile</span></Link></nav></main>
}
