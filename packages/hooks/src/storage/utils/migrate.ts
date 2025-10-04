export type TMigration = {
  id: string
  sql: string
}

export type TMigrationRunner = {
  getCurrentVersion: () => Promise<number>
  runMigration: (migration: TMigration) => Promise<void>
  setVersion: (version: number) => Promise<void>
}

// Built-in migrations
export const migrations: TMigration[] = [
  {
    id: '001_initial',
    sql: `
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    user_id TEXT,
    session_id TEXT NOT NULL,
    url TEXT NOT NULL,
    event TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    referrer TEXT,
    duration INTEGER,
    meta TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    pageviews INTEGER DEFAULT 0,
    duration INTEGER
);`
  },
  {
    id: '002_add_indices',
    sql: `
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_url ON events(url);
CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`
  }
]

/**
 * Run pending migrations for a database.
 */
export async function runMigrations(runner: TMigrationRunner): Promise<void> {
  const currentVersion = await runner.getCurrentVersion()
  
  console.log(`Current schema version: ${currentVersion}`)
  
  for (let i = currentVersion; i < migrations.length; i++) {
    const migration = migrations[i]
    console.log(`Running migration: ${migration.id}`)
    
    try {
      await runner.runMigration(migration)
      await runner.setVersion(i + 1)
      console.log(`✓ Migration ${migration.id} completed`)
    } catch (error) {
      console.error(`✗ Migration ${migration.id} failed:`, error)
      throw error
    }
  }
  
  console.log('All migrations completed successfully')
}

/**
 * Create schema version table for tracking migrations.
 */
export function getSchemaVersionSQL(): string {
  return `
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at BIGINT NOT NULL
);

-- Insert initial version if table is empty
INSERT OR IGNORE INTO schema_version (version, applied_at) 
VALUES (0, ${Date.now()});`
}