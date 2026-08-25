import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.169.147.255',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'MEAZHA',
  password: process.env.DB_PASS || 'dZYRYi(o(0*U',
  database: process.env.DB_NAME || 'le_test',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export const TABLE_PREFIX = process.env.TABLE_PREFIX || 'svt_crackers_';

export function table(name: string): string {
  return `\`${TABLE_PREFIX}${name}\``;
}

export default pool;
