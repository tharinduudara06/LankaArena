/**
 * Seed script: creates an admin user in the database.
 * Run: node scripts/seedAdmin.js
 * Optional env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_MOBILE
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/Users.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lankaArena';

const defaultAdmin = {
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@lankaarena.com',
  mobile: process.env.ADMIN_MOBILE || '0000000000',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  role: 'admin',
  isDeleted: false,
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({
      $or: [{ email: defaultAdmin.email }, { role: 'admin' }],
      isDeleted: { $ne: true },
    });

    if (existing) {
      console.log('Admin user already exists:', existing.email, '(role:', existing.role + ')');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    const admin = new User(defaultAdmin);
    await admin.save();

    console.log('Admin user created successfully:');
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Password:', defaultAdmin.password, '(change after first login if needed)');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();
