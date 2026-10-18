"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBadges = seedBadges;
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = __importDefault(require("./app/config/cloudinary"));
const env_1 = require("./app/config/env");
const badge_model_1 = require("./app/modules/badge/badge.model");
const user_model_1 = require("./app/modules/user/user.model");
const gamification_model_1 = require("./app/modules/gamification/gamification.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const BADGES_DIR = "d:/Projects/LMS/Smart-Edu-Frontend/public/badges";
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
function uploadToCloudinary(filePath, publicId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fs_1.default.existsSync(filePath)) {
                console.log(`Uploading ${publicId} to Cloudinary...`);
                const result = yield cloudinary_1.default.uploader.upload(filePath, {
                    folder: "asia-lms/badges",
                    public_id: publicId,
                    overwrite: true,
                    resource_type: "auto"
                });
                console.log(`✅ Uploaded ${publicId}: ${result.secure_url}`);
                return result.secure_url;
            }
        }
        catch (error) {
            console.warn(`⚠️ Cloudinary upload warning for ${publicId}:`, error);
        }
        return "";
    });
}
function seedBadges() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Connected to MongoDB for Badge Seeding.");
        const createdBadges = [];
        for (const b of badgeDefinitions) {
            const localFilePath = path_1.default.join(BADGES_DIR, b.fileName);
            const publicId = `badge_${b.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            // Try Cloudinary upload
            const uploadedUrl = yield uploadToCloudinary(localFilePath, publicId);
            // If Cloudinary succeeded, use it; otherwise fallback to local frontend path
            const imageUrl = uploadedUrl || `/badges/${b.fileName}`;
            const badgeDoc = yield badge_model_1.Badge.findOneAndUpdate({ title: b.title }, {
                title: b.title,
                description: b.description,
                pointsRequired: b.pointsRequired,
                image: imageUrl,
                isActive: true
            }, { upsert: true, new: true });
            createdBadges.push(badgeDoc);
            console.log(`🏆 Badge Ready: [${b.pointsRequired} pts] ${b.title} -> ${imageUrl}`);
        }
        // Auto-issue initial badges to students and instructors for testing
        const allUsers = yield user_model_1.User.find({
            role: { $in: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] }
        });
        for (const user of allUsers) {
            // Check or find wallet points
            const wallet = yield gamification_model_1.PointWallet.findOne({ user: user._id });
            const userPoints = (wallet === null || wallet === void 0 ? void 0 : wallet.totalPoints) || (user.role === "STUDENT" ? 120 : 300);
            // Ensure wallet exists for student so their badge page displays valid points
            if (!wallet && user.role === "STUDENT") {
                yield gamification_model_1.PointWallet.create({
                    user: user._id,
                    totalPoints: userPoints,
                    byCourse: {}
                });
            }
            // Award badges where pointsRequired <= userPoints
            const eligibleBadges = createdBadges.filter(b => (b.pointsRequired || 0) <= userPoints);
            for (const eb of eligibleBadges) {
                yield badge_model_1.UserBadge.findOneAndUpdate({ user: user._id, badge: eb._id }, {
                    user: user._id,
                    badge: eb._id,
                    reason: `Earned for reaching ${eb.pointsRequired} learning points milestone.`,
                    issuedAt: new Date()
                }, { upsert: true });
            }
            console.log(`Issued ${eligibleBadges.length} badge(s) to user: ${user.name} (${user.email}) [${userPoints} pts]`);
        }
        console.log("\n✅ All Badges and User Badges seeded successfully!");
        yield mongoose_1.default.disconnect();
    });
}
if (require.main === module) {
    seedBadges().catch((err) => {
        console.error("Error seeding badges:", err);
        process.exit(1);
    });
}
