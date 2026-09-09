# Chilimba Zambia MVP

Mobile-first rotating savings (chilimba) platform for Zambia.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL + RLS
- Vercel
- Payment-provider abstraction for MTN/Airtel/Zamtel integrations
- Webhook-driven payment reconciliation

## MVP principles
- Platform does not hold customer funds.
- Payment records are append-only from the application layer.
- Provider webhooks are idempotent.
- Group membership and ledger access are protected by RLS.

## Core flows
1. User signs in with phone/email.
2. Organizer creates a group and contribution rule.
3. Members join via invitation.
4. System generates payout schedule.
5. Members pay through a licensed payment provider.
6. Webhook confirms payment and records immutable transaction event.
7. Scheduled payout is initiated only when business rules are satisfied.
8. Every member sees the same contribution/payout ledger.
