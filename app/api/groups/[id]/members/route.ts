import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: admin } = await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).eq('status', 'active').single();
  const { data: group } = await supabase.from('chilimba_groups').select('created_by').eq('id', id).single();
  if (group?.created_by !== user.id && admin?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const phone = String(body.phone || '').trim();
  const fullName = String(body.full_name || '').trim();
  if (!phone) return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });

  const { data: profile } = await supabase.from('profiles').select('id').eq('phone', phone).maybeSingle();
  if (!profile) return NextResponse.json({ error: 'That member must create a Chilimba account first. Invitation delivery will be added with SMS/WhatsApp.' }, { status: 404 });

  const { data: maxRow } = await supabase.from('group_members').select('payout_position').eq('group_id', id).order('payout_position', { ascending: false }).limit(1).maybeSingle();
  const nextPosition = (maxRow?.payout_position || 0) + 1;
  const { data, error } = await supabase.from('group_members').insert({ group_id: id, user_id: profile.id, role: 'member', status: 'active', payout_position: nextPosition }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, member_id: data.id, payout_position: nextPosition });
}
