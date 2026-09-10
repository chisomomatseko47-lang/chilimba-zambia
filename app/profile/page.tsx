'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage(){const supabase=createClient();const router=useRouter();const [name,setName]=useState('');const [phone,setPhone]=useState('');const [saving,setSaving]=useState(false);const [message,setMessage]=useState('');
useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace('/login');return}const {data}=await supabase.from('profiles').select('full_name,phone').eq('id',user.id).maybeSingle();if(data){setName(data.full_name||'');setPhone(data.phone||user.phone||'')}})()},[router]);
async function save(e:FormEvent){e.preventDefault();setSaving(true);setMessage('');const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace('/login');return}const {error}=await supabase.from('profiles').upsert({id:user.id,full_name:name.trim(),phone:phone.trim()});if(error)setMessage(error.message);else{setMessage('Profile saved.');setTimeout(()=>router.push('/dashboard'),500)}setSaving(false)}
return <main className="shell"><nav className="topbar"><a href="/dashboard">← Dashboard</a><strong>Your profile</strong></nav><section><span className="eyebrow">ONBOARDING</span><h1>Tell us about you</h1><p className="muted">Use your real name and Zambian mobile number so groups can identify you.</p></section><form className="card form-card" onSubmit={save}><label>Full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Chisomo Maseko" /></label><label>Mobile number<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+260 97 123 4567" /></label>{message&&<p role="status">{message}</p>}<button className="btn" disabled={saving}>{saving?'Saving…':'Save profile'}</button></form></main>}
