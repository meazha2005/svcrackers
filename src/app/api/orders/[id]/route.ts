import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

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

    // Fetch current order info before update
    const [existingRows]: any = await pool.query(
      `SELECT * FROM ${table('orders')} WHERE order_id = ?`,
      [orderId]
    );

    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const existingOrder = existingRows[0];
    const targetStatus = status || existingOrder.status;
    const isCurrentlyDeducted = Number(existingOrder.is_stock_deducted || 0) === 1;

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

    let updatedTotal = existingOrder.total_amount;

    // If items are being edited
    if (Array.isArray(items)) {
      // If stock was already deducted for this order, restore old items' stock first
      if (isCurrentlyDeducted) {
        const [oldItems]: any = await pool.query(
          `SELECT product_id, quantity FROM ${table('order_items')} WHERE order_id = ?`,
          [orderId]
        );
        for (const item of oldItems) {
          await pool.query(
            `UPDATE ${table('products')} SET stock_quantity = stock_quantity + ? WHERE id = ?`,
            [item.quantity, item.product_id]
          );
        }
      }

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
      updatedTotal = newTotal;

      // If target status is Success, deduct stock for the new items
      if (targetStatus === 'Success') {
        for (const item of items) {
          await pool.query(
            `UPDATE ${table('products')} SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?`,
            [parseInt(item.quantity), item.product_id]
          );
        }
        await pool.query(
          `UPDATE ${table('orders')} SET is_stock_deducted = 1 WHERE order_id = ?`,
          [orderId]
        );
      } else {
        await pool.query(
          `UPDATE ${table('orders')} SET is_stock_deducted = 0 WHERE order_id = ?`,
          [orderId]
        );
      }
    } else {
      // If items were NOT edited, handle standard status transition
      if (targetStatus === 'Success' && !isCurrentlyDeducted) {
        const [orderItems]: any = await pool.query(
          `SELECT product_id, quantity FROM ${table('order_items')} WHERE order_id = ?`,
          [orderId]
        );
        for (const item of orderItems) {
          await pool.query(
            `UPDATE ${table('products')} SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?`,
            [item.quantity, item.product_id]
          );
        }
        await pool.query(
          `UPDATE ${table('orders')} SET is_stock_deducted = 1 WHERE order_id = ?`,
          [orderId]
        );
      } else if (targetStatus !== 'Success' && isCurrentlyDeducted) {
        const [orderItems]: any = await pool.query(
          `SELECT product_id, quantity FROM ${table('order_items')} WHERE order_id = ?`,
          [orderId]
        );
        for (const item of orderItems) {
          await pool.query(
            `UPDATE ${table('products')} SET stock_quantity = stock_quantity + ? WHERE id = ?`,
            [item.quantity, item.product_id]
          );
        }
        await pool.query(
          `UPDATE ${table('orders')} SET is_stock_deducted = 0 WHERE order_id = ?`,
          [orderId]
        );
      }
    }

    // Trigger Telegram Notification for Order Action Update
    try {
      const targetName = customer_name || existingOrder.customer_name || 'Customer';
      const targetPhone = customer_phone || existingOrder.customer_phone || '';
      const updatedStatus = status || existingOrder.status || 'Updated';

      const stockNote = targetStatus === 'Success' && !isCurrentlyDeducted ? '\n📦 <i>Product stock quantities automatically updated.</i>' : '';

      const telegramMsg = `
🔄 <b>ORDER ACTION UPDATED!</b>

🆔 <b>Order ID:</b> <code>${orderId}</code>
👤 <b>Customer:</b> ${targetName}
📞 <b>Phone:</b> ${targetPhone}
📌 <b>New Status:</b> <b>${updatedStatus}</b>
💵 <b>Total Amount:</b> ₹${Number(updatedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}${stockNote}

<i>Sri Vinayaga Crackers Admin Panel</i>
      `.trim();

      await sendTelegramNotification(telegramMsg);
    } catch (tErr) {
      console.error('Telegram order action alert error:', tErr);
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

    // Check if order stock was deducted, if so restore stock before deleting
    const [existingRows]: any = await pool.query(
      `SELECT is_stock_deducted FROM ${table('orders')} WHERE order_id = ?`,
      [orderId]
    );

    if (existingRows.length > 0 && Number(existingRows[0].is_stock_deducted || 0) === 1) {
      const [orderItems]: any = await pool.query(
        `SELECT product_id, quantity FROM ${table('order_items')} WHERE order_id = ?`,
        [orderId]
      );
      for (const item of orderItems) {
        await pool.query(
          `UPDATE ${table('products')} SET stock_quantity = stock_quantity + ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    await pool.query(`DELETE FROM ${table('order_items')} WHERE order_id = ?`, [orderId]);
    await pool.query(`DELETE FROM ${table('orders')} WHERE order_id = ?`, [orderId]);

    // Trigger Telegram Notification for Order Deletion
    try {
      const telegramMsg = `
🗑️ <b>ORDER DELETED</b>

🆔 <b>Order ID:</b> <code>${orderId}</code>
<i>This order was deleted by Administrator.</i>

<i>Sri Vinayaga Crackers Admin Panel</i>
      `.trim();

      await sendTelegramNotification(telegramMsg);
    } catch (tErr) {
      console.error('Telegram order deletion alert error:', tErr);
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
