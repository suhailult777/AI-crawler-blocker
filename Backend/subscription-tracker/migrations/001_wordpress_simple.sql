-- Simple WordPress Plugin Migration
-- Description: Add core tables for WordPress sites and bot detection

-- Create enums for WordPress plugin functionality
DO $$ BEGIN
    CREATE TYPE site_type_enum AS ENUM ('manual', 'wordpress_plugin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE site_status_enum AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bot_action_enum AS ENUM ('logged', 'allowed', 'blocked', 'monetized');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bot_type_enum AS ENUM ('ai_bot', 'search_bot', 'social_bot', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- WordPress Sites table
CREATE TABLE IF NOT EXISTS wordpress_sites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_url VARCHAR(255) NOT NULL,
    site_name VARCHAR(255),
    site_type site_type_enum DEFAULT 'manual' NOT NULL,
    status site_status_enum DEFAULT 'active' NOT NULL,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    plugin_version VARCHAR(20),
    wordpress_version VARCHAR(20),
    admin_email VARCHAR(255),
    monetization_enabled BOOLEAN DEFAULT false,
    pricing_per_request DECIMAL(10,6) DEFAULT 0.001,
    allowed_bots JSONB DEFAULT '[]'::jsonb,
    stripe_account_id VARCHAR(255),
    cloudflare_zone_id VARCHAR(255),
    last_ping_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Bot Requests table
CREATE TABLE IF NOT EXISTS bot_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    site_id TEXT NOT NULL REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    bot_detected BOOLEAN DEFAULT false,
    bot_type bot_type_enum,
    bot_name VARCHAR(100),
    confidence_score INTEGER DEFAULT 0,
    page_url TEXT,
    content_type VARCHAR(50),
    content_length INTEGER DEFAULT 0,
    action_taken bot_action_enum DEFAULT 'logged',
    revenue_amount DECIMAL(10,6) DEFAULT 0.00,
    payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Site Analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    site_id TEXT NOT NULL REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    bot_requests INTEGER DEFAULT 0,
    monetized_requests INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,6) DEFAULT 0.00,
    unique_bots INTEGER DEFAULT 0,
    top_bot_types JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Plugin Configurations table
CREATE TABLE IF NOT EXISTS plugin_configurations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    site_id TEXT NOT NULL REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id ON wordpress_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_api_key ON wordpress_sites(api_key);
CREATE INDEX IF NOT EXISTS idx_bot_requests_site_id ON bot_requests(site_id);
CREATE INDEX IF NOT EXISTS idx_bot_requests_created_at ON bot_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_site_analytics_site_id ON site_analytics(site_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(date);
CREATE INDEX IF NOT EXISTS idx_plugin_configurations_site_id ON plugin_configurations(site_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_wordpress_sites_updated_at ON wordpress_sites;
CREATE TRIGGER update_wordpress_sites_updated_at
    BEFORE UPDATE ON wordpress_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plugin_configurations_updated_at ON plugin_configurations;
CREATE TRIGGER update_plugin_configurations_updated_at
    BEFORE UPDATE ON plugin_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
