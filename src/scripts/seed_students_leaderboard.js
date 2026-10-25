const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL || "mongodb://sohelf131_db_user:sohelf131_db_user@ac-wkapouj-shard-00-00.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-01.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-02.hqhagzr.mongodb.net:27017/?ssl=true&replicaSet=atlas-nnqk6p-shard-0&authSource=admin&appName=Cluster0";

const studentList = [
  {
    name: "Ahsan Habib",
    email: "ahsan.habib@gmail.com",
    citySearch: "Dhaka",
    schoolSearch: "Notre Dame",
    grade: "12th Grade",
    gender: "male",
    phone: "+8801711001101",
    picture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    totalPoints: 1450,
    badgeTitles: ["Master Architect", "Full-Stack Pioneer", "Tech Virtuoso"]
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.jahan@gmail.com",
    citySearch: "Dhaka",
    schoolSearch: "Viqarunnisa",
    grade: "12th Grade",
    gender: "female",
    phone: "+8801711001102",
    picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    totalPoints: 1320,
    badgeTitles: ["Master Architect", "Full-Stack Pioneer", "Problem Solver"]
  },
  {
    name: "Tahmid Hossain",
    email: "tahmid.hossain@gmail.com",
    citySearch: "Dhaka",
    schoolSearch: "St. Joseph",
    grade: "11th Grade",
    gender: "male",
    phone: "+8801711001103",
    picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    totalPoints: 1180,
    badgeTitles: ["Master Architect", "Tech Virtuoso"]
  },
  {
    name: "Sumaiya Akter",
    email: "sumaiya.akter@gmail.com",
    citySearch: "Dhaka",
    schoolSearch: "Rajuk Uttara",
    grade: "12th Grade",
    gender: "female",
    phone: "+8801711001104",
    picture: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    totalPoints: 1050,
    badgeTitles: ["Master Architect", "Problem Solver"]
  },
  {
    name: "Farhan Ahmed",
    email: "farhan.ahmed@gmail.com",
    citySearch: "Dhaka",
    schoolSearch: "Dhaka Residential",
    grade: "11th Grade",
    gender: "male",
    phone: "+8801711001105",
    picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    totalPoints: 940,
    badgeTitles: ["Full-Stack Pioneer", "Tech Virtuoso"]
  },
  {
    name: "Sadia Afrin",
    email: "sadia.afrin@gmail.com",
    citySearch: "Chattogram",
    schoolSearch: "Chittagong College",
    grade: "Honours 1st Year",
    gender: "female",
    phone: "+8801711001106",
    picture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    totalPoints: 880,
    badgeTitles: ["Full-Stack Pioneer", "Problem Solver"]
  },
  {
    name: "Mahfuzur Rahman",
    email: "mahfuzur.rahman@gmail.com",
    citySearch: "Sylhet",
    schoolSearch: "Murari Chand",
    grade: "12th Grade",
    gender: "male",
    phone: "+8801711001107",
    picture: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    totalPoints: 760,
    badgeTitles: ["Full-Stack Pioneer", "Code Explorer"]
  },
  {
    name: "Ishrat Jahan",
    email: "ishrat.jahan@gmail.com",
    citySearch: "Rajshahi",
    schoolSearch: "Rajshahi College",
    grade: "11th Grade",
    gender: "female",
    phone: "+8801711001108",
    picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    totalPoints: 650,
    badgeTitles: ["Tech Virtuoso", "Quick Starter"]
  },
  {
    name: "Rafiqul Islam",
    email: "rafiqul.islam@gmail.com",
    citySearch: "Khulna",
    schoolSearch: "Brajalal",
    grade: "12th Grade",
    gender: "male",
    phone: "+8801711001109",
    picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    totalPoints: 520,
    badgeTitles: ["Tech Virtuoso", "Quick Starter"]
  },
  {
    name: "Anika Tabassum",
    email: "anika.tabassum@gmail.com",
    citySearch: "Barishal",
    schoolSearch: "Brojomohun",
    grade: "11th Grade",
    gender: "female",
    phone: "+8801711001110",
    picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    totalPoints: 410,
    badgeTitles: ["Problem Solver", "Quick Starter"]
  }
];

async function seedStudents() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URL);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const usersColl = db.collection('users');
    const pointWalletsColl = db.collection('pointwallets');
    const pointLogsColl = db.collection('pointlogs');
    const userBadgesColl = db.collection('userbadges');
    const badgesColl = db.collection('badges');
    const citiesColl = db.collection('cities');
    const schoolsColl = db.collection('schools');

    // 1. Reset points for Admins and Instructors so they have 0 points in PointWallet
    const nonStudents = await usersColl.find({
      role: { $in: ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN', 'ORGANIZATION', 'instructor', 'admin', 'super_admin'] }
    }).toArray();

    const nonStudentIds = nonStudents.map(u => u._id);
    if (nonStudentIds.length > 0) {
      console.log(`Resetting points for ${nonStudentIds.length} instructors/admins...`);
      await pointWalletsColl.updateMany(
        { user: { $in: nonStudentIds } },
        { $set: { totalPoints: 0, byCourse: {} } }
      );
      console.log("Instructors and Admins points reset to 0 in pointwallets.");
    }

    // 2. Fetch all badges for quick mapping
    const allBadges = await badgesColl.find({}).toArray();
    const badgeMap = new Map();
    allBadges.forEach(b => badgeMap.set(b.title.toLowerCase().trim(), b));

    // 3. Process each student
    const defaultPasswordHash = await bcrypt.hash("Student123!", 10);

    for (const item of studentList) {
      // Find city
      let cityDoc = await citiesColl.findOne({ name: { $regex: new RegExp(item.citySearch, 'i') } });
      let schoolDoc = null;
      if (cityDoc) {
        schoolDoc = await schoolsColl.findOne({
          city: cityDoc._id,
          name: { $regex: new RegExp(item.schoolSearch, 'i') }
        });
      }
      if (!schoolDoc) {
        schoolDoc = await schoolsColl.findOne({ name: { $regex: new RegExp(item.schoolSearch, 'i') } });
      }

      console.log(`Processing student: ${item.name} (${item.email}) - City: ${cityDoc?.name || 'N/A'}, School: ${schoolDoc?.name || 'N/A'}`);

      // Upsert User
      const userDoc = await usersColl.findOneAndUpdate(
        { email: item.email },
        {
          $set: {
            name: item.name,
            email: item.email,
            password: defaultPasswordHash,
            role: "STUDENT",
            phone: item.phone,
            picture: item.picture,
            gender: item.gender,
            grade: item.grade,
            city: cityDoc ? cityDoc._id : null,
            school: schoolDoc ? schoolDoc._id : null,
            address: `${cityDoc?.name || 'Dhaka'}, Bangladesh`,
            region: cityDoc?.name || 'Dhaka',
            isDeleted: false,
            isActive: "ACTIVE",
            isVerified: true,
            auths: [{ provider: "credentials", providerId: item.email }],
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );

      const userId = userDoc._id || userDoc.value?._id;

      // Upsert PointWallet
      await pointWalletsColl.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            user: userId,
            totalPoints: item.totalPoints,
            byCourse: {},
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      // Create sample point log entries
      await pointLogsColl.deleteMany({ user: userId });
      const breakdown = [
        { points: Math.round(item.totalPoints * 0.4), sourceType: "course", reason: "Completed Full Track Mastery Course" },
        { points: Math.round(item.totalPoints * 0.3), sourceType: "quiz", reason: "Scored 100% on Final Architecture Quiz" },
        { points: Math.round(item.totalPoints * 0.2), sourceType: "task", reason: "Submitted high-grade Capstone Project" },
        { points: item.totalPoints - Math.round(item.totalPoints * 0.4) - Math.round(item.totalPoints * 0.3) - Math.round(item.totalPoints * 0.2), sourceType: "enrollment", reason: "Course enrollment & activity streak" }
      ];

      for (const log of breakdown) {
        if (log.points > 0) {
          await pointLogsColl.insertOne({
            user: userId,
            points: log.points,
            sourceType: log.sourceType,
            reason: log.reason,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 86400000))
          });
        }
      }

      // Assign Badges
      await userBadgesColl.deleteMany({ user: userId });
      for (const badgeTitle of item.badgeTitles) {
        const foundBadge = badgeMap.get(badgeTitle.toLowerCase().trim());
        if (foundBadge) {
          await userBadgesColl.insertOne({
            user: userId,
            badge: foundBadge._id,
            issuedAt: new Date(),
            reason: `Earned ${badgeTitle} milestone with ${item.totalPoints} points`
          });
        }
      }

      console.log(`  -> Configured ${item.name} with ${item.totalPoints} pts & ${item.badgeTitles.length} badges.`);
    }

    console.log("\n==========================================");
    console.log("Successfully seeded 10 top students for leaderboard!");
    console.log("==========================================");

  } catch (error) {
    console.error("Error seeding students:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedStudents();
