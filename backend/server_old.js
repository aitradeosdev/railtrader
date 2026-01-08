const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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
        twoFactorEnabled: user.twoFactorEnabled
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
        twoFactorEnabled: user.twoFactorEnabled
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

// Economic Calendar API
app.get('/api/economic-calendar', async (req, res) => {
  try {
    const fmpApiKey = process.env.FMP_API_KEY;
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/economic_calendar`, {
      params: {
        apikey: fmpApiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching economic data:', error.message);
    res.status(500).json({ message: 'Error fetching economic data', error: error.message });
  }
});

// Get detailed economic event data
app.get('/api/economic-calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fmpApiKey = process.env.FMP_API_KEY;
    
    // Get economic calendar data
    const response = await axios.get(`https://financialmodelingprep.com/api/v3/economic_calendar`, {
      params: {
        apikey: fmpApiKey
      }
    });
    
    const events = response.data || [];
    const event = events.find(e => `${e.event}_${e.date}` === id);
    
    if (!event) {
      return res.status(404).json({ message: 'Economic event not found' });
    }
    
    // Get historical data for the same event type
    const historicalEvents = events
      .filter(e => e.event === event.event)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12)
      .map(e => ({
        date: e.date,
        value: e.actual || e.estimate || 'N/A'
      }));
    
    res.json({
      id: `${event.event}_${event.date}`,
      title: event.event,
      units: event.unit || '',
      frequency: 'Varies',
      lastUpdated: event.date,
      notes: `${event.event} economic indicator for ${event.country}`,
      observations: historicalEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching detailed economic data', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});