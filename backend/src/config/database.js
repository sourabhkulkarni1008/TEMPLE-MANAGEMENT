// ==========================================================
// SMART TEMPLE MANAGEMENT & PILGRIM FLOW SYSTEM
// MySQL Database Connection Configuration
// ==========================================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ── Connection Pool Configuration ──────────────────────────
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'temple_db',
  waitForConnections: true,
  connectionLimit: 10,         // Max simultaneous connections
  queueLimit: 0,               // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  timezone: '+05:30',          // IST for Indian temple
  dateStrings: true,           // Return dates as strings (not Date objects)
  multipleStatements: true     // Allow multiple SQL statements in one query
};

// Create the connection pool (lazy – first query triggers actual TCP connect)
const pool = mysql.createPool(poolConfig);

// ── Health Check ───────────────────────────────────────────
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log(`[MySQL] ✅ Connected to database "${poolConfig.database}" on ${poolConfig.host}:${poolConfig.port}`);
    connection.release();
    return true;
  } catch (err) {
    console.error(`[MySQL] ❌ Connection failed:`, err.message);
    return false;
  }
}

// ── Graceful Shutdown ──────────────────────────────────────
export async function closePool() {
  try {
    await pool.end();
    console.log('[MySQL] Connection pool closed gracefully.');
  } catch (err) {
    console.error('[MySQL] Error closing pool:', err.message);
  }
}

// ── Query Helper ───────────────────────────────────────────
// Wraps pool.execute with logging in development mode
export async function query(sql, params = []) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('[MySQL QUERY ERROR]', err.message);
    console.error('  SQL:', sql);
    console.error('  Params:', params);
    throw err;
  }
}

// For multi-statement or DDL queries (uses pool.query, not execute)
export async function rawQuery(sql) {
  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    console.error('[MySQL RAW QUERY ERROR]', err.message);
    throw err;
  }
}

// ── Transaction Helper ─────────────────────────────────────
export async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export { pool };
export default pool;
