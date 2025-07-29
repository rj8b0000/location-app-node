import { connectDB } from '../config/database';
import { User } from '../models/User';

const cleanupDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find invalid users (missing required fields)
    const allUsers = await User.find();
    console.log('Total users found:', allUsers.length);

    const invalidUsers = allUsers.filter(user => 
      !user.fullName || 
      !user.mobileNumber || 
      !user.role ||
      typeof user.fullName !== 'string' ||
      typeof user.mobileNumber !== 'string' ||
      typeof user.role !== 'string'
    );

    console.log('Invalid users found:', invalidUsers.length);

    if (invalidUsers.length > 0) {
      // Delete invalid users
      const invalidIds = invalidUsers.map(user => user._id);
      const result = await User.deleteMany({ _id: { $in: invalidIds } });
      console.log('✅ Deleted', result.deletedCount, 'invalid users');
    }

    // Show remaining valid users
    const validUsers = await User.find();
    console.log('✅ Remaining valid users:', validUsers.length);
    validUsers.forEach(user => {
      console.log(`  - ${user.fullName} (${user.mobileNumber}) - ${user.role}`);
    });

    console.log('🎉 Database cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanupDatabase();
