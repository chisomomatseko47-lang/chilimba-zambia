'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const [checking,setChecking]=useState(true);
  useEffect(()=>{const supabase=createClient();supabase.auth.getUser().then(({data})=>{if(!data.user) router.replace('/login'); else setChecking(false)});},[router]);
  if(checking)return <main className="shell"><section className="card"><p>Checking your secure session…</p></section></main>;
  return <>{children}</>;
}
