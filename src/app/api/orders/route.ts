import { NextResponse } from 'next/server';
import pool, { table } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

function generateOrderId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `SVC${dateStr}${randNum}`;
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1 ';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?) `;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ` AND o.status = ? `;
      queryParams.push(status);
    }

    // Count query
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM ${table('orders')} o ${whereClause}`,
      queryParams
    );
    const totalOrders = countResult[0]?.total || 0;

    // Fetch orders query
    const [orders]: any = await pool.query(
      `SELECT o.*, (SELECT COUNT(*) FROM ${table('order_items')} oi WHERE oi.order_id = o.order_id) as item_count
       FROM ${table('orders')} o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let connection: any = null;
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_address, cart, items } = body;

    if (!customer_name || !customer_phone || !customer_address) {
      return NextResponse.json({ success: false, message: 'Missing required customer details' }, { status: 400 });
    }

    // Normalize cart items into array of { product_id, quantity }
    let cartItems: { product_id: number; quantity: number }[] = [];
    if (cart && typeof cart === 'object') {
      Object.entries(cart).forEach(([id, qty]) => {
        const pId = parseInt(id);
        const q = parseInt(qty as string);
        if (pId && q > 0) {
          cartItems.push({ product_id: pId, quantity: q });
        }
      });
    } else if (Array.isArray(items)) {
      cartItems = items.filter(i => i.product_id && i.quantity > 0);
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty. Please select products.' }, { status: 400 });
    }

    // Acquire connection from pool
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Generate unique order ID
    let order_id = generateOrderId();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      const [check]: any = await connection.query(
        `SELECT COUNT(*) as cnt FROM ${table('orders')} WHERE order_id = ?`,
        [order_id]
      );
      if (check[0].cnt === 0) {
        isUnique = true;
      } else {
        order_id = generateOrderId();
      }
    }

    // Fetch product details for all cart items in a single query for speed
    const productIds = cartItems.map(item => item.product_id);
    const [productRows]: any = await connection.query(
      `SELECT id, name, mrp_rate, discounted_rate FROM ${table('products')} WHERE id IN (?) AND is_active = 1`,
      [productIds]
    );

    const productMap = new Map();
    productRows.forEach((p: any) => productMap.set(p.id, p));

    let total_amount = 0;
    const orderItemsToInsert: any[] = [];

    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        await connection.rollback();
        return NextResponse.json({ success: false, message: `Product (ID: ${item.product_id}) is unavailable.` }, { status: 400 });
      }

      const unit_price = (product.discounted_rate && Number(product.discounted_rate) < Number(product.mrp_rate))
        ? parseFloat(product.discounted_rate)
        : parseFloat(product.mrp_rate);

      const total_price = unit_price * item.quantity;
      total_amount += total_price;

      orderItemsToInsert.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price,
        total_price
      });
    }

    // Insert order record
    await connection.query(
      `INSERT INTO ${table('orders')} (order_id, customer_name, customer_phone, customer_address, total_amount, status)
       VALUES (?, ?, ?, ?, ?, 'Bill Order Placed')`,
      [order_id, customer_name.trim(), customer_phone.trim(), customer_address.trim(), total_amount]
    );

    // Insert order items in batch
    const itemValues = orderItemsToInsert.map(item => [
      order_id,
      item.product_id,
      item.product_name,
      item.quantity,
      item.unit_price,
      item.total_price
    ]);

    await connection.query(
      `INSERT INTO ${table('order_items')} (order_id, product_id, product_name, quantity, unit_price, total_price)
       VALUES ?`,
      [itemValues]
    );

    await connection.commit();

    // Fire Telegram Notification completely out-of-band so response is instant!
    setImmediate(() => {
      const itemListText = orderItemsToInsert
        .map((item, idx) => `  ${idx + 1}. ${item.product_name} × ${item.quantity} = ₹${item.total_price.toFixed(2)}`)
        .join('\n');

      const isPos = customer_address.includes('counter billing');
      const headerTitle = isPos ? '🧾 <b>NEW ADMIN POS BILL CREATED!</b>' : '🎉 <b>NEW ORDER ESTIMATE PLACED!</b>';

      const telegramMessage = `
${headerTitle}

🆔 <b>Order ID:</b> <code>${order_id}</code>
👤 <b>Customer:</b> ${customer_name}
📞 <b>Phone:</b> ${customer_phone}
📍 <b>Address:</b> ${customer_address}

🛒 <b>ORDERED ITEMS (${orderItemsToInsert.length}):</b>
${itemListText}

💵 <b>NET TOTAL AMOUNT:</b> ₹${total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
📌 <b>Status:</b> Bill Order Placed

<i>Sri Vinayaga Crackers Store</i>
      `.trim();

      sendTelegramNotification(telegramMessage).catch(err => console.error('Telegram background alert error:', err));
    });

    return NextResponse.json({
      success: true,
      order_id,
      total_amount,
      message: 'Order placed successfully!'
    });

  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rErr) {
        console.error('Rollback error:', rErr);
      }
    }
    console.error('Order placement route error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error placing order' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
