import { connectDB } from "../config/database";
import { User } from "../models/User";
import { Settings } from "../models/Settings";

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Create default admin user
    const existingAdmin = await User.findOne({ role: "admin" });

    if (!existingAdmin) {
      const adminUser = new User({
        fullName: "Admin User",
        mobileNumber: "9999999999",
        password: "admin123",
        role: "admin",
      });

      await adminUser.save();
      console.log("✅ Default admin user created:");
      console.log("   Mobile: 9999999999");
      console.log("   Password: admin123");
    } else {
      console.log("✅ Admin user already exists");
    }

    // Create default settings
    const existingSettings = await Settings.findOne();

    if (!existingSettings) {
      const defaultSettings = new Settings({
        modulesVisibility: {
          sliders: true,
          statistics: true,
          reports: true,
          feedback: true,
          help: true,
        },
        sliderAutoScrollInterval: 5000,
        statisticsLink: "",
      });

      await defaultSettings.save();
      console.log("✅ Default settings created");
    } else {
      console.log("✅ Settings already exist");
    }

    console.log("🎉 Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
