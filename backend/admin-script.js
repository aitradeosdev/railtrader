const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@railtrader.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const deleteAdminUser = async () => {
  try {
    const adminEmail = 'admin@railtrader.com';
    const result = await User.deleteOne({ email: adminEmail });
    
    if (result.deletedCount > 0) {
      console.log('Admin user deleted successfully');
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error deleting admin user:', error);
  }
};

const main = async () => {
  const action = process.argv[2];
  
  if (action === 'create') {
    await createAdminUser();
  } else if (action === 'delete') {
    await deleteAdminUser();
  } else {
    console.log('Usage:');
    console.log('  node admin-script.js create  - Create admin user');
    console.log('  node admin-script.js delete  - Delete admin user');
  }
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

main();