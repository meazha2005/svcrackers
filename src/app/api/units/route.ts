import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT u.*, COUNT(p.id) as product_count 
      FROM ${table('units')} u 
      LEFT JOIN ${table('products')} p ON u.id = p.unit_id AND p.is_active = 1 
      GROUP BY u.id 
      ORDER BY u.name ASC
    `);
    return NextResponse.json({ success: true, units: rows });
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

    const { name, symbol } = await request.json();
    if (!name || !symbol) {
      return NextResponse.json({ success: false, message: 'Unit name and symbol are required' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO ${table('units')} (name, symbol) VALUES (?, ?)`,
      [name.trim(), symbol.trim().toUpperCase()]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Unit added' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, symbol } = await request.json();
    if (!id || !name || !symbol) {
      return NextResponse.json({ success: false, message: 'ID, Name, and Symbol are required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE ${table('units')} SET name = ?, symbol = ? WHERE id = ?`,
      [name.trim(), symbol.trim().toUpperCase(), parseInt(id)]
    );

    return NextResponse.json({ success: true, message: 'Unit updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Unit ID required' }, { status: 400 });
    }

    const [check]: any = await pool.query(
      `SELECT COUNT(*) as count FROM ${table('products')} WHERE unit_id = ? AND is_active = 1`,
      [parseInt(id)]
    );

    if (check[0].count > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete unit. Active products use this unit.' }, { status: 400 });
    }

    await pool.query(`DELETE FROM ${table('units')} WHERE id = ?`, [parseInt(id)]);
    return NextResponse.json({ success: true, message: 'Unit deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
