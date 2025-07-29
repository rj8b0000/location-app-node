import { connectDB } from '../config/database';
import { Feedback } from '../models/Feedback';

const sampleFeedbacks = [
  {
    userName: 'John Smith',
    message: 'Great app! The geo-fencing feature works perfectly. I love how easy it is to set up location-based reminders.'
  },
  {
    userName: 'Sarah Johnson',
    message: 'Very useful application for tracking my team members. The coordinate system is accurate and the interface is user-friendly.'
  },
  {
    userName: 'Mike Wilson',
    message: 'Good concept but could use some improvements in the notification system. Sometimes alerts come late.'
  },
  {
    userName: 'Emily Davis',
    message: 'Excellent for business use! We use it to track deliveries and field staff. Highly recommended.'
  },
  {
    userName: 'David Brown',
    message: 'The app has potential but needs better battery optimization. It drains battery faster than expected.'
  },
  {
    userName: 'Lisa Anderson',
    message: 'Perfect for managing multiple locations! The admin panel is comprehensive and easy to navigate.'
  },
  {
    userName: 'James Miller',
    message: 'Really appreciate the real-time updates and the accuracy of location detection. Keep up the good work!'
  },
  {
    userName: 'Maria Garcia',
    message: 'Good app overall. Would like to see more customization options for notifications and alerts.'
  },
  {
    userName: 'Robert Taylor',
    message: 'The coordinate management feature is exactly what we needed for our logistics operations. Very satisfied!'
  },
  {
    userName: 'Jennifer Lee',
    message: 'Easy to set up and use. The polygon drawing feature for creating geo-fences is intuitive and works well.'
  },
  {
    userName: 'Christopher White',
    message: 'Had some initial setup issues but support was helpful. App works great now for our warehouse management.'
  },
  {
    userName: 'Amanda Rodriguez',
    message: 'Love the analytics dashboard! Helps us understand movement patterns and optimize our operations.'
  },
  {
    userName: 'Alex Thompson',
    message: 'The notification system works flawlessly. We get instant alerts when our delivery vehicles enter or exit designated zones.'
  },
  {
    userName: 'Rachel Green',
    message: 'Simple and effective solution for our field service business. The location accuracy is impressive!'
  },
  {
    userName: 'Mark Stevens',
    message: 'Excellent customer support and regular updates. The app keeps getting better with each version.'
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
