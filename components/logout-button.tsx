'use client';
import { signOut } from '@/lib/auth';
export default function LogoutButton(){return <button className="secondary" onClick={signOut}>Sign out</button>}
