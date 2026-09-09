'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewGroupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('500');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Please sign in first.'); setSaving(false); return; }
    const { data: group, error: groupError } = await supabase.from('chilimba_groups').insert({
      name: name.trim(), contribution_amount: Number(amount), frequency,
      start_date: startDate, created_by: user.id, currency: 'ZMW', country_code: 'ZM'
    }).select('id').single();
    if (groupError) { setError(groupError.message); setSaving(false); return; }
    const { error: memberError } = await supabase.from('group_members').insert({
      group_id: group.id, user_id: user.id, role: 'admin', status: 'active', payout_position: 1
    });
    if (memberError) { setError(memberError.message); setSaving(false); return; }
    router.push(`/groups/${group.id}`);
  }

  return <main className="shell"><nav className="topbar"><a href="/dashboard">← Dashboard</a><strong>New Chilimba</strong></nav><section><span className="eyebrow">CREATE GROUP</span><h1>Start your chilimba</h1><p className="muted">Set the rules once. Everyone sees the same schedule.</p></section><form className="card form-card" onSubmit={submit}><label>Group name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Lusaka Women Traders" /></label><label>Contribution (ZMW)<input required min="1" type="number" value={amount} onChange={e=>setAmount(e.target.value)} /></label><label>Frequency<select value={frequency} onChange={e=>setFrequency(e.target.value)}><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option></select></label><label>Start date<input required type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></label>{error&&<p role="alert">{error}</p>}<button className="btn" disabled={saving}>{saving?'Creating…':'Create chilimba'}</button></form></main>;
}
