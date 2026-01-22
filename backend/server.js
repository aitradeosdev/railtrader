const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Brymix webhook endpoint - MUST be before any body parser middleware
app.post('/api/webhook/challenge-result', express.raw({type: 'application/json'}), async (req, res) => {
  // Additional CSRF protection: Check Content-Type and User-Agent
  if (req.get('Content-Type') !== 'application/json') {
    return res.status(400).json({error: 'Invalid content type'});
  }
  try {
    const signature = req.headers['x-signature'];
    const payload = req.body.toString('utf8');
    
    // Verify signature
    const expected = crypto
      .createHmac('sha256', process.env.BRYMIX_WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');
    
    if (signature !== expected) {
      return res.status(401).json({error: 'Invalid signature'});
    }
    
    const result = JSON.parse(payload);
    const { challenge_id, status, violations, metrics } = result;
    
    const challenge = await ChallengeRequest.findById(challenge_id);
    if (!challenge) {
      return res.status(404).json({error: 'Challenge not found'});
    }
    
    challenge.brymixResult = result;
    challenge.reviewStatus = 'completed';
    
    if (status === 'passed') {
      if (challenge.challengeType === '1-phase') {
        challenge.status = 'pending_funding';
        challenge.needsLiveAccount = true;
      } else if (challenge.challengeType === '2-phase') {
        if (challenge.currentPhase === 1) {
          challenge.currentPhase = 2;
          challenge.status = 'pending';
          challenge.needsMT5 = true;
        } else {
          challenge.status = 'pending_funding';
          challenge.needsLiveAccount = true;
        }
      }
    } else {
      challenge.status = 'rejected';
    }
    
    await challenge.save();
    res.json({status: 'received'});
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL_PROD] 
    : [process.env.FRONTEND_URL_DEV],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Encryption functions
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'utf8').subarray(0, 32) : crypto.randomBytes(32);
const IV_LENGTH = 16;



const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  try {
    if (!text) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Silently return null for corrupted data instead of logging
    return null;
  }
};

// Platform name context middleware
const addPlatformContext = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne();
    req.platformSettings = settings || { platformName: 'RailTrader', currency: '$' };
    next();
  } catch (error) {
    req.platformSettings = { platformName: 'RailTrader', currency: '$' };
    next();
  }
};

// Apply platform context to all routes
app.use(addPlatformContext);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }).catch(retryErr => {});
    }, 5000);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  accountBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalLoss: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  mt5Server: { type: String, default: 'RailTrader-Live' },
  mt5Login: { type: String },
  mt5Password: { type: String },
  mt5Credentials: {
    login: { type: String },
    password: { type: String },
    server: { type: String, default: 'RailTrader-Live' }
  },
  kycStatus: { 
    type: String, 
    enum: ['pending', 'in_progress', 'verified', 'rejected'], 
    default: 'pending' 
  },
  kycData: {
    diditSessionId: { type: String },
    verificationLevel: { type: String },
    documents: [{ type: String }],
    verifiedAt: { type: Date },
    rejectionReason: { type: String }
  },
  paymentMethods: [{
    type: { type: String, enum: ['bank', 'crypto'], required: true },
    name: { type: String, required: true },
    accountName: { type: String },
    bankName: { type: String },
    bankCode: { type: String },
    accountNumber: { type: String },
    walletAddress: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  notificationPreferences: {
    payouts: { type: Boolean, default: true },
    challenges: { type: Boolean, default: true },
    kyc: { type: Boolean, default: true },
    account: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  isSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Admin Notification Schema
const adminNotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['payout', 'challenge', 'kyc', 'user', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

// Challenge Plan Schema
const challengePlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  accountSize: { type: Number, required: true },
  tier: { type: Number, required: true },
  phases: {
    1: {
      price: { type: Number, required: true },
      profitSplit: { type: Number, required: true },
      maxDrawdown: { type: Number, required: true },
      profitTarget: { type: Number, required: true }
    },
    2: {
      price: { type: Number, required: true },
      profitSplit: { type: Number, required: true },
      maxDrawdown: { type: Number, required: true },
      profitTarget: { type: Number, required: true }
    }
  },
  leverageOptions: [{ type: String, default: ['1:30', '1:50', '1:100', '1:200'] }],
  addOns: { type: mongoose.Schema.Types.Mixed, default: {} },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const ChallengePlan = mongoose.model('ChallengePlan', challengePlanSchema);

// Payout Request Schema
const payoutRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    accountBalance: { type: Number, default: 0 }
  },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: String, required: true },
  encryptedMT5Data: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String }
});

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

// Challenge Request Schema
const challengeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }
  },
  challengeType: { type: String, required: true }, // '1-phase', '2-phase'
  accountSize: { type: String, required: true }, // '10k', '25k', '50k', '100k'
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'mt5_assigned', 'evaluation', 'phase_1', 'phase_2', 'pending_funding', 'funded', 'rejected'], default: 'pending' },
  currentPhase: { type: Number, default: 1 }, // 1 or 2
  needsMT5: { type: Boolean, default: false },
  needsLiveAccount: { type: Boolean, default: false },
  phase: { type: Number, default: 1 },
  mt5Accounts: [{
    server: String,
    login: String,
    password: String,
    phase: Number, // 1 or 2
    accountType: { type: String, enum: ['evaluation', 'live'], default: 'evaluation' },
    assignedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
  }],
  brymixJobId: { type: String },
  reviewStatus: { type: String, enum: ['pending', 'reviewing', 'completed'], default: 'pending' },
  brymixResult: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  adminNotes: { type: String }
});

const ChallengeRequest = mongoose.model('ChallengeRequest', challengeRequestSchema);

// Platform Settings Schema
const platformSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'RailTrader' },
  currency: { type: String, default: '$' },
  maintenanceMode: { type: Boolean, default: false },
  registrationEnabled: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  backupFrequency: { type: String, default: 'daily' },
  paystack: {
    testMode: { type: Boolean, default: true },
    testPublicKey: { type: String, default: '' },
    testSecretKey: { type: String, default: '' },
    livePublicKey: { type: String, default: '' },
    liveSecretKey: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

// Helper functions for Brymix integration
const parseAccountSize = (accountSize) => {
  if (!accountSize) return 10000;
  const match = accountSize.toLowerCase().match(/(\d+)k?/);
  if (match) {
    const num = parseInt(match[1]);
    return accountSize.toLowerCase().includes('k') ? num * 1000 : num;
  }
  return 10000;
};

// Helper function to get challenge rules
const getChallengeRules = async (challengeType, accountSize, currentPhase) => {
  try {
    const accountSizeNum = parseAccountSize(accountSize);
    
    const plan = await ChallengePlan.findOne({
      accountSize: accountSizeNum,
      active: true 
    });
    
    if (plan && plan.phases) {
      // Use challenge type to determine which phase rules to use
      const phaseToUse = challengeType === '1-phase' ? 1 : 2;
      
      if (plan.phases[phaseToUse]) {
        return {
          max_drawdown_percent: plan.phases[phaseToUse].maxDrawdown,
          profit_target_percent: plan.phases[phaseToUse].profitTarget
        };
      }
    }
  } catch (error) {
    // Default rules if plan not found
  }
  
  // Default rules if plan not found
  return {
    max_drawdown_percent: 10.0,
    profit_target_percent: 10.0
  };
};



const verifyBrymixSignature = (payload, signature) => {
  if (!signature || !payload) return false;
  const expected = crypto
    .createHmac('sha256', process.env.BRYMIX_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  return signature === expected;
};



// Auth middleware that allows suspended users (for notifications)
const authenticateTokenAllowSuspended = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    
    // Check if user is suspended
    try {
      const userData = await User.findById(user.userId);
      if (userData && userData.isSuspended) {
        return res.status(403).json({ 
          message: 'Your account has been suspended. Please contact support.', 
          suspended: true,
          user: {
            _id: userData._id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            accountBalance: userData.accountBalance || 0,
            totalProfit: userData.totalProfit || 0,
            totalLoss: userData.totalLoss || 0,
            winRate: userData.winRate || 0,
            twoFactorEnabled: userData.twoFactorEnabled,
            kycStatus: userData.kycStatus,
            paymentMethods: userData.paymentMethods || [],
            notificationPreferences: userData.notificationPreferences,
            isSuspended: true
          }
        });
      }
    } catch (error) {
      // Continue if user lookup fails
    }
    
    req.user = user;
    next();
  });
};

// Maintenance mode middleware
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (settings && settings.maintenanceMode) {
      // Allow admin users to bypass maintenance mode
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);
          if (user && user.isAdmin) {
            return next();
          }
        } catch (error) {
          // Token invalid, continue with maintenance check
        }
      }
      
      return res.status(503).json({ 
        message: 'Platform is currently under maintenance. Please try again later.',
        maintenanceMode: true 
      });
    }
    next();
  } catch (error) {
    next();
  }
};

// Registration enabled middleware
const checkRegistrationEnabled = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (settings && !settings.registrationEnabled) {
      return res.status(403).json({ 
        message: 'New user registration is currently disabled.',
        registrationDisabled: true 
      });
    }
    next();
  } catch (error) {
    next();
  }
};
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isAdmin) {
      return res.sendStatus(403);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// Rate limiting for registration
const registrationAttempts = new Map();

const rateLimitRegistration = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 3;
  
  if (!registrationAttempts.has(ip)) {
    registrationAttempts.set(ip, []);
  }
  
  const attempts = registrationAttempts.get(ip);
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    const timeLeft = Math.ceil((windowMs - (now - Math.min(...recentAttempts))) / 60000);
    return res.status(429).json({ 
      message: `Too many registration attempts. Please try again in ${timeLeft} minutes.` 
    });
  }
  
  recentAttempts.push(now);
  registrationAttempts.set(ip, recentAttempts);
  next();
};

// Routes
app.post('/api/register', checkMaintenanceMode, checkRegistrationEnabled, rateLimitRegistration, async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
    });

    await user.save();

    // Create admin notification for new user registration
    const adminNotification = await new AdminNotification({
      type: 'user',
      title: 'New User Registration',
      message: `${firstName} ${lastName} (${email}) registered a new account`
    }).save();
    
    // Send real-time notification to admin
    if (global.adminNotificationStreams && global.adminNotificationStreams.has('admin')) {
      const stream = global.adminNotificationStreams.get('admin');
      stream.write(`data: ${JSON.stringify(adminNotification)}\n\n`);
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountBalance: user.accountBalance,
        totalProfit: user.totalProfit,
        totalLoss: user.totalLoss,
        winRate: user.winRate,
        twoFactorEnabled: user.twoFactorEnabled,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Rate limiting for email checks
const emailCheckAttempts = new Map();

const rateLimitEmailCheck = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;
  
  if (!emailCheckAttempts.has(ip)) {
    emailCheckAttempts.set(ip, []);
  }
  
  const attempts = emailCheckAttempts.get(ip);
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    const timeLeft = Math.ceil((windowMs - (now - Math.min(...recentAttempts))) / 60000);
    return res.status(429).json({ 
      message: `Too many requests. Please try again in ${timeLeft} minutes.` 
    });
  }
  
  recentAttempts.push(now);
  emailCheckAttempts.set(ip, recentAttempts);
  next();
};

// Check if email exists
app.post('/api/check-email', checkMaintenanceMode, rateLimitEmailCheck, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', checkMaintenanceMode, async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ requiresTwoFactor: true });
      }
      
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });
      
      if (!verified) {
        return res.status(400).json({ message: 'Invalid 2FA code' });
      }
    }

    // Check if user is suspended after successful authentication
    if (user.isSuspended) {
      // Generate token but return user data with suspension flag
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          accountBalance: user.accountBalance || 0,
          totalProfit: user.totalProfit || 0,
          totalLoss: user.totalLoss || 0,
          winRate: user.winRate || 0,
          twoFactorEnabled: user.twoFactorEnabled,
          kycStatus: user.kycStatus,
          paymentMethods: user.paymentMethods || [],
          notificationPreferences: user.notificationPreferences,
          isSuspended: true,
          isAdmin: user.isAdmin || false
        }
      });
    }

    // Create login notification
    if (user.notificationPreferences?.account !== false) {
      const notification = await new Notification({
        userId: user._id,
        type: 'info',
        title: 'Account Login',
        message: 'Your account was accessed successfully.'
      }).save();
      
      // Send real-time notification
      if (global.notificationStreams && global.notificationStreams.has(user._id.toString())) {
        const stream = global.notificationStreams.get(user._id.toString());
        stream.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountBalance: user.accountBalance,
        totalProfit: user.totalProfit,
        totalLoss: user.totalLoss,
        winRate: user.winRate,
        twoFactorEnabled: user.twoFactorEnabled,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/user', checkMaintenanceMode, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/profile', checkMaintenanceMode, authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, dateOfBirth } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changes to personal info after KYC verification
    if (user.kycStatus === 'verified') {
      return res.status(400).json({ message: 'Personal information cannot be changed after KYC verification' });
    }
    
    const updateData = { firstName, lastName, email };
    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/user/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    const secret = speakeasy.generateSecret({
      name: `${req.platformSettings.platformName} (${user.email})`,
      issuer: req.platformSettings.platformName
    });
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    await User.findByIdAndUpdate(req.user.userId, { twoFactorSecret: secret.base32 });
    
    res.json({ 
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/user/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });
    
    if (verified) {
      await User.findByIdAndUpdate(req.user.userId, { twoFactorEnabled: true });
      
      // Create 2FA enabled notification
      if (user.notificationPreferences?.account !== false) {
        const notification = await new Notification({
          userId: req.user.userId,
          type: 'success',
          title: '2FA Enabled',
          message: 'Two-factor authentication has been successfully enabled for your account.'
        }).save();
        
        // Send real-time notification
        if (global.notificationStreams && global.notificationStreams.has(req.user.userId)) {
          const stream = global.notificationStreams.get(req.user.userId);
          stream.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
      }
      
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/user/2fa/disable', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { 
      twoFactorEnabled: false,
      twoFactorSecret: null
    });
    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get MT5 credentials from user profile or active challenges
app.get('/api/user/mt5', authenticateToken, async (req, res) => {
  try {
    // Get all challenges with active MT5 accounts and return current active account for each
    const challengesWithMT5 = await ChallengeRequest.find({
      userId: req.user.userId,
      'mt5Accounts.active': true
    });
    
    if (challengesWithMT5.length > 0) {
      const allAccounts = [];
      challengesWithMT5.forEach(challenge => {
        const activeAccount = challenge.mt5Accounts.find(acc => acc.active);
        if (activeAccount) {
          allAccounts.push({
            challengeId: challenge._id,
            challengeType: challenge.challengeType,
            accountSize: challenge.accountSize,
            mt5Server: activeAccount.server,
            mt5Login: activeAccount.login,
            mt5Password: activeAccount.password,
            assignedAt: activeAccount.assignedAt,
            accountType: activeAccount.accountType || 'evaluation'
          });
        }
      });
      
      // Separate live and evaluation accounts
      const liveAccounts = allAccounts.filter(acc => acc.accountType === 'live');
      const evaluationAccounts = allAccounts.filter(acc => acc.accountType === 'evaluation');
      
      // Return both types if they exist
      const result = {};
      if (liveAccounts.length > 0) result.liveAccounts = liveAccounts;
      if (evaluationAccounts.length > 0) result.evaluationAccounts = evaluationAccounts;
      
      if (Object.keys(result).length > 0) {
        return res.json(result);
      }
    }
    
    // Final fallback to user profile MT5 credentials (legacy)
    const user = await User.findById(req.user.userId);
    if (!user || !user.mt5Login) {
      return res.json({ mt5Server: null, mt5Login: null, mt5Password: null });
    }
    
    res.json({
      mt5Server: user.mt5Server,
      mt5Login: user.mt5Login,
      mt5Password: user.mt5Password
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit payout request
app.post('/api/user/payout', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Encrypt MT5 data only if it exists
    let encryptedMT5Data = null;
    if (user.mt5Login) {
      try {
        const mt5Data = {
          server: user.mt5Server || 'Not assigned',
          login: user.mt5Login || 'Not assigned',
          password: user.mt5Password || 'Not assigned'
        };
        encryptedMT5Data = encrypt(JSON.stringify(mt5Data));
      } catch (encryptError) {
        // Encryption failed
      }
    }
    
    const payoutRequest = new PayoutRequest({
      userId: req.user.userId,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountBalance: user.accountBalance
      },
      amount,
      paymentMethod,
      paymentDetails,
      encryptedMT5Data
    });
    
    await payoutRequest.save();
    
    // Create admin notification
    const adminNotification = await new AdminNotification({
      type: 'payout',
      title: 'New Payout Request',
      message: `${user.firstName} ${user.lastName} submitted a payout request for $${amount}`
    }).save();
    
    // Send real-time notification to admin
    if (global.adminNotificationStreams && global.adminNotificationStreams.has('admin')) {
      const stream = global.adminNotificationStreams.get('admin');
      stream.write(`data: ${JSON.stringify(adminNotification)}\n\n`);
    }
    
    // Create notification
    if (user.notificationPreferences?.payouts !== false) {
      const notification = await new Notification({
        userId: req.user.userId,
        type: 'info',
        title: 'Payout Request Submitted',
        message: `Your payout request for $${amount} has been submitted and is being reviewed.`
      }).save();
      
      // Send real-time notification
      if (global.notificationStreams && global.notificationStreams.has(req.user.userId)) {
        const stream = global.notificationStreams.get(req.user.userId);
        stream.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    }
    
    res.json({ message: 'Payout request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's payout requests
app.get('/api/user/payouts', authenticateToken, async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit challenge request
app.post('/api/user/challenge', authenticateToken, async (req, res) => {
  try {
    const { challengeType, accountSize, amount } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const challengeRequest = new ChallengeRequest({
      userId: req.user.userId,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      challengeType,
      accountSize,
      amount
    });
    
    await challengeRequest.save();
    
    // Create admin notification
    const adminNotification = await new AdminNotification({
      type: 'challenge',
      title: 'New Challenge Application',
      message: `${user.firstName} ${user.lastName} applied for ${accountSize} ${challengeType} challenge`
    }).save();
    
    // Send real-time notification to admin
    if (global.adminNotificationStreams && global.adminNotificationStreams.has('admin')) {
      const stream = global.adminNotificationStreams.get('admin');
      stream.write(`data: ${JSON.stringify(adminNotification)}\n\n`);
    }
    res.json({ message: 'Challenge request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's challenge requests with MT5 accounts
app.get('/api/user/challenges', authenticateToken, async (req, res) => {
  try {
    const challenges = await ChallengeRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Notification endpoints
app.get('/api/user/notifications', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/user/notification-preferences', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('notificationPreferences');
    res.json(user.notificationPreferences || {
      payouts: true,
      challenges: true,
      kyc: true,
      account: true,
      marketing: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/notification-preferences', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      notificationPreferences: req.body
    });
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/notifications/:id/read', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/notifications/read-all', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/user/notifications/:id', authenticateTokenAllowSuspended, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Server-Sent Events for real-time notifications
app.get('/api/user/notifications/stream', async (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Store connection for this user
    if (!global.notificationStreams) {
      global.notificationStreams = new Map();
    }
    global.notificationStreams.set(decoded.userId, res);
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30000);
    
    req.on('close', () => {
      clearInterval(keepAlive);
      global.notificationStreams.delete(decoded.userId);
    });
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Submit evaluation review
app.post('/api/user/challenge/:id/review', authenticateToken, async (req, res) => {
  try {
    const challenge = await ChallengeRequest.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (challenge.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Get active MT5 account
    const activeMT5 = challenge.mt5Accounts.find(acc => acc.active);
    if (!activeMT5) {
      return res.status(400).json({ message: 'No active MT5 account found' });
    }
    
    // Get challenge rules - use currentPhase for the correct phase rules
    const rules = await getChallengeRules(challenge.challengeType, challenge.accountSize, challenge.currentPhase);
    const initialBalance = parseAccountSize(challenge.accountSize);
    
    // Submit to Brymix API
    const brymixPayload = {
      user_id: challenge.userId.toString(),
      challenge_id: challenge._id.toString(),
      mt5_login: activeMT5.login,
      mt5_password: activeMT5.password,
      mt5_server: activeMT5.server,
      initial_balance: initialBalance,
      rules,
      callback_url: process.env.NODE_ENV === 'production' 
        ? process.env.BRYMIX_CALLBACK_URL_PROD
        : process.env.BRYMIX_CALLBACK_URL_DEV
    };
    
    const response = await axios.post(process.env.BRYMIX_API_URL, brymixPayload, {
      headers: {
        'X-API-Key': process.env.BRYMIX_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Update challenge with job ID
    challenge.brymixJobId = response.data.job_id;
    challenge.reviewStatus = 'reviewing';
    challenge.status = 'evaluation';
    await challenge.save();
    
    res.json({ 
      message: 'Review submitted to automated system',
      jobId: response.data.job_id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Add payment method
app.post('/api/user/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { type, name, accountName, bankName, bankCode, accountNumber, walletAddress } = req.body;
    const user = await User.findById(req.user.userId);
    
    user.paymentMethods.push({ type, name, accountName, bankName, bankCode, accountNumber, walletAddress });
    await user.save();
    
    res.json({ message: 'Payment method added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete payment method
app.delete('/api/user/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find and remove the payment method
    const methodIndex = user.paymentMethods.findIndex(method => method._id.toString() === req.params.id);
    if (methodIndex === -1) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    user.paymentMethods.splice(methodIndex, 1);
    await user.save();
    
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password -twoFactorSecret');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password -twoFactorSecret');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user dashboard stats
app.get('/api/user/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const challenges = await ChallengeRequest.find({ userId: req.user.userId });
    
    const challengeBalances = challenges.map(challenge => {
      // Parse account size safely
      let accountSizeNum = 0;
      if (challenge.accountSize && typeof challenge.accountSize === 'string') {
        // Handle formats like "10k", "25k", "50k", "100k"
        const sizeMatch = challenge.accountSize.toLowerCase().match(/(\d+)k?/);
        if (sizeMatch) {
          const baseNum = parseInt(sizeMatch[1]);
          // Only multiply by 1000 if it's in "k" format
          accountSizeNum = challenge.accountSize.toLowerCase().includes('k') ? baseNum * 1000 : baseNum;
        }
      } else if (typeof challenge.accountSize === 'number') {
        accountSizeNum = challenge.accountSize;
      }
      
      return {
        accountSize: challenge.accountSize || 'Unknown',
        amount: accountSizeNum,
        status: challenge.status,
        isFunded: challenge.status === 'funded'
      };
    }).filter(balance => balance.amount > 0); // Only include valid balances
    
    res.json({ challengeBalances });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity feed
app.get('/api/user/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only get this user's data
    const challenges = await ChallengeRequest.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const payouts = await PayoutRequest.find({ userId }).sort({ createdAt: -1 }).limit(3);
    
    const activities = [];
    
    // Add recent payouts (only user's own payouts)
    payouts.forEach(payout => {
      if (payout.status === 'approved') {
        activities.push({
          type: 'payout',
          title: 'Payout',
          value: `+$${payout.amount.toLocaleString()}`,
          color: 'text-emerald-400',
          date: payout.createdAt
        });
      }
    });
    
    // Add challenge activities (only user's own challenges)
    challenges.forEach(challenge => {
      if (challenge.status === 'funded') {
        activities.push({
          type: 'achievement',
          title: 'New Badge',
          value: 'Funded Trader',
          color: 'text-amber-400',
          date: challenge.createdAt
        });
      }
      
      if (challenge.brymixResult && challenge.brymixResult.violations && challenge.brymixResult.violations.length > 0) {
        activities.push({
          type: 'risk',
          title: 'Risk Alert',
          value: 'Review Required',
          color: 'text-rose-400',
          date: challenge.createdAt
        });
      }
    });
    
    // Add account creation activity if no other activities exist
    if (activities.length === 0) {
      activities.push({
        type: 'welcome',
        title: 'Welcome',
        value: 'Account Created',
        color: 'text-blue-400',
        date: user.createdAt
      });
    }
    
    // Sort by date and limit to 5 most recent
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ activities: activities.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const usersWithTwoFA = await User.countDocuments({ twoFactorEnabled: true });
    
    // Get all challenges
    const challenges = await ChallengeRequest.find({});
    
    // Calculate platform balance (funded account sizes)
    const fundedChallenges = challenges.filter(c => c.status === 'funded');
    const platformBalance = fundedChallenges.reduce((total, challenge) => {
      let accountSizeNum = 0;
      if (challenge.accountSize && typeof challenge.accountSize === 'string') {
        // Handle formats like "10k", "25k", "50k", "100k"
        const sizeMatch = challenge.accountSize.toLowerCase().match(/(\d+)k?/);
        if (sizeMatch) {
          const baseNum = parseInt(sizeMatch[1]);
          // Only multiply by 1000 if it's in "k" format
          accountSizeNum = challenge.accountSize.toLowerCase().includes('k') ? baseNum * 1000 : baseNum;
        }
      } else if (typeof challenge.accountSize === 'number') {
        accountSizeNum = challenge.accountSize;
      }
      return total + accountSizeNum;
    }, 0);
    
    // Calculate platform profit (amounts users paid)
    const platformProfit = challenges.reduce((total, challenge) => {
      return total + challenge.amount;
    }, 0);
    
    // Calculate challenge phase balance
    const challengePhaseChallenges = challenges.filter(c => 
      ['pending', 'mt5_assigned', 'evaluation', 'pending_funding'].includes(c.status)
    );
    const challengePhaseBalance = challengePhaseChallenges.reduce((total, challenge) => {
      let accountSizeNum = 0;
      if (challenge.accountSize && typeof challenge.accountSize === 'string') {
        // Handle formats like "10k", "25k", "50k", "100k"
        const sizeMatch = challenge.accountSize.toLowerCase().match(/(\d+)k?/);
        if (sizeMatch) {
          const baseNum = parseInt(sizeMatch[1]);
          // Only multiply by 1000 if it's in "k" format
          accountSizeNum = challenge.accountSize.toLowerCase().includes('k') ? baseNum * 1000 : baseNum;
        }
      } else if (typeof challenge.accountSize === 'number') {
        accountSizeNum = challenge.accountSize;
      }
      return total + accountSizeNum;
    }, 0);
    
    res.json({
      totalUsers,
      platformBalance,
      platformProfit,
      challengePhaseBalance,
      usersWithTwoFA
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin payout routes
app.get('/api/admin/payouts', authenticateAdmin, async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({})
      .populate('userId', 'firstName lastName email accountBalance mt5Login mt5Server')
      .sort({ createdAt: -1 });
    
    // Decrypt MT5 data for admin view
    const payoutsWithMT5 = payouts.map(payout => {
      let mt5Data = null;
      if (payout.encryptedMT5Data) {
        try {
          const decryptedData = decrypt(payout.encryptedMT5Data);
          if (decryptedData) {
            mt5Data = JSON.parse(decryptedData);
          }
        } catch (error) {
          mt5Data = { error: 'Failed to decrypt MT5 data' };
        }
      }
      return {
        ...payout.toObject(),
        mt5Data
      };
    });
    
    res.json(payoutsWithMT5);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/payouts/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const payout = await PayoutRequest.findByIdAndUpdate(
      id,
      { status, adminNotes, processedAt: new Date() },
      { new: true }
    ).populate('userId', 'firstName lastName email');
    
    // Create notification for user
    const payoutUser = await User.findById(payout.userId._id);
    if (status === 'approved' && payoutUser.notificationPreferences?.payouts !== false) {
      const notification = await new Notification({
        userId: payout.userId._id,
        type: 'success',
        title: 'Payout Approved',
        message: `Your payout request for $${payout.amount} has been approved and processed.`
      }).save();
      
      // Send real-time notification
      if (global.notificationStreams && global.notificationStreams.has(payout.userId._id.toString())) {
        const stream = global.notificationStreams.get(payout.userId._id.toString());
        stream.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    } else if (status === 'rejected' && payoutUser.notificationPreferences?.payouts !== false) {
      const notification = await new Notification({
        userId: payout.userId._id,
        type: 'error',
        title: 'Payout Rejected',
        message: `Your payout request for $${payout.amount} has been rejected. ${adminNotes || ''}`
      }).save();
      
      // Send real-time notification
      if (global.notificationStreams && global.notificationStreams.has(payout.userId._id.toString())) {
        const stream = global.notificationStreams.get(payout.userId._id.toString());
        stream.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    }
    
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get MT5 assignment requests
app.get('/api/admin/mt5-requests', authenticateAdmin, async (req, res) => {
  try {
    const requests = await ChallengeRequest.find({ 
      $or: [
        { needsMT5: true },
        { needsLiveAccount: true }
      ]
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Notify MT5 needed
app.put('/api/admin/challenges/:id/notify-mt5', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await ChallengeRequest.findById(req.params.id).populate('userId');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (!challenge.userId) {
      return res.status(400).json({ message: 'Cannot notify MT5 for deleted user' });
    }
    
    const { phase, needsMT5 } = req.body;
    const updatedChallenge = await ChallengeRequest.findByIdAndUpdate(
      req.params.id,
      { needsMT5, phase },
      { new: true }
    );
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Notify live account needed
app.put('/api/admin/challenges/:id/notify-live-account', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await ChallengeRequest.findById(req.params.id).populate('userId');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (!challenge.userId) {
      return res.status(400).json({ message: 'Cannot notify live account for deleted user' });
    }
    
    const updatedChallenge = await ChallengeRequest.findByIdAndUpdate(
      req.params.id,
      { needsLiveAccount: true, needsMT5: true, status: 'pending_funding' },
      { new: true }
    );
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.get('/api/admin/challenges', authenticateAdmin, async (req, res) => {
  try {
    const challenges = await ChallengeRequest.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Handle deleted users by adding fallback data
    const challengesWithUserInfo = challenges.map(challenge => {
      const challengeObj = challenge.toObject();
      if (!challengeObj.userId) {
        // User was deleted, use stored userInfo
        challengeObj.userId = {
          _id: null,
          firstName: challengeObj.userInfo?.firstName || 'Deleted',
          lastName: challengeObj.userInfo?.lastName || 'User',
          email: challengeObj.userInfo?.email || 'deleted@user.com',
          isDeleted: true
        };
      }
      return challengeObj;
    });
    
    res.json(challengesWithUserInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/challenges/:id/assign-mt5', authenticateAdmin, async (req, res) => {
  try {
    const { server, login, password, accountType = 'evaluation' } = req.body;
    
    if (!server || !login || !password) {
      return res.status(400).json({ message: 'Server, login, and password are required' });
    }
    
    const challenge = await ChallengeRequest.findById(req.params.id).populate('userId');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (!challenge.userId) {
      return res.status(400).json({ message: 'Cannot assign MT5 account to deleted user' });
    }
    
    // Initialize mt5Accounts array if it doesn't exist
    if (!challenge.mt5Accounts) {
      challenge.mt5Accounts = [];
    }
    
    // Deactivate previous MT5 accounts
    challenge.mt5Accounts.forEach(acc => acc.active = false);
    
    // Add new MT5 account
    challenge.mt5Accounts.push({
      server,
      login,
      password,
      phase: challenge.currentPhase || 1,
      accountType,
      active: true
    });
    
    if (accountType === 'live') {
      challenge.status = 'funded';
      challenge.needsLiveAccount = false;
      
      // Create notification for funded account
      const challengeUser = await User.findById(challenge.userId);
      if (challengeUser.notificationPreferences?.challenges !== false) {
        const notification = await new Notification({
          userId: challenge.userId,
          type: 'success',
          title: 'Account Funded!',
          message: `Congratulations! Your ${challenge.accountSize} challenge has been funded. Your live trading account is now ready.`
        }).save();
        
        // Send real-time notification
        if (global.notificationStreams && global.notificationStreams.has(challenge.userId.toString())) {
          const stream = global.notificationStreams.get(challenge.userId.toString());
          stream.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
      }
    } else {
      challenge.status = 'mt5_assigned';
      
      // Create notification for MT5 assignment
      const challengeUser2 = await User.findById(challenge.userId);
      if (challengeUser2.notificationPreferences?.challenges !== false) {
        const notification = await new Notification({
          userId: challenge.userId,
          type: 'info',
          title: 'MT5 Account Assigned',
          message: `Your MT5 trading account has been assigned for your ${challenge.accountSize} challenge. You can now start trading.`
        }).save();
        
        // Send real-time notification
        if (global.notificationStreams && global.notificationStreams.has(challenge.userId.toString())) {
          const stream = global.notificationStreams.get(challenge.userId.toString());
          stream.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
      }
    }
    challenge.needsMT5 = false;
    await challenge.save();
    
    res.json({ message: 'MT5 account assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/challenges/:id/complete-evaluation', authenticateAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'next_phase' or 'approve_funded'
    const challenge = await ChallengeRequest.findById(req.params.id);
    
    if (action === 'next_phase') {
      challenge.currentPhase = 'evaluation_2';
      challenge.status = 'evaluation_2';
      // Deactivate current MT5 account
      challenge.mt5Accounts.forEach(acc => acc.active = false);
    } else if (action === 'approve_funded') {
      challenge.currentPhase = 'funded';
      challenge.status = 'funded';
      // Deactivate current MT5 account
      challenge.mt5Accounts.forEach(acc => acc.active = false);
    }
    
    await challenge.save();
    res.json({ message: 'Challenge updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update challenge type
app.put('/api/admin/challenges/:id/update-type', authenticateAdmin, async (req, res) => {
  try {
    const { challengeType } = req.body;
    const challenge = await ChallengeRequest.findByIdAndUpdate(
      req.params.id,
      { challengeType, currentPhase: 1 },
      { new: true }
    );
    res.json({ message: 'Challenge type updated successfully', challenge });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update challenge status (new endpoint)
app.put('/api/admin/challenges/:id/update-status', authenticateAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    const challenge = await ChallengeRequest.findById(req.params.id).populate('userId');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (!challenge.userId) {
      return res.status(400).json({ message: 'Cannot update status for deleted user' });
    }
    
    if (action === 'next_phase') {
      // Only proceed to next phase if it's a 2-phase challenge
      if (challenge.challengeType === '2-phase' && challenge.currentPhase === 1) {
        challenge.currentPhase = 2;
        challenge.status = 'pending';
        challenge.needsMT5 = true;
        challenge.mt5Accounts.forEach(acc => acc.active = false);
      } else {
        return res.status(400).json({ message: 'Cannot proceed to next phase for this challenge type or current phase' });
      }
    } else if (action === 'approve_funded') {
      // For 1-phase: go directly to funding
      // For 2-phase: only if currently in phase 2
      if (challenge.challengeType === '1-phase' || 
          (challenge.challengeType === '2-phase' && challenge.currentPhase === 2)) {
        challenge.status = 'pending_funding';
        challenge.needsLiveAccount = true;
        challenge.needsMT5 = false;
        challenge.mt5Accounts.forEach(acc => acc.active = false);
      } else {
        return res.status(400).json({ message: 'Cannot approve for funding at current phase' });
      }
    }
    
    await challenge.save();
    res.json({ message: 'Challenge status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Challenge plan management
app.get('/api/admin/challenge-plans', authenticateAdmin, async (req, res) => {
  try {
    const plans = await ChallengePlan.find({ active: true }).sort({ tier: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/admin/challenge-plans', authenticateAdmin, async (req, res) => {
  try {
    const plan = new ChallengePlan(req.body);
    await plan.save();
    res.json({ message: 'Challenge plan created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/challenge-plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const plan = await ChallengePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/admin/challenge-plans/:id', authenticateAdmin, async (req, res) => {
  try {
    await ChallengePlan.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Challenge plan deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get challenge plans for users
app.get('/api/challenge-plans', checkMaintenanceMode, async (req, res) => {
  try {
    const plans = await ChallengePlan.find({ active: true }).sort({ tier: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Platform settings endpoints
app.get('/api/admin/platform-settings', authenticateAdmin, async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings();
      await settings.save();
    }
    
    // Decrypt sensitive keys for admin view
    const decryptedSettings = { ...settings.toObject() };
    if (decryptedSettings.paystack) {
      if (decryptedSettings.paystack.testSecretKey) {
        decryptedSettings.paystack.testSecretKey = decrypt(decryptedSettings.paystack.testSecretKey) || decryptedSettings.paystack.testSecretKey;
      }
      if (decryptedSettings.paystack.liveSecretKey) {
        decryptedSettings.paystack.liveSecretKey = decrypt(decryptedSettings.paystack.liveSecretKey) || decryptedSettings.paystack.liveSecretKey;
      }
    }
    
    res.json(decryptedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/platform-settings', authenticateAdmin, async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings();
    }
    
    // Encrypt sensitive keys before saving
    const updatedData = { ...req.body };
    if (updatedData.paystack) {
      if (updatedData.paystack.testSecretKey && updatedData.paystack.testSecretKey.trim()) {
        updatedData.paystack.testSecretKey = encrypt(updatedData.paystack.testSecretKey);
      }
      if (updatedData.paystack.liveSecretKey && updatedData.paystack.liveSecretKey.trim()) {
        updatedData.paystack.liveSecretKey = encrypt(updatedData.paystack.liveSecretKey);
      }
    }
    
    Object.assign(settings, updatedData);
    settings.updatedAt = new Date();
    await settings.save();
    
    // Return decrypted version for admin view
    const responseData = { ...settings.toObject() };
    if (responseData.paystack) {
      if (responseData.paystack.testSecretKey) {
        responseData.paystack.testSecretKey = decrypt(responseData.paystack.testSecretKey) || responseData.paystack.testSecretKey;
      }
      if (responseData.paystack.liveSecretKey) {
        responseData.paystack.liveSecretKey = decrypt(responseData.paystack.liveSecretKey) || responseData.paystack.liveSecretKey;
      }
    }
    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public platform settings (for currency)
app.get('/api/platform-settings', async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings();
      await settings.save();
    }
    res.json({ currency: settings.currency });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Paystack payment endpoints
app.post('/api/payment/initialize', authenticateToken, async (req, res) => {
  try {
    const { amount, challengeType, accountSize, callbackUrl } = req.body;
    const user = await User.findById(req.user.userId);
    const settings = await PlatformSettings.findOne();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const secretKey = settings?.paystack?.testMode 
      ? (decrypt(settings.paystack.testSecretKey) || settings.paystack.testSecretKey)
      : (decrypt(settings.paystack.liveSecretKey) || settings.paystack.liveSecretKey);
    
    if (!secretKey) {
      return res.status(500).json({ message: 'Payment configuration not set' });
    }
    
    // Validate required fields
    if (!amount || !user.email) {
      return res.status(400).json({ message: 'Missing required payment data' });
    }
    
    const paymentData = {
      email: user.email,
      amount: Math.round(amount * 100), // Convert to kobo and ensure integer
      currency: 'NGN',
      callback_url: `${req.get('origin')}/?tab=challenges`,
      metadata: {
        userId: user._id.toString(),
        challengeType: challengeType || '1-phase',
        accountSize: accountSize || 'Unknown',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };
    

    
    const response = await axios.post(`${process.env.PAYSTACK_API_URL}/transaction/initialize`, paymentData, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  try {
    const { reference, challengePlanId } = req.body;
    
    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }

    if (!mongoose.connection.readyState) {
      return res.status(500).json({ success: false, message: 'Database connection error' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const settings = await PlatformSettings.findOne();
    const secretKey = settings?.paystack?.testMode 
      ? (decrypt(settings.paystack.testSecretKey) || settings.paystack.testSecretKey)
      : (decrypt(settings.paystack.liveSecretKey) || settings.paystack.liveSecretKey);
    
    if (!secretKey) {
      return res.status(500).json({ success: false, message: 'Payment configuration error' });
    }

    const paystackResponse = await axios.get(`${process.env.PAYSTACK_API_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    });

    const paystackData = paystackResponse.data;

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    const { metadata, customer } = paystackData.data;
    const userEmail = customer?.email || metadata?.email || user.email;
    
    const challengeData = {
      userId: req.user.userId,
      userInfo: {
        firstName: metadata?.firstName || user.firstName,
        lastName: metadata?.lastName || user.lastName,
        email: userEmail
      },
      challengeType: metadata?.challengeType || '1-phase',
      accountSize: metadata?.accountSize || '10k',
      amount: paystackData.data.amount / 100
    };

    const challengeRequest = new ChallengeRequest(challengeData);
    await challengeRequest.save();
    
    // Create admin notification for challenge purchase
    const adminNotification = await new AdminNotification({
      type: 'challenge',
      title: 'Challenge Purchased',
      message: `${challengeData.userInfo.firstName} ${challengeData.userInfo.lastName} purchased ${challengeData.accountSize} ${challengeData.challengeType} challenge for $${challengeData.amount}`
    }).save();
    
    // Send real-time notification to admin
    if (global.adminNotificationStreams && global.adminNotificationStreams.has('admin')) {
      const stream = global.adminNotificationStreams.get('admin');
      stream.write(`data: ${JSON.stringify(adminNotification)}\n\n`);
    }
    
    res.json({
      success: true,
      message: 'Payment verified and challenge created',
      challenge: challengeRequest
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get Paystack public key
app.get('/api/payment/config', async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    const publicKey = settings?.paystack?.testMode 
      ? settings.paystack.testPublicKey 
      : settings.paystack.livePublicKey;
    
    res.json({ 
      publicKey,
      testMode: settings?.paystack?.testMode || true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get list of banks from Paystack
app.get('/api/payment/banks', async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    const secretKey = settings?.paystack?.testMode 
      ? (decrypt(settings.paystack.testSecretKey) || settings.paystack.testSecretKey)
      : (decrypt(settings.paystack.liveSecretKey) || settings.paystack.liveSecretKey);
    
    if (!secretKey) {
      return res.status(500).json({ message: 'Payment configuration not set' });
    }
    
    const response = await axios.get(`${process.env.PAYSTACK_API_URL}/bank`, {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banks', error: error.message });
  }
});

// Resolve bank account details
app.post('/api/payment/resolve-account', authenticateToken, async (req, res) => {
  try {
    const { account_number, bank_code } = req.body;
    
    if (!account_number || !bank_code) {
      return res.status(400).json({ message: 'Account number and bank code are required' });
    }
    
    const settings = await PlatformSettings.findOne();
    const secretKey = settings?.paystack?.testMode 
      ? (decrypt(settings.paystack.testSecretKey) || settings.paystack.testSecretKey)
      : (decrypt(settings.paystack.liveSecretKey) || settings.paystack.liveSecretKey);
    
    if (!secretKey) {
      return res.status(500).json({ message: 'Payment configuration not set' });
    }
    
    const response = await axios.get(`${process.env.PAYSTACK_API_URL}/bank/resolve`, {
      params: {
        account_number,
        bank_code
      },
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    
    // Handle specific Paystack errors
    if (error.response?.data?.message?.includes('daily limit')) {
      return res.status(429).json({ 
        message: 'Daily verification limit reached. Please enter account name manually or try again tomorrow.',
        limitExceeded: true
      });
    }
    
    if (error.response?.status === 422) {
      return res.status(422).json({ message: 'Invalid account details' });
    }
    
    res.status(500).json({ message: 'Failed to resolve account', error: error.message });
  }
});

// User self-deletion endpoint
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user from database (removes all user data including kycData with diditSessionId)
    await User.findByIdAndDelete(req.user.userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// KYC Routes
app.post('/api/user/kyc/initiate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus === 'verified') {
      return res.status(400).json({ message: 'KYC already verified' });
    }

    // Create Didit session
    const diditResponse = await axios.post(`${process.env.DIDIT_API_URL}/session/`, {
      workflow_id: process.env.DIDIT_WORKFLOW_ID,
      callback: `${req.get('origin')}/kyc/callback`,
      vendor_data: user._id.toString(),
      metadata: {
        user_type: 'standard',
        account_id: user._id.toString()
      },
      contact_details: {
        email: user.email,
        email_lang: 'en',
        first_name: user.firstName,
        last_name: user.lastName
      },
      expected_details: {
        first_name: user.firstName,
        last_name: user.lastName,
        date_of_birth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : undefined
      }
    }, {
      headers: {
        'X-Api-Key': process.env.DIDIT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Save session to user account in database
    user.kycStatus = 'in_progress';
    user.kycData = {
      diditSessionId: diditResponse.data.session_id,
      verificationLevel: null,
      documents: [],
      verifiedAt: null,
      startedAt: new Date()
    };
    await user.save();

    // Create admin notification for KYC initiation
    const adminNotification = await new AdminNotification({
      type: 'kyc',
      title: 'KYC Verification Started',
      message: `${user.firstName} ${user.lastName} started KYC verification process`
    }).save();
    
    // Send real-time notification to admin
    if (global.adminNotificationStreams && global.adminNotificationStreams.has('admin')) {
      const stream = global.adminNotificationStreams.get('admin');
      stream.write(`data: ${JSON.stringify(adminNotification)}\n\n`);
    }

    res.json({
      sessionId: diditResponse.data.session_id,
      verificationUrl: diditResponse.data.url
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate KYC verification' });
  }
});

app.get('/api/user/kyc/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('kycStatus kycData');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      status: user.kycStatus,
      verificationLevel: user.kycData?.verificationLevel,
      verifiedAt: user.kycData?.verifiedAt,
      rejectionReason: user.kycData?.rejectionReason,
      startedAt: user.kycData?.startedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh KYC status from Didit API
app.post('/api/user/kyc/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.kycData || !user.kycData.diditSessionId) {
      return res.status(400).json({ message: 'No active KYC session found. Please initiate KYC verification first.' });
    }

    // Check actual status with Didit API
    const diditResponse = await axios.get(`${process.env.DIDIT_API_URL}/session/${user.kycData.diditSessionId}/decision/`, {
      headers: {
        'X-Api-Key': process.env.DIDIT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const sessionData = diditResponse.data;
    const kycStatus = mapDiditStatusToKYC(sessionData, user);
    
    user.kycStatus = kycStatus;
    await user.save();

    res.json({
      status: kycStatus,
      verificationLevel: user.kycData?.verificationLevel,
      verifiedAt: user.kycData?.verifiedAt,
      rejectionReason: user.kycData?.rejectionReason
    });
  } catch (error) {
    
    // Handle specific API errors
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'KYC session not found. Please start a new verification.' });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ message: 'KYC service authentication failed' });
    }
    
    res.status(500).json({ message: 'Failed to refresh KYC status', error: error.message });
  }
});

app.post('/api/user/kyc/update-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.kycStatus = status;
    if (status === 'verified') {
      user.kycData.verifiedAt = new Date();
    } else if (status === 'rejected') {
      user.kycData.rejectionReason = 'Verification declined by provider';
    }
    
    await user.save();
    res.json({ message: 'KYC status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// KYC Management Routes
app.get('/api/admin/kyc/stats', authenticateAdmin, async (req, res) => {
  try {
    const total = await User.countDocuments({});
    const verified = await User.countDocuments({ kycStatus: 'verified' });
    const pending = await User.countDocuments({ kycStatus: 'in_progress' });
    const rejected = await User.countDocuments({ kycStatus: 'rejected' });
    
    res.json({ total, verified, pending, rejected });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function for KYC status mapping
const mapDiditStatusToKYC = (sessionData, user) => {
  let kycStatus = user.kycStatus;
  
  if (sessionData.status === 'Approved') {
    kycStatus = 'verified';
    if (!user.kycData) user.kycData = {};
    user.kycData.verifiedAt = new Date();
    
    // Create KYC verified notification
    User.findById(user._id).then(userForNotif => {
      if (userForNotif && userForNotif.notificationPreferences?.kyc !== false) {
        const notification = new Notification({
          userId: user._id,
          type: 'success',
          title: 'KYC Verified',
          message: 'Your identity verification has been completed successfully.'
        });
        notification.save().then(savedNotification => {
          // Send real-time notification
          if (global.notificationStreams && global.notificationStreams.has(user._id.toString())) {
            const stream = global.notificationStreams.get(user._id.toString());
            stream.write(`data: ${JSON.stringify(savedNotification)}\n\n`);
          }
        });
      }
    });
  } else if (sessionData.status === 'Declined') {
    kycStatus = 'rejected';
    let rejectionReason = 'Verification declined';
    if (sessionData.reviews && sessionData.reviews.length > 0) {
      const latestReview = sessionData.reviews[sessionData.reviews.length - 1];
      if (latestReview.comment) {
        rejectionReason = latestReview.comment;
      }
    }
    if (sessionData.id_verification && sessionData.id_verification.warnings) {
      const warnings = sessionData.id_verification.warnings;
      if (warnings.length > 0) {
        rejectionReason += '. Issues found: ' + warnings.map(w => w.message || w.type).join(', ');
      }
    }
    if (!user.kycData) user.kycData = {};
    user.kycData.rejectionReason = rejectionReason;
    
    // Create KYC rejected notification
    User.findById(user._id).then(userForNotif2 => {
      if (userForNotif2 && userForNotif2.notificationPreferences?.kyc !== false) {
        const notification = new Notification({
          userId: user._id,
          type: 'error',
          title: 'KYC Verification Failed',
          message: `Your identity verification was declined. ${rejectionReason}`
        });
        notification.save().then(savedNotification => {
          // Send real-time notification
          if (global.notificationStreams && global.notificationStreams.has(user._id.toString())) {
            const stream = global.notificationStreams.get(user._id.toString());
            stream.write(`data: ${JSON.stringify(savedNotification)}\n\n`);
          }
        });
      }
    });
  } else if (sessionData.status === 'In Review' || sessionData.status === 'Pending Review') {
    kycStatus = 'in_progress';
  }
  
  return kycStatus;
};

// Bulk refresh all KYC statuses
app.post('/api/admin/kyc/refresh-all', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ 
      'kycData.diditSessionId': { $exists: true },
      kycStatus: { $in: ['in_progress', 'pending'] }
    });
    
    let updated = 0;
    let errors = 0;
    const bulkOps = [];
    
    for (const user of users) {
      try {
        const diditResponse = await axios.get(`${process.env.DIDIT_API_URL}/session/${user.kycData.diditSessionId}/decision/`, {
          headers: {
            'X-Api-Key': process.env.DIDIT_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        const sessionData = diditResponse.data;
        const newStatus = mapDiditStatusToKYC(sessionData, user);
        
        if (newStatus !== user.kycStatus) {
          bulkOps.push({
            updateOne: {
              filter: { _id: user._id },
              update: { 
                kycStatus: newStatus,
                kycData: user.kycData
              }
            }
          });
          updated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors++;
      }
    }
    
    // Execute bulk operations
    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
    
    res.json({ 
      message: `Refreshed ${users.length} users. ${updated} status changes, ${errors} errors.`,
      processed: users.length,
      updated,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/kyc/verified', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'verified' })
      .select('firstName lastName email dateOfBirth kycData')
      .sort({ 'kycData.verifiedAt': -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/kyc/pending', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'in_progress' })
      .select('firstName lastName email dateOfBirth kycData')
      .sort({ 'kycData.startedAt': -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/kyc/rejected', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'rejected' })
      .select('firstName lastName email dateOfBirth kycData')
      .sort({ 'kycData.startedAt': -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin notification endpoints
app.get('/api/admin/notifications', authenticateAdmin, async (req, res) => {
  try {
    const notifications = await AdminNotification.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/notifications/stream', async (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Store connection for admin
    if (!global.adminNotificationStreams) {
      global.adminNotificationStreams = new Map();
    }
    global.adminNotificationStreams.set('admin', res);
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30000);
    
    req.on('close', () => {
      clearInterval(keepAlive);
      global.adminNotificationStreams.delete('admin');
    });
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.put('/api/admin/notifications/:id/read', authenticateAdmin, async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/notifications/read-all', authenticateAdmin, async (req, res) => {
  try {
    await AdminNotification.updateMany({}, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/admin/notifications/:id', authenticateAdmin, async (req, res) => {
  try {
    await AdminNotification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin user management endpoints
app.post('/api/admin/users/:id/suspend', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;
    
    await User.findByIdAndUpdate(id, { isSuspended: suspend });
    
    res.json({ 
      message: suspend ? 'User suspended successfully' : 'User unsuspended successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/admin/users/:id/reset-password', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    
    res.json({ 
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -twoFactorSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Auto-refresh KYC statuses every 5 minutes
let isAutoRefreshing = false;
setInterval(async () => {
  if (isAutoRefreshing) return; // Prevent overlapping executions
  
  try {
    isAutoRefreshing = true;
    const users = await User.find({ 
      'kycData.diditSessionId': { $exists: true },
      kycStatus: { $in: ['in_progress', 'pending'] }
    });
    
    if (users.length === 0) return;
    
    const bulkOps = [];
    let updated = 0;
    
    for (const user of users) {
      try {
        const diditResponse = await axios.get(`${process.env.DIDIT_API_URL}/session/${user.kycData.diditSessionId}/decision/`, {
          headers: {
            'X-Api-Key': process.env.DIDIT_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        const sessionData = diditResponse.data;
        const newStatus = mapDiditStatusToKYC(sessionData, user);
        
        if (newStatus !== user.kycStatus) {
          bulkOps.push({
            updateOne: {
              filter: { _id: user._id },
              update: { 
                kycStatus: newStatus,
                kycData: user.kycData
              }
            }
          });
          updated++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        // Silent error handling
      }
    }
    
    // Execute bulk operations
    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
  } catch (error) {
    // Silent error handling
  } finally {
    isAutoRefreshing = false;
  }
}, 5 * 60 * 1000); // 5 minutes