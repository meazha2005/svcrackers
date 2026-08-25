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

async function updateStoreSettings() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  console.log('Connecting to database to update store settings...');
  const connection = await mysql.createConnection({ host, port, user, password, database });

  const newSettings = [
    ['store_name', 'Sri Vinayaga Crackers'],
    ['store_address', 'D/No :229. Subramaniyapuram (Near Ruby Sparklers), Sivakasi- Taluk, Virudhunagar- Dist. Tamilnadu- 626128.'],
    ['store_phone', '+91 7780967465 / +91 9566383227'],
    ['store_email', 'srivinayagacrackers26@gmail.com']
  ];

  for (const [key, val] of newSettings) {
    await connection.query(
      `INSERT INTO \`${prefix}settings\` (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, val]
    );
    console.log(`Updated setting ${key}: ${val}`);
  }

  await connection.end();
  console.log('Database store settings updated successfully!');
}

updateStoreSettings().catch(err => {
  console.error('Error updating settings:', err);
  process.exit(1);
});
