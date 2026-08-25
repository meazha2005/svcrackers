const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

async function testOrder() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  console.log('Testing connection & order placement...');
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10
  });

  const connection = await pool.getConnection();
  console.log('Connection acquired.');

  try {
    await connection.beginTransaction();
    console.log('Transaction started.');

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const order_id = `SVC${dateStr}${randNum}`;

    console.log('Generated order_id:', order_id);

    const [prods] = await connection.query(`SELECT id, name, mrp_rate, discounted_rate FROM \`${prefix}products\` LIMIT 2`);
    console.log('Fetched products:', prods);

    if (prods.length === 0) {
      console.log('No products found to order!');
      return;
    }

    const p = prods[0];
    const total_amount = p.discounted_rate || p.mrp_rate;

    await connection.query(
      `INSERT INTO \`${prefix}orders\` (order_id, customer_name, customer_phone, customer_address, total_amount, status)
       VALUES (?, ?, ?, ?, ?, 'Bill Order Placed')`,
      [order_id, 'Test User', '9876543210', 'Test Address', total_amount]
    );
    console.log('Inserted order.');

    await connection.query(
      `INSERT INTO \`${prefix}order_items\` (order_id, product_id, product_name, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, p.id, p.name, 1, total_amount, total_amount]
    );
    console.log('Inserted order item.');

    await connection.commit();
    console.log('Committed transaction successfully!');

  } catch (err) {
    console.error('Error in transaction:', err);
    await connection.rollback();
  } finally {
    connection.release();
    await pool.end();
  }
}

testOrder();
