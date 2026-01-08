const mongoose = require('mongoose');
require('dotenv').config();

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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const fixAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@railtrader.com';
    
    // Update admin user to ensure admin privileges
    const result = await User.updateOne(
      { email: adminEmail },
      { $set: { isAdmin: true } }
    );
    
    if (result.matchedCount > 0) {
      console.log('Admin user privileges updated successfully');
      console.log('Email: admin@railtrader.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixAdminUser();