import mongoose from "mongoose";
import cloudinary from "./app/config/cloudinary";
import { envVars } from "./app/config/env";
import { Badge, UserBadge } from "./app/modules/badge/badge.model";
import { User } from "./app/modules/user/user.model";
import { PointWallet } from "./app/modules/gamification/gamification.model";
import fs from "fs";
import path from "path";

const BADGES_DIR = "d:/Projects/LMS/Smart-Edu-Frontend/public/badges";

interface BadgeSeedData {
  title: string;
  description: string;
  pointsRequired: number;
  fileName: string;
}

const badgeDefinitions: BadgeSeedData[] = [
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

async function uploadToCloudinary(filePath: string, publicId: string): Promise<string> {
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
    console.warn(`⚠️ Cloudinary upload warning for ${publicId}:`, error);
  }
  return "";
}

export async function seedBadges() {
  await mongoose.connect(envVars.DB_URL);
  console.log("Connected to MongoDB for Badge Seeding.");

  const createdBadges = [];

  for (const b of badgeDefinitions) {
    const localFilePath = path.join(BADGES_DIR, b.fileName);
    const publicId = `badge_${b.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    
    // Try Cloudinary upload
    const uploadedUrl = await uploadToCloudinary(localFilePath, publicId);
    // If Cloudinary succeeded, use it; otherwise fallback to local frontend path
    const imageUrl = uploadedUrl || `/badges/${b.fileName}`;

    const badgeDoc = await Badge.findOneAndUpdate(
      { title: b.title },
      {
        title: b.title,
        description: b.description,
        pointsRequired: b.pointsRequired,
        image: imageUrl,
        isActive: true
      },
      { upsert: true, new: true }
    );

    createdBadges.push(badgeDoc);
    console.log(`🏆 Badge Ready: [${b.pointsRequired} pts] ${b.title} -> ${imageUrl}`);
  }

  // Auto-issue initial badges to students and instructors for testing
  const allUsers = await User.find({
    role: { $in: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] }
  });

  for (const user of allUsers) {
    // Check or find wallet points
    const wallet = await PointWallet.findOne({ user: user._id });
    const userPoints = wallet?.totalPoints || (user.role === "STUDENT" ? 120 : 300);

    // Ensure wallet exists for student so their badge page displays valid points
    if (!wallet && user.role === "STUDENT") {
      await PointWallet.create({
        user: user._id,
        totalPoints: userPoints,
        byCourse: {}
      });
    }

    // Award badges where pointsRequired <= userPoints
    const eligibleBadges = createdBadges.filter(b => (b.pointsRequired || 0) <= userPoints);
    for (const eb of eligibleBadges) {
      await UserBadge.findOneAndUpdate(
        { user: user._id, badge: eb._id },
        {
          user: user._id,
          badge: eb._id,
          reason: `Earned for reaching ${eb.pointsRequired} learning points milestone.`,
          issuedAt: new Date()
        },
        { upsert: true }
      );
    }
    console.log(`Issued ${eligibleBadges.length} badge(s) to user: ${user.name} (${user.email}) [${userPoints} pts]`);
  }

  console.log("\n✅ All Badges and User Badges seeded successfully!");
  await mongoose.disconnect();
}

if (require.main === module) {
  seedBadges().catch((err) => {
    console.error("Error seeding badges:", err);
    process.exit(1);
  });
}
