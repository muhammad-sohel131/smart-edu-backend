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
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./app/config/env");
const user_model_1 = require("./app/modules/user/user.model");
const course_model_1 = require("./app/modules/course/course.model");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Connected to MongoDB to update Kawsar instructor profile.");
        // Find user by email 'kawsar@gmail.com' or name 'kawsar'
        let user = yield user_model_1.User.findOne({ email: "kawsar@gmail.com" });
        if (!user) {
            user = yield user_model_1.User.findOne({ name: { $regex: "kawsar", $options: "i" }, role: "INSTRUCTOR" });
        }
        if (!user) {
            throw new Error("User kawsar not found!");
        }
        console.log(`Found User: ${user.name} (${user._id})`);
        // Count real courses assigned to this user
        const courseCount = yield course_model_1.Course.countDocuments({ instructor: user._id, isDeleted: false });
        // 1. Update User document
        user.name = "Engr. Kawsar Ahmed";
        user.picture = "/images/kawsar.jpg";
        user.phone = "+880 1712-345678";
        user.address = "Dhaka, Bangladesh";
        user.role = "INSTRUCTOR";
        user.isVerified = true;
        user.intro = "Passionate Senior Software Engineer and Tech Educator with 8+ years of industry experience building scalable enterprise web platforms and AI-driven solutions. Experienced in Next.js, TypeScript, Python, Node.js, and Cloud Native Architectures. Mentored thousands of students worldwide to transition into modern software engineering roles.";
        user.socialLinks = {
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            twitter: "https://twitter.com",
            website: "https://kawsarahmed.dev"
        };
        yield user.save();
        console.log("✅ User document updated for Kawsar.");
        // 2. Update or create Instructor document
        const instructorDoc = yield user_model_1.Instructor.findOneAndUpdate({ userId: user._id }, {
            userId: user._id,
            designation: "Lead Full-Stack Software Engineer & AI Researcher",
            enrolledStudent: 485,
            noOfCourse: Math.max(courseCount, 6),
            expertise: [
                "Web Development",
                "Next.js & React 19",
                "Artificial Intelligence",
                "Python & PyTorch",
                "Node.js & Express",
                "Cloud & DevOps"
            ],
            certifications: [
                "AWS Certified Solutions Architect – Associate",
                "Meta Certified Full-Stack Developer",
                "TensorFlow Developer Certificate",
                "Google Professional Cloud Architect"
            ]
        }, { upsert: true, new: true });
        console.log("✅ Instructor document updated:", JSON.stringify({
            id: instructorDoc._id,
            designation: instructorDoc.designation,
            noOfCourse: instructorDoc.noOfCourse,
            enrolledStudent: instructorDoc.enrolledStudent,
            expertise: instructorDoc.expertise,
            certifications: instructorDoc.certifications
        }, null, 2));
        yield mongoose_1.default.disconnect();
        console.log("Done!");
    });
}
main().catch(err => {
    console.error("Error updating profile:", err);
    process.exit(1);
});
