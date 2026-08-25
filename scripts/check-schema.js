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

async function checkSchema() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  const connection = await mysql.createConnection({ host, port, user, password, database });

  const [prodCols] = await connection.query(`DESCRIBE \`${prefix}products\``);
  console.log('Products table columns:', prodCols.map(c => c.Field));

  const [orderCols] = await connection.query(`DESCRIBE \`${prefix}orders\``);
  console.log('Orders table columns:', orderCols.map(c => c.Field));

  await connection.end();
}

checkSchema().catch(console.error);
