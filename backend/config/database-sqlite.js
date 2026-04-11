import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../homeaway.db');

let db = null;

export function initDb() {
  try {
    db = new Database(dbPath);
    console.log('✅ Database connected successfully (SQLite)');
    console.log(`📁 Database file: ${dbPath}`);
    
    createTables();
    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT NOT NULL,
      avatar TEXT,
      auth_provider TEXT DEFAULT 'email',
      google_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trips table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      location_lat REAL,
      location_lng REAL,
      location_name TEXT,
      status TEXT DEFAULT 'planning',
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trip Members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trip_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'viewer',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id, user_id)
    )
  `);

  // Trip Steps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trip_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      step_date TEXT NOT NULL,
      step_time TEXT,
      step_type TEXT DEFAULT 'other',
      location_name TEXT,
      location_lat REAL,
      location_lng REAL,
      duration_hours INTEGER,
      estimated_cost REAL,
      currency TEXT DEFAULT 'EUR',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      file_type TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      document_type TEXT DEFAULT 'other',
      uploaded_by INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      expense_date TEXT NOT NULL,
      category TEXT DEFAULT 'other',
      paid_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expense Splits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      email TEXT,
      user_id INTEGER,
      invite_code TEXT UNIQUE,
      role TEXT DEFAULT 'viewer',
      status TEXT DEFAULT 'pending',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `);
}

export function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

export function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

export function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('Database run error:', error.message);
    throw error;
  }
}
