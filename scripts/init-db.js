const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
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

async function initDatabase() {
  const host = process.env.DB_HOST || '192.169.147.255';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'MEAZHA';
  const password = process.env.DB_PASS || 'dZYRYi(o(0*U';
  const database = process.env.DB_NAME || 'le_test';
  const prefix = process.env.TABLE_PREFIX || 'svt_crackers_';

  console.log(`Connecting to MySQL database ${database} at ${host}:${port}...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: false
  });

  console.log('Connected successfully!');

  // Create admin_users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}admin_users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(100) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}admin_users checked/created.`);

  // Create categories table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}categories\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(100) NOT NULL,
      \`description\` TEXT,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}categories checked/created.`);

  // Create units table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}units\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(50) NOT NULL,
      \`symbol\` VARCHAR(20) NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}units checked/created.`);

  // Create products table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}products\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(255) NOT NULL,
      \`description\` TEXT,
      \`category_id\` INT,
      \`unit_id\` INT,
      \`mrp_rate\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`discounted_rate\` DECIMAL(10,2) DEFAULT NULL,
      \`image_url\` VARCHAR(500),
      \`is_active\` TINYINT(1) DEFAULT 1,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`category_id\`) REFERENCES \`${prefix}categories\`(\`id\`) ON DELETE SET NULL,
      FOREIGN KEY (\`unit_id\`) REFERENCES \`${prefix}units\`(\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}products checked/created.`);

  // Create orders table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}orders\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`order_id\` VARCHAR(50) NOT NULL UNIQUE,
      \`customer_name\` VARCHAR(255) NOT NULL,
      \`customer_phone\` VARCHAR(50) NOT NULL,
      \`customer_address\` TEXT NOT NULL,
      \`total_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`status\` VARCHAR(50) DEFAULT 'Bill Order Placed',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}orders checked/created.`);

  // Create order_items table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}order_items\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`order_id\` VARCHAR(50) NOT NULL,
      \`product_id\` INT NOT NULL,
      \`product_name\` VARCHAR(255) NOT NULL,
      \`quantity\` INT NOT NULL DEFAULT 1,
      \`unit_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`total_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}order_items checked/created.`);

  // Create settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`${prefix}settings\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`setting_key\` VARCHAR(100) NOT NULL UNIQUE,
      \`setting_value\` TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log(`Table ${prefix}settings checked/created.`);

  // Seed default admin user (username: admin, password: adminpassword)
  const crypto = require('crypto');
  const defaultPass = 'adminpassword';
  const hash = crypto.createHash('sha256').update(defaultPass).digest('hex');

  const [users] = await connection.query(`SELECT id FROM \`${prefix}admin_users\` WHERE username = 'admin'`);
  if (users.length === 0) {
    await connection.query(`
      INSERT INTO \`${prefix}admin_users\` (username, password) VALUES ('admin', '${hash}')
    `);
    console.log('Default admin user created: admin / adminpassword');
  }

  // Seed default store settings if empty
  const defaultSettings = [
    ['store_name', 'Sri Vinayaga Crackers'],
    ['store_address', 'D/No :229. Subramaniyapuram (Near Ruby Sparklers), Sivakasi- Taluk, Virudhunagar- Dist. Tamilnadu- 626128.'],
    ['store_phone', '+91 7780967465 / +91 9566383227'],
    ['store_email', 'srivinayagacrackers26@gmail.com'],
    ['telegram_bot_token', ''],
    ['telegram_chat_id', '']
  ];

  for (const [key, val] of defaultSettings) {
    await connection.query(`
      INSERT INTO \`${prefix}settings\` (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)
    `, [key, val]);
  }
  console.log('Default settings seeded.');

  // Seed default units if empty
  const [units] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${prefix}units\``);
  if (units[0].cnt === 0) {
    await connection.query(`
      INSERT INTO \`${prefix}units\` (name, symbol) VALUES
      ('Box', 'BOX'),
      ('Packet', 'PKT'),
      ('Piece', 'PCS'),
      ('Tin', 'TIN')
    `);
    console.log('Default units seeded.');
  }

  // Seed default categories if empty
  const [cats] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${prefix}categories\``);
  if (cats[0].cnt === 0) {
    await connection.query(`
      INSERT INTO \`${prefix}categories\` (name, description) VALUES
      ('Sound Crackers', 'Single sound, 2 sound, 3 sound and atom bomb crackers'),
      ('Sparklers', 'Electric sparklers, color sparklers and crackling sparklers'),
      ('Flower Pots', 'Big, Special, Deluxe and Color Changing Flower Pots'),
      ('Ground Chakkars', 'Asoka, Special, Deluxe and Whistling Chakkars'),
      ('Rockets', 'Lunik, Whistling, Music and Multi-color Sky Rockets'),
      ('Fancy Aerial Shots', '12 Shot, 30 Shot, 60 Shot, 120 Shot Sky repeating displays'),
      ('Novelty Fireworks', 'Peacock, Dancing Wheel, Magic Pops, Fountain Fireworks')
    `);
    console.log('Default categories seeded.');
  }

  // Seed initial products if empty
  const [prods] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${prefix}products\``);
  if (prods[0].cnt === 0) {
    const [cRows] = await connection.query(`SELECT id, name FROM \`${prefix}categories\``);
    const catMap = {};
    cRows.forEach(c => catMap[c.name] = c.id);

    const [uRows] = await connection.query(`SELECT id, symbol FROM \`${prefix}units\``);
    const unitMap = {};
    uRows.forEach(u => unitMap[u.symbol] = u.id);

    const sampleProducts = [
      { name: '2 3/4" Kuruvi Crackers', cat: 'Sound Crackers', unit: 'PKT', mrp: 120, disc: 30 },
      { name: '3 1/2" Laxmi Crackers', cat: 'Sound Crackers', unit: 'PKT', mrp: 180, disc: 45 },
      { name: '10 cm Electric Sparklers', cat: 'Sparklers', unit: 'BOX', mrp: 150, disc: 38 },
      { name: '15 cm Green Sparklers', cat: 'Sparklers', unit: 'BOX', mrp: 240, disc: 60 },
      { name: 'Flower Pot Small', cat: 'Flower Pots', unit: 'BOX', mrp: 280, disc: 70 },
      { name: 'Flower Pot Deluxe', cat: 'Flower Pots', unit: 'BOX', mrp: 450, disc: 110 },
      { name: 'Ground Chakkar Asoka', cat: 'Ground Chakkars', unit: 'BOX', mrp: 200, disc: 50 },
      { name: 'Ground Chakkar Special', cat: 'Ground Chakkars', unit: 'BOX', mrp: 320, disc: 80 },
      { name: 'Baby Rocket', cat: 'Rockets', unit: 'BOX', mrp: 220, disc: 55 },
      { name: 'Whistling Rocket', cat: 'Rockets', unit: 'BOX', mrp: 380, disc: 95 },
      { name: '12 Shot Sky Display', cat: 'Fancy Aerial Shots', unit: 'BOX', mrp: 850, disc: 220 },
      { name: '30 Shot Sky Display', cat: 'Fancy Aerial Shots', unit: 'BOX', mrp: 1950, disc: 550 }
    ];

    for (const p of sampleProducts) {
      await connection.query(`
        INSERT INTO \`${prefix}products\` (name, category_id, unit_id, mrp_rate, discounted_rate, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [p.name, catMap[p.cat] || null, unitMap[p.unit] || null, p.mrp, p.disc]);
    }
    console.log('Sample products seeded.');
  }

  await connection.end();
  console.log('Database initialization complete!');
}

initDatabase().catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});
