-- Migration: 001_add_user_profile_fields.sql
-- Description: Add profile customization fields to users table
-- Date: 2025-06-28

ALTER TABLE users 
ADD COLUMN bio TEXT,
ADD COLUMN avatar_url VARCHAR(512),
ADD COLUMN theme_preference ENUM('light', 'dark', 'auto') DEFAULT 'auto',
ADD COLUMN notification_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index for performance
CREATE INDEX idx_users_last_active ON users(last_active_at);

-- Update existing users with default values
UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE last_active_at IS NULL; 