import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    let query = `
      SELECT p.*, c.name as category_name, u.name as unit_name, u.symbol as unit_symbol 
      FROM ${table('products')} p 
      LEFT JOIN ${table('categories')} c ON p.category_id = c.id 
      LEFT JOIN ${table('units')} u ON p.unit_id = u.id 
    `;

    if (!includeInactive) {
      query += ` WHERE p.is_active = 1 `;
    }

    query += ` ORDER BY (c.name + 0) ASC, c.name ASC, p.id ASC`;

    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, products: rows });
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
    const { name, description, category_id, unit_id, mrp_rate, discounted_rate, stock_quantity, image_url } = body;

    if (!name || mrp_rate === undefined) {
      return NextResponse.json({ success: false, message: 'Name and MRP are required' }, { status: 400 });
    }

    const stockQty = stock_quantity !== undefined && stock_quantity !== null && stock_quantity !== ''
      ? Math.max(0, parseInt(stock_quantity))
      : 100;

    const [result]: any = await pool.query(
      `INSERT INTO ${table('products')} (name, description, category_id, unit_id, mrp_rate, discounted_rate, stock_quantity, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name.trim(),
        description || null,
        category_id ? parseInt(category_id) : null,
        unit_id ? parseInt(unit_id) : null,
        parseFloat(mrp_rate),
        discounted_rate ? parseFloat(discounted_rate) : null,
        stockQty,
        image_url || null
      ]
    );

    return NextResponse.json({ success: true, id: result.insertId, message: 'Product created successfully' });
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

    const body = await request.json();
    const { id, name, description, category_id, unit_id, mrp_rate, discounted_rate, stock_quantity, image_url, is_active } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID and Name are required' }, { status: 400 });
    }

    const stockQty = stock_quantity !== undefined && stock_quantity !== null && stock_quantity !== ''
      ? Math.max(0, parseInt(stock_quantity))
      : 100;

    await pool.query(
      `UPDATE ${table('products')} 
       SET name = ?, description = ?, category_id = ?, unit_id = ?, mrp_rate = ?, discounted_rate = ?, stock_quantity = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        name.trim(),
        description || null,
        category_id ? parseInt(category_id) : null,
        unit_id ? parseInt(unit_id) : null,
        parseFloat(mrp_rate),
        discounted_rate ? parseFloat(discounted_rate) : null,
        stockQty,
        image_url || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        parseInt(id)
      ]
    );

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
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
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    // Soft delete product by setting is_active = 0
    await pool.query(`UPDATE ${table('products')} SET is_active = 0 WHERE id = ?`, [parseInt(id)]);

    return NextResponse.json({ success: true, message: 'Product deleted (deactivated) successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
