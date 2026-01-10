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
    console.log('Decryption failed, returning null:', error.message);
    return null;
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }, 5000);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
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
  paymentMethods: [{
    type: { type: String, enum: ['bank', 'crypto'], required: true },
    name: { type: String, required: true },
    accountName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    walletAddress: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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
  addOns: {
    resetProtection: { price: { type: Number, default: 49 }, description: { type: String, default: 'Reset your challenge once if you fail' } },
    timeExtension: { price: { type: Number, default: 29 }, description: { type: String, default: 'Add 30 extra days to complete' } },
    profitBoost: { price: { type: Number, default: 99 }, description: { type: String, default: 'Increase profit share by 5%' } }
  },
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
  updatedAt: { type: Date, default: Date.now }
});

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
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

// Admin middleware
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

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

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
      lastName
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

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
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
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
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email },
      { new: true }
    ).select('-password');
    res.json(user);
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
      name: `RailTrader (${user.email})`,
      issuer: 'RailTrader'
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
    // Get all funded challenges with live accounts
    const fundedChallenges = await ChallengeRequest.find({
      userId: req.user.userId,
      status: 'funded',
      'mt5Accounts.active': true,
      'mt5Accounts.accountType': 'live'
    });
    
    const liveAccounts = [];
    fundedChallenges.forEach(challenge => {
      const activeLiveAccounts = challenge.mt5Accounts.filter(acc => acc.active && acc.accountType === 'live');
      activeLiveAccounts.forEach(account => {
        liveAccounts.push({
          challengeId: challenge._id,
          challengeType: challenge.challengeType,
          accountSize: challenge.accountSize,
          mt5Server: account.server,
          mt5Login: account.login,
          mt5Password: account.password,
          assignedAt: account.assignedAt
        });
      });
    });
    
    if (liveAccounts.length > 0) {
      return res.json({ liveAccounts });
    }
    
    // Fallback: check for any active MT5 account (evaluation)
    const activeChallenge = await ChallengeRequest.findOne({
      userId: req.user.userId,
      status: 'mt5_assigned',
      'mt5Accounts.active': true
    });
    
    if (activeChallenge && activeChallenge.mt5Accounts.length > 0) {
      const activeMT5 = activeChallenge.mt5Accounts.find(acc => acc.active);
      return res.json({
        mt5Server: activeMT5.server,
        mt5Login: activeMT5.login,
        mt5Password: activeMT5.password
      });
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
        console.error('Encryption error:', encryptError);
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
    res.json({ message: 'Payout request submitted successfully' });
  } catch (error) {
    console.error('Payout request error:', error);
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
    
    challenge.status = 'evaluation';
    await challenge.save();
    
    res.json({ message: 'Evaluation review submitted' });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add payment method
app.post('/api/user/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { type, name, accountName, bankName, accountNumber, walletAddress } = req.body;
    const user = await User.findById(req.user.userId);
    
    user.paymentMethods.push({ type, name, accountName, bankName, accountNumber, walletAddress });
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
    user.paymentMethods.id(req.params.id).remove();
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
          console.error('Error decrypting MT5 data:', error);
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
    const { phase, needsMT5 } = req.body;
    const challenge = await ChallengeRequest.findByIdAndUpdate(
      req.params.id,
      { needsMT5, phase },
      { new: true }
    );
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Notify live account needed
app.put('/api/admin/challenges/:id/notify-live-account', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await ChallengeRequest.findByIdAndUpdate(
      req.params.id,
      { needsLiveAccount: true, needsMT5: true, status: 'pending_funding' },
      { new: true }
    );
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.get('/api/admin/challenges', authenticateAdmin, async (req, res) => {
  try {
    const challenges = await ChallengeRequest.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(challenges);
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
    
    const challenge = await ChallengeRequest.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Deactivate previous MT5 accounts
    challenge.mt5Accounts.forEach(acc => acc.active = false);
    
    // Add new MT5 account
    challenge.mt5Accounts.push({
      server,
      login,
      password,
      phase: challenge.currentPhase,
      accountType,
      active: true
    });
    
    if (accountType === 'live') {
      challenge.status = 'funded';
      challenge.needsLiveAccount = false;
    } else {
      challenge.status = 'mt5_assigned';
    }
    challenge.needsMT5 = false;
    await challenge.save();
    
    res.json({ message: 'MT5 account assigned successfully' });
  } catch (error) {
    console.error('MT5 assignment error:', error);
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
    const challenge = await ChallengeRequest.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
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
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Challenge plan management
app.get('/api/admin/challenge-plans', authenticateAdmin, async (req, res) => {
  try {
    const plans = await ChallengePlan.find({ active: true }).sort({ tier: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Challenge plans error:', error);
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
app.get('/api/challenge-plans', async (req, res) => {
  try {
    const plans = await ChallengePlan.find({ active: true }).sort({ tier: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Public challenge plans error:', error);
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
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/admin/platform-settings', authenticateAdmin, async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
    }
    await settings.save();
    res.json(settings);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});