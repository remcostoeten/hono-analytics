-- Migration 001: Initial schema
-- Creates events and sessions tables

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
);