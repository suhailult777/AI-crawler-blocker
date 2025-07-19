# AI Crawler Blocker

A comprehensive solution for detecting, blocking, and monetizing AI bot traffic on your website.

## 🚀 Features

- **Advanced Bot Detection**: Identify AI bots with 95%+ accuracy
- **Revenue Analytics Dashboard**: Track revenue loss from unmonetized AI traffic
- **Monetization Engine**: Convert bot traffic into revenue streams
- **Real-time Monitoring**: Live tracking of bot visits and potential revenue
- **Subscription Management**: Multi-tier pricing with automated billing
- **Email Notifications**: Automated subscription and cancellation emails

## 📁 Project Structure

```
AI-Crawler/
├── ai-crawler-frontend/     # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   └── package.json
├── Backend/
│   └── subscription-tracker/  # Node.js backend API
│       ├── config/          # Configuration files
│       ├── controllers/     # Route controllers
│       ├── middleware/      # Express middleware
│       ├── models/          # Database models
│       ├── routes/          # API routes
│       └── utils/           # Utility functions
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Chart.js** for analytics visualization

### Backend

- **Node.js** with Express
- **PostgreSQL** with Neon database
- **JWT** authentication
- **Arcjet** for security middleware
- **Upstash** for queue management
- **Nodemailer** for email services

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- GitHub account for OAuth (optional)

### Frontend Setup

```bash
cd ai-crawler-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd Backend/subscription-tracker
npm install
```

Create a `.env.development.local` file:

```env
PORT=5500
NODE_ENV=development
DB_URI=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
ARCJET_KEY=your_arcjet_key
QSTASH_URL=your_upstash_url
QSTASH_TOKEN=your_upstash_token
EMAIL_PASSWORD=your_email_app_password
```

Start the backend:

```bash
npm start
```

The backend will be available at `http://localhost:5500`

## 🔧 Configuration

### Environment Variables

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| `PORT`           | Backend server port            |
| `DB_URI`         | PostgreSQL connection string   |
| `JWT_SECRET`     | Secret key for JWT tokens      |
| `ARCJET_KEY`     | Arcjet security service key    |
| `QSTASH_URL`     | Upstash queue service URL      |
| `QSTASH_TOKEN`   | Upstash authentication token   |
| `EMAIL_PASSWORD` | App password for email service |

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Subscriptions

- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎯 Subscription Plans

### Free Tier

- Advanced bot detection
- Basic revenue analytics
- Real-time monitoring
- Community support

### Pro Tier ($15/month)

- Full monetization engine
- Stripe Connect integration
- Advanced rule engine
- Priority support

### Enterprise Tier ($99/month)

- White-label solution
- Custom integrations
- Dedicated account manager
- SLA guarantee

## 🔒 Security Features

- **Arcjet Middleware**: Rate limiting and bot protection
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request sanitization
- **Error Handling**: Secure error responses

## 📧 Email Templates

The system includes automated email templates for:

- Subscription confirmation
- Cancellation notifications
- Payment reminders
- Feature updates

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)

```bash
# Set environment variables
# Deploy from GitHub repository
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📞 Support

For support, email support@aicrawlerblocker.com or create an issue in this repository.

---

**Built with ❤️ for website owners who want to monetize AI bot traffic**
