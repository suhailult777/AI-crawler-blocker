-- Migration: Add WordPress Plugin Tables
-- Description: Add tables for WordPress sites, bot requests, analytics, and plugin configurations

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

-- WordPress Sites table - stores registered WordPress sites and manual URLs
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

-- Bot Requests table - logs all bot detection and monetization events
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

-- Site Analytics table - aggregated analytics for dashboard
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(site_id, date)
);

-- Plugin Configurations table - store plugin settings
CREATE TABLE IF NOT EXISTS plugin_configurations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    site_id TEXT NOT NULL REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id ON wordpress_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_api_key ON wordpress_sites(api_key);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_status ON wordpress_sites(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_site_url ON wordpress_sites(site_url);

CREATE INDEX IF NOT EXISTS idx_bot_requests_site_id ON bot_requests(site_id);
CREATE INDEX IF NOT EXISTS idx_bot_requests_created_at ON bot_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_requests_bot_detected ON bot_requests(bot_detected) WHERE bot_detected = true;
CREATE INDEX IF NOT EXISTS idx_bot_requests_revenue ON bot_requests(revenue_amount) WHERE revenue_amount > 0;
CREATE INDEX IF NOT EXISTS idx_bot_requests_ip_address ON bot_requests(ip_address);

CREATE INDEX IF NOT EXISTS idx_site_analytics_site_date ON site_analytics(site_id, date);
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(date);

CREATE INDEX IF NOT EXISTS idx_plugin_configurations_site_id ON plugin_configurations(site_id);
CREATE INDEX IF NOT EXISTS idx_plugin_configurations_key ON plugin_configurations(config_key);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DO $$ BEGIN
    CREATE TRIGGER update_wordpress_sites_updated_at 
        BEFORE UPDATE ON wordpress_sites
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_plugin_configurations_updated_at 
        BEFORE UPDATE ON plugin_configurations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
BEGIN
    INSERT INTO site_analytics (
        site_id,
        date,
        total_requests,
        bot_requests,
        monetized_requests,
        total_revenue,
        unique_bots,
        top_bot_types
    )
    SELECT 
        site_id,
        target_date,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE bot_detected = true) as bot_requests,
        COUNT(*) FILTER (WHERE revenue_amount > 0) as monetized_requests,
        COALESCE(SUM(revenue_amount), 0) as total_revenue,
        COUNT(DISTINCT bot_name) FILTER (WHERE bot_detected = true) as unique_bots,
        jsonb_object_agg(
            bot_name, 
            COUNT(*)
        ) FILTER (WHERE bot_detected = true AND bot_name IS NOT NULL) as top_bot_types
    FROM bot_requests
    WHERE DATE(created_at) = target_date
    GROUP BY site_id
    ON CONFLICT (site_id, date) 
    DO UPDATE SET
        total_requests = EXCLUDED.total_requests,
        bot_requests = EXCLUDED.bot_requests,
        monetized_requests = EXCLUDED.monetized_requests,
        total_revenue = EXCLUDED.total_revenue,
        unique_bots = EXCLUDED.unique_bots,
        top_bot_types = EXCLUDED.top_bot_types;
END;
$$ LANGUAGE plpgsql;

-- Insert sample AI companies data for reference
INSERT INTO ai_companies (company_name, contact_email, subscription_active, rate_per_request) VALUES
('OpenAI', 'partnerships@openai.com', false, 0.002),
('Anthropic', 'business@anthropic.com', false, 0.0015),
('Google AI', 'ai-partnerships@google.com', false, 0.001),
('Microsoft AI', 'ai-licensing@microsoft.com', false, 0.0012),
('Meta AI', 'ai-data@meta.com', false, 0.001)
ON CONFLICT (company_name) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW wordpress_site_summary AS
SELECT 
    ws.id,
    ws.site_url,
    ws.site_name,
    ws.site_type,
    ws.status,
    ws.monetization_enabled,
    u.name as user_name,
    u.email as user_email,
    COALESCE(SUM(br.revenue_amount), 0) as total_revenue,
    COUNT(br.id) as total_requests,
    COUNT(br.id) FILTER (WHERE br.bot_detected = true) as bot_requests,
    COUNT(br.id) FILTER (WHERE br.revenue_amount > 0) as monetized_requests,
    ws.created_at
FROM wordpress_sites ws
LEFT JOIN users u ON ws.user_id = u.id
LEFT JOIN bot_requests br ON ws.id = br.site_id
WHERE ws.status = 'active'
GROUP BY ws.id, ws.site_url, ws.site_name, ws.site_type, ws.status, ws.monetization_enabled, u.name, u.email, ws.created_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON wordpress_sites TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bot_requests TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON site_analytics TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_configurations TO your_app_user;
