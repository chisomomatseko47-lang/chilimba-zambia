'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/logout-button';

type Contribution = {
  id: string;
  group_id: string;
  due_date: string;
  amount: number | string;
  status: string;
  paid_at: string | null;
  chilimba_groups: { id: string; name: string; frequency: string } | null;
};

type Payment = {
  row: Contribution;
  transaction_id: string;
  status: string;
};

export default function MemberHome() {
  const supabase = createClient();
  const [rows, setRows] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data, error } = await supabase
      .from('contributions')
      .select(
        'id,group_id,due_date,amount,status,paid_at,chilimba_groups(id,name,frequency),group_members!inner(user_id,payout_position)',
      )
      .eq('group_members.user_id', user.id)
      .order('due_date');

    if (error) {
      setMessage('Unable to load your contributions. Please try again.');
    } else {
      setRows((data ?? []) as unknown as Contribution[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(
    () => rows.filter((row) => row.status === 'pending'),
    [rows],
  );
  const paid = useMemo(
    () => rows.filter((row) => row.status === 'paid'),
    [rows],
  );
  const totalDue = pending.reduce((sum, row) => sum + Number(row.amount), 0);
  const totalPaid = paid.reduce((sum, row) => sum + Number(row.amount), 0);

  async function pay(row: Contribution) {
    if (!phone.trim()) {
      setMessage('Enter your mobile-money number first.');
      return;
    }

    setPaying(row.id);
    setMessage('');

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contribution_id: row.id,
          phone,
          provider: 'moneyunify',
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Unable to start payment.');
        return;
      }

      setPayment({
        row,
        transaction_id: data.transaction_id,
        status: data.status,
      });
      setMessage(
        data.status === 'pending'
          ? 'Payment request sent. Check your phone and approve it.'
          : 'Payment started.',
      );
    } catch {
      setMessage('Unable to connect to the payment service. Please try again.');
    } finally {
      setPaying(null);
    }
  }

  const verify = useCallback(async () => {
    if (!payment) return;

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transaction_id: payment.transaction_id }),
      });
      const data = await response.json();

      setPayment((current) =>
        current ? { ...current, status: data.status } : current,
      );

      setMessage(
        data.status === 'successful'
          ? 'Payment confirmed successfully.'
          : data.status === 'pending'
            ? 'Still waiting for approval…'
            : `Payment ${data.status}.`,
      );

      if (data.status !== 'pending') {
        await load();
      }
    } catch {
      setMessage('Unable to verify the payment right now.');
    }
  }, [load, payment]);

  useEffect(() => {
    if (!payment || payment.status !== 'pending') return;

    const timer = window.setInterval(() => {
      void verify();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [payment, verify]);

  if (loading) {
    return (
      <main className="shell">
        <section className="card">
          <p>Loading your savings…</p>
        </section>
      </main>
    );
  }

  const paymentPending = payment?.status === 'pending';

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/dashboard">← Dashboard</Link>
        <LogoutButton />
      </header>

      <section>
        <span className="eyebrow">MEMBER HOME</span>
        <h1>Your savings</h1>
        <p className="muted">
          Pay your Chilimba contribution securely through MoneyUnify.
        </p>
      </section>

      <section className="stats">
        <div className="card">
          <span>Due</span>
          <strong>K{totalDue.toLocaleString()}</strong>
        </div>
        <div className="card">
          <span>Paid</span>
          <strong>K{totalPaid.toLocaleString()}</strong>
        </div>
        <div className="card">
          <span>Records</span>
          <strong>{rows.length}</strong>
        </div>
      </section>

      {message && (
        <section className="card">
          <p role="status">{message}</p>
        </section>
      )}

      <section className="card">
        <h2>Mobile number</h2>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="097 123 4567"
          autoComplete="tel"
        />
        <small>Use the number registered with MTN, Airtel or Zamtel.</small>
      </section>

      <section className="card">
        <h2>Next contributions</h2>
        {pending.length === 0 ? (
          <p className="muted">You&apos;re up to date. 🎉</p>
        ) : (
          pending.slice(0, 5).map((row) => (
            <div className="payout" key={row.id}>
              <div>
                <strong>{row.chilimba_groups?.name ?? 'Chilimba group'}</strong>
                <small>
                  Due {row.due_date} · {row.chilimba_groups?.frequency ?? ''}
                </small>
              </div>
              <div>
                <strong>K{Number(row.amount).toLocaleString()}</strong>
                <button
                  type="button"
                  onClick={() => void pay(row)}
                  disabled={paying === row.id || paymentPending}
                >
                  {paying === row.id ? 'Starting…' : 'Pay with mobile money'}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {payment && (
        <section className="card">
          <h2>Payment status</h2>
          <p>
            {payment.status === 'pending'
              ? '📱 Check your phone and approve the MoneyUnify request. We are checking automatically.'
              : payment.status === 'successful'
                ? '✅ Payment confirmed.'
                : `Payment status: ${payment.status}`}
          </p>
          {paymentPending && (
            <button type="button" onClick={() => void verify()}>
              Check now
            </button>
          )}
        </section>
      )}

      <section className="card">
        <h2>Payment history</h2>
        {paid.slice(-5).reverse().map((row) => (
          <div className="payout" key={row.id}>
            <div>
              <strong>{row.chilimba_groups?.name ?? 'Chilimba group'}</strong>
              <small>
                Paid {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : '—'}
              </small>
            </div>
            <strong>K{Number(row.amount).toLocaleString()}</strong>
            <span className="pill">Paid</span>
          </div>
        ))}
        {paid.length === 0 && (
          <p className="muted">Your completed payments will appear here.</p>
        )}
      </section>
    </main>
  );
}
