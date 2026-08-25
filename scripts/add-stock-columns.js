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

async function addStockColumns() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  console.log('Connecting to database to add stock columns...');
  const connection = await mysql.createConnection({ host, port, user, password, database });

  // 1. Add stock_quantity column to products table if not exists
  const [prodCols] = await connection.query(`DESCRIBE \`${prefix}products\``);
  const hasStockQty = prodCols.some(c => c.Field === 'stock_quantity');
  if (!hasStockQty) {
    await connection.query(
      `ALTER TABLE \`${prefix}products\` ADD COLUMN stock_quantity INT NOT NULL DEFAULT 100 AFTER discounted_rate`
    );
    console.log(`Added stock_quantity column to ${prefix}products table.`);
  } else {
    console.log(`stock_quantity column already exists in ${prefix}products table.`);
  }

  // 2. Add is_stock_deducted column to orders table if not exists
  const [orderCols] = await connection.query(`DESCRIBE \`${prefix}orders\``);
  const hasIsDeducted = orderCols.some(c => c.Field === 'is_stock_deducted');
  if (!hasIsDeducted) {
    await connection.query(
      `ALTER TABLE \`${prefix}orders\` ADD COLUMN is_stock_deducted TINYINT(1) NOT NULL DEFAULT 0 AFTER status`
    );
    console.log(`Added is_stock_deducted column to ${prefix}orders table.`);
  } else {
    console.log(`is_stock_deducted column already exists in ${prefix}orders table.`);
  }

  await connection.end();
  console.log('Database migration completed successfully!');
}

addStockColumns().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
