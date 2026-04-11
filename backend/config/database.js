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
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Verification Codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      budget REAL,
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
      date TEXT NOT NULL,
      start_time TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      description TEXT
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trip_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT,
      file_url TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date TEXT,
      paid_by INTEGER,
      split_between TEXT
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
      text TEXT NOT NULL,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Accommodations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS accommodations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      checkIn TEXT,
      checkOut TEXT,
      price REAL,
      currency TEXT DEFAULT 'EUR',
      bookingReference TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  // Activities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      duration INTEGER,
      price REAL,
      description TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  // Transports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      departure TEXT NOT NULL,
      arrival TEXT NOT NULL,
      departureTime TEXT,
      arrivalTime TEXT,
      bookingReference TEXT,
      price REAL,
      latitude REAL,
      longitude REAL
    )
  `);
}

export function query(sql, params = []) {
  const processedParams = params.map(p => p instanceof Date ? p.toISOString() : p);
  return Promise.resolve().then(() => {
    try {
      const stmt = db.prepare(sql);
      return stmt.all(...processedParams);
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  });
}

export function queryOne(sql, params = []) {
  const processedParams = params.map(p => p instanceof Date ? p.toISOString() : p);
  return Promise.resolve().then(() => {
    try {
      const stmt = db.prepare(sql);
      return stmt.get(...processedParams);
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  });
}

export function run(sql, params = []) {
  const processedParams = params.map(p => p instanceof Date ? p.toISOString() : p);
  return Promise.resolve().then(() => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(...processedParams);
      return {
        lastID: result.lastInsertRowid,
        changes: result.changes
      };
    } catch (error) {
      console.error('Database run error:', error.message);
      throw error;
    }
  });
}
