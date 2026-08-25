import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    let query = `SELECT * FROM ${table('orders')} WHERE order_id = ?`;
    const queryParams: any[] = [orderId];

    if (phone) {
      query += ` AND customer_phone = ?`;
      queryParams.push(phone.trim());
    }

    const [orders]: any = await pool.query(query, queryParams);

    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Fetch items
    const [items]: any = await pool.query(
      `SELECT oi.*, u.symbol as unit_symbol 
       FROM ${table('order_items')} oi 
       LEFT JOIN ${table('products')} p ON oi.product_id = p.id
       LEFT JOIN ${table('units')} u ON p.unit_id = u.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    order.items = items;

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { status, customer_name, customer_phone, customer_address, items } = body;

    if (status) {
      await pool.query(
        `UPDATE ${table('orders')} SET status = ? WHERE order_id = ?`,
        [status, orderId]
      );
    }

    if (customer_name || customer_phone || customer_address) {
      await pool.query(
        `UPDATE ${table('orders')} 
         SET customer_name = COALESCE(?, customer_name), 
             customer_phone = COALESCE(?, customer_phone), 
             customer_address = COALESCE(?, customer_address) 
         WHERE order_id = ?`,
        [customer_name || null, customer_phone || null, customer_address || null, orderId]
      );
    }

    // If items are being edited
    if (Array.isArray(items)) {
      await pool.query(`DELETE FROM ${table('order_items')} WHERE order_id = ?`, [orderId]);
      let newTotal = 0;
      for (const item of items) {
        const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity);
        newTotal += itemTotal;
        await pool.query(
          `INSERT INTO ${table('order_items')} (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, parseInt(item.quantity), parseFloat(item.unit_price), itemTotal]
        );
      }
      await pool.query(`UPDATE ${table('orders')} SET total_amount = ? WHERE order_id = ?`, [newTotal, orderId]);
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    await pool.query(`DELETE FROM ${table('order_items')} WHERE order_id = ?`, [orderId]);
    await pool.query(`DELETE FROM ${table('orders')} WHERE order_id = ?`, [orderId]);

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
