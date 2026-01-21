# RailTrader - Proprietary Trading Firm Platform

A comprehensive prop trading platform built with React and Node.js, featuring challenge management, MT5 integration, admin controls, and real-time notifications.

## 🚀 Live Demo

**Frontend & Backend**: [https://railtrader.vercel.app](https://railtrader.vercel.app)

## 🏗️ Architecture

- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Full-stack)
- **Authentication**: JWT + 2FA
- **Real-time**: Server-Sent Events (SSE)

## 🔧 Local Development

### Prerequisites
- Node.js 16+
- MongoDB Atlas account

### Setup

1. **Clone repository**
```bash
git clone https://github.com/aitradeosdev/railtrader.git
cd railtrader
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install
```

3. **Environment setup**
```bash
# Copy backend/.env.example to backend/.env
# Add your MongoDB URI and other secrets
```

4. **Run development**
```bash
# Frontend (from root)
npm start

# Backend (from backend folder)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import project from GitHub
   - Vercel will auto-detect the configuration

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FMP_API_KEY=your_fmp_api_key
   ENCRYPTION_KEY=your_encryption_key
   DIDIT_API_KEY=your_didit_api_key
   DIDIT_WORKFLOW_ID=your_didit_workflow_id
   BRYMIX_API_KEY=your_brymix_api_key
   BRYMIX_WEBHOOK_SECRET=your_brymix_webhook_secret
   PAYSTACK_API_URL=https://api.paystack.co
   ```

3. **Deploy**
   - Push to master branch
   - Vercel auto-deploys

## 📁 Project Structure

```
railtrader/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── notifications/     # Notification system
│   │   ├── components/    # Toast & button components
│   │   ├── contexts/      # Notification state management
│   │   └── pages/         # Notification pages
│   ├── pages/             # Page components
│   └── App.js             # Main app component
├── backend/               # Node.js backend
│   ├── server.js          # Express server
│   └── package.json       # Backend dependencies
├── public/                # Static assets
├── vercel.json           # Vercel configuration
└── package.json          # Frontend dependencies
```

## 🔐 Features

### User Features
- **Authentication**: Email/password + 2FA
- **Trading Challenges**: 1-phase & 2-phase challenges
- **MT5 Integration**: Account management & credentials
- **Payouts**: Request withdrawals with multiple payment methods
- **Dashboard**: Real-time statistics and progress tracking
- **KYC Verification**: Identity verification with Didit integration
- **Notifications**: Real-time notifications with preferences

### Admin Features
- **User Management**: CRUD operations for users
- **Challenge Management**: Configure and monitor challenges
- **Payout Processing**: Approve/reject withdrawal requests
- **MT5 Assignment**: Assign trading accounts to users
- **KYC Management**: Review and manage identity verifications
- **Platform Settings**: Global configuration management
- **Analytics**: User activity and platform statistics

### Notification System
- **Real-time Delivery**: Server-Sent Events for instant notifications
- **4 Notification Types**: Payouts, Challenges, KYC, Account Security
- **User Preferences**: Granular control over notification types
- **Toast Notifications**: In-app popup notifications
- **Unread Badges**: Visual indicators for new notifications

## 🛡️ Security

- JWT token authentication
- bcrypt password hashing
- AES-256-CBC encryption for sensitive data
- 2FA with TOTP
- Environment variable protection
- Secure API endpoints with middleware

## 📊 Database Schema

- **Users**: User profiles with encrypted MT5 credentials and notification preferences
- **Notifications**: Real-time notification system
- **Challenges**: Trading challenge configurations
- **PayoutRequests**: Withdrawal request management
- **ChallengeRequests**: User challenge applications
- **PlatformSettings**: Global platform configuration

## 🔗 API Endpoints

### Public
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/challenge-plans` - Available challenges

### User Protected
- `GET /api/user` - User profile
- `POST /api/user/payout` - Submit payout request
- `GET /api/user/mt5` - MT5 credentials
- `GET /api/user/notifications` - Get notifications
- `GET /api/user/notifications/stream` - SSE notification stream
- `PUT /api/user/notification-preferences` - Update notification settings

### Admin Protected
- `GET /api/admin/users` - User management
- `GET /api/admin/challenges` - Challenge management
- `PUT /api/admin/payouts/:id` - Process payouts
- `PUT /api/admin/challenges/:id/assign-mt5` - Assign MT5 accounts

## 🔄 Real-time Features

- **Server-Sent Events**: Real-time notification delivery
- **Live Updates**: Instant status changes without refresh
- **Preference Filtering**: Respects user notification settings
- **Connection Management**: Automatic reconnection handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@railtrader.com or create an issue in this repository.