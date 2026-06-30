import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { User } from '../src/models/User';

async function seedDemoAccount() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hometown_hub';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Create demo account
    const hashedPassword = await bcryptjs.hash('Demo@12345', 12);

    // Check if demo account exists
    const existing = await User.findOne({ email: 'demo@hometownhub.com' });

    if (existing) {
      console.log('ℹ Demo account already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const demoUser = new User({
      email: 'demo@hometownhub.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
      username: 'demouser',
      phone: '+1 (555) 123-4567',
      bio: 'Welcome to Hometown Hub! This is the demo account for testing all features.',
      hometown: 'New York',
      currentCity: 'New York City',
      interests: ['Community', 'Events', 'Social'],
      role: 'USER',
      isVerified: true,
      isActive: true,
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      coverImage: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1200&h=400&fit=crop',
    });

    await demoUser.save();
    console.log('✓ Demo account created successfully');
    console.log('  Email: demo@hometownhub.com');
    console.log('  Password: Demo@12345');

    // Create admin account
    const adminHashedPassword = await bcryptjs.hash('Admin@12345', 12);
    const adminUser = new User({
      email: 'admin@hometownhub.com',
      passwordHash: adminHashedPassword,
      name: 'Admin User',
      username: 'admin',
      phone: '+1 (555) 999-8888',
      bio: 'Administrator of Hometown Hub',
      hometown: 'San Francisco',
      currentCity: 'San Francisco',
      interests: ['Management', 'Community', 'Events'],
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    });

    await adminUser.save();
    console.log('✓ Admin account created successfully');
    console.log('  Email: admin@hometownhub.com');
    console.log('  Password: Admin@12345');

    console.log('\n✓ Demo accounts ready for testing!');
  } catch (error) {
    console.error('✗ Error seeding demo account:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoAccount();
