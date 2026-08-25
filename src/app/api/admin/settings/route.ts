import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import crypto from 'crypto';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`SELECT setting_key, setting_value FROM ${table('settings')}`);
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => {
      settings[r.setting_key] = r.setting_value || '';
    });
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, settings, current_password, new_password } = body;

    if (action === 'update_settings' && settings) {
      for (const [key, value] of Object.entries(settings)) {
        await pool.query(
          `INSERT INTO ${table('settings')} (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, (value as string) || '']
        );
      }
      return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    }

    if (action === 'change_password') {
      if (!current_password || !new_password) {
        return NextResponse.json({ success: false, message: 'Current and new password are required' }, { status: 400 });
      }

      const [userRows]: any = await pool.query(
        `SELECT * FROM ${table('admin_users')} WHERE id = ?`,
        [session.id]
      );

      if (userRows.length === 0) {
        return NextResponse.json({ success: false, message: 'Admin user not found' }, { status: 404 });
      }

      const user = userRows[0];
      const currentHash = crypto.createHash('sha256').update(current_password).digest('hex');

      if (user.password !== currentHash && user.password !== current_password) {
        return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });
      }

      const newHash = crypto.createHash('sha256').update(new_password).digest('hex');
      await pool.query(
        `UPDATE ${table('admin_users')} SET password = ? WHERE id = ?`,
        [newHash, session.id]
      );

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
