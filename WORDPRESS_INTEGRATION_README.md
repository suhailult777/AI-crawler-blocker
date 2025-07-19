# WordPress Plugin Integration - AI Crawler Guard

This document provides a comprehensive overview of the WordPress plugin integration for the AI Crawler Guard platform.

## Overview

The WordPress plugin integration allows users to protect their WordPress websites from AI bots and monetize bot access through two main approaches:

1. **Manual URL Protection** - Add any website URL for protection
2. **WordPress Plugin Installation** - Install a dedicated WordPress plugin for seamless integration

## Architecture

### Backend Components

#### Database Schema
- **`wordpress_sites`** - Stores registered WordPress sites and manual URLs
- **`bot_requests`** - Logs all bot detection events and monetization attempts
- **`site_analytics`** - Aggregated analytics data for dashboard display
- **`plugin_configurations`** - Plugin settings and configurations

#### Models
- **`WordPressSite`** - Site management and API key handling
- **`BotRequest`** - Bot detection logging and analytics
- **`SiteAnalytics`** - Analytics aggregation and reporting

#### Controllers
- **`wordpress.controller.js`** - Site management, registration, and settings
- **`bot-detection.controller.js`** - Bot detection and monetization logic

#### Services
- **`cloudflare.service.js`** - Cloudflare Workers integration for bot protection

### Frontend Components

#### Dashboard Components
- **`wordpress-sites-panel.jsx`** - Site management interface
- **`bot-protection-panel.jsx`** - Bot protection configuration
- **`wordpress-analytics-panel.jsx`** - Analytics and reporting dashboard
- **`wordpress-plugin-guide.jsx`** - Step-by-step plugin installation guide

## Features

### Bot Detection
- **AI Bot Signatures** - Detects major AI bots (GPT, Claude, Bard, etc.)
- **Pattern Matching** - Identifies suspicious user agent patterns
- **Confidence Scoring** - Assigns confidence levels to bot detections
- **Heuristic Analysis** - Advanced bot detection algorithms

### Monetization
- **Per-Request Pricing** - Configurable pricing per bot request
- **Allowed Bot Lists** - Whitelist specific bots (search engines, social media)
- **Payment Integration** - Stripe integration for bot access payments
- **Revenue Tracking** - Detailed revenue analytics and reporting

### Analytics
- **Real-time Monitoring** - Live bot detection and request logging
- **Historical Data** - 30/90/365-day analytics retention
- **Bot Type Analysis** - Breakdown by bot types and companies
- **Revenue Reports** - Detailed monetization analytics

### Cloudflare Integration
- **Worker Deployment** - Automatic Cloudflare Worker deployment
- **Edge Protection** - Bot detection at the edge for better performance
- **Custom Rules** - Site-specific bot protection rules
- **Analytics Integration** - Cloudflare analytics integration

## API Endpoints

### Site Management
```
POST   /api/v1/wordpress/sites              - Register new site
GET    /api/v1/wordpress/sites              - Get user sites
GET    /api/v1/wordpress/sites/:id          - Get site details
PUT    /api/v1/wordpress/sites/:id          - Update site settings
DELETE /api/v1/wordpress/sites/:id          - Delete site
POST   /api/v1/wordpress/sites/:id/regenerate-key - Regenerate API key
```

### Analytics
```
GET    /api/v1/wordpress/sites/:id/analytics     - Get site analytics
GET    /api/v1/wordpress/sites/:id/bot-statistics - Get bot statistics
GET    /api/v1/wordpress/sites/:id/bot-requests  - Get recent bot requests
GET    /api/v1/wordpress/dashboard/overview      - Get dashboard overview
```

### Public API (WordPress Plugin)
```
POST   /api/v1/wordpress/api/validate-key  - Validate API key
POST   /api/v1/wordpress/api/detect-bot    - Bot detection endpoint
POST   /api/v1/wordpress/api/log-request   - Log bot request
```

## WordPress Plugin

### Installation
1. Download `crawlguard-wp.zip` from the dashboard
2. Upload to WordPress via Plugins → Add New → Upload Plugin
3. Activate the plugin
4. Configure API key in Settings → AI Crawler Guard

### Features
- **Automatic Bot Detection** - Real-time bot detection on all page requests
- **API Integration** - Seamless integration with AI Crawler Guard API
- **Admin Dashboard** - WordPress admin interface for plugin management
- **Settings Panel** - Configure bot protection settings
- **Status Monitoring** - Connection status and health checks

### Plugin Structure
```
wp-admin/crawlguard-wp/
├── crawlguard-wp.php           # Main plugin file
├── includes/
│   ├── class-bot-detector.php  # Bot detection logic
│   ├── class-api-client.php    # API communication
│   └── class-admin.php         # WordPress admin interface
├── admin/
│   ├── css/                    # Admin styles
│   ├── js/                     # Admin scripts
│   └── partials/               # Admin templates
└── database/
    └── schema.sql              # Database schema
```

## Configuration

### Environment Variables
```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# API Configuration
API_BASE_URL=https://api.aicrawlerguard.com
```

### Subscription Limits
- **Free Plan**: 1 site, basic bot detection
- **Pro Plan**: 5 sites, advanced analytics, monetization
- **Enterprise Plan**: Unlimited sites, custom integrations

## Testing

### Automated Testing
Run the comprehensive test suite:
```bash
cd backend/subscription-tracker
node scripts/test-wordpress-integration.js
```

### Manual Testing
1. Register a test site in the dashboard
2. Configure bot protection settings
3. Test with different user agents:
   - `GPTBot/1.0` (OpenAI)
   - `ClaudeBot/1.0` (Anthropic)
   - `Google-Extended` (Google AI)
4. Verify analytics and monetization

### Test Sites
Use the test sites configured in `.env.development.local`:
- Test Site 1: WordPress plugin integration
- Test Site 2: Manual URL protection

## Deployment

### Database Migration
```bash
# Run the WordPress tables migration
psql -d your_database -f backend/subscription-tracker/migrations/001_add_wordpress_tables.sql
```

### Cloudflare Worker Deployment
Workers are automatically deployed when sites are registered with Cloudflare integration enabled.

### WordPress Plugin Distribution
The plugin is packaged and distributed through the dashboard download feature.

## Security

### API Key Management
- Unique API keys per site
- Secure key generation using crypto.randomUUID()
- Key validation on all API requests
- Key regeneration capability

### Bot Detection Security
- Rate limiting on detection endpoints
- IP-based suspicious activity detection
- Encrypted configuration storage
- Secure API communication

## Monitoring

### Health Checks
- Site ping monitoring (24-hour intervals)
- Plugin connection status
- API endpoint health checks
- Cloudflare Worker status

### Analytics Aggregation
- Daily analytics aggregation via cron jobs
- Real-time request logging
- Revenue tracking and reporting
- Bot pattern analysis

## Support

### Dashboard Features
- Step-by-step plugin installation guide
- Real-time analytics and monitoring
- Bot protection configuration
- Revenue management and reporting

### Documentation
- Complete API documentation
- WordPress plugin documentation
- Integration guides and tutorials
- Troubleshooting guides

## Future Enhancements

### Planned Features
- Advanced bot fingerprinting
- Machine learning-based detection
- Custom bot rules engine
- Multi-site management dashboard
- Advanced payment options
- Enterprise SSO integration

### Roadmap
- Q1 2024: Enhanced analytics and reporting
- Q2 2024: Machine learning integration
- Q3 2024: Enterprise features
- Q4 2024: Advanced monetization options

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Configure environment variables
4. Run database migrations
5. Start development servers

### Testing Guidelines
- Write unit tests for all new features
- Run integration tests before deployment
- Test with multiple WordPress versions
- Validate Cloudflare Worker functionality

For more information, see the main project documentation and API reference.
