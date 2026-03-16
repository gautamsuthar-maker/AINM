import { NextResponse } from 'next/server';
import { clearTokens } from '@/lib/linkedin-ads/token-store';

export async function POST() {
  try {
    clearTokens();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
