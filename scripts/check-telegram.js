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

async function checkTelegram() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  console.log('Connecting to DB to check Telegram settings...');
  const connection = await mysql.createConnection({ host, port, user, password, database });

  const [rows] = await connection.query(
    `SELECT setting_key, setting_value FROM \`${prefix}settings\` WHERE setting_key IN ('telegram_bot_token', 'telegram_chat_id')`
  );

  console.log('Database Telegram settings:', rows);

  await connection.end();
}

checkTelegram().catch(err => {
  console.error(err);
  process.exit(1);
});
