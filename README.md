# AI Crawler Guard

A comprehensive bot protection and monetization platform that helps website owners detect, limit, and monetize AI crawler traffic. Transform unwanted bot traffic into revenue streams while maintaining control over your content.

## 🚀 Features

- **Advanced Bot Detection**: Identify AI bots with 95%+ accuracy using sophisticated fingerprinting
- **Revenue Analytics Dashboard**: Track revenue loss from unmonetized AI traffic with detailed insights
- **Monetization Engine**: Convert bot traffic into revenue streams through intelligent rate limiting
- **Real-time Monitoring**: Live tracking of bot visits and potential revenue opportunities
- **Subscription Management**: Multi-tier pricing with automated billing and email notifications
- **WordPress Integration**: Easy-to-install plugin for WordPress sites with dashboard management
- **Cloudflare Integration**: Seamless integration with Cloudflare for enhanced bot protection

## 📁 Project Structure

```
AI-Crawler/
├── ai-crawler-frontend/           # React frontend application (Vite + Tailwind)
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   │   └── dashboard/         # Dashboard-specific components
│   │   ├── contexts/              # React contexts (Auth, Theme, etc.)
│   │   ├── hooks/                 # Custom React hooks for data fetching
│   │   ├── pages/                 # Page components and routing
│   │   └── services/              # API services and utilities
│   ├── package.json               # Frontend dependencies (pnpm)
│   └── vite.config.js             # Vite configuration with proxy setup
├── Backend/
│   └── subscription-tracker/      # Node.js backend API (Express + Drizzle)
│       ├── config/                # Configuration files (env, arcjet, nodemailer)
│       ├── controllers/           # Route controllers for API endpoints
│       ├── database/              # Database schema and connection
│       ├── middleware/            # Express middleware (auth, security, error)
│       ├── models/                # Database models and types
│       ├── routes/                # API route definitions
│       ├── scripts/               # Database migration and testing scripts
│       ├── services/              # External service integrations (Cloudflare)
│       └── utils/                 # Utility functions and helpers
├── wp-admin/
│   └── crawlguard-wp/             # WordPress plugin for easy integration
│       ├── includes/              # Plugin core functionality
│       ├── assets/                # CSS and JS assets
│       └── crawlguard-wp.php      # Main plugin file
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **React 19** with Vite for fast development and building
- **Tailwind CSS 4** for modern, responsive styling
- **React Router** for client-side navigation
- **React Hot Toast** for user notifications
- **Recharts** for analytics visualization and charts
- **date-fns** for date manipulation and formatting

### Backend

- **Node.js** with Express.js framework
- **Drizzle ORM** with PostgreSQL (Neon database)
- **JWT** authentication with secure token management
- **Arcjet** for advanced security middleware and bot protection
- **Upstash** for queue management and workflow automation
- **Nodemailer** for automated email services

### Infrastructure & Services

- **PostgreSQL** (Neon) for primary database
- **Cloudflare** for CDN and additional bot protection
- **Upstash** for background job processing
- **Arcjet** for security and rate limiting

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (LTS recommended)
- **pnpm** (preferred package manager)
- **PostgreSQL database** (Neon account recommended)
- **Git** for version control

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-Crawler
   ```

2. **Install pnpm globally** (if not already installed)

   ```bash
   npm install -g pnpm
   ```

3. **Frontend Setup**

   ```bash
   cd ai-crawler-frontend
   pnpm install
   ```

4. **Backend Setup**
   ```bash
   cd Backend/subscription-tracker
   pnpm install
   ```

## 🔧 Configuration

### Environment Variables Setup

Create environment files for both development and production:

#### Backend Environment (`.env.development.local`)

Create this file in `Backend/subscription-tracker/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
SERVER_URL=http://localhost:3001

# Database Configuration (Neon PostgreSQL)
DB_URI=postgresql://username:password@host:port/database_name

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Arcjet Security (https://app.arcjet.com)
ARCJET_KEY=your_arcjet_api_key
ARCJET_ENV=development

# Upstash Queue Management (https://console.upstash.com)
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

# Email Configuration (Gmail App Password)
EMAIL_PASSWORD=your_gmail_app_password

# Cloudflare Integration (Optional)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id
```

#### Frontend Environment (Optional)

The frontend uses Vite's proxy configuration to connect to the backend. No additional environment variables are required for basic setup.

### Database Setup

1. **Create a Neon Database**

   - Sign up at [Neon](https://neon.tech)
   - Create a new project and database
   - Copy the connection string to your `.env.development.local` file

2. **Run Database Migrations**

   ```bash
   cd Backend/subscription-tracker
   pnpm run db:push
   ```

3. **Verify Database Setup**
   ```bash
   pnpm run db:studio
   ```
   This opens Drizzle Studio to view your database schema.

### External Services Setup

#### Required Services

1. **Arcjet (Security & Bot Detection)**

   - Sign up at [Arcjet](https://app.arcjet.com)
   - Create a new site/project
   - Copy your API key to the environment file

2. **Upstash (Queue Management)**

   - Sign up at [Upstash](https://console.upstash.com)
   - Create a QStash instance
   - Copy the URL and tokens to your environment file

3. **Gmail (Email Notifications)**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Use this App Password in the EMAIL_PASSWORD field

#### Optional Services

4. **Cloudflare (Enhanced Protection)**
   - Sign up at [Cloudflare](https://cloudflare.com)
   - Add your domain and get the required credentials
   - Configure the Cloudflare environment variables

## 💻 Development Workflow

### Starting the Development Servers

1. **Start the Backend Server**

   ```bash
   cd Backend/subscription-tracker
   pnpm run dev
   ```

   The backend will be available at `http://localhost:3001` with hot reload via nodemon.

2. **Start the Frontend Development Server**

   ```bash
   cd ai-crawler-frontend
   pnpm run dev
   ```

   The frontend will be available at `http://localhost:5173` with hot reload via Vite.

3. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`
   - Database Studio: `pnpm run db:studio` (from backend directory)

### Available Scripts

#### Frontend Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint
```

#### Backend Scripts

```bash
pnpm run dev          # Start development server with nodemon
pnpm start            # Start production server
pnpm run db:generate  # Generate database migrations
pnpm run db:migrate   # Run database migrations
pnpm run db:push      # Push schema changes to database
pnpm run db:studio    # Open Drizzle Studio
```

### Testing the Application

1. **Run Backend Tests**

   ```bash
   cd Backend/subscription-tracker
   node scripts/simple-test.js
   ```

2. **Test WordPress Integration**

   ```bash
   node scripts/test-wordpress-integration.js
   ```

3. **Test Complete Flow**
   ```bash
   node scripts/test-complete-flow.js
   ```

### Database Management

#### Running Migrations

```bash
cd Backend/subscription-tracker
pnpm run db:push  # Push schema changes
```

#### Seeding Test Data

```bash
node scripts/setup-test-user-with-site.js
```

#### Database Studio

```bash
pnpm run db:studio  # Opens web interface at http://localhost:4983
```

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/sign-up` - User registration
- `POST /api/v1/auth/sign-in` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/verify` - Verify JWT token

### Subscriptions

- `GET /api/v1/subscriptions` - Get user subscriptions
- `POST /api/v1/subscriptions` - Create new subscription
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `DELETE /api/v1/subscriptions/:id` - Cancel subscription

### WordPress Integration

- `POST /api/v1/wordpress/sites` - Add WordPress site
- `GET /api/v1/wordpress/sites` - Get user's sites
- `GET /api/v1/wordpress/plugin-download` - Download plugin
- `POST /api/v1/wordpress/validate-request` - Validate bot requests

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## 🎯 Subscription Plans

### Free Tier ($0/month)

- **10,000 monthly requests**
- Advanced bot detection (95% accuracy)
- Basic revenue analytics
- Real-time monitoring
- 30-day analytics retention
- Community support

### Pro Tier ($15/month)

- **100,000 monthly requests**
- Enhanced bot detection (99% accuracy)
- Full monetization engine
- Advanced analytics and reporting
- 365-day analytics retention
- Custom bot detection rules
- Priority support
- Email notifications

### Enterprise Tier ($99/month)

- **Unlimited requests**
- White-label solution
- Custom integrations
- Dedicated account manager
- SLA guarantee
- Advanced rule engine
- Multi-site management

## 🔧 Common Development Tasks

### Adding New Dependencies

Always use pnpm for package management:

```bash
# Frontend dependencies
cd ai-crawler-frontend
pnpm add package-name
pnpm add -D dev-package-name

# Backend dependencies
cd Backend/subscription-tracker
pnpm add package-name
pnpm add -D dev-package-name
```

### Code Formatting and Linting

```bash
# Frontend
cd ai-crawler-frontend
pnpm run lint

# Backend
cd Backend/subscription-tracker
npx eslint . --fix
```

### Database Schema Changes

1. **Modify the schema** in `Backend/subscription-tracker/database/schema.js`
2. **Push changes** to the database:
   ```bash
   pnpm run db:push
   ```
3. **Generate migrations** (for production):
   ```bash
   pnpm run db:generate
   ```

### WordPress Plugin Development

The WordPress plugin is located in `wp-admin/crawlguard-wp/`. To test:

1. **Download the plugin** via the dashboard
2. **Install on a test WordPress site**
3. **Test the integration** using the provided scripts

## 🔒 Security Features

- **Arcjet Middleware**: Advanced rate limiting and bot protection
- **JWT Authentication**: Secure token-based authentication with expiration
- **Input Validation**: Comprehensive request sanitization
- **Error Handling**: Secure error responses without information leakage
- **CORS Configuration**: Properly configured cross-origin resource sharing
- **Environment Isolation**: Separate configurations for development and production

## 📧 Email System

The system includes automated email templates for:

- **Subscription Success**: Welcome email with plan details
- **Subscription Cancellation**: Confirmation with reactivation options
- **Payment Reminders**: 7/3/2 days before expiration
- **Feature Updates**: Product announcements and updates

Email configuration uses Gmail with App Passwords for secure authentication.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```bash
   # Check if DB_URI is correctly set
   echo $DB_URI

   # Test database connection
   cd Backend/subscription-tracker
   node scripts/simple-test.js
   ```

2. **Frontend Not Connecting to Backend**

   - Ensure backend is running on port 3001
   - Check Vite proxy configuration in `vite.config.js`
   - Verify CORS settings in backend

3. **Environment Variables Not Loading**

   - Ensure `.env.development.local` exists in the correct directory
   - Check file naming (must match exactly)
   - Restart the development server after changes

4. **pnpm Command Not Found**

   ```bash
   npm install -g pnpm
   ```

5. **Database Migration Issues**
   ```bash
   # Reset and push schema
   cd Backend/subscription-tracker
   pnpm run db:push
   ```

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=*
NODE_ENV=development
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**

   ```bash
   cd ai-crawler-frontend
   pnpm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider

3. **Set environment variables** (if needed) in your hosting dashboard

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. **Set all environment variables** in your hosting dashboard
2. **Ensure database is accessible** from your hosting provider
3. **Deploy from GitHub repository** or use CLI tools
4. **Run database migrations** after deployment:
   ```bash
   pnpm run db:push
   ```

### WordPress Plugin Distribution

The plugin is automatically generated and can be downloaded through the dashboard. For manual distribution:

1. **Zip the plugin directory**: `wp-admin/crawlguard-wp/`
2. **Upload to WordPress** via the admin interface
3. **Configure API endpoints** to point to your production backend

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the existing code style
4. **Test thoroughly** using the provided test scripts
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a detailed description

### Development Guidelines

- Use **pnpm** for all package management
- Follow **existing code patterns** and naming conventions
- Write **comprehensive tests** for new features
- Update **documentation** for any API changes
- Ensure **security best practices** are followed

## 📝 License

This project is private and proprietary. All rights reserved.

## 📞 Support

- **Email**: support@aicrawlerguard.com
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in this repository for bug reports
- **Feature Requests**: Use GitHub issues with the "enhancement" label

---

**Built with ❤️ for website owners who want to protect and monetize their content from AI crawlers**
