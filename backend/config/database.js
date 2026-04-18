import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Nécessaire pour Supabase
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function initDb() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully (PostgreSQL via Supabase)');
    client.release();

    await createTables();
    console.log('✅ All tables created successfully');

    await runMigrations();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

export async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT NOT NULL,
      avatar TEXT,
      auth_provider TEXT DEFAULT 'email',
      google_id TEXT,
      is_active INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS trip_members (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'viewer',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id, user_id)
    )`,

    `CREATE TABLE IF NOT EXISTS trip_steps (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      description TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS trip_documents (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT,
      file_url TEXT,
      created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date TEXT,
      paid_by INTEGER,
      split_between TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS expense_splits (
      id SERIAL PRIMARY KEY,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      email TEXT,
      user_id INTEGER,
      invite_code TEXT UNIQUE,
      role TEXT DEFAULT 'viewer',
      status TEXT DEFAULT 'pending',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS accommodations (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      checkin TEXT,
      checkout TEXT,
      price REAL,
      currency TEXT DEFAULT 'EUR',
      bookingreference TEXT,
      latitude REAL,
      longitude REAL,
      paid_by INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      duration INTEGER,
      price REAL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      location TEXT,
      paid_by INTEGER
    )`,

    `CREATE TABLE IF NOT EXISTS transports (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      departure TEXT NOT NULL,
      arrival TEXT NOT NULL,
      departuretime TEXT,
      arrivaltime TEXT,
      bookingreference TEXT,
      price REAL,
      latitude REAL,
      longitude REAL,
      paid_by INTEGER
    )`
  ];

    for (const query of queries) {
      try {
        await pool.query(query);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Error creating table:', error.message);
        }
      }
    }
}

export async function runMigrations() {
  try {
    // 1. Check if paid_by in expenses is text
    const expensesCol = await query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'paid_by'
    `);

    if (expensesCol.length > 0 && expensesCol[0].data_type === 'text') {
      console.log('🔄 Migrating expenses.paid_by from TEXT to INTEGER...');
      
      // Update existing emails to IDs (stored as text temporarily)
      await run(`
        UPDATE expenses 
        SET paid_by = u.id::text 
        FROM users u 
        WHERE expenses.paid_by = u.email
      `);

      // Change column type to INTEGER
      // We use explicit casting and handle non-numeric values by setting them to NULL
      await run(`
        ALTER TABLE expenses 
        ALTER COLUMN paid_by TYPE INTEGER 
        USING (CASE WHEN paid_by ~ '^[0-9]+$' THEN paid_by::integer ELSE NULL END)
      `);
      
      console.log('✅ Migration completed: expenses.paid_by is now INTEGER');
    }

    // 3. Add paid_by to accommodations, activities, transports if missing
    const tablesToUpdate = ['accommodations', 'activities', 'transports'];
    for (const table of tablesToUpdate) {
      const colCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'paid_by'
      `);
      if (colCheck.length === 0) {
        console.log(`🔄 Adding paid_by column to ${table}...`);
        await run(`ALTER TABLE ${table} ADD COLUMN paid_by INTEGER`);
      }
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

export function getPool() {
  return pool;
}

/**
 * Convertit les placeholders '?' de SQLite en '$1, $2...' de PostgreSQL
 */
function convertPlaceholders(sql) {
  let count = 1;
  return sql.replace(/\?/g, () => `$${count++}`);
}

export async function query(sql, params = []) {
  try {
    const finalSql = convertPlaceholders(sql);
    const result = await pool.query(finalSql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    throw error;
  }
}

export async function queryOne(sql, params = []) {
  try {
    const finalSql = convertPlaceholders(sql);
    const result = await pool.query(finalSql, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', sql);
    throw error;
  }
}

export async function run(sql, params = []) {
  try {
    let finalSql = convertPlaceholders(sql);
    
    // Pour PostgreSQL, on ajoute RETURNING id sur les INSERT pour récupérer le lastID
    if (finalSql.trim().toUpperCase().startsWith('INSERT') && !finalSql.toUpperCase().includes('RETURNING')) {
      finalSql += ' RETURNING id';
    }

    const result = await pool.query(finalSql, params);
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount
    };
  } catch (error) {
    console.error('Database run error:', error.message);
    console.error('SQL:', sql);
    throw error;
  }
}