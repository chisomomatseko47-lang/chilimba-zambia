import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Production implementation: verify provider signature, validate payload with Zod,
  // enforce idempotency on provider event/reference, then append a transaction event.
  const body = await request.json();
  if (!body?.reference) return NextResponse.json({error:'Invalid webhook'}, {status:400});
  return NextResponse.json({received:true});
}
