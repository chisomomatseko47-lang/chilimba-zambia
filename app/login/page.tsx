'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    setMessage(error ? error.message : 'OTP sent. Check your phone.');
  }

  return <main className="auth"><div className="auth-card"><span className="eyebrow">Chilimba Zambia</span><h1>Welcome back</h1><p>Sign in with your Zambian mobile number.</p><form onSubmit={sendOtp}><label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+260 97 123 4567" required /></label><button className="btn" disabled={loading}>{loading ? 'Sending…' : 'Send OTP'}</button></form>{message && <p className="notice">{message}</p>}</div></main>;
}
