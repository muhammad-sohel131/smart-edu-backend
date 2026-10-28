const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL;

async function syncMissingEnrollments() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URL);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const ordersColl = db.collection('orders');
    const enrollmentsColl = db.collection('enrollments');
    const coursesColl = db.collection('courses');
    const usersColl = db.collection('users');
    const pointWalletsColl = db.collection('pointwallets');
    const pointLogsColl = db.collection('pointlogs');

    // Find all paid course orders
    const paidOrders = await ordersColl.find({ itemType: 'course', status: 'paid' }).toArray();
    console.log(`Found ${paidOrders.length} paid course orders.`);

    let createdCount = 0;

    for (const order of paidOrders) {
      if (!order.user || !order.course) {
        console.warn(`Order ${order._id} missing user or course.`);
        continue;
      }

      const userObjectId = typeof order.user === 'string' ? new mongoose.Types.ObjectId(order.user) : order.user;
      const courseObjectId = typeof order.course === 'string' ? new mongoose.Types.ObjectId(order.course) : order.course;

      // Check if enrollment already exists
      const existing = await enrollmentsColl.findOne({
        user: userObjectId,
        course: courseObjectId
      });

      const userDoc = await usersColl.findOne({ _id: userObjectId });
      const courseDoc = await coursesColl.findOne({ _id: courseObjectId });

      if (existing) {
        console.log(`✓ Enrollment already exists for ${userDoc?.name || userObjectId} in "${courseDoc?.title || courseObjectId}"`);
        continue;
      }

      console.log(`➕ Creating missing enrollment for ${userDoc?.name || userObjectId} in "${courseDoc?.title || courseObjectId}"...`);

      const instructorId = courseDoc?.instructor || null;
      const now = order.createdAt ? new Date(order.createdAt) : new Date();

      await enrollmentsColl.insertOne({
        user: userObjectId,
        course: courseObjectId,
        instructor: instructorId,
        status: "enrolled",
        progress: 0,
        completedLessons: [],
        timeSpent: 0,
        streak: 0,
        startedAt: now,
        lastActivityAt: now,
        isDeleted: false,
        createdAt: now,
        updatedAt: new Date()
      });

      // Increment course student count
      await coursesColl.updateOne(
        { _id: courseObjectId },
        { $inc: { noOfStudents: 1 } }
      );

      // Award 20 enrollment points in PointWallet if not already awarded
      const existingLog = await pointLogsColl.findOne({
        user: userObjectId,
        sourceType: "enrollment",
        courseId: String(courseObjectId)
      });

      if (!existingLog) {
        await pointLogsColl.insertOne({
          user: userObjectId,
          points: 20,
          sourceType: "enrollment",
          courseId: String(courseObjectId),
          reason: "Course enrollment",
          createdAt: now
        });

        await pointWalletsColl.updateOne(
          { user: userObjectId },
          {
            $inc: { totalPoints: 20 },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
      }

      createdCount++;
      console.log(`✅ Enrolled ${userDoc?.name || userObjectId} into "${courseDoc?.title || courseObjectId}"!`);
    }

    console.log(`\n==============================================`);
    console.log(`Sync complete! Created ${createdCount} missing enrollment(s).`);
    console.log(`==============================================`);
  } catch (error) {
    console.error("Error during enrollment sync:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

syncMissingEnrollments();
