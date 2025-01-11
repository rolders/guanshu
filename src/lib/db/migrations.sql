-- Drop existing tables if they exist
DROP TABLE IF EXISTS "Key";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "User";

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'GUEST', 'ADMIN')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Session table
CREATE TABLE "Session" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL
);

-- Create Key table
CREATE TABLE "Key" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  hashed_password TEXT
); 