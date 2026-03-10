const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, 'data', 'siliconatlas.db')

function initDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS processors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER UNIQUE,
      model_name TEXT NOT NULL,
      family TEXT NOT NULL,
      model TEXT NOT NULL,
      codename TEXT NOT NULL,
      cores INTEGER NOT NULL,
      threads INTEGER NOT NULL,
      boost_clock_ghz REAL NOT NULL,
      cache_l3_mb REAL NOT NULL,
      tdp_watts INTEGER NOT NULL,
      launch_year INTEGER NOT NULL,
      max_memory_tb REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gpus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER UNIQUE,
      model_name TEXT NOT NULL,
      vendor TEXT NOT NULL,
      model TEXT NOT NULL,
      form_factor TEXT,
      memory_gb REAL,
      memory_type TEXT,
      tdp_watts INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_processors_launch_year ON processors(launch_year);
    CREATE INDEX IF NOT EXISTS idx_processors_model_name ON processors(model_name);
    CREATE INDEX IF NOT EXISTS idx_gpus_model_name ON gpus(model_name);
    CREATE INDEX IF NOT EXISTS idx_gpus_vendor ON gpus(vendor);
  `)
  return db
}

module.exports = { initDb, dbPath }