-- Honolytics Storage Schema
-- Compatible with PostgreSQL and SQLite/Turso

-- Events table: stores individual user interactions
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
    duration INTEGER, -- Duration in seconds
    meta TEXT -- JSON string for additional data
);

-- Sessions table: stores user session data  
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    pageviews INTEGER DEFAULT 0,
    duration INTEGER -- Session duration in seconds
);

-- Indices for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_url ON events(url);
CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);