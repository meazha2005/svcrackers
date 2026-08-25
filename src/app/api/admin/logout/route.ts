import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth';

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
