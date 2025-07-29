import { connectDB } from "../config/database";
import { User } from "../models/User";

const cleanupDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find invalid users (missing required fields)
    const allUsers = await User.find();
    console.log("Total users found:", allUsers.length);

    // Log each user to see what the data looks like
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        role: user.role,
        fullNameType: typeof user.fullName,
        mobileNumberType: typeof user.mobileNumber,
        roleType: typeof user.role,
      });
    });

    const invalidUsers = allUsers.filter(
      (user) =>
        user.fullName === undefined ||
        user.mobileNumber === undefined ||
        !user.fullName ||
        !user.mobileNumber ||
        user.role === "1" ||
        user.role === "2" ||
        user.role === "3" ||
        (user.role !== "admin" && user.role !== "user"),
    );

    console.log("Invalid users found:", invalidUsers.length);

    if (invalidUsers.length > 0) {
      // Delete invalid users using a direct query since some might not have proper _id
      const result = await User.deleteMany({
        $or: [
          { fullName: { $exists: false } },
          { fullName: undefined },
          { fullName: null },
          { fullName: "" },
          { mobileNumber: { $exists: false } },
          { mobileNumber: undefined },
          { mobileNumber: null },
          { mobileNumber: "" },
          { role: "1" },
          { role: "2" },
          { role: "3" },
        ],
      });
      console.log("✅ Deleted", result.deletedCount, "invalid users");
    }

    // Show remaining valid users
    const validUsers = await User.find();
    console.log("✅ Remaining valid users:", validUsers.length);
    validUsers.forEach((user) => {
      console.log(`  - ${user.fullName} (${user.mobileNumber}) - ${user.role}`);
    });

    console.log("🎉 Database cleanup completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }
};

cleanupDatabase();
