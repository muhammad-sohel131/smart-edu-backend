const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load environment variables manually if dotenv is available
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL || "mongodb://sohelf131_db_user:sohelf131_db_user@ac-wkapouj-shard-00-00.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-01.hqhagzr.mongodb.net:27017,ac-wkapouj-shard-00-02.hqhagzr.mongodb.net:27017/?ssl=true&replicaSet=atlas-nnqk6p-shard-0&authSource=admin&appName=Cluster0";

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'diwvm1tyg',
  api_key: process.env.CLOUDINARY_API_KEY || '433658933853622',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'wPyuSPvqPSFdSTshz9SfCvyBCAk'
});

const BADGES_DIR = path.resolve(__dirname, '../../../Smart-Edu-Frontend/public/badges');

const badgeDefinitions = [
  {
    title: "Quick Starter",
    description: "Earned by embarking on your learning journey, exploring your first courses and completing introductory lessons.",
    pointsRequired: 50,
    fileName: "quick-starter.jpg"
  },
  {
    title: "Code Explorer",
    description: "Awarded for navigating foundational programming concepts, solving early coding challenges, and active learning.",
    pointsRequired: 100,
    fileName: "code-explorer.jpg"
  },
  {
    title: "Problem Solver",
    description: "Demonstrated exceptional analytical capability, debugging prowess, and passing milestone assessments.",
    pointsRequired: 250,
    fileName: "problem-solver.jpg"
  },
  {
    title: "Tech Virtuoso",
    description: "Mastered intermediate to advanced curriculum tracks with outstanding agility, precision, and high quiz scores.",
    pointsRequired: 500,
    fileName: "tech-virtuoso.svg"
  },
  {
    title: "Full-Stack Pioneer",
    description: "Successfully engineered both frontend and backend modules, integrating dynamic APIs and modern architectures.",
    pointsRequired: 750,
    fileName: "fullstack-pioneer.svg"
  },
  {
    title: "Master Architect",
    description: "Exceptional mastery of scalable distributed systems, cloud computing principles, and production architecture.",
    pointsRequired: 1000,
    fileName: "master-architect.svg"
  },
  {
    title: "Elite Scholar",
    description: "Exemplary academic discipline and superior intellectual achievement maintained across multiple advanced tracks.",
    pointsRequired: 1500,
    fileName: "elite-scholar.svg"
  },
  {
    title: "Grandmaster Legend",
    description: "The pinnacle of mastery and lifelong learning at Smart Edu. A distinguished honor reserved for premier scholars.",
    pointsRequired: 2000,
    fileName: "grandmaster-legend.svg"
  }
];

async function uploadToCloudinary(filePath, publicId) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${publicId} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "asia-lms/badges",
        public_id: publicId,
        overwrite: true,
        resource_type: "auto"
      });
      console.log(`✅ Uploaded ${publicId}: ${result.secure_url}`);
      return result.secure_url;
    }
  } catch (error) {
    console.warn(`⚠️ Cloudinary upload warning for ${publicId}:`, error.message || error);
  }
  return "";
}

async function main() {
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB for Badge Seeding.");

  const badgesCollection = mongoose.connection.collection('badges');
  const userBadgesCollection = mongoose.connection.collection('userbadges');
  const usersCollection = mongoose.connection.collection('users');
  const pointWalletsCollection = mongoose.connection.collection('pointwallets');

  const createdBadges = [];

  for (const b of badgeDefinitions) {
    const localFilePath = path.join(BADGES_DIR, b.fileName);
    const publicId = `badge_${b.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    
    // Upload or fallback
    const uploadedUrl = await uploadToCloudinary(localFilePath, publicId);
    const imageUrl = uploadedUrl || `/badges/${b.fileName}`;

    const filter = { title: b.title };
    const update = {
      $set: {
        title: b.title,
        description: b.description,
        pointsRequired: b.pointsRequired,
        image: imageUrl,
        isActive: true,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    const res = await badgesCollection.findOneAndUpdate(filter, update, { upsert: true, returnDocument: 'after' });
    const badgeDoc = res.value || await badgesCollection.findOne(filter);

    createdBadges.push(badgeDoc);
    console.log(`🏆 Badge Ready: [${b.pointsRequired} pts] ${b.title} -> ${imageUrl}`);
  }

  // Issue badges to users based on points
  const allUsers = await usersCollection.find({
    role: { $in: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] }
  }).toArray();

  for (const user of allUsers) {
    const wallet = await pointWalletsCollection.findOne({ user: user._id });
    const userPoints = wallet?.totalPoints || (user.role === "STUDENT" ? 150 : 300);

    // If student doesn't have wallet, create one with starter points
    if (!wallet && user.role === "STUDENT") {
      await pointWalletsCollection.insertOne({
        user: user._id,
        totalPoints: userPoints,
        byCourse: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const eligibleBadges = createdBadges.filter(b => (b.pointsRequired || 0) <= userPoints);
    for (const eb of eligibleBadges) {
      await userBadgesCollection.updateOne(
        { user: user._id, badge: eb._id },
        {
          $set: {
            reason: `Earned for reaching ${eb.pointsRequired} learning points milestone.`,
            issuedAt: new Date()
          },
          $setOnInsert: {
            user: user._id,
            badge: eb._id
          }
        },
        { upsert: true }
      );
    }
    console.log(`Issued ${eligibleBadges.length} badge(s) to user: ${user.name} (${user.email}) [${userPoints} pts]`);
  }

  console.log("\n✨ All Badges and User Badges successfully seeded in MongoDB!");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Fatal error during badge seeding:", err);
  process.exit(1);
});
