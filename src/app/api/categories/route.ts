import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM ${table('categories')} c 
      LEFT JOIN ${table('products')} p ON c.id = p.category_id AND p.is_active = 1 
      GROUP BY c.id 
      ORDER BY (c.name + 0) ASC, c.name ASC
    `);
    return NextResponse.json({ success: true, categories: rows });
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

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO ${table('categories')} (name, description) VALUES (?, ?)`,
      [name.trim(), description ? description.trim() : null]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Category added' });
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

    const { id, name, description } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID and Category name are required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE ${table('categories')} SET name = ?, description = ? WHERE id = ?`,
      [name.trim(), description ? description.trim() : null, parseInt(id)]
    );

    return NextResponse.json({ success: true, message: 'Category updated' });
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
      return NextResponse.json({ success: false, message: 'Category ID required' }, { status: 400 });
    }

    const [check]: any = await pool.query(
      `SELECT COUNT(*) as count FROM ${table('products')} WHERE category_id = ? AND is_active = 1`,
      [parseInt(id)]
    );

    if (check[0].count > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete category. Active products exist in this category.' }, { status: 400 });
    }

    await pool.query(`DELETE FROM ${table('categories')} WHERE id = ?`, [parseInt(id)]);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
