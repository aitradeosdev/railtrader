# RailTrader - Proprietary Trading Firm Platform

A comprehensive prop trading platform built with React and Node.js, featuring challenge management, MT5 integration, and admin controls.

## 🚀 Live Demo

**Frontend & Backend**: [https://railtrader.vercel.app](https://railtrader.vercel.app)

## 🏗️ Architecture

- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Full-stack)
- **Authentication**: JWT + 2FA

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

### Admin Features
- **User Management**: CRUD operations for users
- **Challenge Management**: Configure and monitor challenges
- **Payout Processing**: Approve/reject withdrawal requests
- **MT5 Assignment**: Assign trading accounts to users
- **Platform Settings**: Global configuration management

## 🛡️ Security

- JWT token authentication
- bcrypt password hashing
- AES-256-CBC encryption for sensitive data
- 2FA with TOTP
- Environment variable protection

## 📊 Database Schema

- **Users**: User profiles with encrypted MT5 credentials
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

### Admin Protected
- `GET /api/admin/users` - User management
- `GET /api/admin/challenges` - Challenge management
- `PUT /api/admin/payouts/:id` - Process payouts

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