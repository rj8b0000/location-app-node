import { connectDB } from '../config/database';
import { Feedback } from '../models/Feedback';

const sampleFeedbacks = [
  {
    userId: 'sample_user_1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    message: 'Great app! The geo-fencing feature works perfectly. I love how easy it is to set up location-based reminders.',
    rating: 5
  },
  {
    userId: 'sample_user_2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    message: 'Very useful application for tracking my team members. The coordinate system is accurate and the interface is user-friendly.',
    rating: 4
  },
  {
    userId: 'sample_user_3',
    name: 'Mike Wilson',
    email: 'mike.wilson@example.com',
    message: 'Good concept but could use some improvements in the notification system. Sometimes alerts come late.',
    rating: 3
  },
  {
    userId: 'sample_user_4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    message: 'Excellent for business use! We use it to track deliveries and field staff. Highly recommended.',
    rating: 5
  },
  {
    userId: 'sample_user_5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    message: 'The app has potential but needs better battery optimization. It drains battery faster than expected.',
    rating: 3
  },
  {
    userId: 'sample_user_6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    message: 'Perfect for managing multiple locations! The admin panel is comprehensive and easy to navigate.',
    rating: 4
  },
  {
    userId: 'sample_user_7',
    name: 'James Miller',
    email: 'james.miller@example.com',
    message: 'Really appreciate the real-time updates and the accuracy of location detection. Keep up the good work!',
    rating: 5
  },
  {
    userId: 'sample_user_8',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    message: 'Good app overall. Would like to see more customization options for notifications and alerts.',
    rating: 4
  },
  {
    userId: 'sample_user_9',
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    message: 'The coordinate management feature is exactly what we needed for our logistics operations. Very satisfied!',
    rating: 5
  },
  {
    userId: 'sample_user_10',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@example.com',
    message: 'Easy to set up and use. The polygon drawing feature for creating geo-fences is intuitive and works well.',
    rating: 4
  },
  {
    userId: 'sample_user_11',
    name: 'Christopher White',
    email: 'chris.white@example.com',
    message: 'Had some initial setup issues but support was helpful. App works great now for our warehouse management.',
    rating: 4
  },
  {
    userId: 'sample_user_12',
    name: 'Amanda Rodriguez',
    email: 'amanda.rodriguez@example.com',
    message: 'Love the analytics dashboard! Helps us understand movement patterns and optimize our operations.',
    rating: 5
  }
];

async function seedFeedback() {
  try {
    await connectDB();
    
    // Clear existing feedback data
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback data');

    // Insert sample feedback
    const result = await Feedback.insertMany(sampleFeedbacks);
    console.log(`✅ Successfully seeded ${result.length} feedback entries`);

    // Display summary
    const totalFeedbacks = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    console.log(`\n📊 Feedback Summary:`);
    console.log(`Total Feedbacks: ${totalFeedbacks}`);
    console.log(`Average Rating: ${avgRating[0]?.avgRating.toFixed(1) || 0}/5`);
    
    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`\n⭐ Rating Distribution:`);
    ratingDistribution.forEach(({ _id, count }) => {
      console.log(`${_id} stars: ${count} feedbacks`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
    process.exit(1);
  }
}

seedFeedback();
