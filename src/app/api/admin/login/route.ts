import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { signJwt, setAdminCookie } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM ${table('admin_users')} WHERE username = ?`,
      [username.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
    }

    const user = rows[0];
    const passHash = crypto.createHash('sha256').update(password).digest('hex');

    // Check sha256 or fallback comparison
    if (user.password !== passHash && user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
    }

    const token = signJwt({ id: user.id, username: user.username });
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
